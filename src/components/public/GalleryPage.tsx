import React, { useState } from 'react';
import { Camera, Building, Users, Award, Calendar, X, Eye, Trash2, Edit3, Plus, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocalFilePicker } from '../common/LocalFilePicker';
import { UploadedFileMetadata, BranchGalleryEvent } from '../../types';

export const GalleryPage: React.FC = () => {
  const {
    branches,
    galleryEvents,
    addGalleryEvent,
    updateGalleryEvent,
    deleteGalleryEvent,
    currentUser
  } = useApp();

  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lightboxEvent, setLightboxEvent] = useState<BranchGalleryEvent | null>(null);

  // Administrator upload & edit modal state
  const [showAdminUploadModal, setShowAdminUploadModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BranchGalleryEvent | null>(null);

  // New photo upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadBranchId, setUploadBranchId] = useState<string>(branches[0]?.id || 'BRN-LAG');
  const [uploadCategory, setUploadCategory] = useState<BranchGalleryEvent['category']>('Legal Summit');
  const [uploadDate, setUploadDate] = useState<string>(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isAdministrator = currentUser?.role === 'Administrator' ||
                          currentUser?.role === 'Head of Chamber' ||
                          currentUser?.role === 'Principal Partner';

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'Legal Summit', label: 'Conferences & Summits' },
    { id: 'Court', label: 'Court Appearances' },
    { id: 'Awards', label: 'NBA Accolades & Honours' },
    { id: 'Office', label: 'Chambers Facilities' },
    { id: 'Team', label: 'Legal Team & Counsel' },
    { id: 'Community', label: 'Pro Bono & Community' }
  ];

  const filteredItems = galleryEvents.filter(item => {
    const branchMatch = selectedBranchId === 'ALL' || item.branchId === selectedBranchId;
    const catMatch = selectedCategory === 'ALL' || item.category === selectedCategory;
    return branchMatch && catMatch;
  });

  const handleFilePicked = (files: UploadedFileMetadata[]) => {
    if (files.length > 0) {
      setUploadedPhotoUrl(files[0].dataUrl);
      if (!uploadTitle) {
        setUploadTitle(files[0].originalName.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!uploadTitle.trim()) {
      setUploadError('Please provide an event or photograph title.');
      return;
    }
    if (!uploadedPhotoUrl) {
      setUploadError('Please choose a photograph from your device or use camera.');
      return;
    }

    addGalleryEvent({
      branchId: uploadBranchId,
      category: uploadCategory,
      title: uploadTitle.trim(),
      description: uploadDescription.trim() || `Official photographic record for ${branches.find(b => b.id === uploadBranchId)?.name || 'Chambers'}.`,
      imageUrl: uploadedPhotoUrl,
      date: uploadDate.trim() || new Date().toLocaleDateString('en-GB'),
      uploadedBy: currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Administrator'
    });

    // Reset form
    setUploadTitle('');
    setUploadDescription('');
    setUploadedPhotoUrl('');
    setShowAdminUploadModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    updateGalleryEvent(editingEvent.id, {
      title: editingEvent.title,
      description: editingEvent.description,
      category: editingEvent.category,
      branchId: editingEvent.branchId,
      date: editingEvent.date
    });
    setEditingEvent(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase font-mono-code">
          Photographic Record
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#1a2a4a]">
          Chambers Branch Gallery
        </h1>
        <p className="text-xs sm:text-sm text-[#5a5a5a] leading-relaxed">
          Visual documentation of B. B. BALE & CO Chambers facilities, legal conferences, superior court appearances, and community initiatives across Nigeria.
        </p>

        {/* Administrator Quick Action Button (Only for Administrators/Heads) */}
        {isAdministrator && (
          <div className="pt-2">
            <button
              onClick={() => {
                setUploadBranchId(selectedBranchId === 'ALL' ? (branches[0]?.id || 'BRN-LAG') : selectedBranchId);
                setShowAdminUploadModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-serif-heading font-bold text-xs rounded-md shadow-md border border-[#c9a227]/40 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Administrator: Upload Branch Event Photo</span>
            </button>
          </div>
        )}
      </div>

      {/* Branch & Category Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-[#e0ddd5] shadow-xs space-y-4">
        {/* Branch Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-100">
          <span className="text-xs font-bold text-[#1a2a4a] whitespace-nowrap mr-2 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Branch:</span>
          </span>
          <button
            onClick={() => setSelectedBranchId('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer transition-colors ${
              selectedBranchId === 'ALL'
                ? 'bg-[#1a2a4a] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Chambers Branches ({galleryEvents.length})
          </button>
          {branches.map(branch => {
            const count = galleryEvents.filter(g => g.branchId === branch.id).length;
            return (
              <button
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
                  selectedBranchId === branch.id
                    ? 'bg-[#1a2a4a] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{branch.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-[#c9a227] font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-[#1a2a4a] whitespace-nowrap mr-2">Category:</span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs rounded border whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat.id
                  ? 'border-[#c9a227] bg-[#c9a227]/15 text-[#1a2a4a] font-bold'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Photo Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredItems.map(item => {
            const branch = branches.find(b => b.id === item.branchId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-[#e0ddd5] overflow-hidden shadow-xs hover:border-[#c9a227] transition-all flex flex-col justify-between group"
              >
                <div
                  onClick={() => setLightboxEvent(item)}
                  className="relative h-48 bg-gray-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-6 h-6 text-[#c9a227]" />
                  </div>
                  <div className="absolute top-2 right-2 bg-[#1a2a4a]/90 text-[#c9a227] text-[10px] font-mono-code px-2 py-0.5 rounded shadow">
                    {item.category}
                  </div>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setLightboxEvent(item)}
                      className="font-serif font-bold text-xs text-[#1a2a4a] line-clamp-2 hover:text-[#c9a227] cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#5a5a5a] mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                    <span className="font-semibold text-[#1a2a4a] truncate max-w-[130px]">
                      {branch ? branch.name.split(' (')[0] : 'Chambers'}
                    </span>
                    <span className="font-mono text-gray-400">{item.date}</span>
                  </div>

                  {/* Administrator Edit/Delete Controls */}
                  {isAdministrator && (
                    <div className="pt-2 border-t border-dashed border-gray-200 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingEvent(item)}
                        className="p-1 text-gray-500 hover:text-[#1a2a4a] rounded hover:bg-gray-100"
                        title="Edit Event Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete photo "${item.title}" from the branch gallery?`)) {
                            deleteGalleryEvent(item.id);
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
          <Camera className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#1a2a4a]">No Gallery Photos in this View</h3>
          <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
            The Chambers photo bank for this branch or category currently has no published photographs.
          </p>
          {isAdministrator && (
            <button
              onClick={() => setShowAdminUploadModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Upload First Photo</span>
            </button>
          )}
        </div>
      )}

      {/* Lightbox Fullview Modal */}
      {lightboxEvent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#1a2a4a] text-white rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl border-2 border-[#c9a227]/40 animate-in fade-in zoom-in-95">
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#0f1a30]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#c9a227] text-[#1a2a4a] text-[10px] font-bold uppercase font-mono">
                  {lightboxEvent.category}
                </span>
                <span className="text-xs text-gray-300 font-mono">
                  {branches.find(b => b.id === lightboxEvent.branchId)?.name || 'Chambers'}
                </span>
              </div>
              <button
                onClick={() => setLightboxEvent(null)}
                className="p-1.5 text-gray-300 hover:text-white rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black flex justify-center max-h-[65vh] overflow-hidden">
              <img
                src={lightboxEvent.imageUrl}
                alt={lightboxEvent.title}
                className="max-h-[65vh] w-full object-contain"
              />
            </div>

            <div className="p-5 space-y-2 bg-[#0f1a30]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                  {lightboxEvent.title}
                </h2>
                <div className="text-xs text-[#c9a227] font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{lightboxEvent.date}</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {lightboxEvent.description}
              </p>
              <div className="text-[10px] text-gray-400 font-mono pt-2 border-t border-white/10 flex items-center justify-between">
                <span>Photographic Archive: {lightboxEvent.id}</span>
                <span>Uploaded by: {lightboxEvent.uploadedBy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Administrator Upload Modal */}
      {showAdminUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#1a2a4a] text-white flex items-center justify-between border-b-2 border-[#c9a227]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#c9a227]" />
                <h3 className="font-serif font-bold text-sm sm:text-base">
                  Administrator: Upload Branch Event Photo
                </h3>
              </div>
              <button
                onClick={() => setShowAdminUploadModal(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="p-5 space-y-4 text-xs">
              {uploadError && (
                <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">
                  {uploadError}
                </div>
              )}

              {/* Branch Assignment */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Chambers Branch Division *
                </label>
                <select
                  value={uploadBranchId}
                  onChange={(e) => setUploadBranchId(e.target.value)}
                  className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Event Category *
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                >
                  <option value="Legal Summit">Conferences & Summits</option>
                  <option value="Court">Court Appearances</option>
                  <option value="Awards">NBA Accolades & Honours</option>
                  <option value="Office">Chambers Facilities</option>
                  <option value="Team">Legal Team & Counsel</option>
                  <option value="Community">Pro Bono & Community</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Photo / Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supreme Court Valedictory Court Session"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Event Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 18 October 2026"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Event Description & Significance
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the occasion, attendees, and key milestones..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              {/* Image Picker */}
              <div className="space-y-2 pt-2 border-t">
                <label className="block font-semibold text-gray-700">
                  Select Photo from Device *
                </label>
                <LocalFilePicker
                  label="Pick Event Photo from Device"
                  maxSizeMb={12}
                  accept=".jpg,.jpeg,.png,.webp"
                  compact
                  onUploadComplete={handleFilePicked}
                />
                {uploadedPhotoUrl && (
                  <div className="relative mt-2 h-32 bg-gray-100 rounded border overflow-hidden">
                    <img src={uploadedPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                      Selected
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAdminUploadModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded hover:bg-[#111e38]"
                >
                  Publish to Branch Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Administrator Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-[#1a2a4a] text-white flex items-center justify-between border-b-2 border-[#c9a227]">
              <h3 className="font-serif font-bold text-sm sm:text-base">
                Edit Event Photo Record
              </h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Chambers Branch Division
                </label>
                <select
                  value={editingEvent.branchId}
                  onChange={(e) => setEditingEvent({ ...editingEvent, branchId: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editingEvent.category}
                  onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                  className="w-full p-2 border rounded border-gray-300"
                >
                  <option value="Legal Summit">Conferences & Summits</option>
                  <option value="Court">Court Appearances</option>
                  <option value="Awards">NBA Accolades & Honours</option>
                  <option value="Office">Chambers Facilities</option>
                  <option value="Team">Legal Team & Counsel</option>
                  <option value="Community">Pro Bono & Community</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full p-2 border rounded border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded hover:bg-[#111e38]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
