
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  LayoutGrid,
  BarChart2,
  Database,
  Users,
  AppWindow,
  Settings,
  Info,
  ChevronDown,
  LogOut,
  Scan,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '../icons';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  subItems?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  {
    label: 'Home',
    icon: Home,
    subItems: [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Store Manager', href: '/admin/store-manager' },
      { label: 'Content', href: '/admin/content' },
    ],
  },
  {
    label: 'Catalog',
    icon: LayoutGrid,
    subItems: [
      { label: 'Products', href: '/admin/products' },
      { label: 'Orders', href: '/admin/orders' },
      { label: 'Customers', href: '/admin/customers' },
    ],
  },
  { label: 'Barcode Tools', icon: Scan, href: '/admin/barcode-tools' },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: Settings, href: '#' }, // Placeholder
  { label: 'Info', icon: Info, href: '#' }, // Placeholder
];

export default function Sidebar({
  onLogout,
  isMobile = false,
  onLinkClick,
}: {
  onLogout: () => void;
  isMobile?: boolean;
  onLinkClick?: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>(['Home', 'Catalog']); // Open by default
  const pathname = usePathname();

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleMouseEnter = () => !isMobile && setIsCollapsed(false);
  const handleMouseLeave = () => !isMobile && setIsCollapsed(true);
  
  if (isMobile) {
    return (
        <div className="flex h-full flex-col bg-background">
            <div className="flex h-16 items-center border-b px-4">
                <Link className="flex items-center gap-2 font-semibold" href="/admin">
                    <Icons.logo className="h-6 w-6" />
                    <span className="font-headline text-xl">My Mart Admin</span>
                </Link>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {navItems.map((item) => (
                    <NavItemComponent key={item.label} item={item} isCollapsed={false} pathname={pathname} openDropdowns={openDropdowns} toggleDropdown={toggleDropdown} onLinkClick={onLinkClick} />
                ))}
            </nav>
             <div className="mt-auto space-y-2 p-4 border-t">
                 {bottomNavItems.map((item) => (
                    <NavItemComponent key={item.label} item={item} isCollapsed={false} pathname={pathname} openDropdowns={[]} toggleDropdown={() => {}} onLinkClick={onLinkClick} />
                ))}
                <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        animate={{ width: isCollapsed ? '4rem' : '16rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed top-0 left-0 h-full flex flex-col border-r bg-background z-50"
      >
        <div className="flex h-16 items-center justify-center border-b">
          <Link href="/admin">
            <Icons.logo
              className={cn(
                'h-6 w-6 text-primary transition-all',
                !isCollapsed && 'mr-2'
              )}
            />
          </Link>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.1 } }}
                exit={{ opacity: 0 }}
                className="font-headline text-xl font-bold whitespace-nowrap"
              >
                My Mart
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-2 py-4">
          {navItems.map((item) => (
            <NavItemComponent
              key={item.label}
              item={item}
              isCollapsed={isCollapsed}
              pathname={pathname}
              openDropdowns={openDropdowns}
              toggleDropdown={toggleDropdown}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-2 p-2 border-t">
          {bottomNavItems.map((item) => (
            <NavItemComponent
              key={item.label}
              item={item}
              isCollapsed={isCollapsed}
              pathname={pathname}
              openDropdowns={[]}
              toggleDropdown={() => {}}
            />
          ))}
           <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                        exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                        className="font-medium whitespace-nowrap"
                      >
                        Logout
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}

function NavItemComponent({
  item,
  isCollapsed,
  pathname,
  openDropdowns,
  toggleDropdown,
  onLinkClick
}: {
  item: NavItem;
  isCollapsed: boolean;
  pathname: string;
  openDropdowns: string[];
  toggleDropdown: (label: string) => void;
  onLinkClick?: () => void;
}) {
  const isDropdownOpen = openDropdowns.includes(item.label);
  const isActive =
    item.href === pathname ||
    !!item.subItems?.some((sub) => sub.href === pathname);

  if (item.subItems) {
    return (
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => toggleDropdown(item.label)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary cursor-pointer',
                isActive && 'bg-primary/10 text-primary'
              )}
            >
              <item.icon className="h-4 w-4" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                    exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                    className="font-medium flex-1 whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={false}
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
        {!isCollapsed && (
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pl-6 py-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      onClick={onLinkClick}
                      className={cn(
                        'block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-primary',
                        pathname === subItem.href && 'text-primary bg-primary/5 font-semibold'
                      )}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href || '#'}
          onClick={onLinkClick}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            isActive && 'bg-primary/10 text-primary font-semibold'
          )}
        >
          <item.icon className="h-4 w-4" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                className="font-medium whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
