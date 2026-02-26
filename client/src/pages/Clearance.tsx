import { FilteredProductsPage } from "./FilteredProductsPage";

export function Clearance() {
  return (
    <FilteredProductsPage
      title="Clearance"
      subtitle="Last-chance prices on devices, e-liquids, and more — limited quantities."
      clearanceOnly
      showHeader={false}
    />
  );
}
