
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ShippingReturnsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline">Shipping & Returns</CardTitle>
            <CardDescription>Information about our shipping and return policies.</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>Shipping Policy</h2>
            <p>We are committed to delivering your order accurately, in good condition, and always on time. We currently offer shipping only within Pakistan.</p>
            <ul>
              <li><strong>Standard Shipping:</strong> 3-5 business days.</li>
              <li><strong>Express Shipping:</strong> 1-2 business days.</li>
              <li>Orders are dispatched within 24 hours of being placed.</li>
              <li>Shipping costs are calculated at checkout based on your location and the weight of your order.</li>
            </ul>

            <h2>Return Policy</h2>
            <p>We want you to be completely satisfied with your purchase. If you are not, you can return the product for a full refund or exchange within 30 days of purchase.</p>
            <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>
            <p>To initiate a return, please contact our customer support team with your order number and the reason for the return. We will guide you through the process.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
