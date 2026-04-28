"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";
type Surface = "sidebar" | "topbar";

function getInitials(email?: string) {
  if (!email) return "Q";
  return email.slice(0, 1).toUpperCase();
}

function AuthDialog({
  mode,
  onModeChange,
  onClose,
  onSuccess,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSuccess: (user: User | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSignIn = mode === "sign-in";

  const title = isSignIn ? "Welcome back" : "Create your workspace";
  const actionLabel = isSignIn ? "Sign in" : "Sign up";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const supabase = createClient();
    const result = isSignIn
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (result.data.user && result.data.session) {
      onSuccess(result.data.user);
      onClose();
      return;
    }

    setMessage("Check your email to confirm your account, then sign in.");
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/18 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] border border-white/80 bg-[#f8f8fc]/95 p-5 shadow-[0_28px_80px_rgba(79,70,120,0.24)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-500">
              Supabase Auth
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-normal text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-slate-950"
            aria-label="Close auth dialog"
          >
            x
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-slate-500">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-violet-300"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-slate-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              minLength={6}
              required
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-950 outline-none transition-colors placeholder:text-slate-300 focus:border-violet-300"
              placeholder="6+ characters"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-[12px] font-medium text-red-500">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-2xl border border-violet-100 bg-violet-50 px-3 py-2 text-[12px] font-medium text-violet-600">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-2xl bg-violet-600 text-sm font-bold text-white shadow-[0_14px_28px_rgba(124,58,237,0.2)] transition-all hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Working..." : actionLabel}
          </button>
        </form>

        <button
          type="button"
          onClick={() => onModeChange(isSignIn ? "sign-up" : "sign-in")}
          className="mt-4 w-full text-center text-[13px] font-semibold text-slate-500 transition-colors hover:text-slate-950"
        >
          {isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

export function SupabaseAuthControl({ surface }: { surface: Surface }) {
  const configured = isSupabaseConfigured();
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => data.subscription.unsubscribe();
  }, [configured]);

  const email = user?.email ?? "";
  const initials = useMemo(() => getInitials(email), [email]);

  const openAuth = (nextMode: AuthMode) => {
    setMode(nextMode);
    setAuthOpen(true);
  };

  const signOut = async () => {
    if (!configured) return;
    await createClient().auth.signOut();
    setUser(null);
  };

  if (!configured) {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-700">
        Add Supabase env
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn("animate-pulse rounded-full bg-slate-100", surface === "topbar" ? "h-9 w-20" : "h-10 w-full")} />
    );
  }

  if (user) {
    if (surface === "topbar") {
      return (
        <button
          type="button"
          onClick={signOut}
          title={`Sign out ${email}`}
          className="flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 pr-3 text-[12px] font-semibold text-slate-600 shadow-sm transition-colors hover:text-slate-950"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[11px] font-bold text-violet-600">
            {initials}
          </span>
          Sign out
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[12px] font-bold text-violet-600">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-slate-900">{email}</p>
          <p className="truncate text-[11px] text-slate-400">Syncing with Supabase</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          Out
        </button>
      </div>
    );
  }

  return (
    <>
      {surface === "topbar" ? (
        <button
          type="button"
          onClick={() => openAuth("sign-in")}
          className="h-9 rounded-full border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors hover:text-slate-950"
        >
          Sign in
        </button>
      ) : (
        <div className="grid w-full grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openAuth("sign-in")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 shadow-sm transition-colors hover:text-slate-950"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => openAuth("sign-up")}
            className="rounded-xl bg-violet-600 px-3 py-2 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-violet-500"
          >
            Sign up
          </button>
        </div>
      )}

      {authOpen && (
        <AuthDialog
          mode={mode}
          onModeChange={setMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={setUser}
        />
      )}
    </>
  );
}
