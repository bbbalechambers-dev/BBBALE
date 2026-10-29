import React, { useState } from 'react';
import { Building2, MapPin, Layers, PhoneCall, Mail, CheckCircle2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PublicPropertiesPage: React.FC<{ onOpenConsultationModal: () => void }> = ({ onOpenConsultationModal }) => {
  const { properties, branches } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredProperties = properties.filter(p => {
    if (p.status !== 'Active') return false;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'ALL' || p.propertyType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Page Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase font-mono-code">
          Managed Real Estate
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#1a2a4a]">
          Chambers Property Portfolio
        </h1>
        <p className="text-xs sm:text-sm text-[#5a5a5a] leading-relaxed">
          Residential estates, commercial complexes, and prime developmental land professionally administered by B. B. BALE & CO Chambers across Lagos, Abuja, and key Nigerian urban centers.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#e0ddd5] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search city, state or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-600">Type:</span>
          {['ALL', 'Residential', 'Commercial', 'Mixed Use', 'Land'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs rounded border cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? 'bg-[#1a2a4a] text-white border-[#1a2a4a] font-semibold'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(prop => {
            const firstPhoto = prop.photos && prop.photos.length > 0 ? prop.photos[0].dataUrl : null;
            return (
              <div
                key={prop.id}
                className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#c9a227] transition-colors"
              >
                <div>
                  <div className="h-44 bg-gray-100 relative">
                    {firstPhoto ? (
                      <img src={firstPhoto} alt={prop.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a2a4a]/5 text-[#1a2a4a]">
                        <Building2 className="w-10 h-10 text-[#c9a227] mb-1" />
                        <span className="text-xs font-semibold">Chambers Property Registry</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-[#1a2a4a]/90 text-white text-[10px] font-mono-code px-2 py-0.5 rounded">
                      {prop.propertyType}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-serif font-bold text-base text-[#1a2a4a] truncate">{prop.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-[#c9a227]" />
                      <span>{prop.city}, {prop.state} State</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-gray-400" />
                        <span>{prop.unitsCount} Units Portfolio</span>
                      </div>
                      <span>·</span>
                      <div className="text-emerald-700 font-medium">
                        Managed by Chambers
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div
                    onClick={onOpenConsultationModal}
                    className="w-full py-2 bg-[#f8f6f1] hover:bg-[#1a2a4a] hover:text-[#c9a227] text-gray-700 rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#e0ddd5]"
                  >
                    <span>Inquire with Estate Division →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Chambers Property Portfolio</h3>
          <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
            No public property listings currently match your query. Contact our Property Management division for off-market listings and landlord representation.
          </p>
          <button
            onClick={onOpenConsultationModal}
            className="px-5 py-2 bg-[#c9a227] text-[#1a2a4a] rounded text-xs font-bold font-serif-heading"
          >
            Schedule Real Estate Consultation
          </button>
        </div>
      )}

      {/* Unified Property Stewardship Consultation Banner */}
      {filteredProperties.length > 0 && (
        <div className="bg-[#1a2a4a] text-white rounded-xl p-8 border-2 border-[#c9a227] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif font-bold text-lg text-white">
              Landlord Mandates &amp; Facility Inquiries
            </h3>
            <p className="text-xs text-gray-300 max-w-xl">
              Mandate B. B. BALE &amp; CO Chambers for property administration, legal title regularisation, or tenant screening across Nigeria.
            </p>
          </div>
          <button
            onClick={onOpenConsultationModal}
            className="px-6 py-2.5 bg-[#c9a227] text-[#1a2a4a] hover:bg-[#dfba43] font-bold text-xs rounded-md shadow whitespace-nowrap cursor-pointer font-serif-heading"
          >
            Schedule Real Estate Consultation
          </button>
        </div>
      )}
    </div>
  );
};
