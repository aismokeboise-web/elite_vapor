import { useEffect } from "react";

/**
 * Scrolls the admin layout's main content area to the top when the pagination
 * page changes. Use in admin list pages that have client-side pagination
 * (page state doesn't change the URL, so ScrollToTop doesn't run).
 */
export function useScrollToTopOnPageChange(currentPage: number) {
  useEffect(() => {
    document.querySelector("main")?.scrollTo(0, 0);
  }, [currentPage]);
}
