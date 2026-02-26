import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";


const slides = [
  { image: "/banner1.jpg", fallback: "/banner1.jpg", title: "Sales for the Week", subtitle: "Don't miss this week's best sales on devices and more. Great deals on vape kits, mods, and accessories for every vaper." },
  { image: "/banner2.jpg", fallback: "/banner1.jpg", title: "Flavor That Hits", subtitle: "Discover hundreds of e-liquids and disposables to find your favorite. From fruity to minty, we have it all." },
  { image: "/banner3.jpg", fallback: "/banner1.jpg", title: "Premium Selection", subtitle: "Save on devices, juice, and accessories today. Limited time offers on top brands and best sellers." },
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
            <img
              src={getImageSrc(slide)}
              alt="banner image"
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => handleImageError(slide.image)}
            />
            <div className="absolute inset-0 bg-slate-900/5" aria-hidden />
            <div className="absolute right-0 top-0 bottom-0 left-1/2 flex flex-col items-center justify-center gap-5 text-center px-6 text-black">
              <h2
                className={`max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl ${
                  index === currentIndex
                    ? "animate-fade-in-up opacity-0 [animation-fill-mode:forwards]"
                    : ""
                }`}
              >
                {slide.title}
              </h2>
              <p
                className={`max-w-lg text-base text-slate-900 sm:text-lg md:text-xl ${
                  index === currentIndex
                    ? "animate-fade-in-up opacity-0 [animation-delay:150ms] [animation-fill-mode:forwards]"
                    : ""
                }`}
              >
                {slide.subtitle}
              </p>
              <Link
                to="/products"
                className={`inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-slate-900 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-white/50 ${
                  index === currentIndex
                    ? "animate-fade-in-up opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards]"
                    : ""
                }`}
              >
                View products
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-slate-900/70 p-2.5 text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent sm:left-4 sm:p-3"
          aria-label="Previous slide"
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
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
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-slate-900/70 p-2.5 text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent sm:right-4 sm:p-3"
          aria-label="Next slide"
        >
          <svg
            className="h-5 w-5 sm:h-6 sm:w-6"
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

