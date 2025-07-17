// src/components/admin/Sidebar.tsx
"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Package, Settings, Home, Users, BarChart } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { title: 'Dashboard', icon: <Home size={20} />, path: '/admin' },
    { title: 'Products', icon: <Package size={20} />, path: '/admin/products' },
    { title: 'Categories', icon: <Package size={20} />, path: '/admin/categories' },
    { title: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    // { title: 'Customers', icon: <Users size={20} />, path: '/admin/customers' },
    // { title: 'Analytics', icon: <BarChart size={20} />, path: '/admin/analytics' },
    // { title: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="px-2 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;