/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef, useEffect } from 'react';
import { selectUser, userLogout } from '../../redux/slices/userSlice';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ProtectedRoute } from '../layouts/protectedRoutes';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Plus,
  LogOut,
  Users,
  BarChart3,
  Settings,
  Settings2Icon,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { fetchUserMeAsync } from '@/services/auth/asyncThunk';
import { LoadingOverlay } from '../loaders/overlayloader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { profile } = useAppSelector(selectUser);

  useEffect(() => {
    try {
      dispatch(fetchUserMeAsync()).unwrap();
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const backgroundImage = '/Logo.png';

  const handleLogout = () => {
    dispatch(userLogout());
    setProfileDropdownOpen(false);
  };

  // ---- ROLE HANDLING (ADMIN / AGENT / VA) ----
  const rawRole = profile?.role?.toLowerCase() || 'agent';

  // normalize to one of: admin | agent | va
  const userRole: 'admin' | 'agent' | 'va' =
    rawRole === 'admin'
      ? 'admin'
      : rawRole === 'va' || rawRole === 'virtual_assistant' || rawRole === 'virtual assistant'
        ? 'va'
        : 'agent';

  const userName: string = profile?.businessName || profile?.name || 'User';
  const userEmail: string = profile?.email || 'user@company.com';

  interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    current: boolean;
    description: string;
  }

  const adminNavigation: NavigationItem[] = [
    {
      name: 'Stats',
      href: '/dashboard/admin/stat',
      icon: BarChart3,
      current: router.pathname === '/dashboard/admin/stat',
      description: 'Analytics & Overview',
    },
    {
      name: 'Template Management',
      href: '/dashboard/admin/templates/template',
      icon: FolderOpen,
      current: router.pathname === '/dashboard/admin/templates/template',
      description: 'Manage Templates',
    },
    {
      name: 'User Management',
      href: '/dashboard/admin/userManagement',
      icon: Users,
      current: router.pathname === '/dashboard/admin/users',
      description: 'Manage Users',
    },
  ];

  const agentNavigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard/agent/overview',
      icon: LayoutDashboard,
      current: router.pathname === '/dashboard/agent/overview',
      description: 'Overview & Analytics',
    },
    {
      name: 'My Requests',
      href: '/dashboard/agent/requests',
      icon: FileText,
      current: router.pathname === '/dashboard/agent/requests',
      description: 'View All Requests',
    },
    {
      name: 'Template Library',
      href: '/dashboard/agent/templates',
      icon: FolderOpen,
      current: router.pathname === '/dashboard/agent/templates',
      description: 'Browse Templates',
    },
    {
      name: 'Submit Request',
      href: '/dashboard/agent/submit',
      icon: Plus,
      current: router.pathname === '/dashboard/agent/submit',
      description: 'New Request',
    },
  ];

  // ---- NEW: VIRTUAL ASSISTANT NAVIGATION ----
  const vaNavigation: NavigationItem[] = [
    {
      name: 'Work Queue',
      href: '/dashboard/vs/requestque',
      icon: LayoutDashboard,
      current: router.pathname === '/dashboard/vs/requestque',
      description: 'All incoming requests (by status)',
    },
    // you can add more VA pages later, e.g. History, Reports, etc.
    // {
    //   name: 'Completed Jobs',
    //   href: '/dashboard/va/completed',
    //   icon: FolderOpen,
    //   current: router.pathname === '/dashboard/va/completed',
    //   description: 'Previously completed requests',
    // },
  ];

  const navigation: NavigationItem[] =
    userRole === 'admin'
      ? adminNavigation
      : userRole === 'va'
        ? vaNavigation
        : agentNavigation;

  interface UserSettingItem {
    name: string;
    href: string;
    icon: any;
    current: boolean;
  }

  const userSetting: UserSettingItem[] = [
    {
      name: 'Settings',
      href: '/dashboard/settings/SettingsPage',
      icon: Settings2Icon,
      current: false,
    },
    {
      name: 'Logout',
      href: '#',
      icon: LogOut,
      current: false,
    },
  ];

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!profile) {
    return <LoadingOverlay isVisible />;
  }

  return (
    <ProtectedRoute>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap');

        .font-manrope {
          font-family: 'Manrope', sans-serif;
        }

        .font-roboto {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
      <div className="h-screen flex overflow-hidden bg-[#EEEEEE]">
        {/* Desktop sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-72">
            <div className="flex flex-col h-0 flex-1 bg-white shadow-lg">
              <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                {/* Logo */}
                <div className="flex items-center flex-shrink-0 px-6 mb-8 border-b border-[#EEEEEE] pb-6">
                  <Image
                    src={backgroundImage}
                    alt="Logo"
                    width={180}
                    height={50}
                    className="h-14 w-auto"
                  />
                </div>

                {/* User Profile Card */}
                <div className="px-6 mb-6">
                  <div className="bg-[#EEEEEE] rounded-lg p-4 border border-[#595959]/10 shadow-sm">
                    <div className="flex items-center space-x-3">
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={userName}
                          className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="bg-black rounded-full h-12 w-12 flex items-center justify-center text-white font-manrope"
                          style={{ fontWeight: 800 }}
                        >
                          {getUserInitials(userName)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm text-black truncate font-manrope"
                          style={{ fontWeight: 800 }}
                        >
                          {userName}
                        </p>
                        <p
                          className="text-xs text-[#595959] truncate font-roboto"
                          style={{ fontWeight: 400 }}
                        >
                          {userEmail}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-manrope ${userRole === 'admin'
                            ? 'bg-black text-white'
                            : 'bg-[#595959] text-white'
                            }`}
                          style={{ fontWeight: 700 }}
                        >
                          {userRole === 'admin' ? 'Admin' : 'Agent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                  <p
                    className="px-3 text-xs text-[#595959] uppercase tracking-wider mb-3 font-manrope"
                    style={{ fontWeight: 800 }}
                  >
                    {userRole === 'admin'
                      ? 'Admin Panel'
                      : userRole === 'va'
                        ? 'VA Panel'
                        : 'Main Menu'}
                  </p>
                  {navigation.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`${item.current
                          ? 'bg-black text-white shadow-md'
                          : 'text-[#595959] hover:bg-[#EEEEEE] hover:text-black'
                          } group flex items-center px-4 py-3.5 text-sm rounded-lg transition-all duration-200`}
                      >
                        <IconComponent
                          className={`mr-3 flex-shrink-0 h-5 w-5 ${item.current ? 'text-white' : 'text-[#595959] group-hover:text-black'
                            }`}
                        />
                        <div className="flex-1">
                          <p
                            className={`font-manrope ${item.current ? 'text-white' : 'text-[#595959]'
                              }`}
                            style={{ fontWeight: 800 }}
                          >
                            {item.name}
                          </p>
                          <p
                            className={`text-xs mt-0.5 font-roboto ${item.current ? 'text-white/80' : 'text-[#595959]'
                              }`}
                            style={{ fontWeight: 300 }}
                          >
                            {item.description}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Settings Section */}
              <div className="flex-shrink-0 border-t border-[#EEEEEE] p-4">
                <div className="space-y-1">
                  {userSetting.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => {
                          if (item.name === 'Logout') {
                            e.preventDefault();
                            handleLogout();
                          }
                        }}
                        className={`${item.name === 'Logout'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-[#595959] hover:bg-[#EEEEEE] hover:text-black'
                          } group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 cursor-pointer`}
                      >
                        <IconComponent className="mr-3 flex-shrink-0 h-5 w-5" />
                        <span className="font-manrope" style={{ fontWeight: 700 }}>
                          {item.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sidebar */}
        <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 flex z-40">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white shadow-lg"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <span className="text-white text-2xl font-bold">✕</span>
                </button>
              </div>

              <div className="flex-shrink-0 flex items-center px-6 py-6 border-b border-[#EEEEEE]">
                <Image
                  src={backgroundImage}
                  alt="Logo"
                  width={150}
                  height={40}
                  className="h-12 w-auto"
                />
              </div>

              <div className="px-4 py-4">
                <div className="bg-[#EEEEEE] rounded-lg p-4 border border-[#595959]/10 shadow-sm">
                  <div className="flex items-center space-x-3">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={userName}
                        className="h-11 w-11 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="bg-black rounded-full h-11 w-11 flex items-center justify-center text-white font-manrope"
                        style={{ fontWeight: 800 }}
                      >
                        {getUserInitials(userName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm text-black truncate font-manrope"
                        style={{ fontWeight: 800 }}
                      >
                        {userName}
                      </p>
                      <p
                        className="text-xs text-[#595959] truncate font-roboto"
                        style={{ fontWeight: 400 }}
                      >
                        {userEmail}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-manrope ${userRole === 'admin'
                          ? 'bg-black text-white'
                          : 'bg-[#595959] text-white'
                          }`}
                        style={{ fontWeight: 700 }}
                      >
                        {userRole === 'admin' ? 'Admin' : 'Agent'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex-1 h-0 overflow-y-auto">
                <nav className="px-4 space-y-1">
                  {navigation.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`${item.current
                          ? 'bg-black text-white shadow-md'
                          : 'text-[#595959] hover:bg-[#EEEEEE] hover:text-black'
                          } group flex items-center px-4 py-3.5 text-base rounded-lg transition-all duration-200`}
                      >
                        <IconComponent
                          className={`mr-3 flex-shrink-0 h-6 w-6 ${item.current ? 'text-white' : 'text-[#595959] group-hover:text-black'
                            }`}
                        />
                        <span className="flex-1 font-manrope" style={{ fontWeight: 800 }}>
                          {item.name}
                        </span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              <div className="flex-shrink-0 border-t border-[#EEEEEE] p-4">
                <div className="space-y-1">
                  {userSetting.map((item) => {
                    const IconComponent = item.icon;
                    return (
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
                        className={`${item.name === 'Logout'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-[#595959] hover:bg-[#EEEEEE] hover:text-black'
                          } group flex items-center px-4 py-3 text-base rounded-lg transition-all duration-200 cursor-pointer`}
                      >
                        <IconComponent className="mr-3 flex-shrink-0 h-6 w-6" />
                        <span className="font-manrope" style={{ fontWeight: 700 }}>
                          {item.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Mobile menu button */}
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-[#EEEEEE] shadow-sm">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-black hover:text-[#595959] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <span className="text-2xl">☰</span>
            </button>
          </div>

          {/* Page Header */}
          <div className="bg-white shadow-sm z-10 border-b border-[#EEEEEE]">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1
                    className="text-3xl text-black font-manrope"
                    style={{ fontWeight: 800 }}
                  >
                    {navigation.find((item) => item.current)?.name ||
                      (userRole === 'admin' ? 'Admin Dashboard' : 'Agent Dashboard')}
                  </h1>
                  <p
                    className="text-sm text-[#595959] mt-1 font-roboto"
                    style={{ fontWeight: 400 }}
                  >
                    {navigation.find((item) => item.current)?.description || 'Welcome back'}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {userRole === 'agent' && (
                    <button
                      onClick={() => router.push('/dashboard/agent/submit')}
                      className="bg-black hover:bg-[#595959] text-white px-5 py-2.5 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md font-manrope"
                      style={{ fontWeight: 800 }}
                    >
                      + New Request
                    </button>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className={`flex items-center justify-center rounded-full h-10 w-10 transition-all duration-200 shadow-sm ${profile ? '' : 'bg-black hover:bg-[#595959]'
                        }`}
                    >
                      {profile.profileImage ? (
                        <img
                          src={profile.profileImage}
                          alt={userName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span
                          className="text-white font-manrope text-sm"
                          style={{ fontWeight: 800 }}
                        >
                          {getUserInitials(userName)}
                        </span>
                      )}
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-[#EEEEEE] z-50 overflow-hidden">
                        <div className="px-4 py-4 border-b border-[#EEEEEE] bg-[#FAFAFA]">
                          <div className="flex items-center space-x-3">
                            {profile.profileImage ? (
                              <img
                                src={profile.profileImage}
                                alt={userName}
                                className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div
                                className="bg-black rounded-full h-12 w-12 flex items-center justify-center text-white font-manrope flex-shrink-0"
                                style={{ fontWeight: 800 }}
                              >
                                {getUserInitials(userName)}
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm text-black truncate font-manrope"
                                style={{ fontWeight: 800 }}
                              >
                                {userName}
                              </p>
                              <p
                                className="text-xs text-[#595959] truncate font-roboto"
                                style={{ fontWeight: 400 }}
                              >
                                {userEmail}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <button
                            onClick={() => {
                              router.push('/dashboard/settings/SettingsPage');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-[#595959] hover:bg-[#FAFAFA] transition-colors duration-150"
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            <span className="font-manrope" style={{ fontWeight: 600 }}>
                              Settings
                            </span>
                          </button>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            <span className="font-manrope" style={{ fontWeight: 600 }}>
                              Logout
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[#EEEEEE]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};