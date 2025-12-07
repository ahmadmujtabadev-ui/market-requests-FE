import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Search, FileText, Building2, Eye, Filter } from 'lucide-react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { selectTemplates } from '@/redux/slices/templateSlice';
import { fetchTemplatesAsync } from '@/services/template/asyncThunk';
import { LoadingOverlay } from '@/components/loaders/overlayloader';
import { fetchCategoriesAsync } from '@/services/category/asyncThunk';
import {
  selectActiveCategoryItems,
  selectCategoryLoading,
} from '@/redux/slices/categorySlice';

type TemplateType = 'residential' | 'commercial';

export default function TemplateLibraryPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { items: templates, isLoading } = useSelector(selectTemplates);

  // Categories from API
  const categoriesFromApi = useSelector(selectActiveCategoryItems);
  const categoriesLoading = useSelector(selectCategoryLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType>('residential');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch templates filtered by type
  useEffect(() => {
    dispatch(fetchTemplatesAsync({ type: selectedType }));
  }, [dispatch, selectedType]);

  // Fetch categories once
  useEffect(() => {
    dispatch(fetchCategoriesAsync());
  }, [dispatch]);

  // Build category list from API (with "All" at the top)
  const categories = useMemo(() => {
    const base = ['All'];

    if (!Array.isArray(categoriesFromApi) || categoriesFromApi.length === 0) {
      return base;
    }

    const names = Array.from(
      new Set(
        categoriesFromApi
          .filter((c) => c.isActive)
          .map((c) => (c.name || '').trim())
          .filter((name) => name.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));

    return base.concat(names);
  }, [categoriesFromApi]);

  const filteredTemplates = useMemo(() => {
    const list = Array.isArray(templates) ? templates : [];
    const normalizedSearch = searchQuery.toLowerCase();

    return list.filter((template) => {
      if (!template) return false;

      const matchesType = template.type === selectedType;
      const matchesCategory =
        selectedCategory === 'All' || template.category === selectedCategory;

      const title = (template.title || '').toLowerCase();
      const categoryName = (template.category || '').toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        categoryName.includes(normalizedSearch);

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [templates, selectedType, selectedCategory, searchQuery]);

  const handleUseTemplate = (templateId: string) => {
    router.push(`/dashboard/agent/submit?templateId=${templateId}`);
  };

  const handleTypeChange = (type: TemplateType) => {
    setSelectedType(type);
    setSelectedCategory('All'); // reset category when switching type
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
          {/* Type Toggle */}
          <div className="mb-6">
            <div className="inline-flex rounded-lg bg-white border border-[#EEEEEE] p-1">
              <button
                onClick={() => handleTypeChange('residential')}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-manrope transition-all ${
                  selectedType === 'residential'
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
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-manrope transition-all ${
                  selectedType === 'commercial'
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

          {/* Search + Category Filter */}
          <div className="mb-6 bg-white rounded-lg border border-[#EEEEEE] p-4">
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

              <div className="lg:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959]" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={categoriesLoading}
                    className="w-full pl-10 pr-4 py-2.5 border border-[#EEEEEE] rounded-lg text-sm font-roboto appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10 disabled:bg-[#F5F5F5]"
                    style={{ fontWeight: 400 }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All'
                          ? categoriesLoading
                            ? 'Loading categories...'
                            : 'All Categories'
                          : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4">
            <p
              className="text-sm text-[#595959] font-roboto"
              style={{ fontWeight: 400 }}
            >
              Showing {filteredTemplates.length} template
              {filteredTemplates.length !== 1 ? 's' : ''}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <LoadingOverlay isVisible />
          ) : filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-12 text-center">
              <FileText className="w-12 h-12 text-[#595959] mx-auto mb-4" />
              <h3
                className="text-lg text-black font-manrope mb-2"
                style={{ fontWeight: 700 }}
              >
                No templates found
              </h3>
              <p
                className="text-sm text-[#595959] font-roboto"
                style={{ fontWeight: 400 }}
              >
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg border border-[#EEEEEE] overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="h-[600px] bg-[#EEEEEE] relative overflow-hidden">
                    {template.previewUrl ? (
                      <img
                        src={template.previewUrl}
                        alt={template.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-[#595959]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-3">
                      <span
                        className="inline-block px-2 py-1 bg-[#EEEEEE] text-[#595959] text-xs rounded font-roboto"
                        style={{ fontWeight: 500 }}
                      >
                        {template.category}
                      </span>
                    </div>
                    <h3
                      className="text-base text-black font-manrope mb-3"
                      style={{ fontWeight: 700 }}
                    >
                      {template.title}
                    </h3>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg text-sm font-manrope hover:bg-[#595959] transition-all"
                        style={{ fontWeight: 700 }}
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
