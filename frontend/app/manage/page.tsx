"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

function hasAnyPrivilege(can: (r: string, a: "create" | "update" | "delete" | "reply") => boolean, resource: string): boolean {
  return can(resource, "create") || can(resource, "update") || can(resource, "delete") || can(resource, "reply");
}

function ManageDashboard() {
  const { role, can } = useAuth();
  const isAdmin = role === "admin";
  const showMessages = isAdmin || hasAnyPrivilege(can, "message");
  const showNewsletter = isAdmin || hasAnyPrivilege(can, "newsletter");

  // Show resource cards only when user has access; message/newsletter require at least one privilege for moderators.
  const cards = [
    { href: "/manage/categories", icon: "categories", title: "Categories", desc: "View and manage categories" },
    { href: "/manage/brands", icon: "brands", title: "Brands", desc: "View and manage brands" },
    { href: "/manage/products", icon: "products", title: "Products", desc: "View and manage products" },
    { href: "/manage/models", icon: "models", title: "Models", desc: "View and manage models" },
    ...(showMessages ? [{ href: "/manage/messages", icon: "messages", title: "Messages", desc: "View contact form messages" }] : []),
    ...(showNewsletter ? [{ href: "/manage/newsletter", icon: "newsletter", title: "Newsletter", desc: "View newsletter subscriptions" }] : []),
    ...(isAdmin ? [{ href: "/manage/moderators", icon: "moderators", title: "Moderators", desc: "Manage moderators", wide: true }] : []),
  ];

  const iconMap: Record<string, React.ReactNode> = {
    categories: (
      <svg className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 6v2.776m-16.5 0a2.25 2.25 0 013.832 1.562 1.5 1.5 0 002.98 0 2.25 2.25 0 013.832-1.562z" />
      </svg>
    ),
    brands: (
      <svg className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
    products: (
      <svg className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    models: (
      <svg className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
    moderators: (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 sm:h-11 sm:w-11">
        <svg className="h-5 w-5 text-indigo-800 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      </span>
    ),
    messages: (
      <svg className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    newsletter: (
      <svg className="h-8 w-8 sm:h-9 sm:w-9 text-indigo-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.387-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.676.39-1.27.712-1.84.942-.57.23-1.08.397-1.56.482-.48.085-.92.1-1.32.1-.4 0-.84-.015-1.32-.1-.48-.085-.99-.252-1.56-.482-.57-.23-1.164-.553-1.84-.942l-.657-.38c-.524-.3-.71-.96-.463-1.51.401-.891.732-1.821.985-2.783m0 0A18.815 18.815 0 0112 17.25c-2.17 0-4.25-.42-6.18-1.17" />
      </svg>
    ),
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600">
          Quick access
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`admin-card admin-card-hover group flex flex-col rounded-2xl p-5 transition sm:p-6 ${
                (card as { wide?: boolean }).wide ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <span className="flex items-center justify-start text-indigo-800 transition group-hover:text-indigo-900" aria-hidden>
                {iconMap[card.icon]}
              </span>
              <h3 className="mt-3 font-semibold text-slate-800 transition group-hover:text-indigo-900">
                {card.title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {card.desc}
              </p>
              <span className="mt-3 inline-flex items-center text-xs font-medium text-indigo-800 opacity-0 transition group-hover:opacity-100 group-hover:text-indigo-900">
                Open
                <svg className="ml-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ManagePage() {
  const { token, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!token || !role) {
      const params = new URLSearchParams({ next: pathname || "/manage" });
      router.replace(`/manage/login?${params.toString()}`);
    }
  }, [token, role, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
          <p className="text-sm text-slate-600">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!token || !role) {
    return null;
  }

  return <ManageDashboard />;
}
