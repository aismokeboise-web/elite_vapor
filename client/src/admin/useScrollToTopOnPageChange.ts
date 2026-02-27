import { useEffect } from "react";

/**
 * Scrolls the admin layout's main content area to the top when the pagination
 * page changes. Use in admin list pages that have client-side pagination
 * (page state doesn't change the URL, so ScrollToTop doesn't run).
 */
export function useScrollToTopOnPageChange(currentPage: number) {
  useEffect(() => {
    const adminMain = document.getElementById("admin-main");
    if (adminMain) {
      adminMain.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);
}
