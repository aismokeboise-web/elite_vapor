import { useState } from "react";
import { ApiError, submitContactMessage } from "../api/client";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      await submitContactMessage({ name, email, subject: subject || undefined, message });
      setSubmitted(true);
      form.reset();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError("Contact service is not available (404). Please try again later.");
        } else if (err.status >= 500) {
          setError("We ran into a server problem while sending your message. Please try again later.");
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message || "Something went wrong sending your message. Please try again.");
      } else {
        setError("Something went wrong sending your message. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-2rem-3.5rem)] overflow-hidden bg-gradient-to-bl from-slate-100 via-slate-50 to-cyan-50/50">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "2.5rem 2.5rem",
        }}
        aria-hidden
      />
      {/* Decorative gradient orbs */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" aria-hidden />
      <div className="absolute bottom-1/3 left-1/4 h-48 w-48 rounded-full bg-cyan-300/15 blur-2xl" aria-hidden />

      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-8 shadow-lg shadow-slate-200/50 sm:px-8 sm:py-10 ring-1 ring-slate-900/5">
          <div className="grid gap-10 sm:grid-cols-2">
            {/* Contact form */}
            <section className="sm:col-span-2 sm:max-w-lg">
              <h2 className="text-lg font-semibold text-slate-900">
                Send a message
              </h2>
              {submitted ? (
                <p className="mt-4 rounded-lg bg-cyan-50 p-4 text-sm text-cyan-800">
                  Thanks for your message. We’ll reply as soon as possible.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {error && (
                    <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                      {error}
                    </p>
                  )}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      required
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? "Sending…" : "Send message"}
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
