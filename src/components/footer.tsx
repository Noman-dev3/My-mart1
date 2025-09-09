import Link from 'next/link';
import { Icons } from './icons';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold text-primary">My Mart</span>
            </Link>
            <p className="text-muted-foreground text-sm">Your one-stop shop for everything you need, delivered right to your door.</p>
          </div>

          <div>
            <h4 className="font-headline font-semibold text-lg mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Groceries</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Home Goods</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-headline font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-semibold text-lg mb-4">Stay Connected</h4>
            <p className="text-muted-foreground text-sm mb-2">Subscribe to our newsletter for the latest deals and offers.</p>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email" />
              <Button type="submit">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} My Mart. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
             <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
             <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
