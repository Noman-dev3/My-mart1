
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#f7ffe8] via-white to-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <Card className="max-w-3xl mx-auto border border-emerald-50 bg-white/80 shadow-[0_40px_120px_rgba(80,140,80,0.15)] backdrop-blur">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-4xl font-headline">Contact Us</CardTitle>
            <CardDescription className="text-base">
              We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What is your message about?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message here..." rows={6} />
              </div>
              <div className="text-center">
                <Button type="submit" size="lg" className="rounded-full bg-emerald-500 px-10 hover:bg-emerald-600">
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
