import { FilteredProductsPage } from "./FilteredProductsPage";

export function VapeJuice() {
  return (
    <FilteredProductsPage
      title="Vape Juice"
      subtitle="E-liquids in every flavor and nicotine strength."
      categoryId="vape-juice"
      showHeader={false}
    />
  );
}
