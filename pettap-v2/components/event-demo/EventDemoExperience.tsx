"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/Card";
import { abandonEventDemoSession, completeEventDemoProfile, getEventDemoPreview, startEventDemoSession, updateEventDemoContactAndPrivacy, updateEventDemoPetDetails, uploadEventDemoPhoto } from "@/features/event-demo/actions/event-demo-actions";

type Stage = "welcome" | "pet" | "photo" | "privacy" | "preview" | "success";
type Session = { petName: string | null; species: "dog" | "cat" | "other" | null; breed: string | null; age: string | null; personality: string | null; ownerFirstName: string | null; showOwnerFirstName: boolean; showTelephone: boolean; showEmail: boolean; showBreed: boolean; showAge: boolean; showPersonality: boolean };

export function EventDemoExperience({ publicCode, restoredSession }: { publicCode: string; restoredSession: Session | null }) {
  const [stage, setStage] = useState<Stage>(restoredSession ? "pet" : "welcome");
  const [session, setSession] = useState<Session | null>(restoredSession);
  const [message, setMessage] = useState<string | null>(restoredSession ? "Your saved demo has been restored." : null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profilePublicId, setProfilePublicId] = useState<string | null>(null);
  const progress = useMemo(() => ["pet", "photo", "privacy", "preview"].indexOf(stage) + 1, [stage]);

  async function invoke(action: () => Promise<{ status: "success" | "error"; message: string; step?: Stage; previewUrl?: string | null; sessionPublicId?: string }>) {
    setPending(true); setError(null); setMessage(null);
    try {
      const result = await action();
      if (result.status === "error") { setError(result.message); return; }
      setMessage(result.message);
      if (result.previewUrl) setPreviewUrl(result.previewUrl);
      if (result.sessionPublicId) setProfilePublicId(result.sessionPublicId);
      if (result.step) setStage(result.step);
    } catch {
      setError("We couldn't upload your photo right now. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (stage === "welcome") return <Card className="mx-auto max-w-xl p-6 sm:p-9" variant="elevated"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Live Event Demo</p><h1 className="mt-4 text-3xl font-semibold tracking-tight">Create your pet’s PetTap profile</h1><p className="mt-4 text-neutral-600">Experience PetTap live using your own pet’s details. No app required.</p><ul className="mt-6 space-y-2 text-sm text-neutral-600"><li>This is a temporary event demonstration.</li><li>The physical tag remains with PetTap.</li><li>Your demo information will be deleted automatically.</li><li>Do not enter your home address.</li><li>Telephone and email are optional.</li></ul><Button className="mt-8" disabled={pending} loading={pending} onClick={() => invoke(() => startEventDemoSession(publicCode))} size="lg">Start the experience</Button><p className="mt-4 text-sm text-neutral-500">Usually takes less than two minutes.</p>{error ? <p className="mt-4 text-sm text-red-700" role="alert">{error}</p> : null}</Card>;

  return <main className="mx-auto max-w-xl px-4 py-10 sm:py-16"><header><p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">Live Event Demo</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your pet’s PetTap profile</h1><p className="mt-3 text-sm text-neutral-600">Step {Math.max(progress, 1)} of 4 · Pet · Photo · Privacy · Preview</p></header>{message ? <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" aria-live="polite">{message}</p> : null}{error ? <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p> : null}
    {stage === "pet" ? <PetStep initial={session} pending={pending} onSubmit={(value) => invoke(async () => { const result = await updateEventDemoPetDetails(publicCode, value); if (result.status === "success") setSession((current) => ({ ...current, ...value } as Session)); return result; })} /> : null}
    {stage === "photo" ? <PhotoStep pending={pending} previewUrl={previewUrl} onSubmit={(data) => invoke(() => uploadEventDemoPhoto(publicCode, data))} onBack={() => setStage("pet")} /> : null}
    {stage === "privacy" ? <PrivacyStep initial={session} pending={pending} onBack={() => setStage("photo")} onSubmit={(value) => invoke(() => updateEventDemoContactAndPrivacy(publicCode, value))} /> : null}
    {stage === "preview" ? <PreviewStep session={session} previewUrl={previewUrl} pending={pending} onBack={() => setStage("privacy")} onRefresh={() => invoke(() => getEventDemoPreview(publicCode))} onComplete={() => invoke(() => completeEventDemoProfile(publicCode))} /> : null}
    {stage === "success" ? <Card className="mt-7 p-6 sm:p-8" variant="elevated"><h2 className="text-2xl font-semibold">Your PetTap profile is ready!</h2><p className="mt-3 text-neutral-600">Your demo profile has been created successfully. Tap the tag again after opening your temporary profile to experience what someone would see if they found your pet.</p>{profilePublicId ? <a className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white" href={`/event/profile/${profilePublicId}`}>View demo profile</a> : null}<Button className="mt-4" onClick={() => setStage("preview")} variant="outline">Review my demo</Button><Button className="mt-4" disabled={pending} onClick={() => { if (window.confirm("Remove this temporary demo profile?")) void invoke(() => abandonEventDemoSession(publicCode)); }} variant="ghost">Cancel and remove my demo</Button></Card> : null}
    {stage !== "success" ? <Button className="mt-8" disabled={pending} onClick={() => invoke(() => abandonEventDemoSession(publicCode))} variant="ghost">Cancel demo</Button> : null}
  </main>;
}

function PetStep({ initial, onSubmit, pending }: { initial: Session | null; pending: boolean; onSubmit: (value: Record<string, unknown>) => void }) { return <form className="mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ petName: data.get("petName"), species: data.get("species"), breed: data.get("breed"), age: data.get("age"), personality: data.get("personality"), ownerFirstName: data.get("ownerFirstName") }); }}><Field label="Pet name" name="petName" required defaultValue={initial?.petName ?? ""} maxLength={60}/><label className="block text-sm font-medium">Species<select className="mt-2 min-h-12 w-full rounded-xl border border-neutral-200 bg-white px-3" defaultValue={initial?.species ?? ""} name="species" required><option value="" disabled>Choose species</option><option value="dog">Dog</option><option value="cat">Cat</option><option value="other">Other</option></select></label><Field label="Breed (optional)" name="breed" defaultValue={initial?.breed ?? ""} maxLength={80}/><Field label="Age (optional)" name="age" defaultValue={initial?.age ?? ""} maxLength={40}/><Field label="Personality (optional)" name="personality" defaultValue={initial?.personality ?? ""} maxLength={240}/><Field label="Your first name (optional)" name="ownerFirstName" defaultValue={initial?.ownerFirstName ?? ""} maxLength={80}/><Button disabled={pending} fullWidth loading={pending} size="lg" type="submit">Continue to photo</Button></form> }
const MAX_EVENT_DEMO_PHOTO_SIZE = 5 * 1024 * 1024;
const eventDemoPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function PhotoStep({ onSubmit, onBack, pending, previewUrl }: { onSubmit: (data: FormData) => void; onBack: () => void; pending: boolean; previewUrl: string | null }) {
  const takePhotoInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  function selectPhoto(file: File | undefined, input: HTMLInputElement) {
    input.value = "";
    if (!file) return;
    if (!eventDemoPhotoTypes.has(file.type)) {
      setPhoto(null);
      setSelectionError("Choose a JPG, PNG, WebP, HEIC or HEIF image.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_EVENT_DEMO_PHOTO_SIZE) {
      setPhoto(null);
      setSelectionError("Choose an image smaller than 5 MB.");
      return;
    }
    setSelectionError(null);
    setPhoto(file);
  }

  function submitPhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      setSelectionError("Choose a photo before saving.");
      return;
    }
    const data = new FormData();
    data.set("photo", photo);
    onSubmit(data);
  }

  return <form className="mt-7 space-y-5" onSubmit={submitPhoto}>
    <p className="text-neutral-600">Add a clear photo of your pet. It is stored privately and deleted with this temporary demo.</p>
    {previewUrl ? <Image alt="Private preview of your pet" className="aspect-square rounded-2xl object-cover" height={480} src={previewUrl} unoptimized width={480}/> : null}
    <p className="text-sm font-medium">Pet photo</p>
    <p className="text-sm text-neutral-600">Choose a JPG, PNG, WebP, HEIC or HEIF image up to 5 MB.</p>
    <input ref={takePhotoInput} accept="image/*" aria-label="Take a photo of your pet" capture="environment" className="sr-only" onChange={(event) => selectPhoto(event.currentTarget.files?.[0], event.currentTarget)} type="file" />
    <input ref={galleryInput} accept="image/*" aria-label="Choose a pet photo from your gallery" className="sr-only" onChange={(event) => selectPhoto(event.currentTarget.files?.[0], event.currentTarget)} type="file" />
    <div className="grid gap-3 sm:grid-cols-2">
      <Button disabled={pending} onClick={() => takePhotoInput.current?.click()} type="button" variant="outline">Take photo</Button>
      <Button disabled={pending} onClick={() => galleryInput.current?.click()} type="button" variant="outline">Choose from gallery</Button>
    </div>
    {photo ? <p className="text-sm text-neutral-700" aria-live="polite">Selected: {photo.name}</p> : null}
    {selectionError ? <p className="text-sm text-red-700" role="alert">{selectionError}</p> : null}
    <div className="flex gap-3"><Button disabled={pending} onClick={onBack} type="button" variant="outline">Back</Button><Button disabled={pending || !photo} loading={pending} type="submit">Save photo</Button></div>
  </form>
}
function PrivacyStep({ initial, onSubmit, onBack, pending }: { initial: Session | null; onSubmit: (value: Record<string, unknown>) => void; onBack: () => void; pending: boolean }) { return <form className="mt-7 space-y-4" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ contactTelephone: data.get("contactTelephone"), contactEmail: data.get("contactEmail"), visibility: { showOwnerFirstName: data.get("showOwnerFirstName") === "on", showTelephone: data.get("showTelephone") === "on", showEmail: data.get("showEmail") === "on", showBreed: data.get("showBreed") === "on", showAge: data.get("showAge") === "on", showPersonality: data.get("showPersonality") === "on" }, demoConsentAccepted: data.get("demoConsentAccepted") === "on", marketingConsent: data.get("marketingConsent") === "on" }); }}><Field label="Telephone (optional)" name="contactTelephone" type="tel" maxLength={40}/><Field label="Email (optional)" name="contactEmail" type="email" maxLength={254}/><p className="text-sm text-neutral-600">Only the information you choose will appear on your temporary profile.</p>{[["showOwnerFirstName","Show my first name"],["showTelephone","Show telephone"],["showEmail","Show email"],["showBreed","Show breed"],["showAge","Show age"],["showPersonality","Show personality"]].map(([name,label])=><label className="flex gap-3 text-sm" key={name}><input defaultChecked={Boolean(initial?.[name as keyof Session])} name={name} type="checkbox"/><span>{label}</span></label>)}<label className="flex gap-3 rounded-xl bg-neutral-50 p-4 text-sm"><input name="demoConsentAccepted" required type="checkbox"/><span>I understand this is a temporary event demonstration and my demo data will be deleted automatically.</span></label><label className="flex gap-3 text-sm"><input name="marketingConsent" type="checkbox"/><span>I would like to receive PetTap launch news and updates.</span></label><div className="flex gap-3"><Button disabled={pending} onClick={onBack} type="button" variant="outline">Back</Button><Button disabled={pending} loading={pending} type="submit">Review profile</Button></div></form> }
function PreviewStep({ session, previewUrl, pending, onBack, onRefresh, onComplete }: { session: Session | null; previewUrl: string | null; pending: boolean; onBack: () => void; onRefresh: () => void; onComplete: () => void }) { return <Card className="mt-7 overflow-hidden p-6" variant="elevated"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Live Event Demo</p>{previewUrl ? <Image alt="Private preview of your pet" className="mt-5 aspect-square rounded-2xl object-cover" height={480} src={previewUrl} unoptimized width={480}/> : <Button className="mt-5" disabled={pending} onClick={onRefresh} variant="outline">Load photo preview</Button>}<h2 className="mt-5 text-2xl font-semibold">{session?.petName ?? "Your pet"}</h2>{session?.showBreed && session.breed ? <p className="text-neutral-600">{session.breed}</p> : null}{session?.showAge && session.age ? <p className="text-neutral-600">{session.age}</p> : null}{session?.showPersonality && session.personality ? <p className="mt-3 text-neutral-600">{session.personality}</p> : null}<div className="mt-6 flex gap-3"><Button disabled={pending} onClick={onBack} variant="outline">Back and edit</Button><Button disabled={pending} loading={pending} onClick={onComplete}>Create my demo profile</Button></div></Card> }
function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className="block text-sm font-medium">{label}<input className="mt-2 min-h-12 w-full rounded-xl border border-neutral-200 px-3 outline-none focus:ring-4 focus:ring-neutral-950/10" name={name} {...props}/></label> }
