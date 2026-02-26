import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import {
  About,
  Accessories,
  BestSellers,
  Clearance,
  Contact,
  Deals,
  Devices,
  Disposables,
  Home,
  NicotinePouches,
  Papers,
  ProductDetail,
  Products,
  NewProducts,
  VapeJuice,
  NotFound,
} from "./pages";
import { AdminApp } from "./admin/AdminApp";
import { useStore } from "./store/useStore";

function App() {
  const fetchProducts = useStore((s) => s.fetchProducts);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="accessories" element={<Accessories />} />
          <Route path="clearance" element={<Clearance />} />
          <Route path="deals" element={<Deals />} />
          <Route path="devices" element={<Devices />} />
          <Route path="disposables" element={<Disposables />} />
          <Route path="nicotine-pouches" element={<NicotinePouches />} />
          <Route path="papers" element={<Papers />} />
          <Route path="vape-juice" element={<VapeJuice />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<NewProducts />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="best-sellers" element={<BestSellers />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </>
  );
}

export default App;
