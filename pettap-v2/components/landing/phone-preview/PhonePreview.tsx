"use client";

import PhoneExperience from "./PhoneExperience";

export default function PhonePreview() {
    return (
        <section id="nfc" className="relative scroll-mt-24 bg-white py-24 lg:py-32">

            <div className="mx-auto max-w-4xl text-center">

                <span className="mb-4 inline-block rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-semibold tracking-wide text-sky-700">
                    Tap. Open. Reunite.
                </span>

                <h2 className="mt-6 text-5xl font-bold tracking-tight">
                    One tap changes everything.
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
                    A modern phone opens your pet&apos;s web profile instantly — no app,
                    no QR code, and no delay when it matters.
                </p>

            </div>

            <PhoneExperience />

        </section>
    );
}
