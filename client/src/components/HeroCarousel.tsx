import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";


const slides = [
  {
    image: "/banner1.jpg",
    mobileImage: "/banner1_mb_tb.jpg",
    fallback: "/banner1.jpg",
    title: "Sales for the Week",
    shortTitle: "Weekly Sales",
    subtitle: "Don't miss this week's best sales on devices and more. Great deals on vape kits, mods, and accessories for every vaper.",
    shortSubtitle: "Save big on this week’s deals.",
  },
  {
    image: "/banner2.jpg",
    mobileImage: "/banner2_mb_tb.jpg",
    fallback: "/banner1.jpg",
    title: "Flavor That Hits",
    shortTitle: "Big Flavor Hits",
    subtitle: "Discover hundreds of e-liquids and disposables to find your favorite. From fruity to minty, we have it all.",
    shortSubtitle: "Hundreds of flavors to try.",
  },
  {
    image: "/banner3.jpg",
    mobileImage: "/banner3_mb_tb.jpg",
    fallback: "/banner1.jpg",
    title: "Premium Selection",
    shortTitle: "Premium Picks",
    subtitle: "Save on devices, juice, and accessories today. Limited time offers on top brands and best sellers.",
    shortSubtitle: "Top brands, hand-picked for you.",
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const getImageSrc = (slide: (typeof slides)[0]) =>
    failedImages.has(slide.image) ? slide.fallback : slide.image;

  const handleImageError = (src: string) => {
    setFailedImages((prev) => new Set(prev).add(src));
  };

  const goTo = useCallback(
    (nextIndex: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(nextIndex);
      const t = setTimeout(() => setIsTransitioning(false), 400);
      return () => clearTimeout(t);
    },
    [isTransitioning]
  );

  const goPrev = () => {
    goTo(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  };

  const goNext = () => {
    goTo(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex((i) => (i === slides.length - 1 ? 0 : i + 1));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-slate-900">
      <div className="relative aspect-[3/1] w-full min-h-[180px] sm:min-h-[220px] md:min-h-[280px] lg:min-h-[320px]">
        {slides.map((slide, index) => (
          <div
            key={slide.image + index}
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              index === currentIndex
                ? "z-10 opacity-100"
                : "z-0 opacity-0 pointer-events-none"
            }`}
            aria-hidden={index !== currentIndex}
          >
            <picture className="absolute inset-0 h-full w-full">
              <source media="(min-width: 1024px)" srcSet={getImageSrc(slide)} />
              <img
                src={slide.mobileImage ?? getImageSrc(slide)}
                alt="banner image"
                className="h-full w-full object-cover"
                onError={() => handleImageError(slide.image)}
              />
            </picture>
            <div className="absolute inset-0 bg-slate-900/5" aria-hidden />
            <div className="absolute right-0 top-0 bottom-0 left-1/2 flex flex-col items-center justify-center gap-3 sm:gap-4 lg:gap-5 text-center px-4 sm:px-5 lg:px-6 text-black">
              <h2
                className={`max-w-2xl text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight ${
                  index === currentIndex
                    ? "animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
                    : ""
                }`}
              >
                <span className="block lg:hidden">
                  {slide.shortTitle ?? slide.title}
                </span>
                <span className="hidden lg:inline">
                  {slide.title}
                </span>
              </h2>
              {/* Very short description on mobile/tablet */}
              {slide.shortSubtitle && (
                <p
                  className={`block lg:hidden max-w-xs text-xs sm:text-sm text-slate-900 ${
                    index === currentIndex
                      ? "animate-fade-in-up opacity-0 [animation-delay:120ms] [animation-fill-mode:forwards]"
                      : ""
                  }`}
                >
                  {slide.shortSubtitle}
                </p>
              )}
              <p
                className={`hidden lg:block max-w-lg text-sm sm:text-base md:text-lg lg:text-xl text-slate-900 ${
                  index === currentIndex
                    ? "animate-fade-in-up opacity-0 [animation-delay:150ms] [animation-fill-mode:forwards]"
                    : ""
                }`}
              >
                {slide.subtitle}
              </p>
              <Link
                to="/products"
                className={`inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-slate-900 px-4 py-2.5 text-xs sm:px-5 sm:py-2.5 sm:text-sm md:px-6 md:py-3 md:text-sm lg:px-8 lg:py-3.5 lg:text-base font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-white/50 ${
                  index === currentIndex
                    ? "animate-fade-in-up opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards]"
                    : ""
                }`}
              >
                View products
                <svg className="hidden h-5 w-5 lg:inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        ))}

        {/* Left arrow */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 bg-transparent p-1 text-white transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent sm:left-3 lg:left-4 lg:rounded-full lg:bg-slate-900/70 lg:p-2.5 lg:hover:bg-slate-800"
          aria-label="Previous slide"
        >
          <svg
            className="h-4 w-4 text-white drop-shadow-[0_0_4px_rgba(15,23,42,0.9)] lg:hidden"
            fill="none"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 3L5 8l5 5" />
          </svg>
          {/* Original arrow on laptop and up */}
          <svg
            className="hidden h-5 w-5 sm:h-6 sm:w-6 lg:inline-block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right arrow */}
        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 bg-transparent p-1 text-white transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent sm:right-3 lg:right-4 lg:rounded-full lg:bg-slate-900/70 lg:p-2.5 lg:hover:bg-slate-800"
          aria-label="Next slide"
        >
          <svg
            className="h-4 w-4 text-sky-900 drop-shadow-[0_0_4px_rgba(15,23,42,0.9)] lg:hidden"
            fill="none"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3l5 5-5 5" />
          </svg>
          {/* Original arrow on laptop and up */}
          <svg
            className="hidden h-5 w-5 sm:h-6 sm:w-6 lg:inline-block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-cyan-400"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

