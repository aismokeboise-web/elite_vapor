import { FilteredProductsPage } from "./FilteredProductsPage";

export function Papers() {
  return (
    <FilteredProductsPage
      title="Papers"
      subtitle="Rolling papers, cones, and tips."
      categoryId="papers"
      showHeader={false}
    />
  );
}
