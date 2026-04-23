"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const BACKEND =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
    : "";

type Status =
  | "loading"
  | "success"
  | "error"
  | "not_found"
  | "invalid"
  | "already_unsubscribed";

export default function NewsletterUnsubscribePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!BACKEND || !token) {
      setStatus("invalid");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch(`${BACKEND}/api/newsletter/unsubscribe/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (cancelled) return;
        const data = (await res
          .json()
          .catch(() => ({}))) as { status?: string; message?: string };

        // Prefer explicit JSON status from backend when available
        if (data.status === "success") {
          setStatus("success");
        } else if (data.status === "already_unsubscribed") {
          setStatus("already_unsubscribed");
        } else if (data.status === "not_found") {
          setStatus("not_found");
        } else if (data.status === "invalid") {
          setStatus("invalid");
        } else if (res.ok) {
          setStatus("success");
        } else if (res.status === 404) {
          setStatus("not_found");
        } else if (res.status === 400) {
          setStatus("invalid");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const title =
    status === "success"
      ? "You're unsubscribed"
      : status === "already_unsubscribed"
      ? "Already unsubscribed"
      : status === "not_found"
      ? "No subscription found"
      : status === "invalid"
      ? "Invalid link"
      : status === "error"
      ? "Something went wrong"
      : "Unsubscribing…";

  const message =
    status === "success"
      ? "You've been unsubscribed from the Elite Vapor newsletter. You can resubscribe any time from the website."
      : status === "already_unsubscribed"
      ? "This email is already unsubscribed from the Elite Vapor newsletter."
      : status === "not_found"
      ? "We couldn't find an active newsletter subscription for this link. It may have already been used, or this email was never subscribed."
      : status === "invalid"
      ? "This unsubscribe link is invalid. Please use the link from your latest email, or contact support if you keep seeing this."
      : status === "error"
      ? "We couldn't process your request right now. Please try again in a moment."
      : "We're processing your unsubscribe request…";

  return (
    <div className="bg-gradient-to-br from-slate-100 via-sky-50 to-slate-100 px-4 py-6 text-slate-900 sm:py-8">
      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50 to-slate-100 px-6 py-10 text-center shadow-xl shadow-slate-300/80 backdrop-blur-sm sm:px-8 sm:py-12">
        <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
          {title}
        </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">{message}</p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300/80 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

