import { FilteredProductsPage } from "./FilteredProductsPage";

export function NicotinePouches() {
  return (
    <FilteredProductsPage
      title="Nicotine Pouches"
      subtitle="Tobacco-free nicotine in a range of flavors."
      categoryId="nicotine-pouches"
      showHeader={false}
    />
  );
}
