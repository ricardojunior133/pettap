"use client";

import { useActionState } from "react";

import { loginAction, registerAction, type AuthActionState } from "@/features/auth/actions/auth-actions";

type AuthFormProps = {
  mode: "login" | "register";
};

const initialState: AuthActionState = null;

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="mt-1.5 text-sm text-red-700" role="alert">{errors[0]}</p>;
}

export function AuthForm({ mode }: AuthFormProps) {
  const isRegistration = mode === "register";
  const [state, formAction, pending] = useActionState(
    isRegistration ? registerAction : loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      {isRegistration ? (
        <div>
          <label className="text-sm font-medium text-neutral-900" htmlFor="displayName">
            Your name
          </label>
          <input
            autoComplete="name"
            className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10"
            disabled={pending}
            id="displayName"
            name="displayName"
            required
          />
          <FieldError errors={state?.fieldErrors?.displayName} />
        </div>
      ) : null}

      <div>
        <label className="text-sm font-medium text-neutral-900" htmlFor="email">
          Email address
        </label>
        <input
          autoComplete="email"
          className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10"
          disabled={pending}
          id="email"
          inputMode="email"
          name="email"
          required
          type="email"
        />
        <FieldError errors={state?.fieldErrors?.email} />
      </div>

      <div>
        <label className="text-sm font-medium text-neutral-900" htmlFor="password">
          Password
        </label>
        <input
          autoComplete={isRegistration ? "new-password" : "current-password"}
          className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10"
          disabled={pending}
          id="password"
          minLength={isRegistration ? 8 : undefined}
          name="password"
          required
          type="password"
        />
        <FieldError errors={state?.fieldErrors?.password} />
      </div>

      {isRegistration ? (
        <div>
          <label className="text-sm font-medium text-neutral-900" htmlFor="passwordConfirmation">
            Confirm password
          </label>
          <input
            autoComplete="new-password"
            className="mt-2 min-h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-base text-neutral-950 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/10"
            disabled={pending}
            id="passwordConfirmation"
            minLength={8}
            name="passwordConfirmation"
            required
            type="password"
          />
          <FieldError errors={state?.fieldErrors?.passwordConfirmation} />
        </div>
      ) : null}

      {state ? (
        <p
          className={state.status === "success" ? "rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800" : "rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Please wait…" : isRegistration ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
