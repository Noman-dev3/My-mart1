import Header from '@/components/header';
import Footer from '@/components/footer';
import { products } from '@/lib/placeholder-data';
import ProductListing from '@/components/product-listing';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <ProductListing products={products} />
      <Footer />
    </div>
  );
}
