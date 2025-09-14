
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Database, Server, UserCog } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <div className="flex-grow">
        <div className="bg-background">
            <div className="container mx-auto px-4 py-16 text-center">
                <ShieldCheck className="mx-auto h-16 w-16 text-primary" />
                <h1 className="mt-4 text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">
                    Privacy Policy
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Your privacy is important to us. Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>
        </div>

        <main className="container mx-auto px-4 py-12 -mt-16">
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-6 md:p-10 text-base leading-relaxed">
              <p className="mb-6 text-muted-foreground">Welcome to My Mart. We are committed to protecting your privacy and handling your data in an open and transparent manner. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
              
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Database className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg font-headline">Information We Collect</h3>
                      <p className="text-muted-foreground mt-1">We may collect personal information such as your name, shipping address, email, and phone number when you place an order. We also collect non-personal data like browser type and pages visited to improve our services.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Server className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg font-headline">How We Use Your Information</h3>
                       <ul className="mt-1 space-y-2 list-disc list-inside text-muted-foreground">
                          <li>Process your transactions efficiently.</li>
                          <li>Send you relevant promotional materials.</li>
                          <li>Improve our website and services.</li>
                          <li>Respond to your support inquiries.</li>
                       </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <UserCog className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg font-headline">Security of Your Information</h3>
                      <p className="text-muted-foreground mt-1">We use administrative, technical, and physical security measures to protect your personal information. While we take reasonable steps, please be aware that no security measures are perfect or impenetrable.</p>
                    </div>
                  </div>
                   <div className="flex gap-4">
                    <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg font-headline">Changes to This Policy</h3>
                      <p className="text-muted-foreground mt-1">We may update this Privacy Policy from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically.</p>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  );
}
