"use client";

import { useState } from "react";
import { MapPin, MessageCircle, Phone } from "lucide-react";

interface RescueActionsProps {
  petName: string;
  ownerName: string;
  ownerPhone: string;
  availability?: string;
}

function normalisePhone(phone: string) {
  return phone.replace(/\s/g, "");
}

export default function RescueActions({ petName, ownerName, ownerPhone, availability }: RescueActionsProps) {
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const phone = normalisePhone(ownerPhone);

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location sharing is not available on this device.");
      return;
    }

    setIsSharingLocation(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const mapUrl = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
        const message = `I found ${petName}. My location: ${mapUrl}`;

        try {
          if (navigator.share) {
            await navigator.share({ title: `${petName}'s location`, text: message, url: mapUrl });
            setLocationMessage("Location ready to share.");
          } else {
            window.location.href = `sms:${phone}?body=${encodeURIComponent(message)}`;
          }
        } catch {
          setLocationMessage("Location sharing was cancelled.");
        } finally {
          setIsSharingLocation(false);
        }
      },
      () => {
        setIsSharingLocation(false);
        setLocationMessage("Please allow location access to share where you found them.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <section aria-labelledby="contact-owner" className="mt-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 id="contact-owner" className="text-2xl font-semibold tracking-tight text-foreground">Contact {petName}&apos;s owner</h2>
        <span className="text-sm font-medium text-emerald-700">{isSharingLocation ? "Getting location…" : availability ?? "Available"}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <a href={`tel:${phone}`} className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-[#111111] px-5 text-base font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,.16)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 active:translate-y-0">
          <Phone className="h-5 w-5" />
          Call {ownerName}
        </a>

        <a href={`sms:${phone}?body=${encodeURIComponent(`I found ${petName}.`)}`} className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-sky-600 px-5 text-base font-semibold text-white shadow-[0_12px_28px_rgba(2,132,199,.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 active:translate-y-0">
          <MessageCircle className="h-5 w-5" />
          Send message
        </a>
      </div>

      <button type="button" onClick={shareLocation} disabled={isSharingLocation} className="mt-3 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 text-base font-semibold text-foreground shadow-sm transition-all duration-200 hover:border-sky-200 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600 disabled:cursor-wait disabled:opacity-70">
        <MapPin className="h-5 w-5 text-sky-700" />
        {isSharingLocation ? "Getting your location…" : "Share location"}
      </button>

      {locationMessage && <p role="status" className="mt-3 text-sm text-muted-foreground">{locationMessage}</p>}
    </section>
  );
}
