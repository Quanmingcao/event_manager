import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, LayoutDashboard, LogOut, Menu, DollarSign, Users, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import logo from '@/assets/logo.png';

export function Layout() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard, show: true },
    { path: '/events', label: 'Sự kiện', icon: Calendar, show: true },
    { path: '/services', label: 'Dịch vụ', icon: DollarSign, show: true }, 
    { path: '/accounts', label: 'Quản lý tài khoản', icon: Users, show: profile?.role === 'super_admin' },
    { path: '/settings', label: 'Cài đặt', icon: Settings, show: true },
  ];

  const NavLink = ({ item, mobile = false }: { item: typeof navItems[0], mobile?: boolean }) => {
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    const Icon = item.icon;
    
    return (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={`justify-start ${mobile ? 'w-full' : ''}`}
        onClick={() => {
          navigate(item.path);
          if (mobile) setOpen(false);
        }}
      >
        <Icon className="size-4 mr-2" />
        {item.label}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.filter(item => item.show).map((item) => (
                    <NavLink key={item.path} item={item} mobile />
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-teal-50 p-2 rounded-2xl shadow-sm border border-teal-100">
                <img src={logo} alt="Logo" className="size-16 object-contain" />
              </div>
              <h1 className="text-2xl font-extrabold hidden sm:block bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                Quản Lý Sự Kiện
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-medium">{profile?.fullName || user?.email}</p>
              <p className="text-gray-500 capitalize">
                {profile?.role === 'super_admin' ? 'Super Admin' : 
                 profile?.role === 'admin' ? 'Quản trị viên' : 'Nhân sự'}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} size="sm">
              <LogOut className="size-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
            <nav className="flex flex-col gap-2">
              {navItems.filter(item => item.show).map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
