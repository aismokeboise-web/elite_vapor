import { FilteredProductsPage } from "./FilteredProductsPage";

export function BestSellers() {
  return (
    <FilteredProductsPage
      title="Best Sellers"
      subtitle="Our most popular products, chosen by customers."
      bestSellersOnly
      showHeader={false}
    />
  );
}
