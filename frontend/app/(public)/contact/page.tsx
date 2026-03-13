"use client";

import { useState } from "react";

const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || undefined,
      message: message.trim(),
    };
    // Optimistic: show success and clear form immediately
    setStatus("success");
    setErrorMessage("");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    // Send in background; backend still saves and sends confirmation email
    fetch(`${BACKEND}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || "Something went wrong.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "We couldn’t deliver your message. Please try again.");
      });
  };

  return (
    <div className="flex flex-col bg-slate-100">
      <section className="w-full border-b border-slate-200 bg-gradient-to-r from-sky-100 via-slate-50 to-indigo-100 py-6 sm:py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:px-6 lg:px-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-800 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Get in touch
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Contact us
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Have a question or feedback? Send us a message and we’ll get back to you.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="mt-0 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="What is this about?"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="Your message..."
            />
          </div>

          {status === "success" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 py-3 px-4 text-sm text-emerald-800">
              Thank you. Your message has been sent and we’ll get back to you soon.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-3 px-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-blue-600 bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-blue-500 hover:bg-blue-500"
            >
              Send message
            </button>
            <p className="text-xs text-slate-500">
              We aim to respond within one business day.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
