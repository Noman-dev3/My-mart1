import { CheckCircle } from 'lucide-react';

const values = [
  'Seasonal curation from local farmers',
  'Transparent sourcing and pricing',
  'Express delivery slots that fit your day',
  'Live order tracking with instant support',
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7ffe9] via-white to-white py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">
          About My Mart
        </p>
        <h1 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
          We build joyful grocery experiences for modern homes.
        </h1>
        <p className="mt-4 text-base text-gray-600">
          My Mart started with a simple goal: make fresh, high-quality groceries as easy to
          access as your favorite playlist. Today we partner with trusted growers, artisans,
          and logistics experts to keep kitchens stocked across the city.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-4xl rounded-[36px] border border-emerald-50 bg-white/80 p-10 shadow-[0_40px_120px_rgba(80,140,80,0.15)] backdrop-blur">
        <h2 className="text-2xl font-semibold text-gray-900">What guides us</h2>
        <div className="mt-8 grid gap-6 text-left sm:grid-cols-2">
          {values.map((value) => (
            <div key={value} className="flex items-start gap-3 rounded-2xl bg-emerald-50/60 p-4">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <p className="text-sm text-gray-700">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

