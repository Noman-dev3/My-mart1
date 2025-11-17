
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, UserCheck, Gavel, ShieldBan } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Header />
      <div className="flex-grow">
        <div className="bg-background">
          <div className="container mx-auto px-4 py-16 text-center">
            <FileText className="mx-auto h-16 w-16 text-primary" />
            <h1 className="mt-4 text-4xl font-extrabold font-headline tracking-tight lg:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Please read our terms carefully before using our service. Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <main className="container mx-auto px-4 py-12 -mt-16">
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-6 md:p-10 space-y-8">
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-headline">1. Agreement to Terms</h3>
                  <p className="text-muted-foreground mt-1">By accessing or using our website and services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldBan className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-headline">2. Prohibited Conduct</h3>
                  <p className="text-muted-foreground mt-1">You agree not to use the website for any unlawful purpose or in any way that could damage the website, the services, or the general business of My Mart. This includes harassing or abusing other users, violating intellectual property rights, or engaging in any fraudulent activity.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gavel className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg font-headline">3. Limitation of Liability</h3>
                  <p className="text-muted-foreground mt-1">In no event shall My Mart, nor its directors or employees, be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from your access to or use of our Service.</p>
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
