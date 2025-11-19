// pages/dashboard/admin/userManagement/index.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Users, Plus, Edit, Trash2, Lock, Power, Search, Filter, ChevronDown, X, AlertTriangle, Mail, Calendar, Activity } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { DashboardLayout } from '@/components/layouts';
import { 
  adminResetPasswordAsync, 
  deleteUserAsync,
  fetchUsersAsync, 
  fetchUserStatsAsync, 
  toggleUserActiveAsync 
} from '@/services/admin/asyncThunk';
import { User } from '@/types/user';

export default function UserManagementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { 
    users, 
    stats,  
    loading, 
    error, 
    successMessage,
  } = useAppSelector((state) => state.admin);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchUsersAsync({ 
      search: searchQuery, 
      role: selectedRole, 
      page: 1,
      limit: 10 
    }));
    dispatch(fetchUserStatsAsync());
  }, [dispatch, searchQuery, selectedRole, selectedStatus]);

  const filteredUsers = useMemo(() => {
    return users?.filter((user: User) => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !selectedRole || user.role === selectedRole;
      const matchesStatus = !selectedStatus || user.isActive.toString() === selectedStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteUserAsync(userToDelete.id)).unwrap();
      dispatch(fetchUsersAsync({}));
      dispatch(fetchUserStatsAsync());
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openResetPasswordModal = (user: User) => {
    setUserToResetPassword(user);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const closeResetPasswordModal = () => {
    if (!isResetting) {
      setShowResetPasswordModal(false);
      setUserToResetPassword(null);
      setNewPassword('');
    }
  };

  const confirmResetPassword = async () => {
    if (!userToResetPassword || newPassword.length < 8) return;
    
    setIsResetting(true);
    try {
      await dispatch(adminResetPasswordAsync({ 
        id: userToResetPassword.id, 
        data: { newPassword } 
      })).unwrap();
      setShowResetPasswordModal(false);
      setUserToResetPassword(null);
      setNewPassword('');
    } catch (error) {
      console.error('Reset password failed:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await dispatch(toggleUserActiveAsync(userId)).unwrap();
      dispatch(fetchUsersAsync({}));
      dispatch(fetchUserStatsAsync());
    } catch (error) {
      console.error('Toggle active failed:', error);
    }
  };

  const getRoleBadgeStyle = (role: string): string => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-600 text-white',
      agent: 'bg-black text-white',
      va: 'bg-[#595959] text-white',
    };
    return styles[role] || 'bg-gray-500 text-white';
  };

  return (
    <DashboardLayout>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap');
        
        .font-manrope {
          font-family: 'Manrope', sans-serif;
        }
        
        .font-roboto {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>

      <div className="flex-1 overflow-auto bg-[#EEEEEE] p-6 lg:p-8">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-manrope text-black mb-2" style={{ fontWeight: 800 }}>
                User Management
              </h1>
              <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                Manage your team members and their permissions
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/admin/userManagement/actions/add-user-form')}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors"
              style={{ fontWeight: 700 }}
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-black" />
                  </div>
                  <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Total Users
                  </p>
                </div>
                <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                  {stats.total}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Active Users
                  </p>
                </div>
                <p className="text-2xl text-green-600 font-manrope" style={{ fontWeight: 800 }}>
                  {stats.active}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Power className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Inactive Users
                  </p>
                </div>
                <p className="text-2xl text-red-600 font-manrope" style={{ fontWeight: 800 }}>
                  {stats.inactive}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                    Admins
                  </p>
                </div>
                <p className="text-2xl text-purple-600 font-manrope" style={{ fontWeight: 800 }}>
                  {stats.byRole?.admin || 0}
                </p>
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-roboto" style={{ fontWeight: 400 }}>
                {error}
              </p>
            </div>
          )}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-roboto" style={{ fontWeight: 400 }}>
                {successMessage}
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div className="lg:w-48 relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="va">VA</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
              </div>
              <div className="lg:w-48 relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 pr-10 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              Showing {filteredUsers?.length} user{filteredUsers?.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#EEEEEE] border-t-black"></div>
                <p className="text-sm text-[#595959] font-roboto mt-4" style={{ fontWeight: 400 }}>
                  Loading users...
                </p>
              </div>
            ) : filteredUsers?.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-[#595959] mx-auto mb-4" />
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  No users found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#EEEEEE]">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        USER
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        ROLE
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        STATUS
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        REQUESTS
                      </th>
                      <th className="text-right px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers?.map((user: User) => (
                      <tr key={user?.id} className="border-t border-[#EEEEEE] hover:bg-[#EEEEEE]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-manrope" style={{ fontWeight: 700 }}>
                              {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                                {user?.name}
                              </p>
                              <p className="text-xs text-[#595959] font-roboto flex items-center gap-1" style={{ fontWeight: 400 }}>
                                <Mail className="w-3 h-3" />
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roboto ${getRoleBadgeStyle(user.role)}`} style={{ fontWeight: 600 }}>
                            {user?.role?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roboto ${
                            user?.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`} style={{ fontWeight: 600 }}>
                            <div className={`w-2 h-2 rounded-full ${user?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {user?.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {/* <td className="px-6 py-4">
                          <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 500 }}>
                            {user?.requestCount || 0}
                          </p>
                        </td> */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#595959] font-roboto flex items-center gap-1" style={{ fontWeight: 400 }}>
                            <Calendar className="w-3 h-3" />
                            {new Date(user?.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        {/* <td className="px-6 py-4">
                          <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                            {user?.lastLoginAt ? new Date(user?.lastLoginAt).toLocaleDateString() : 'Never'}
                          </p>
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/admin/userManagement/actions/edit/${user?.id}`)}
                              className="p-2 hover:bg-[#EEEEEE] rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4 text-[#595959]" />
                            </button>
                            <button
                              onClick={() => openResetPasswordModal(user)}
                              className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Reset Password"
                            >
                              <Lock className="w-4 h-4 text-orange-600" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(user.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive 
                                  ? 'hover:bg-yellow-50' 
                                  : 'hover:bg-green-50'
                              }`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              <Power className={`w-4 h-4 ${user.isActive ? 'text-yellow-600' : 'text-green-600'}`} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-manrope text-black mb-2" style={{ fontWeight: 700 }}>
                  Delete User
                </h3>
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  Are you sure you want to delete <span className="font-medium text-black">&quot;{userToDelete.name}&quot;</span>? This action cannot be undone.
                </p>
              </div>
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="text-[#595959] hover:text-black transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-manrope text-[#595959] hover:bg-[#EEEEEE] transition-colors disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg text-sm font-manrope text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetPasswordModal && userToResetPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-manrope text-black mb-2" style={{ fontWeight: 700 }}>
                  Reset Password
                </h3>
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  Reset password for <span className="font-medium text-black">{userToResetPassword.name}</span>
                </p>
              </div>
              <button
                onClick={closeResetPasswordModal}
                disabled={isResetting}
                className="text-[#595959] hover:text-black transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-roboto text-black mb-2" style={{ fontWeight: 500 }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                style={{ fontWeight: 400 }}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeResetPasswordModal}
                disabled={isResetting}
                className="flex-1 px-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-manrope text-[#595959] hover:bg-[#EEEEEE] transition-colors disabled:opacity-50"
                style={{ fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmResetPassword}
                disabled={isResetting || newPassword.length < 8}
                className="flex-1 px-4 py-2.5 bg-orange-600 rounded-lg text-sm font-manrope text-white hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontWeight: 600 }}
              >
                {isResetting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Reset Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}