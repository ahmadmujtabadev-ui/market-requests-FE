import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  FileText,
  Building2,
  ExternalLink,
  ChevronDown,
  X,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { fetchTemplatesAsync, deleteTemplateAsync } from '@/services/template/asyncThunk';
import { selectTemplates } from '@/redux/slices/templateSlice';
import { LoadingOverlay } from '@/components/loaders/overlayloader';

type TemplateType = 'residential' | 'commercial';

const RESIDENTIAL_CATEGORIES = [
  "Guides",
  "Seller Guide",
  "Property Brochures",
  "12 Months Newsletter",
  "Pre-Listing Checklist",
  "Vendor List",
  "Postcard (6*4 inch)",
  "Postcard (6*4 inch) Congratulations",
  "Postcard (6*4 inch) Holiday",
  "Postcard (6*4 inch) Just Listed",
  "Postcard (6*4 inch) Sold",
  "Postcard (6*4 inch) Maintenence",
  "Postcard (6*4 inch) Under Contract",
  "Postcard (6*4 inch) General",
  "Postcard (6*4 inch) Intro",
  "Postcard (6*4 inch) Open House",
  "Postcard (7*5 inch)",
  "Postcard (7*5 inch) Congratulations",
  "Postcard (7*5 inch) Holiday",
  "Postcard (7*5 inch) Just Listed",
  "Postcard (7*5 inch) Sold",
  "Postcard (7*5 inch) Maintenence",
  "Postcard (7*5 inch) Under Contract",
  "Postcard (7*5 inch) General",
  "Postcard (7*5 inch) Intro",
  "Postcard (7*5 inch) Open House",
  "Instagram Posts (1080*1080)",
  "Instagram Posts (1080*1080) About us",
  "Instagram Posts (1080*1080) General",
  "Instagram Posts (1080*1080) Tips",
  "Instagram Posts (1080*1080) Discover",
  "Instagram Posts (1080*1080) Q&A",
  "Instagram Posts (1080*1080) Listing",
  "Instagram Posts (1080*1080) Marketing Updates",
  "Instagram Posts (1080*1080) Open House",
  "Instagram Posts (1080*1080) Testominal",
  "Instagram Stories (1080*1920)",
  "Instagram Stories (1080*1920) General",
  "Instagram Stories (1080*1920) Discover",
  "Instagram Stories (1080*1920) Listing",
  "Instagram Stories (1080*1920) Marketing Updates",
  "Instagram Stories (1080*1920) Open House",
  "Instagram Stories (1080*1920) Testominal",
  "Flyers",
];

const COMMERCIAL_CATEGORIES = [
  'All',
  'For Sale',
  'For Lease',
  'Sold/Leased',
  'Price Adjustment',
  'Project Announcements',
  'Market Reports',
  'Property Highlights',
  'Broker Branding',
];

export default function AdminTemplatesPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items: templates, isLoading } = useSelector(selectTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType>('residential');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchTemplatesAsync());
  }, [dispatch]);

  const categories = selectedType === 'residential' ? RESIDENTIAL_CATEGORIES : COMMERCIAL_CATEGORIES;

  const filteredTemplates = useMemo(() => {
    const list = Array.isArray(templates) ? templates : [];
    const normalizedSearch = (searchQuery || '').toLowerCase();

    return list
      .filter(Boolean)
      .filter((template) => {
        const matchesType = template.type === selectedType;
        const matchesCategory =
          selectedCategory === 'All' || template.category === selectedCategory;

        const title = (template.title || '').toLowerCase();
        const category = (template.category || '').toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          title.includes(normalizedSearch) ||
          category.includes(normalizedSearch);

        return matchesType && matchesCategory && matchesSearch;
      });
  }, [templates, selectedType, selectedCategory, searchQuery]);

  const templateCounts = useMemo(() => {
    const list = Array.isArray(templates) ? templates.filter(Boolean) : [];
    return {
      total: list.length,
      residential: list.filter(t => t.type === 'residential').length,
      commercial: list.filter(t => t.type === 'commercial').length,
    };
  }, [templates]);


  const openDeleteModal = (templateId: string, templateTitle: string) => {
    setTemplateToDelete({ id: templateId, title: templateTitle });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    }
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);
    try {
      setShowDeleteModal(false);
      await dispatch(deleteTemplateAsync(templateToDelete.id)).unwrap();
      dispatch(fetchTemplatesAsync());
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTypeChange = (type: TemplateType) => {
    setSelectedType(type);
    setSelectedCategory('All');
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
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push('/dashboard/admin/templates/actions/add-template-form')}
              className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg font-manrope hover:bg-[#595959] transition-colors"
              style={{ fontWeight: 700 }}
            >
              <Plus className="w-5 h-5" />
              Add Template
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Total Templates
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {templateCounts.total}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Residential
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {templateCounts.residential}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-4">
              <p className="text-xs text-[#595959] font-roboto mb-1" style={{ fontWeight: 400 }}>
                Commercial
              </p>
              <p className="text-2xl text-black font-manrope" style={{ fontWeight: 800 }}>
                {templateCounts.commercial}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex rounded-lg bg-white border border-[#EEEEEE] p-1">
              <button
                onClick={() => handleTypeChange('residential')}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-manrope transition-all ${selectedType === 'residential'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-[#595959] hover:text-black'
                  }`}
                style={{ fontWeight: 700 }}
              >
                <FileText className="w-4 h-4" />
                Residential
              </button>
              <button
                onClick={() => handleTypeChange('commercial')}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-manrope transition-all ${selectedType === 'commercial'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-[#595959] hover:text-black'
                  }`}
                style={{ fontWeight: 700 }}
              >
                <Building2 className="w-4 h-4" />
                Commercial
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#EEEEEE] p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div className="lg:w-64 relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  style={{ fontWeight: 400 }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div>
            {isLoading ? (
              <LoadingOverlay isVisible />
            ) : filteredTemplates.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-[#595959] mx-auto mb-4" />
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  No templates found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#EEEEEE]">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        PREVIEW
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        TEMPLATE
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        CATEGORY
                      </th>
                      <th className="text-left px-6 py-4 text-xs text-black font-manrope" style={{ fontWeight: 700 }}>
                        TYPE
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
                    {filteredTemplates.map((template) => (
                      <tr key={template.id} className="border-t border-[#EEEEEE] hover:bg-[#EEEEEE]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-20 h-12 bg-[#EEEEEE] rounded overflow-hidden">
                            {template.previewUrl ? (
                              <img
                                src={template.previewUrl}
                                alt={template.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-[#595959]" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-black font-roboto" style={{ fontWeight: 500 }}>
                            {template.title}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-1 bg-[#EEEEEE] text-[#595959] rounded text-xs font-roboto" style={{ fontWeight: 500 }}>
                            {template.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roboto ${template.type === 'residential'
                            ? 'bg-black text-white'
                            : 'bg-[#595959] text-white'
                            }`} style={{ fontWeight: 600 }}>
                            {template.type === 'residential' ? <FileText className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                            {template.type === 'residential' ? 'Residential' : 'Commercial'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                            {new Date(template.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {template.canvaUrl && (
                              <a
                                href={template.canvaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-[#EEEEEE] rounded-lg transition-colors"
                                title="Preview in Canva"
                              >
                                <ExternalLink className="w-4 h-4 text-[#595959]" />
                              </a>
                            )}
                            <button
                              onClick={() => router.push(`/dashboard/admin/templates/actions/edit/${template.id}`)}
                              className="p-2 hover:bg-[#EEEEEE] rounded-lg transition-colors"
                              title="Edit Template"
                            >
                              <Edit className="w-4 h-4 text-[#595959]" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(template.id, template.title)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Template"
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

      {showDeleteModal && templateToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-manrope text-black mb-2" style={{ fontWeight: 700 }}>
                  Delete Template
                </h3>
                <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
                  Are you sure you want to delete <span className="font-medium text-black">{templateToDelete.title}</span>? This action cannot be undone.
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
                  <LoadingOverlay isVisible />
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