import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  pathnames: {
    '/': '/',
    '/dashboard': '/dashboard',
    '/transactions': '/transactions',
    '/accounts': '/accounts',
    '/categories': '/categories',
    '/budget': '/budget',
    '/reports': '/reports',
    '/ai-insights': '/ai-insights',
    '/goals': '/goals',
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);