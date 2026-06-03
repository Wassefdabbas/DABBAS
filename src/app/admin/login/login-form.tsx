"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

type State = { error?: string };

export function LoginForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    loginAction as unknown as (s: State, f: FormData) => Promise<State>,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="block">
        <span className="small-caps mb-2 block">Password</span>
        <input
          type="password"
          name="password"
          autoFocus
          required
          autoComplete="current-password"
          className="w-full border-b border-ink/20 bg-transparent py-3 text-ink focus:border-gold focus:outline-none"
        />
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-gold-deep">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-4 bg-ink px-6 py-3 text-porcelain transition-colors hover:bg-gold-deep disabled:opacity-50"
      >
        <span className="small-caps !text-current">
          {pending ? "Signing in…" : "Sign in"}
        </span>
      </button>
    </form>
  );
}
