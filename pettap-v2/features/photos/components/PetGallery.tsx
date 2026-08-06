"use client";

import Image from "next/image";
import { ImagePlus, Star, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import {
  deletePhotoAction,
  setPrimaryPhotoAction,
  uploadPhotoAction,
  type PhotoActionState,
} from "../actions/photo-actions";
import { ACCEPTED_PHOTO_MIME_TYPES, MAX_PHOTO_SIZE, MAX_PHOTOS_PER_PET } from "../constants";
import type { PetPhoto } from "../types/photo";

const initialState: PhotoActionState = null;

function PhotoActionButton({ petId, photo, actionType }: { petId: string; photo: PetPhoto; actionType: "primary" | "delete" }) {
  const action = actionType === "primary" ? setPrimaryPhotoAction.bind(null, petId, photo.id) : deletePhotoAction.bind(null, petId, photo.id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const isPrimaryAction = actionType === "primary";

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!isPrimaryAction && !window.confirm("Remove this photo? This action cannot be undone.")) event.preventDefault();
      }}
    >
      <button
        aria-label={isPrimaryAction ? "Set as main photo" : "Remove photo"}
        className={isPrimaryAction
          ? "inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/10 disabled:opacity-60"
          : "inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-700/15 disabled:opacity-60"}
        disabled={pending || (isPrimaryAction && photo.isPrimary)}
        type="submit"
      >
        {isPrimaryAction ? <><Star className="size-4" aria-hidden="true" />{photo.isPrimary ? "Main photo" : pending ? "Updating main photo…" : "Make main photo"}</> : <><Trash2 className="size-4" aria-hidden="true" />{pending ? "Removing photo…" : "Remove photo"}</>}
      </button>
      {state ? <p className={`mt-2 max-w-56 text-xs leading-5 ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
    </form>
  );
}

function getClientValidationError(file: File) {
  if (!ACCEPTED_PHOTO_MIME_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_MIME_TYPES)[number])) return "Please upload a JPG, PNG or WebP image.";
  if (file.size === 0 || file.size > MAX_PHOTO_SIZE) return "This image is too large. Please choose a file smaller than 5 MB.";
  return null;
}

export function PetGallery({ petId, petName, photos }: { petId: string; petName: string; photos: PetPhoto[] }) {
  const action = uploadPhotoAction.bind(null, petId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selectedPhotoId, setSelectedPhotoId] = useState(photos.find((photo) => photo.isPrimary)?.id ?? photos[0]?.id);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId) ?? photos[0];

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setClientError(null);
    if (!file) return;

    const error = getClientValidationError(file);
    if (error) {
      setClientError(error);
      event.currentTarget.value = "";
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  const message = clientError ?? state?.message;
  const messageStatus = clientError ? "error" : state?.status;

  return (
    <section className="mt-8" aria-labelledby="photos-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Pet profile</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-neutral-950" id="photos-heading">Photos</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Add up to {MAX_PHOTOS_PER_PET} photos. Your main photo appears first.</p>
        </div>
      </div>

      {previewUrl && state?.status !== "success" ? (
        <div className="mt-5 overflow-hidden rounded-[28px] bg-neutral-100">
          <div className="relative aspect-[4/3]">
            {/* Local blob URLs exist only before upload and cannot use Next's image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={`Preview of a new photo for ${petName}`} className="size-full object-cover" src={previewUrl} />
          </div>
        </div>
      ) : selectedPhoto ? (
        <div className="mt-5 overflow-hidden rounded-[28px] bg-neutral-100">
          <div className="relative aspect-[4/3]"><Image alt={`Photo of ${petName}`} className="object-cover" fill priority sizes="(max-width: 768px) 100vw, 768px" src={selectedPhoto.signedUrl} /></div>
        </div>
      ) : (
        <div className="mt-5 flex aspect-[4/3] items-center justify-center rounded-[28px] border border-dashed border-black/[0.12] bg-white">
          <div className="text-center"><ImagePlus className="mx-auto size-6 text-neutral-400" aria-hidden="true" /><p className="mt-3 text-sm text-neutral-600">No photos yet</p></div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {photos.map((photo) => (
          <button aria-label={`Preview photo of ${petName}`} aria-pressed={photo.id === selectedPhoto?.id} className={`relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 outline-none ring-offset-2 transition focus-visible:ring-4 focus-visible:ring-neutral-950/15 ${photo.id === selectedPhoto?.id ? "ring-2 ring-neutral-950" : "hover:opacity-80"}`} key={photo.id} onClick={() => setSelectedPhotoId(photo.id)} type="button">
            <Image alt="" className="object-cover" fill loading="lazy" sizes="(max-width: 640px) 33vw, 112px" src={photo.signedUrl} />
            {photo.isPrimary ? <span className="absolute left-2 top-2 rounded-full bg-white/90 p-1 text-neutral-900"><Star className="size-3 fill-current" aria-label="Main photo" /></span> : null}
          </button>
        ))}
      </div>

      {selectedPhoto ? <div className="mt-3 flex flex-wrap gap-2"><PhotoActionButton actionType="primary" petId={petId} photo={selectedPhoto} /><PhotoActionButton actionType="delete" petId={petId} photo={selectedPhoto} /></div> : null}

      <form action={formAction} className="mt-6 rounded-2xl border border-dashed border-black/[0.12] bg-white p-4" onSubmit={(event) => { if (clientError) event.preventDefault(); }}>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center sm:flex-row" htmlFor="photo">
          <ImagePlus className="size-5 text-neutral-500" aria-hidden="true" />
          <span className="text-sm font-medium text-neutral-950">Choose a photo</span>
          <span className="text-sm text-neutral-500">JPG, PNG or WebP · up to 5 MB</span>
        </label>
        <input accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" className="sr-only" disabled={pending || photos.length >= MAX_PHOTOS_PER_PET} id="photo" name="photo" onChange={handleFileChange} required type="file" />
        <p className="sr-only" id="photo-help">Choose one JPG, PNG or WebP image smaller than 5 MB.</p>
        {message ? <p className={`mt-3 text-sm ${messageStatus === "error" ? "text-red-700" : "text-emerald-700"}`} role={messageStatus === "error" ? "alert" : "status"}>{message}</p> : null}
        <button className="mt-4 flex min-h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending || Boolean(clientError) || photos.length >= MAX_PHOTOS_PER_PET} type="submit">{photos.length >= MAX_PHOTOS_PER_PET ? "Photo limit reached" : pending ? "Uploading photo…" : "Upload photo"}</button>
      </form>
    </section>
  );
}
