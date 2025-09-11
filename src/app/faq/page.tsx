
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function FaqPage() {
  const faqs = [
    {
      question: "What are your shipping options?",
      answer: "We offer standard shipping (3-5 business days) and express shipping (1-2 business days). All orders are shipped from our warehouse in Karachi."
    },
    {
      question: "How do I return an item?",
      answer: "You can return any item within 30 days of purchase. Please visit our Shipping & Returns page for detailed instructions on how to process a return."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within Pakistan. We are working on expanding our shipping options to include international destinations in the near future."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order has been shipped, you will receive an email with a tracking number and a link to the courier's website where you can track your package."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD) and online payments through Foree Pay, which supports credit cards, debit cards, and bank transfers."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-headline">Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions about our products and services.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
