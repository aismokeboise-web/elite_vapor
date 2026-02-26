import { FilteredProductsPage } from "./FilteredProductsPage";

export function Disposables() {
  return (
    <FilteredProductsPage
      title="Disposables"
      subtitle="Ready-to-use, no charging or refilling required."
      categoryId="disposables"
      showHeader={false}
    />
  );
}
