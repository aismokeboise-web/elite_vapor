"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

/** Renders assistant text: **bold** as bold (no asterisks), URLs as clickable links (trailing dot removed from link) */
function formatAssistantText(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /(https?:\/\/[^\s]+)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let key = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      const url = match[1].replace(/\.$/, "");
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-indigo-600 hover:text-indigo-700"
        >
          {url}
        </a>
      );
    } else if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

function BotAvatar({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-indigo-200 sm:h-10 sm:w-10 ${className ?? ""}`}
      aria-hidden
    >
      <img src="/images/logo.svg" alt="" className="h-5 w-5 object-contain sm:h-6 sm:w-6" aria-hidden />
    </div>
  );
}

function UserAvatar() {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-500 ring-2 ring-indigo-200/80 shadow-sm sm:h-10 sm:w-10"
      aria-hidden
    >
      <svg
        className="h-5 w-5 text-white sm:h-6 sm:w-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

function MinimizeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 12H4" />
    </svg>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");

  return (
    <>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="chat-toggle"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-4 right-4 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-600 text-white shadow-xl transition hover:border-indigo-300 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
            aria-label="Open chat"
          >
            <svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>
        ) : (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed inset-x-2 bottom-4 z-40 flex h-[min(560px,calc(100dvh-2rem))] w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(560px,78vh)] sm:w-[min(calc(100vw-3rem),400px)]"
          >
            {/* Header – Elite Vapor logo (navbar logo) + title */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-slate-50 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200 sm:h-10 sm:w-10">
                  <img src="/images/logo.svg" alt="" className="h-5 w-5 object-contain sm:h-6 sm:w-6" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Elite Vapor</h2>
                  <p className="truncate text-xs text-slate-500 sm:text-sm">Store assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white sm:p-2.5"
                aria-label="Minimize chat"
              >
                <MinimizeIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-slate-50/50 sm:p-4 sm:space-y-4">
              {messages.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-sm text-slate-600 py-6 sm:text-base sm:py-8"
                >
                  Ask about products, deals, or how to contact us.
                </motion.p>
              )}
              {messages.map((message, idx) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm sm:max-w-[82%] sm:px-4 sm:py-3 sm:text-base ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-white text-slate-900 border border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="mb-1 text-xs font-medium opacity-90 sm:mb-1.5 sm:text-sm">
                      {message.role === "user" ? "You" : "Assistant"}
                    </div>
                    <div className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.parts.map((part, index) =>
                        part.type === "text" ? (
                          message.role === "assistant" ? (
                            <span key={index}>{formatAssistantText(part.text)}</span>
                          ) : (
                            <span key={index}>{part.text}</span>
                          )
                        ) : null
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {(status === "submitted" || status === "streaming") && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <BotAvatar />
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-600 shadow-sm">
                    <span className="inline-flex items-center gap-2">
                      <span className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "100ms" }} />
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "200ms" }} />
                      </span>
                      {status === "streaming" ? "Typing…" : null}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-3 mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-4 sm:px-4 sm:py-2.5 sm:text-base"
              >
                Something went wrong. Please try again.
              </motion.div>
            )}

            {/* Input – touch-friendly on mobile */}
            <div className="shrink-0 border-t border-slate-200 bg-white p-2 sm:p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const trimmed = input.trim();
                  if (trimmed && status === "ready") {
                    sendMessage({ text: trimmed });
                    setInput("");
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={status !== "ready"}
                  placeholder="Ask about products…"
                  className="min-h-[44px] flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition sm:px-4 [.touch-manipulation]:text-base"
                />
                <button
                  type="submit"
                  disabled={status !== "ready" || !input.trim()}
                  className="min-h-[44px] cursor-pointer shrink-0 rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-base font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-white"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
