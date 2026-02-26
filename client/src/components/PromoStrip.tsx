import { Link } from "react-router-dom";

export function PromoStrip() {
  return (
    <section className="bg-slate-900 text-white" aria-label="Promotions">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium sm:text-base">
          <span className="text-cyan-400">Free shipping</span> on orders $50+ ·{" "}
          <Link to="/deals" className="underline decoration-cyan-400 underline-offset-2 hover:text-cyan-300">
            20% off first order
          </Link>{" "}
          · Use code <strong className="text-cyan-300">WELCOME20</strong>
        </p>
      </div>
    </section>
  );
}
