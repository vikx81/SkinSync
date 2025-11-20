import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Syringe,
  Package,
  User,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ai-routine', icon: Sparkles, label: 'AI Routine' },
  { to: '/treatments', icon: Syringe, label: 'Treatments' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function Layout() {
  return (
    <div className="min-h-screen pb-20">
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 dark:border-gray-700 safe-area-pb backdrop-blur-xl">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-all ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400'
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
