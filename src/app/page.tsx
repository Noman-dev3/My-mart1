import Image from 'next/image';
import Link from 'next/link';
import { type ReactNode } from 'react';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Clock,
  Grid,
  Headphones,
  Leaf,
  Lock,
  MapPin,
  Quote,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Wallet,
} from 'lucide-react';

// ============================================================================
// DATA
// ============================================================================

const heroStats = [
  { value: '5 Million+', label: 'Worldwide orders' },
  { value: '1250+', label: 'Categories' },
  { value: '8000+', label: 'Products listed' },
];

const howSteps = [
  {
    title: 'Browse & Discover',
    copy: 'Explore endless aisles of fresh groceries, daily essentials, and exclusive deals curated just for you.',
    icon: Search,
  },
  {
    title: 'Add to Cart',
    copy: 'Tap once to add favorites to your cart, save repeat orders, and keep essentials stocked effortlessly.',
    icon: ShoppingCart,
  },
  {
    title: 'Choose Delivery Slot',
    copy: 'Pick a delivery window that fits your routine. Whether you need groceries ASAP or later, we have a slot.',
    icon: CalendarCheck,
  },
  {
    title: 'Track Your Order',
    copy: 'Follow the journey from warehouse to doorstep with real-time updates and reliable couriers.',
    icon: MapPin,
  },
];

const serviceHighlights = [
  {
    title: 'Free Shipping',
    description: 'Free shipping on your first order',
    icon: Truck,
  },
  {
    title: 'Customer Support',
    description: 'Instant access to support',
    icon: Headphones,
  },
  {
    title: 'Fresh Groceries',
    description: 'Fresh items sourced daily',
    icon: Leaf,
  },
  {
    title: '100% secure payment',
    description: 'Protected checkout experience',
    icon: Lock,
  },
];

const whyChooseUsCards = [
  {
    title: 'Affordable Prices',
    copy: 'Enjoy premium quality without premium pricing thanks to direct sourcing.',
    icon: Wallet,
  },
  {
    title: 'Quality Products',
    copy: 'We hand-pick each item to ensure only the freshest produce reaches you.',
    icon: BadgeCheck,
  },
  {
    title: 'Wide Variety',
    copy: 'Browse everything from exotic fruits to pantry staples in a single app.',
    icon: Grid,
  },
  {
    title: 'Reliable Delivery',
    copy: 'Track every order in real time with delivery slots that match your day.',
    icon: Clock,
  },
];

const phoneFruitImages = {
  basket: 'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=400&q=80',
  detail: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=400&q=80',
  orange: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80',
  checkout: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=400&q=80',
};

const avatarImages = [
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=60',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=60',
];

const featureCards = [
  {
    title: 'Easy Registration & Login',
    copy: 'Getting started is quick with effortless onboarding, social sign-ins, and secure one-tap logins.',
    image: 'https://images.unsplash.com/photo-1515165562835-c4c1bfa1c34b?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Quick Add to Cart',
    copy: 'Shopping is seamless thanks to smart suggestions, saved favorites, and one-tap refill lists.',
    image: phoneFruitImages.checkout,
  },
  {
    title: 'Smart Search & Filters',
    copy: 'Find exactly what you need in seconds with AI-aided search, voice input, and dietary filters.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=400&q=80',
  },
];

const testimonials = [
  {
    quote: 'Your team makes it easier to stock up for my café on tight schedules. Every delivery has been on time and perfectly packed.',
    name: 'Drovid Wise',
    role: 'CEO at AST Company',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=60',
  },
];

const faqItems = [
  {
    question: 'What is My Mart?',
    answer: 'My Mart is your modern online grocery platform delivering fresh produce, pantry staples, and daily essentials with rapid fulfillment and live tracking.',
  },
  {
    question: 'How do I place an order?',
    answer: 'Browse products, add them to your cart, select a delivery slot, and checkout securely. You can also reorder from previous purchases in one tap.',
  },
  {
    question: 'Can I schedule deliveries?',
    answer: 'Yes. Pick any available slot for same-day or next-day delivery. We will keep you updated when your courier is en route.',
  },
  {
    question: 'How do I track my order?',
    answer: 'Once confirmed, you can monitor each stage—picked, packed, dispatched, and delivered—directly inside the Feedzzy app.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We support major credit and debit cards, digital wallets, and cash-on-delivery in select regions. All payments are encrypted end-to-end.',
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

function PhoneFrame({ children, className, innerClassName }: PhoneFrameProps) {
  return (
    <div className={cn('relative h-[560px] w-[280px]', className)}>
      {/* Phone frame with notch */}
      <div className="absolute inset-0 rounded-[50px] border-[12px] border-black bg-black shadow-[0_25px_80px_rgba(0,0,0,0.3)]">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 h-6 w-40 -translate-x-1/2 rounded-b-3xl bg-black" />
        {/* Screen */}
        <div className={cn('h-full w-full overflow-hidden rounded-[38px] bg-white', innerClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

function HeroPrimaryScreen() {
  return (
    <div className="flex h-full flex-col gap-4 bg-gradient-to-b from-white to-gray-50 p-5">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-1 w-4 rounded-full bg-gray-300" />
          <div className="h-1 w-1 rounded-full bg-gray-300" />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-400">CATEGORIES</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {['Fruits', 'Veggies', 'Dairy', 'Meat'].map((cat, idx) => (
            <div key={cat} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl text-lg',
                  idx === 0 ? 'bg-emerald-500 text-white' : 'bg-gray-100'
                )}
              >
                {idx === 0 ? '🍎' : idx === 1 ? '🥬' : idx === 2 ? '🥛' : '🥩'}
              </div>
              <span className="text-[10px] font-medium text-gray-600">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-400">TRENDING</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[
            { name: 'Sweet Peach', price: '$18' },
            { name: 'Corn', price: '$10' },
          ].map((item) => (
            <div key={item.name} className="rounded-xl bg-gray-50 p-3">
              <div className="mb-2 flex h-20 items-center justify-center rounded-lg bg-white">
                <div className="text-4xl">🍑</div>
              </div>
              <p className="text-xs font-semibold text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">{item.price}</p>
              <button className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                +
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSecondaryScreen() {
  return (
    <div className="flex h-full flex-col bg-white p-5">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-1 w-4 rounded-full bg-gray-300" />
          <div className="h-1 w-1 rounded-full bg-gray-300" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-400">Details</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">Orange</p>
      </div>

      <div className="relative mx-auto my-8 h-48 w-48 overflow-hidden rounded-full bg-gradient-to-br from-orange-100 to-orange-50">
        <Image src={phoneFruitImages.orange} alt="Orange" fill sizes="192px" className="object-cover" />
      </div>

      <div className="mt-auto space-y-4 rounded-t-3xl bg-gray-50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-3xl font-bold text-gray-900">$45.00</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Quantity</p>
            <div className="mt-1 flex items-center gap-3">
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600">
                -
              </button>
              <span className="text-lg font-semibold">2</span>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                +
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery</span>
            <span className="font-medium text-gray-900">20 Mins</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Freshness</span>
            <span className="font-medium text-gray-900">5 Hours</span>
          </div>
        </div>

        <button className="w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-600">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function DeliveryTrackerScreen() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#ecffe0] to-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Delivery</p>
          <p className="text-lg font-semibold text-gray-900">Arriving Soon</p>
          <p className="text-xs text-gray-500">John is 6 mins away</p>
        </div>
        <ShieldCheck className="h-7 w-7 text-emerald-500" />
      </div>
      <div className="mt-5 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-300 to-lime-200 p-4 text-white shadow-lg">
        <p className="text-xs uppercase tracking-wide opacity-80">Order #FDZ884</p>
        <p className="text-2xl font-semibold">Reliable Delivery</p>
        <p className="text-sm opacity-90">
          ETA <span className="font-semibold">12:30 PM</span>
        </p>
      </div>
      <div className="mt-6 space-y-4">
        {['Picked & Packed', 'On the way', 'Delivered'].map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold',
                index === 2 ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-600'
              )}
            >
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{step}</p>
              <p className="text-xs text-gray-500">
                {index === 0
                  ? 'Selected by in-house experts'
                  : index === 1
                  ? 'Courier left the store'
                  : 'Awaiting confirmation'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowItWorksScreen() {
  const featuredItems = [
    { name: 'Strawberry', price: '$5.20' },
    { name: 'Cherry Tomato', price: '$3.80' },
    { name: 'Spinach', price: '$4.10' },
  ];

  return (
    <div className="flex h-full flex-col gap-4 bg-gradient-to-b from-white to-emerald-50/40 p-4">
      <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
        <span>Feedzzy cart</span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-600">LIVE</span>
      </div>
      <div className="rounded-3xl bg-white/90 p-4 shadow">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Favorites</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          {['Fruits', 'Veggies', 'Bakery', 'Dairy'].map((category, idx) => (
            <div
              key={category}
              className={cn(
                'rounded-2xl px-3 py-2 text-center font-semibold',
                idx === 0 ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
              )}
            >
              {category}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/70 bg-white/95 p-4 shadow-inner">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Best picks</p>
        <div className="mt-4 space-y-3">
          {featuredItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">Organic • 500g</p>
              </div>
              <p className="font-semibold text-emerald-600">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-emerald-500/90 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg">
        Checkout
      </div>
    </div>
  );
}

// ============================================================================
// MAIN SECTIONS
// ============================================================================

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f9ffe8] via-[#f5fce8] to-white pb-32 pt-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-20 h-96 w-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-lime-100/50 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-xl space-y-8 lg:flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm">
            <span className="text-emerald-500">●</span>
            The best online Grocery Store
          </div>
          <div className="space-y-5">
            <h1 className="font-headline text-5xl leading-tight text-gray-900 lg:text-6xl">
              Experience Grocery
              <br />
              Shopping Redefined
            </h1>
            <p className="text-lg leading-relaxed text-gray-600">
              Fresh, Curated, Delivered. Discover a way to shop with premium grocery essentials that feel effortless.
              Track each move, and let real food for real lives hit your door step.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button size="lg" className="rounded-full bg-emerald-500 px-8 py-6 text-base font-semibold hover:bg-emerald-600">
              Shop Now
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="group rounded-full px-6 py-6 text-base font-medium text-gray-700 hover:bg-gray-50"
              asChild
            >
              <Link href="#process" className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
                  ▶
                </span>
                Explore
              </Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="grid gap-8 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center lg:justify-end">
          <div className="absolute right-12 top-0 z-20 w-52 rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                <Image src={phoneFruitImages.basket} alt="Basket" fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500">Happy Customers</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {avatarImages.slice(0, 3).map((avatar, index) => (
                      <div key={avatar} className="relative h-7 w-7 rounded-full border-2 border-white">
                        <Image src={avatar} alt={`Customer ${index + 1}`} fill sizes="28px" className="rounded-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-base font-bold text-gray-900">
                      4.9
                      <Star className="h-4 w-4 text-amber-400" fill="currentColor" />
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">(14.5k Reviews)</p>
              </div>
            </div>
          </div>

          <div className="relative mt-20 flex gap-6">
            <PhoneFrame className="z-10 -rotate-6 transform">
              <HeroPrimaryScreen />
            </PhoneFrame>
            <PhoneFrame className="z-0 translate-y-12 rotate-6 transform">
              <HeroSecondaryScreen />
            </PhoneFrame>
          </div>

          <div className="absolute bottom-4 left-0 z-20 w-56 rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
                <Image src={phoneFruitImages.orange} alt="Orange" fill sizes="48px" className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Orange</p>
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  Delivery <span className="font-medium text-gray-700">20 Mins</span>
                </p>
              </div>
              <p className="ml-auto text-lg font-bold text-gray-900">$45.00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceRibbon() {
  return (
    <section className="relative -mt-20 z-20 px-6">
      <div className="mx-auto grid max-w-6xl gap-6 rounded-2xl bg-white p-8 shadow-lg sm:grid-cols-2 lg:grid-cols-4">
        {serviceHighlights.map(({ title, description, icon: Icon }) => (
          <div key={title} className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Icon className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section id="process" className="bg-gradient-to-b from-white via-gray-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">Why Choose Us</p>
          <h2 className="mt-3 font-headline text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">Why Choose Us</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
            We combine transparency, backed by quality of the best world brands. Contact support from an experienced team or
            live nearby. Grow with us.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-6">
            {whyChooseUsCards.slice(0, 2).map(({ title, copy, icon: Icon }) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Icon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{title}</p>
                    <p className="mt-2 text-sm text-gray-600">{copy}</p>
                    <button className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-500 hover:text-emerald-600">
                      Explore →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative flex items-center justify-center">
            <PhoneFrame>
              <DeliveryTrackerScreen />
            </PhoneFrame>
          </div>

          <div className="space-y-6">
            {whyChooseUsCards.slice(2).map(({ title, copy, icon: Icon }) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Icon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{title}</p>
                    <p className="mt-2 text-sm text-gray-600">{copy}</p>
                    <button className="mt-3 flex items-center gap-1 text-sm font-medium text-emerald-500 hover:text-emerald-600">
                      Explore →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KeyFeatures() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500">Key Features</p>
          <h2 className="mt-3 font-headline text-4xl font-bold text-gray-900 sm:text-5xl">
            Smarter, faster, more delightful grocery shopping.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600">
            From frictionless onboarding to intelligent filters, every touchpoint is crafted so you can finish errands in minutes, not hours.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-10 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[32px] border border-emerald-50 bg-white/90 p-8 shadow-[0_25px_80px_rgba(65,125,65,0.08)]"
            >
              <div className="relative mx-auto mb-8 h-64 w-44">
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-emerald-50 to-white blur-2xl" />
                <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-white shadow-lg">
                  <Image src={feature.image} alt={feature.title} fill sizes="200px" className="object-cover" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-3 text-sm text-gray-600">{feature.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonial = testimonials[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#f3ffe9] py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-12 top-12 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-lime-200/50 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-center">
        <div className="grid flex-1 grid-cols-3 gap-6 sm:gap-10">
          {[0, 1, 2, 3, 4, 5].map((circle) => (
            <div
              key={circle}
              className="flex items-center justify-center rounded-full border border-white/80 bg-white/90 p-3 shadow-lg"
            >
              <div className="relative h-16 w-16 rounded-full">
                <Image
                  src={avatarImages[circle % avatarImages.length] ?? avatarImages[0]}
                  alt="Customer avatar"
                  fill
                  sizes="64px"
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 rounded-[32px] border border-emerald-50 bg-white/95 p-10 shadow-[0_25px_90px_rgba(65,125,65,0.15)]">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">Testimonial</p>
          <h2 className="mt-4 font-headline text-4xl text-gray-900">Our Customers Say It Best</h2>
          <p className="mt-6 text-lg text-gray-600">{testimonial.quote}</p>
          <div className="mt-8 flex items-center gap-4">
            <div className="relative h-14 w-14">
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                fill
                sizes="56px"
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
            <div className="ml-auto flex gap-1 text-amber-400">
              {Array.from({ length: testimonial.rating }).map((_, index) => (
                <Star key={index} className="h-5 w-5" fill="currentColor" />
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-3 text-emerald-500">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 hover:bg-emerald-50">
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 hover:bg-emerald-50">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute left-8 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-4 shadow-lg lg:flex">
        <Quote className="h-6 w-6 text-emerald-500" />
      </div>
      <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-4 shadow-lg lg:flex">
        <Quote className="h-6 w-6 rotate-180 text-emerald-500" />
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-gradient-to-b from-[#f3ffe9] to-white py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 px-6 lg:flex-row">
        <div className="relative flex flex-1 justify-center lg:justify-start">
          <div className="absolute inset-auto -left-4 top-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
          <PhoneFrame className="z-10">
            <HowItWorksScreen />
          </PhoneFrame>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">How It Works</p>
          <h2 className="mt-4 font-headline text-4xl text-gray-900 sm:text-5xl">
            Shopping for groceries has never been this smooth.
          </h2>
          <p className="mt-4 text-base text-gray-600">
            Browse curated collections, add to cart instantly, schedule the perfect delivery slot, and track your courier from store to doorstep.
          </p>
          <div className="mt-8 space-y-6">
            {howSteps.map(({ title, copy, icon: Icon }) => (
              <div key={title} className="flex gap-4">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="bg-gradient-to-b from-white to-[#efffe6] py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">FAQs</p>
        <h2 className="mt-4 font-headline text-4xl text-gray-900 sm:text-5xl">Frequently Asked Questions</h2>
        <p className="mt-3 text-base text-gray-600">
          Your opinion matters. Share thoughts, rate your shopping experience, and suggest delivery speeds or app features.
        </p>
      </div>
      <div className="mx-auto mt-12 max-w-3xl rounded-[32px] bg-white/95 p-6 shadow-[0_30px_90px_rgba(60,110,60,0.12)]">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base font-semibold text-gray-900">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServiceRibbon />
        <WhyChooseUs />
        <KeyFeatures />
        <Testimonials />
        <HowItWorks />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}