import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../../redux/slices/userSlice';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ProtectedRoute } from '../layouts/protectedRoutes';
import { LogoutModal } from '../models/logoutModel';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const backgroundImage = '/Logo.png';

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    dispatch(userLogout());
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Professional Agent navigation with complete features
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard/agent/overview',
      icon: '📊',
      current: router.pathname === '/dashboard/agent/overview',
      description: 'Overview & Analytics'
    },
    {
      name: 'My Requests',
      href: '/dashboard/agent/requests',
      icon: '📋',
      current: router.pathname === '/dashboard/agent/requests',
      description: 'View All Requests'
    },
    {
      name: 'Template Library',
      href: '/dashboard/agent/templates',
      icon: '📁',
      current: router.pathname === '/dashboard/agent/templates',
      description: 'Browse Templates'
    },
    {
      name: 'Submit Request',
      href: '/dashboard/agent/submit',
      icon: '➕',
      current: router.pathname === '/dashboard/agent/submit',
      description: 'New Request'
    },
    {
      name: 'Request History',
      href: '/dashboard/agent/history',
      icon: '📜',
      current: router.pathname === '/dashboard/agent/history',
      description: 'Past Requests'
    },
    {
      name: 'My Profile',
      href: '/dashboard/agent/profile',
      icon: '👤',
      current: router.pathname === '/dashboard/agent/profile',
      description: 'Account Settings'
    },
    {
      name: 'Notifications',
      href: '/dashboard/agent/notifications',
      icon: '🔔',
      current: router.pathname === '/dashboard/agent/notifications',
      description: 'Updates & Alerts',
      badge: 3
    },
    {
      name: 'Help & Support',
      href: '/dashboard/agent/support',
      icon: '❓',
      current: router.pathname === '/dashboard/agent/support',
      description: 'Get Help'
    }
  ];

  const userSetting = [
    {
      name: 'Settings',
      href: '/dashboard/agent/settings',
      icon: '⚙️',
      current: router.pathname === '/dashboard/agent/settings'
    },
    {
      name: 'Logout',
      href: '#',
      icon: '🚪',
      current: false
    }
  ];

  return (
    <ProtectedRoute>
      <div className="h-screen flex overflow-hidden bg-gray-200">
        {/* Logout Modal */}
        <LogoutModal
          isOpen={showLogoutModal}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />

        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-72">
            <div className="flex flex-col h-0 flex-1   shadow-2xl">
              {/* Logo Section */}
              <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-6 mb-8 border-b border-slate-700 pb-6">
                  <Image
                    src={backgroundImage}
                    alt="Logo"
                    width={180}
                    height={50}
                    className="h-14 w-auto"
                  />
                </div>

                {/* User Info Card */}
                <div className="px-6 mb-6">
                  <div className="bg-[#3b5054] rounded-xl p-4 border border-[#595959]/20 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-[#3b5054] to-[#595959] rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg border-2 border-white/20">
                        AG
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          Agent Name
                        </p>
                        <p className="text-xs text-gray-300 truncate">
                          agent@company.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                  <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Main Menu
                  </p>
                  {navigation.slice(0, 4).map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`${
                        item.current
                          ? 'bg-[#3b5054] text-white shadow-xl border-l-4 border-white'
                          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                      } group flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-all duration-200 relative`}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{item.name}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                    </a>
                  ))}

                </nav>
              </div>

              {/* User Settings - Bottom */}
              <div className="flex-shrink-0 border-t border-slate-700  p-4">
                <div className="space-y-1">
                  {userSetting.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        if (item.name === 'Logout') {
                          e.preventDefault();
                          handleLogout();
                        }
                      }}
                      className="text-gray-300 hover:bg-slate-700 hover:text-white group flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 flex z-40">
            <div
              className="fixed inset-0 bg-black bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-[#3b5054] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white shadow-xl"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <span className="text-white text-2xl font-bold">✕</span>
                </button>
              </div>

              {/* Mobile Logo */}
              <div className="flex-shrink-0 flex items-center px-6 py-6 border-b border-slate-700">
                <Image
                  src={backgroundImage}
                  alt="Logo"
                  width={150}
                  height={40}
                  className="h-12 w-auto"
                />
              </div>

              {/* Mobile User Info */}
              <div className="px-4 py-4">
                <div className="bg-[#3b5054] rounded-xl p-4 border border-[#595959]/20 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-[#3b5054] to-[#595959] rounded-full h-11 w-11 flex items-center justify-center text-white font-bold text-base border-2 border-white/20">
                      AG
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        Agent Name
                      </p>
                      <p className="text-xs text-gray-300 truncate">
                        agent@company.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="mt-2 flex-1 h-0 overflow-y-auto">
                <nav className="px-4 space-y-1">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`${
                        item.current
                          ? 'bg-[#3b5054] text-white shadow-xl border-l-4 border-white'
                          : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                      } group flex items-center px-4 py-3.5 text-base font-medium rounded-lg transition-all duration-200`}
                    >
                      <span className="text-xl mr-3">{item.icon}</span>
                      <span className="flex-1 font-semibold">{item.name}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Mobile User Settings */}
              <div className="flex-shrink-0 border-t border-slate-700 bg-[#0f172a] p-4">
                <div className="space-y-1">
                  {userSetting.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        if (item.name === 'Logout') {
                          e.preventDefault();
                          handleLogout();
                        }
                        setSidebarOpen(false);
                      }}
                      className="text-gray-300 hover:bg-slate-700 hover:text-white group flex items-center px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200 shadow-sm">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-[#595959] hover:text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#3b5054]"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <span className="text-2xl">☰</span>
            </button>
          </div>

          {/* Page header */}
          <div className="bg-white shadow-sm z-10 border-b border-[#EEEEEE]">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                {/* Left - Page Title */}
                <div>
                  <h1 className="text-3xl font-bold text-black">
                    {navigation.find(item => item.current)?.name || 'Agent Dashboard'}
                  </h1>
                  <p className="text-sm text-[#595959] mt-1 font-medium">
                    {navigation.find(item => item.current)?.description || 'Welcome back'}
                  </p>
                </div>
                
                {/* Right - Quick Actions */}
                <div className="flex items-center space-x-3">
                  <button className="bg-[#3b5054] hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-md hover:shadow-xl border-2 border-[#3b5054] hover:border-black">
                    + New Request
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[#EEEEEE]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};