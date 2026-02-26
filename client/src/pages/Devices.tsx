import { FilteredProductsPage } from "./FilteredProductsPage";

export function Devices() {
  return (
    <FilteredProductsPage
      title="Devices"
      subtitle="Pod systems, mods, starter kits, and tanks."
      categoryId="devices"
      showHeader={false}
    />
  );
}
