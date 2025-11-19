import { useState } from 'react';
import { userLogout } from '../../redux/slices/userSlice';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ProtectedRoute } from '../layouts/protectedRoutes';
import { LogoutModal } from '../models/logoutModel';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Plus, 
  LogOut,
  Users,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/hooks';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const { user, isLoading } = useAuth();

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

  const userRole = user?.role?.toLowerCase() || 'agent';
  const userName = user?.businessName || user?.name || 'User';
  const userEmail = user?.email || 'user@company.com';

  const adminNavigation = [
    {
      name: 'Stats',
      href: '/dashboard/admin/stat',
      icon: BarChart3,
      current: router.pathname === '/dashboard/admin/stat',
      description: 'Analytics & Overview'
    },
    {
      name: 'Template Management',
      href: '/dashboard/admin/templates/template',
      icon: FolderOpen,
      current: router.pathname === '/dashboard/admin/templates/template',
      description: 'Manage Templates'
    },
    {
      name: 'User Management',
      href: '/dashboard/admin/userManagement',
      icon: Users,
      current: router.pathname === '/dashboard/admin/users',
      description: 'Manage Users'
    }
  ];

  const agentNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard/agent/overview',
      icon: LayoutDashboard,
      current: router.pathname === '/dashboard/agent/overview',
      description: 'Overview & Analytics'
    },
    {
      name: 'My Requests',
      href: '/dashboard/agent/requests',
      icon: FileText,
      current: router.pathname === '/dashboard/agent/requests',
      description: 'View All Requests'
    },
    {
      name: 'Template Library',
      href: '/dashboard/agent/templates',
      icon: FolderOpen,
      current: router.pathname === '/dashboard/agent/templates',
      description: 'Browse Templates'
    },
    {
      name: 'Submit Request',
      href: '/dashboard/agent/submit',
      icon: Plus,
      current: router.pathname === '/dashboard/agent/submit',
      description: 'New Request'
    },
  ];

  const navigation = userRole === 'admin' ? adminNavigation : agentNavigation;

  const userSetting = [
    // {
    //   name: 'Settings',
    //   href: userRole === 'admin' ? '/dashboard/admin/settings' : '/dashboard/agent/settings',
    //   icon: Settings,
    //   current: router.pathname === (userRole === 'admin' ? '/dashboard/admin/settings' : '/dashboard/agent/settings')
    // },
    {
      name: 'Logout',
      href: '#',
      icon: LogOut,
      current: false
    }
  ];

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoading && !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#EEEEEE]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#595959] font-manrope" style={{ fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    );
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
        <LogoutModal
          isOpen={showLogoutModal}
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />

        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-72">
            <div className="flex flex-col h-0 flex-1 bg-white shadow-lg">
              <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-6 mb-8 border-b border-[#EEEEEE] pb-6">
                  <Image
                    src={backgroundImage}
                    alt="Logo"
                    width={180}
                    height={50}
                    className="h-14 w-auto"
                  />
                </div>

                <div className="px-6 mb-6">
                  <div className="bg-[#EEEEEE] rounded-lg p-4 border border-[#595959]/10 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="bg-black rounded-full h-12 w-12 flex items-center justify-center text-white font-manrope" style={{ fontWeight: 800 }}>
                        {getUserInitials(userName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-black truncate font-manrope" style={{ fontWeight: 800 }}>
                          {userName}
                        </p>
                        <p className="text-xs text-[#595959] truncate font-roboto" style={{ fontWeight: 400 }}>
                          {userEmail}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-manrope ${
                          userRole === 'admin' 
                            ? 'bg-black text-white' 
                            : 'bg-[#595959] text-white'
                        }`} style={{ fontWeight: 700 }}>
                          {userRole === 'admin' ? 'Admin' : 'Agent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                  <p className="px-3 text-xs text-[#595959] uppercase tracking-wider mb-3 font-manrope" style={{ fontWeight: 800 }}>
                    {userRole === 'admin' ? 'Admin Panel' : 'Main Menu'}
                  </p>
                  {navigation.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className={`${
                          item.current
                            ? 'bg-black text-white shadow-md'
                            : 'text-[#595959] hover:bg-[#EEEEEE] hover:text-black'
                        } group flex items-center px-4 py-3.5 text-sm rounded-lg transition-all duration-200 relative`}
                      >
                        <IconComponent className="w-5 h-5 mr-3" strokeWidth={2} />
                        <div className="flex-1">
                          {/* <div className="flex items-center justify-between">
                            <span className="font-manrope" style={{ fontWeight: 800 }}>{item.name}</span>
                            {item.badge && (
                              <span className="bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm font-manrope" style={{ fontWeight: 800 }}>
                                {item.badge}
                              </span>
                            )}
                          </div> */}
                          <p className={`text-xs mt-0.5 font-roboto ${item.current ? 'text-white/80' : 'text-[#595959]'}`} style={{ fontWeight: 300 }}>{item.description}</p>
                        </div>
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
                        }}
                        className="text-[#595959] hover:bg-[#EEEEEE] hover:text-black group flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <IconComponent className="w-5 h-5 mr-3" strokeWidth={2} />
                        <span className="font-manrope" style={{ fontWeight: 700 }}>{item.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

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
                    <div className="bg-black rounded-full h-11 w-11 flex items-center justify-center text-white font-manrope" style={{ fontWeight: 800 }}>
                      {getUserInitials(userName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black truncate font-manrope" style={{ fontWeight: 800 }}>
                        {userName}
                      </p>
                      <p className="text-xs text-[#595959] truncate font-roboto" style={{ fontWeight: 400 }}>
                        {userEmail}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-manrope ${
                        userRole === 'admin' 
                          ? 'bg-black text-white' 
                          : 'bg-[#595959] text-white'
                      }`} style={{ fontWeight: 700 }}>
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
                        className={`${
                          item.current
                            ? 'bg-black text-white shadow-md'
                            : 'text-[#595959] hover:bg-[#EEEEEE] hover:text-black'
                        } group flex items-center px-4 py-3.5 text-base rounded-lg transition-all duration-200`}
                      >
                        <IconComponent className="w-5 h-5 mr-3" strokeWidth={2} />
                        <span className="flex-1 font-manrope" style={{ fontWeight: 800 }}>{item.name}</span>
                        {/* {item.badge && (
                          <span className="bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm font-manrope" style={{ fontWeight: 800 }}>
                            {item.badge}
                          </span>
                        )} */}
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile User Settings */}
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
                        className="text-[#595959] hover:bg-[#EEEEEE] hover:text-black group flex items-center px-4 py-3 text-base rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <IconComponent className="w-5 h-5 mr-3" strokeWidth={2} />
                        <span className="font-manrope" style={{ fontWeight: 700 }}>{item.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-[#EEEEEE] shadow-sm">
            <button
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-black hover:text-[#595959] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <span className="text-2xl">☰</span>
            </button>
          </div>

          <div className="bg-white shadow-sm z-10 border-b border-[#EEEEEE]">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl text-black font-manrope" style={{ fontWeight: 800 }}>
                    {navigation.find(item => item.current)?.name || (userRole === 'admin' ? 'Admin Dashboard' : 'Agent Dashboard')}
                  </h1>
                  <p className="text-sm text-[#595959] mt-1 font-roboto" style={{ fontWeight: 400 }}>
                    {navigation.find(item => item.current)?.description || 'Welcome back'}
                  </p>
                </div>
                
                {userRole === 'agent' && (
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => router.push('/dashboard/agent/submit')}
                      className="bg-black hover:bg-[#595959] text-white px-5 py-2.5 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md font-manrope" 
                      style={{ fontWeight: 800 }}
                    >
                      + New Request
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-[#EEEEEE]">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};