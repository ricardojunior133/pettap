"use client";

import PhoneExperience from "./PhoneExperience";

export default function PhonePreview() {
    return (
        <section className="relative bg-white py-32">

            <div className="mx-auto max-w-4xl text-center">

                <span className="mb-4 inline-block rounded-full border px-4 py-2 text-sm font-medium">
                    Tap. Scan. Reunite.
                </span>

                <h2 className="mt-6 text-5xl font-bold tracking-tight">
                    One tap changes everything.
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
                    See exactly what happens when someone finds your pet and
                    taps their PetTap tag.
                </p>

            </div>

            <PhoneExperience />

        </section>
    );
}