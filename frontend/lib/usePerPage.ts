"use client";

import { useEffect, useState } from "react";

/** Per-page counts by breakpoint: mobile 6, tablet 9, laptop 12 */
const PER_PAGE = { mobile: 6, tablet: 9, laptop: 12 } as const;

export function usePerPage(): number {
  const [perPage, setPerPage] = useState<number>(PER_PAGE.laptop);

  useEffect(() => {
    const mqLaptop = window.matchMedia("(min-width: 1024px)");
    const mqTablet = window.matchMedia("(min-width: 640px)");

    const update = () => {
      if (mqLaptop.matches) setPerPage(PER_PAGE.laptop);
      else if (mqTablet.matches) setPerPage(PER_PAGE.tablet);
      else setPerPage(PER_PAGE.mobile);
    };

    update();
    mqLaptop.addEventListener("change", update);
    mqTablet.addEventListener("change", update);
    return () => {
      mqLaptop.removeEventListener("change", update);
      mqTablet.removeEventListener("change", update);
    };
  }, []);

  return perPage;
}
