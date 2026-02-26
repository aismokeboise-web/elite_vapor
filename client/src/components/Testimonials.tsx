const testimonials = [
  {
    quote: "Best selection and prices I've found. Shipping was fast and everything arrived as described.",
    author: "Jordan M.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=11",
  },
  {
    quote: "Customer service helped me pick the right device. No pressure, just honest advice. Will order again.",
    author: "Sam K.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=22",
  },
  {
    quote: "Quality products and quick delivery. The deals section actually has good stuff, not just leftovers.",
    author: "Alex T.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=33",
  },
  {
    quote: "First time buying here. Site was easy to use and my order came in two days. Definitely coming back.",
    author: "Riley P.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=44",
  },
];

function StarRating({ stars }: { stars: number }) {
  const unfilledClass = "text-slate-400";
  return (
    <div className="flex gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${i < stars ? "text-amber-400" : unfilledClass}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

type TestimonialsProps = {
  variant?: "light" | "dark";
};

export function Testimonials({ variant = "dark" }: TestimonialsProps) {
  const isLight = variant === "light";

  return (
    <section
      className={
        isLight
          ? "relative w-full border-t border-slate-200 bg-slate-50 py-12 text-slate-800"
          : "relative mt-16 w-full border-t border-slate-700 bg-slate-800 text-slate-300"
      }
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2
          id="testimonials-heading"
          className={
            isLight
              ? "text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
              : "text-center text-sm font-semibold uppercase tracking-wider text-white sm:text-base"
          }
        >
          What our customers say
        </h2>
        <p className={isLight ? "mt-2 text-center text-sm text-slate-600" : "mt-2 text-center text-sm text-slate-400"}>
          Real reviews from real customers
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map(({ quote, author, rating, avatar }) => (
            <blockquote
              key={author}
              className={
                isLight
                  ? "flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  : "flex flex-col rounded-xl border border-slate-600 bg-slate-700/50 p-6"
              }
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatar}
                  alt=""
                  className={
                    isLight
                      ? "h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-200"
                      : "h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-600"
                  }
                />
                <StarRating stars={rating} />
              </div>
              <p
                className={
                  isLight
                    ? "mt-4 flex-1 text-sm leading-relaxed text-slate-600"
                    : "mt-4 flex-1 text-sm leading-relaxed text-slate-300"
                }
              >
                &ldquo;{quote}&rdquo;
              </p>
              <cite
                className={
                  isLight
                    ? "mt-4 block border-t border-slate-200 pt-4 text-sm font-semibold text-cyan-600 not-italic"
                    : "mt-4 block border-t border-slate-600 pt-4 text-sm font-semibold text-cyan-400 not-italic"
                }
              >
                — {author}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
