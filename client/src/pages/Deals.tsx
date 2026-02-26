import { FilteredProductsPage } from "./FilteredProductsPage";

export function Deals() {
  return (
    <FilteredProductsPage
      title="Deals"
      subtitle="Limited-time offers on devices, e-liquids, and more."
      dealsOnly
      showHeader={false}
    />
  );
}
