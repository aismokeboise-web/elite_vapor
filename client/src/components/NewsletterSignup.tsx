import { useState } from "react";
import { ApiError, subscribeToNewsletter } from "../api/client";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    setErrorMessage(null);
    subscribeToNewsletter(email)
      .then((result) => {
        if ("success" in result && result.success) {
          setStatus("done");
          setEmail("");
        } else {
          setStatus("error");
          setErrorMessage("We couldn't subscribe you right now. Please try again.");
        }
      })
      .catch((err) => {
        setStatus("error");
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setErrorMessage("Newsletter service is not available (404). Please try again later.");
          } else if (err.status >= 500) {
            setErrorMessage("We ran into a server problem while subscribing. Please try again later.");
          } else {
            setErrorMessage(err.message);
          }
        } else if (err instanceof Error) {
          setErrorMessage(err.message || "Something went wrong. Please try again later.");
        } else {
          setErrorMessage("Something went wrong. Please try again later.");
        }
      });
  };

  return (
    <section
      className="border-t border-slate-200 bg-cyan-50/90 text-slate-700"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2
            id="newsletter-heading"
            className="text-sm font-semibold uppercase tracking-wider text-slate-900 sm:text-base"
          >
            Stay in the loop
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Get deals, new arrivals, and tips. No spam — unsubscribe anytime.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={status === "submitting" || status === "done"}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={status === "submitting" || status === "done"}
              className="shrink-0 rounded-lg bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-100 disabled:opacity-60"
            >
              {status === "submitting" ? "Subscribing…" : status === "done" ? "Subscribed" : "Subscribe"}
            </button>
          </form>
          {status === "done" && (
            <p className="mt-3 text-sm text-cyan-700">Thanks! We’ll send you updates.</p>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm text-rose-700">
              {errorMessage ?? "Something went wrong. Please try again later."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
