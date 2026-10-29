import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { LocalFilePicker } from '../../common/LocalFilePicker';
import { COURT_CATEGORIES, CASE_TYPES, SUB_CATEGORIES_BY_CASE_TYPE } from '../../../data/legalHierarchy';
import { Precedent, CourtCategory, CaseType, UploadedFileMetadata } from '../../../types';
import { BookOpen, Plus, Search, Filter, FileText, Download, Tag, Scale } from 'lucide-react';

export const PrecedentsModule: React.FC = () => {
  const { precedents, addPrecedent, deletePrecedent, currentUser, branches, activeBranchId, canAccessBranchData, effectiveBranchId } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourt, setFilterCourt] = useState('ALL');
  const [filterCaseType, setFilterCaseType] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [readingPrecedent, setReadingPrecedent] = useState<Precedent | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [citation, setCitation] = useState('');
  const [courtCategory, setCourtCategory] = useState<CourtCategory>('Supreme Court of Nigeria');
  const [caseType, setCaseType] = useState<CaseType>('Civil');
  const [subCategory, setSubCategory] = useState('Breach of Contract');
  const [yearDecided, setYearDecided] = useState<number>(2024);
  const [presidingJustice, setPresidingJustice] = useState('');
  const [ratioDecidendi, setRatioDecidendi] = useState('');
  const [summary, setSummary] = useState('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMetadata | null>(null);
  const [precedentError, setPrecedentError] = useState<string | null>(null);

  const targetBranchId = effectiveBranchId;

  const filteredPrecedents = precedents.filter(p => {
    // Only show firm-wide precedents or precedents belonging to accessible branch
    const matchBranch = p.branchId === 'ALL' || canAccessBranchData(p.branchId);
    if (!matchBranch) return false;

    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.ratioDecidendi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourt = filterCourt === 'ALL' || p.courtCategory === filterCourt;
    const matchCaseType = filterCaseType === 'ALL' || p.caseType === filterCaseType;
    return matchSearch && matchCourt && matchCaseType;
  });

  const handleCreatePrecedent = (e: React.FormEvent) => {
    e.preventDefault();
    setPrecedentError(null);
    if (!title || !citation || !ratioDecidendi) {
      setPrecedentError('Please fill all required precedent fields (Title, Citation, Ratio Decidendi).');
      return;
    }

    addPrecedent({
      branchId: targetBranchId,
      title: title.trim(),
      citation: citation.trim(),
      courtCategory,
      caseType,
      subCategory,
      yearDecided: Number(yearDecided) || 2024,
      presidingJustice: presidingJustice.trim() || 'Per Supreme Court Justices',
      ratioDecidendi: ratioDecidendi.trim(),
      summary: summary.trim(),
      fullText: summary.trim(),
      documentFile: uploadedFile || undefined,
      tags: [caseType, subCategory],
      addedBy: currentUser?.fullName || 'Counsel'
    });

    setShowAddModal(false);
    setTitle('');
    setCitation('');
    setRatioDecidendi('');
    setSummary('');
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Court Precedent & Authority Bank
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Firm-wide knowledge repository: Appellate Nigerian citations, leading Ratio Decidendi, and judgment archives.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-sm font-serif-heading"
        >
          <Plus className="w-4 h-4" />
          <span>Add Court Precedent</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-[#e0ddd5] shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search citation, legal principle, or ratio decidendi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCourt}
            onChange={(e) => setFilterCourt(e.target.value)}
            className="text-xs p-1.5 rounded border border-[#e0ddd5] bg-white focus:outline-none"
          >
            <option value="ALL">All Courts</option>
            {COURT_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterCaseType}
            onChange={(e) => setFilterCaseType(e.target.value)}
            className="text-xs p-1.5 rounded border border-[#e0ddd5] bg-white focus:outline-none"
          >
            <option value="ALL">All Case Types</option>
            {CASE_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Precedents Cards */}
      {filteredPrecedents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrecedents.map(p => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs flex flex-col justify-between space-y-3 hover:border-[#c9a227] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold bg-[#1a2a4a] text-[#c9a227] px-2 py-0.5 rounded">
                    {p.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-700">{p.yearDecided}</span>
                </div>

                <h3 className="font-serif font-bold text-base text-[#1a2a4a] leading-tight">
                  {p.title}
                </h3>

                <div className="text-xs font-mono font-bold text-gray-800 bg-[#f8f6f1] p-2 rounded border border-gray-200">
                  {p.citation}
                </div>

                <div className="text-xs text-gray-600 line-clamp-3">
                  <strong className="text-gray-900 block font-serif">Ratio Decidendi:</strong>
                  {p.ratioDecidendi}
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-500">{p.courtCategory}</span>
                <button
                  onClick={() => setReadingPrecedent(p)}
                  className="px-3 py-1 bg-[#1a2a4a] text-white hover:bg-[#111e38] rounded text-[11px] font-semibold"
                >
                  Read Authority →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Precedent Bank is Empty</h3>
          <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
            Build your Chambers repository of Supreme Court and Court of Appeal binding authorities and case ratios.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading"
          >
            Add First Precedent
          </button>
        </div>
      )}

      {/* Reading Modal */}
      {readingPrecedent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-3xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between border-b pb-2">
              <div>
                <span className="text-xs font-mono font-bold text-[#c9a227] bg-[#1a2a4a] px-2 py-0.5 rounded mr-2">
                  {readingPrecedent.code}
                </span>
                <span className="font-serif font-bold text-lg text-[#1a2a4a]">{readingPrecedent.title}</span>
              </div>
              <button onClick={() => setReadingPrecedent(null)}>✕</button>
            </div>

            <div className="bg-[#f8f6f1] p-3 rounded border text-xs font-mono space-y-1">
              <div><strong>Citation:</strong> {readingPrecedent.citation}</div>
              <div><strong>Court & Year:</strong> {readingPrecedent.courtCategory} ({readingPrecedent.yearDecided})</div>
              <div><strong>Bench / Justices:</strong> {readingPrecedent.presidingJustice}</div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-serif font-bold text-sm text-[#1a2a4a]">Ratio Decidendi / Legal Principle</h4>
              <p className="bg-amber-50/60 p-4 rounded-lg border border-amber-200 text-gray-900 leading-relaxed font-serif text-sm">
                "{readingPrecedent.ratioDecidendi}"
              </p>
            </div>

            {readingPrecedent.summary && (
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-[#1a2a4a]">Case Summary & Counsel Notes</h4>
                <p className="text-gray-700 leading-relaxed">{readingPrecedent.summary}</p>
              </div>
            )}

            {readingPrecedent.documentFile?.dataUrl && (
              <div className="p-3 bg-gray-50 border rounded flex items-center justify-between text-xs">
                <span>📎 {readingPrecedent.documentFile.originalName}</span>
                <a
                  href={readingPrecedent.documentFile.dataUrl}
                  download={readingPrecedent.documentFile.originalName}
                  className="px-3 py-1 bg-[#1a2a4a] text-white rounded text-[11px] font-semibold"
                >
                  Download Full Judgment PDF
                </a>
              </div>
            )}

            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setReadingPrecedent(null)}
                className="px-4 py-1.5 bg-[#1a2a4a] text-white rounded text-xs font-semibold"
              >
                Close Authority
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Precedent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-2xl w-full p-6 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Record Court Precedent Authority</h3>
              <button onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreatePrecedent} className="space-y-3 text-xs">
              {precedentError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
                  {precedentError}
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Attorney General of Lagos State v. Attorney General of the Federation"
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Official Law Report Citation *</label>
                  <input
                    type="text"
                    required
                    value={citation}
                    onChange={(e) => setCitation(e.target.value)}
                    placeholder="e.g. (2004) 18 NWLR (Pt. 904) 1 SC"
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Year Decided *</label>
                  <input
                    type="number"
                    required
                    value={yearDecided}
                    onChange={(e) => setYearDecided(Number(e.target.value))}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Court Hierarchy</label>
                  <select
                    value={courtCategory}
                    onChange={(e) => setCourtCategory(e.target.value as CourtCategory)}
                    className="w-full p-2 rounded border border-[#e0ddd5] bg-white"
                  >
                    {COURT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Case Type</label>
                  <select
                    value={caseType}
                    onChange={(e) => setCaseType(e.target.value as CaseType)}
                    className="w-full p-2 rounded border border-[#e0ddd5] bg-white"
                  >
                    {CASE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Presiding Bench</label>
                  <input
                    type="text"
                    value={presidingJustice}
                    onChange={(e) => setPresidingJustice(e.target.value)}
                    placeholder="e.g. Uwais CJN"
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Ratio Decidendi (Binding Legal Principle) *</label>
                <textarea
                  rows={3}
                  required
                  value={ratioDecidendi}
                  onChange={(e) => setRatioDecidendi(e.target.value)}
                  placeholder="State the core ratio established by the Court..."
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>

              {/* Upload Full Judgment Document (Section 20 & 37.5) */}
              <div>
                <label className="block font-semibold mb-1">Upload Full Judgment PDF / DOCX (Local Device Picker)</label>
                <LocalFilePicker
                  label="Choose Judgment File from Device"
                  maxSizeMb={50}
                  accept=".pdf,.doc,.docx"
                  compact
                  onUploadComplete={(files) => {
                    if (files.length > 0) setUploadedFile(files[0]);
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] font-bold rounded">Save to Precedent Bank</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
