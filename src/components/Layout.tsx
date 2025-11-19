import { NavLink, Outlet } from 'react-router-dom';
import {
  Sun,
  Syringe,
  History,
  Package,
  User,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: Sun, label: 'Routine' },
  { to: '/treatments', icon: Syringe, label: 'Treatments' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Layout() {
  return (
    <div className="min-h-screen pb-20">
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-500'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
