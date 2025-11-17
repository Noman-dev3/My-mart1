
'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { Github, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import type { SiteSettings } from '@/lib/settings-actions';

const footerColumns = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Features', href: '/products' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Partner Program', href: '/account' },
      { label: 'Rewards', href: '/account/orders' },
      { label: 'Resources', href: '/faq' },
    ],
  },
  {
    title: 'Product',
    links: [
      { label: 'Marketplace', href: '/products' },
      { label: 'Terms & Conditions', href: '/terms-of-service' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
    ],
  },
  {
    title: 'Help Center',
    links: [
      { label: 'Community', href: '/contact' },
      { label: 'Knowledge Base', href: '/faq' },
      { label: 'Support', href: '/contact' },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
];

export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('siteContent')
        .select('content')
        .eq('page', 'settings')
        .single();

      if (data) {
        setSettings(data.content as SiteSettings);
      }
    };

    fetchSettings();
  }, [supabase]);

  return (
    <footer className="mt-24 bg-[#070503] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="h-9 w-9 text-emerald-400" />
              <span className="font-headline text-3xl font-bold text-white">
                {settings?.storeName || 'My Mart'}
              </span>
            </Link>
            <p className="max-w-sm text-sm text-white/70">
              My Mart is your smart and convenient online grocery experience. Fresh,
              quality essentials are just a tap away.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-emerald-400 hover:text-emerald-400"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title} className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
                  {column.title}
                </p>
                <ul className="space-y-3 text-sm text-white/70">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition hover:text-emerald-300">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/60 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-x-3">
            <Link href="/terms-of-service" className="hover:text-emerald-300">
              User Terms & Conditions
            </Link>
            <span>|</span>
            <Link href="/privacy-policy" className="hover:text-emerald-300">
              Privacy Policy
            </Link>
          </div>
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} {settings?.storeName || 'My Mart'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
