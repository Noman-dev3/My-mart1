
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline">Terms of Service</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>By using our website, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the website.</p>
            
            <h2>2. User Accounts</h2>
            <p>You may be required to create an account to access some features of our website. You are responsible for safeguarding your account information and for all activities that occur under your account.</p>

            <h2>3. Prohibited Conduct</h2>
            <p>You agree not to use the website for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the website in any way that could damage the website, the services, or the general business of My Mart.</p>

            <h2>4. Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, and images, is our property or the property of our content suppliers and is protected by international copyright laws.</p>
            
            <h2>5. Limitation of Liability</h2>
            <p>In no event shall My Mart, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
