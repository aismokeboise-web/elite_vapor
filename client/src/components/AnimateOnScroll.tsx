import { useEffect, useRef, useState } from "react";

const ANIMATION_DURATION_MS = 600;
const DEFAULT_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: "0px 0px -60px 0px",
  threshold: 0.1,
};

type AnimateOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  options?: IntersectionObserverInit;
};

export function AnimateOnScroll({
  children,
  className = "",
  options = {},
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { ...DEFAULT_OPTIONS, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.root, options.rootMargin, options.threshold]);

  useEffect(() => {
    if (!isVisible) return;
    const id = setTimeout(() => setHasAnimated(true), ANIMATION_DURATION_MS);
    return () => clearTimeout(id);
  }, [isVisible]);

  const animationClass = hasAnimated
    ? "opacity-100 translate-y-0"
    : isVisible
      ? "animate-fade-in-up"
      : "opacity-0 translate-y-4";

  return (
    <div
      ref={ref}
      className={`transition-none ${animationClass} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
