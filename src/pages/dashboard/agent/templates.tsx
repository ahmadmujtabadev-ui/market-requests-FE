import React, { useEffect, useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Search, FileText, Building2, Eye, ExternalLink, Filter } from 'lucide-react';
import { useRouter } from 'next/router';

type TemplateType = 'residential' | 'commercial';

type Template = {
  id: string;
  title: string;
  category: string;
  type: TemplateType;
  previewUrl?: string;
  canvaUrl?: string;
  createdAt: string;
  updatedAt: string;
};

// Dummy data - replace with actual API call
const DUMMY_TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'Buyer Guide Template',
    category: 'Guides',
    type: 'residential',
    previewUrl: '/templates/buyer-guide.jpg',
    canvaUrl: 'https://canva.com/template/1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Property Brochure',
    category: 'Property Brochures',
    type: 'residential',
    previewUrl: '/templates/brochure.jpg',
    canvaUrl: 'https://canva.com/template/2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'For Sale Template',
    category: 'For Sale',
    type: 'commercial',
    previewUrl: '/templates/for-sale.jpg',
    canvaUrl: 'https://canva.com/template/3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'For Lease Template',
    category: 'For Lease',
    type: 'commercial',
    previewUrl: '/templates/for-lease.jpg',
    canvaUrl: 'https://canva.com/template/4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const RESIDENTIAL_CATEGORIES = [
  'All',
  'Guides',
  'Property Brochures',
  'Just Listed',
  'Coming Soon',
  'Open House',
  'Just Sold',
  'Price Improvement',
  'Under Contract',
  'Market Updates',
  'Testimonials',
  'Instagram Posts',
  'Instagram Stories',
  'Highlight Covers',
  'Flyers',
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

export default function TemplateLibraryPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TemplateType>('residential');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API call
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setTemplates(DUMMY_TEMPLATES);
      setIsLoading(false);
    }, 500);
  }, []);

  const categories = selectedType === 'residential' ? RESIDENTIAL_CATEGORIES : COMMERCIAL_CATEGORIES;

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesType = template.type === selectedType;
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [templates, selectedType, selectedCategory, searchQuery]);

  const handleUseTemplate = (templateId: string) => {
    router.push(`/dashboard/agent/submit?templateId=${templateId}`);
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
                onClick={() => {
                  setSelectedType('residential');
                  setSelectedCategory('All');
                }}
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
                onClick={() => {
                  setSelectedType('commercial');
                  setSelectedCategory('All');
                }}
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

          {/* Search and Filter Bar */}
          <div className="mb-6 bg-white rounded-lg border border-[#EEEEEE] p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
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

              {/* Category Filter */}
              <div className="lg:w-64">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595959]" />
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
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
              Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-[#EEEEEE] p-4 animate-pulse">
                  <div className="aspect-video bg-[#EEEEEE] rounded-lg mb-4"></div>
                  <div className="h-4 bg-[#EEEEEE] rounded mb-2"></div>
                  <div className="h-3 bg-[#EEEEEE] rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#EEEEEE] p-12 text-center">
              <FileText className="w-12 h-12 text-[#595959] mx-auto mb-4" />
              <h3 className="text-lg text-black font-manrope mb-2" style={{ fontWeight: 700 }}>
                No templates found
              </h3>
              <p className="text-sm text-[#595959] font-roboto" style={{ fontWeight: 400 }}>
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
                  {/* Preview Image */}
                  <div className="aspect-video bg-[#EEEEEE] relative overflow-hidden">
                    {template.previewUrl ? (
                      <img
                        src={template.previewUrl}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-[#595959]" />
                      </div>
                    )}
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-[#EEEEEE] text-[#595959] text-xs rounded font-roboto" style={{ fontWeight: 500 }}>
                        {template.category}
                      </span>
                    </div>
                    <h3 className="text-base text-black font-manrope mb-3" style={{ fontWeight: 700 }}>
                      {template.title}
                    </h3>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {template.canvaUrl && (
                        <a
                          href={template.canvaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-black text-black rounded-lg text-sm font-manrope hover:bg-[#EEEEEE] transition-all"
                          style={{ fontWeight: 700 }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Preview
                        </a>
                      )}
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