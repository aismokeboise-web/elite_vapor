"use client";

import { useState } from "react";

const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";

export function ContactForm() {
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
    setStatus("success");
    setErrorMessage("");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
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
        setErrorMessage(
          err instanceof Error ? err.message : "We couldn't deliver your message. Please try again."
        );
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
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
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
            className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="you@example.com"
          />
        </div>
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
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Your message..."
        />
      </div>

      {status === "success" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 py-3 px-4 text-sm text-emerald-800">
          Thank you! Your message has been sent and we will get back to you soon.
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
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-indigo-600 bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-indigo-500 hover:bg-indigo-500 hover:shadow-md"
        >
          Send message
        </button>
        <p className="text-xs text-slate-500">We aim to respond within one business day.</p>
      </div>
    </form>
  );
}
