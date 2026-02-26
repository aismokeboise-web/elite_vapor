import { FilteredProductsPage } from "./FilteredProductsPage";

export function Accessories() {
  return (
    <FilteredProductsPage
      title="Accessories"
      subtitle="Coils, batteries, cases, cotton, and more."
      categoryId="accessories"
      showHeader={false}
    />
  );
}
