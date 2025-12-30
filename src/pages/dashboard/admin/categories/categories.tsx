import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts';
import {
  Search,
  Trash2,
  AlertTriangle,
  X,
  FolderOpen,
  Plus,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { fetchCategoriesAsync, deleteCategoryAsync } from '@/services/category/asyncThunk';
import { selectCategoryItems, selectCategoryLoading } from '@/redux/slices/categorySlice';
import { LoadingOverlay } from '@/components/loaders/overlayloader';

export default function CategoriesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(selectCategoryItems);
  const isLoading = useSelector(selectCategoryLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];

    const normalizedSearch = (searchQuery || '').toLowerCase();

    return categories.filter((category: any) => {
      if (!category) return false;

      // Status filter
      if (statusFilter === 'active' && !category.isActive) return false;
      if (statusFilter === 'inactive' && category.isActive) return false;

      // Search filter
      const name = (category.name || '').toLowerCase();
      const description = (category.description || '').toLowerCase();
      const canva = (category.canvaFolderUrl || '').toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        canva.includes(normalizedSearch);

      return matchesSearch;
    });
  }, [categories, searchQuery, statusFilter]);

  const categoryCounts = useMemo(() => {
    if (!Array.isArray(categories)) return { total: 0, active: 0, inactive: 0 };

    return {
      total: categories.length,
      active: categories.filter((c: any) => c?.isActive).length,
      inactive: categories.filter((c: any) => c && !c.isActive).length,
    };
  }, [categories]);

  const openDeleteModal = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      setShowDeleteModal(false);
      await dispatch(deleteCategoryAsync(categoryToDelete.id)).unwrap();
      dispatch(fetchCategoriesAsync());
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
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
              <h1 className="text-2xl text-black font-manrope mb-1" style={{ fontWeight: 800 }}>
                Categories
              </h1>
              <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                Manage template categories
              </p>
            </div>

            {/* Optional Add button */}
            {/*
            <button
              onClick={() => router.push('/dashboard/admin/categories/add')}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors"
              style={{ fontWeight: 700 }}
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
            */}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Total Categories
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {categoryCounts.total}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Active
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {categoryCounts.active}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Inactive
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {categoryCounts.inactive}
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div className="lg:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full px-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              Showing {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>

          {/* Categories List */}
          <div>
            {isLoading ? (
              <LoadingOverlay isVisible />
            ) : filteredCategories.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#EEEEEE] p-12 text-center">
                <FolderOpen className="w-12 h-12 text-[#595959] mx-auto mb-4" />
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  No categories found
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-[#EEEEEE] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#EEEEEE]">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                          CATEGORY NAME
                        </th>
                        <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                          STATUS
                        </th>
                        <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                          CANVA FOLDER
                        </th>
                        <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                          CREATED
                        </th>
                        <th className="text-right px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((category: any) => (
                        <tr
                          key={category.id}
                          className="border-t border-[#EEEEEE] hover:bg-[#EEEEEE]/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#EEEEEE] rounded-lg flex items-center justify-center flex-shrink-0">
                                <FolderOpen className="w-5 h-5 text-[#595959]" />
                              </div>
                              <div className="flex flex-col">
                                <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                                  {category.name}
                                </p>
                                {category.isLegacy ? (
                                  <span className="text-xs text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                                    Legacy (from templates)
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-roboto ${
                                category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}
                              style={{ fontWeight: 600 }}
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {category?.canvaFolderUrl ? (
                              <a
                                href={category.canvaFolderUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EEEEEE] hover:bg-[#EEEEEE] transition-colors text-sm text-black font-roboto"
                                title="Open Canva folder"
                                style={{ fontWeight: 500 }}
                              >
                                <ExternalLink className="w-4 h-4 text-[#595959]" />
                                Open
                              </a>
                            ) : (
                              <span className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                                Not set
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                              {new Date(category.createdAt).toLocaleDateString()}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* Optional Edit */}
                              {/*
                              <button
                                onClick={() => router.push(`/dashboard/admin/categories/edit/${category.id}`)}
                                className="p-2 hover:bg-[#EEEEEE] rounded-lg transition-colors"
                                title="Edit Category"
                                disabled={category.isLegacy}
                              >
                                <Edit className="w-4 h-4 text-[#595959]" />
                              </button>
                              */}

                              <button
                                onClick={() => openDeleteModal(category.id, category.name)}
                                disabled={!!category.isLegacy}
                                className={`p-2 rounded-lg transition-colors ${
                                  category.isLegacy ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-50'
                                }`}
                                title={category.isLegacy ? 'Legacy category cannot be deleted' : 'Delete Category'}
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-manrope text-black mb-2" style={{ fontWeight: 700 }}>
                  Delete Category
                </h3>
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-black">{categoryToDelete.name}</span>? This action cannot be undone
                  and will affect all associated templates.
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
                  <span>Deleting...</span>
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
    </DashboardLayout>
  );
}
