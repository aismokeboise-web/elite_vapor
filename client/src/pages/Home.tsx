import { AnimateOnScroll } from "../components/AnimateOnScroll";
import { BestSellerListing } from "../components/BestSellerListing";
import { HeroCarousel } from "../components/HeroCarousel";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { NewArrivalsListing } from "../components/NewArrivalsListing";
import { ProductListing } from "../components/ProductListing";
import { ShopByCategory } from "../components/ShopByCategory";
import { Testimonials } from "../components/Testimonials";

export function Home() {
  return (
    <div>
      <HeroCarousel />
      <AnimateOnScroll>
        <ProductListing />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <NewArrivalsListing />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <BestSellerListing />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <ShopByCategory />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <Testimonials variant="light" />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <NewsletterSignup />
      </AnimateOnScroll>
    </div>
  );
}
