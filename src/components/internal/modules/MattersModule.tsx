import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { LocalFilePicker } from '../../common/LocalFilePicker';
import { COURT_CATEGORIES, CASE_TYPES, SUB_CATEGORIES_BY_CASE_TYPE, STANDARD_COURT_DIVISIONS } from '../../../data/legalHierarchy';
import { CourtCategory, CaseType, Matter, UploadedFileMetadata } from '../../../types';
import { Scale, Plus, Search, Filter, Calendar, FileText, CheckCircle2, Clock, User, Download } from 'lucide-react';

export const MattersModule: React.FC = () => {
  const {
    matters,
    addMatter,
    updateMatter,
    clients,
    users,
    activeBranchId,
    branches,
    getActiveBranch,
    canAccessBranchData,
    effectiveBranchId,
    currentUser
  } = useApp();

  const isAccountOfficer = currentUser?.role === 'Account Officer';

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourt, setFilterCourt] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [convertingMatter, setConvertingMatter] = useState<Matter | null>(null);
  const [appealCourtCategory, setAppealCourtCategory] = useState<'Court of Appeal' | 'Supreme Court of Nigeria'>('Court of Appeal');
  const [appealSuitNumber, setAppealSuitNumber] = useState('');
  const [appellatePanel, setAppellatePanel] = useState('');
  const [matterError, setMatterError] = useState<string | null>(null);

  const handleConvertToAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingMatter) return;
    updateMatter(convertingMatter.id, {
      courtCategory: appealCourtCategory,
      suitNumber: appealSuitNumber.trim() || `CA/L/APP/${Math.floor(100 + Math.random() * 900)}/2026`,
      presidingJudge: appellatePanel.trim() || 'Hon. Justice (Appellate Justices Panel)',
      description: `${convertingMatter.description}\n\n[Converted to Appeal Jurisdiction (${appealCourtCategory}) on ${new Date().toISOString().split('T')[0]}]`
    });
    setConvertingMatter(null);
    setAppealSuitNumber('');
    setAppellatePanel('');
  };

  const [editingMatter, setEditingMatter] = useState<Matter | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSuitNumber, setEditSuitNumber] = useState('');
  const [editJudge, setEditJudge] = useState('');
  const [editHearingDate, setEditHearingDate] = useState('');
  const [editStatus, setEditStatus] = useState<any>('Active');
  const [editFee, setEditFee] = useState(0);

  const handleOpenEditMatter = (m: Matter) => {
    setEditingMatter(m);
    setEditTitle(m.title);
    setEditSuitNumber(m.suitNumber);
    setEditJudge(m.presidingJudge);
    setEditHearingDate(m.nextHearingDate || '');
    setEditStatus(m.status);
    setEditFee(m.estimatedFee);
  };

  const handleSaveEditMatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatter) return;
    updateMatter(editingMatter.id, {
      title: editTitle.trim(),
      suitNumber: editSuitNumber.trim(),
      presidingJudge: editJudge.trim(),
      nextHearingDate: editHearingDate || undefined,
      status: editStatus,
      estimatedFee: Number(editFee) || 0
    });
    setEditingMatter(null);
  };

  // Form State
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [courtCategory, setCourtCategory] = useState<CourtCategory>('State High Court');
  const [customCourtName, setCustomCourtName] = useState('');
  const [courtDivision, setCourtDivision] = useState('Lagos Judicial Division');
  const [caseType, setCaseType] = useState<CaseType>('Civil');
  const [subCategory, setSubCategory] = useState('Breach of Contract');
  const [suitNumber, setSuitNumber] = useState('');
  const [presidingJudge, setPresidingJudge] = useState('');
  const [assignedCounselId, setAssignedCounselId] = useState('');
  const [filingDate, setFilingDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedFee, setEstimatedFee] = useState<number>(500000);
  const [isLegalHold, setIsLegalHold] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedFileMetadata[]>([]);

  // Strictly filter matters by branch data isolation
  const branchMatters = matters.filter(m => {
    if (!canAccessBranchData(m.branchId)) return false;
    const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.suitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourt = filterCourt === 'ALL' || m.courtCategory === filterCourt;
    const matchStatus = filterStatus === 'ALL' || m.status === filterStatus;
    return matchSearch && matchCourt && matchStatus;
  });

  const branchClients = clients.filter(c => canAccessBranchData(c.branchId));

  const handleCreateMatter = (e: React.FormEvent) => {
    e.preventDefault();
    setMatterError(null);
    if (isAccountOfficer) {
      setMatterError('Permission Denied: Account Officers cannot intake/register matters. Account officers only manage branch financial activities.');
      return;
    }
    if (!title.trim() || !clientId) {
      setMatterError('Please provide a matter title and select a client.');
      return;
    }

    const targetBranchId = effectiveBranchId;

    addMatter({
      branchId: targetBranchId,
      title: title.trim(),
      clientId,
      courtCategory,
      customCourtName: courtCategory === 'Other (Specify Manually)' ? customCourtName : undefined,
      caseType,
      subCategory,
      suitNumber: suitNumber.trim(),
      presidingJudge: presidingJudge.trim(),
      courtDivision,
      assignedCounselId: assignedCounselId || 'UNASSIGNED',
      status: 'Active',
      filingDate,
      nextHearingDate: nextHearingDate || undefined,
      description: description.trim(),
      estimatedFee: Number(estimatedFee) || 0,
      paidFee: 0,
      isLegalHold,
      documents: uploadedDocs,
      notes: []
    });

    setShowAddModal(false);
    setTitle('');
    setSuitNumber('');
    setPresidingJudge('');
    setDescription('');
    setUploadedDocs([]);
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Matters & Litigation Registry
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Hierarchical categorization: Court Category → Case Type → Sub-Category across Nigerian jurisdictions.
          </p>
        </div>

        {!isAccountOfficer ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-sm transition-all cursor-pointer font-serif-heading"
          >
            <Plus className="w-4 h-4" />
            <span>Intake New Matter</span>
          </button>
        ) : (
          <div className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded border border-amber-200 font-medium">
            Account Officer: Matter intake restricted to Counsel & Head of Chamber
          </div>
        )}
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-3.5 rounded-lg border border-[#e0ddd5] shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search matter code, title, or suit number..."
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
            <option value="ALL">All Court Categories</option>
            {COURT_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs p-1.5 rounded border border-[#e0ddd5] bg-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Adjourned">Adjourned</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Matters Table */}
      {branchMatters.length > 0 ? (
        <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                <th className="p-3 font-semibold">Matter Code</th>
                <th className="p-3 font-semibold">Title & Client</th>
                <th className="p-3 font-semibold">Court Hierarchy</th>
                <th className="p-3 font-semibold">Suit No / Judge</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Next Hearing</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branchMatters.map(m => {
                const client = clients.find(c => c.id === m.clientId);
                return (
                  <tr key={m.id} className="hover:bg-[#f8f6f1] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#1a2a4a] whitespace-nowrap">
                      {m.code}
                    </td>
                    <td className="p-3">
                      <div className="font-serif font-bold text-[#1c1c1c] text-sm">{m.title}</div>
                      <div className="text-[11px] text-gray-500">
                        Client: {client?.fullName || 'Assigned Client'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-[#1a2a4a]">{m.courtCategory}</div>
                      <div className="text-[10px] text-[#8c6d17]">{m.caseType} · {m.subCategory}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-gray-900 font-medium">{m.suitNumber || 'Pending'}</div>
                      <div className="text-[11px] text-gray-500">{m.presidingJudge || 'Court Registry'}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        m.status === 'Adjourned' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                      {m.nextHearingDate ? (
                        <span className="text-[#1a2a4a] font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#c9a227]" />
                          {m.nextHearingDate}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not Slated</span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditMatter(m)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConvertingMatter(m)}
                          className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Convert to Court of Appeal or Supreme Court"
                        >
                          Convert to Appeal
                        </button>
                        <button
                          onClick={() => setSelectedMatter(m)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-[#1a2a4a] hover:text-[#c9a227] rounded text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Brief Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
          <Scale className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Matters Registry is Empty</h3>
          <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
            No litigation or advisory matters currently exist for this branch. Click "Intake New Matter" to register a client brief and upload pleadings.
          </p>
          {!isAccountOfficer && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading"
            >
              Intake First Matter
            </button>
          )}
        </div>
      )}

      {/* Intake Matter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-2xl w-full p-6 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
                Intake New Litigation or Legal Brief
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateMatter} className="space-y-4 text-xs">
              {matterError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded font-medium">
                  {matterError}
                </div>
              )}
              <div>
                <label className="block font-semibold mb-1">Matter Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chief Adeleke v. Federal Ministry of Lands & Anor"
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Client *</label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    <option value="">-- Select Client Record --</option>
                    {branchClients.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Court Category *</label>
                  <select
                    value={courtCategory}
                    onChange={(e) => setCourtCategory(e.target.value as CourtCategory)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    {COURT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {courtCategory === 'Other (Specify Manually)' && (
                <div>
                  <label className="block font-semibold mb-1">Custom Court / Tribunal Name (Section 27) *</label>
                  <input
                    type="text"
                    required
                    value={customCourtName}
                    onChange={(e) => setCustomCourtName(e.target.value)}
                    placeholder="Specify special statutory tribunal or arbitration panel..."
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Case Type *</label>
                  <select
                    value={caseType}
                    onChange={(e) => {
                      const newType = e.target.value as CaseType;
                      setCaseType(newType);
                      setSubCategory(SUB_CATEGORIES_BY_CASE_TYPE[newType][0] || 'General');
                    }}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    {CASE_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Sub-Category *</label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    {(SUB_CATEGORIES_BY_CASE_TYPE[caseType] || []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Suit Number</label>
                  <input
                    type="text"
                    value={suitNumber}
                    onChange={(e) => setSuitNumber(e.target.value)}
                    placeholder="e.g. FHC/L/CS/102/2026"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Presiding Judge</label>
                  <input
                    type="text"
                    value={presidingJudge}
                    onChange={(e) => setPresidingJudge(e.target.value)}
                    placeholder="e.g. Hon. Justice O. A. Williams"
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Filing Date</label>
                  <input
                    type="date"
                    value={filingDate}
                    onChange={(e) => setFilingDate(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Next Hearing Date</label>
                  <input
                    type="date"
                    value={nextHearingDate}
                    onChange={(e) => setNextHearingDate(e.target.value)}
                    className="w-full p-2 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Matter Summary & Instructions</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Facts of the case, relief sought, status of interlocutory motions..."
                  className="w-full p-2 rounded border border-[#e0ddd5]"
                />
              </div>

              {/* Local File Picker for Matter Pleadings (Section 20) */}
              <div>
                <label className="block font-semibold mb-1">
                  Upload Pleadings, Affidavits & Exhibits (Local Device Picker)
                </label>
                <LocalFilePicker
                  label="Choose Files from Device"
                  multiple
                  maxSizeMb={50}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  currentFiles={uploadedDocs}
                  onUploadComplete={(files) => setUploadedDocs(prev => [...prev, ...files])}
                  onRemoveFile={(id) => setUploadedDocs(prev => prev.filter(f => f.id !== id))}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hold"
                  checked={isLegalHold}
                  onChange={(e) => setIsLegalHold(e.target.checked)}
                />
                <label htmlFor="hold" className="text-gray-700 font-semibold text-[11px]">
                  Impose Legal Hold (Prevents document purge or archiving under NDPA)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading"
                >
                  Register Matter Brief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Matter Details Modal */}
      {selectedMatter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="text-xs font-mono font-bold text-[#c9a227] bg-[#1a2a4a] px-2 py-0.5 rounded mr-2">
                  {selectedMatter.code}
                </span>
                <span className="font-serif font-bold text-base text-[#1a2a4a]">{selectedMatter.title}</span>
              </div>
              <button onClick={() => setSelectedMatter(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-700 bg-[#f8f6f1] p-3 rounded border">
              <div><strong>Jurisdiction:</strong> {selectedMatter.courtCategory}</div>
              <div><strong>Suit Number:</strong> {selectedMatter.suitNumber || 'None'}</div>
              <div><strong>Case Type:</strong> {selectedMatter.caseType} ({selectedMatter.subCategory})</div>
              <div><strong>Presiding Judge:</strong> {selectedMatter.presidingJudge || 'Court Master'}</div>
              <div><strong>Filing Date:</strong> {selectedMatter.filingDate}</div>
              <div><strong>Next Hearing:</strong> {selectedMatter.nextHearingDate || 'Unscheduled'}</div>
            </div>

            <p className="text-xs text-gray-600">{selectedMatter.description}</p>

            <div className="space-y-2 border-t pt-3">
              <h4 className="font-bold text-xs text-[#1a2a4a]">Pleadings & Exhibits ({selectedMatter.documents.length})</h4>
              {selectedMatter.documents.map(d => (
                <div key={d.id} className="p-2 border rounded flex items-center justify-between text-xs">
                  <span>{d.originalName}</span>
                  {d.dataUrl && (
                    <a href={d.dataUrl} download={d.originalName} className="text-[#1a2a4a] font-bold underline">
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="text-right pt-2 border-t">
              <button
                onClick={() => setSelectedMatter(null)}
                className="px-4 py-1.5 bg-[#1a2a4a] text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Appeal Court Modal */}
      {convertingMatter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
                Convert Matter to Appeal Court
              </h3>
              <button onClick={() => setConvertingMatter(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <p className="text-xs text-gray-600">
              Converting litigation matter <strong>{convertingMatter.title}</strong> ({convertingMatter.code}) from trial court to Appellate Jurisdiction.
            </p>

            <form onSubmit={handleConvertToAppeal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Appeal Court *</label>
                <select
                  value={appealCourtCategory}
                  onChange={(e) => setAppealCourtCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value="Court of Appeal">Court of Appeal of Nigeria</option>
                  <option value="Supreme Court of Nigeria">Supreme Court of Nigeria</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Appeal Suit Number</label>
                <input
                  type="text"
                  value={appealSuitNumber}
                  onChange={(e) => setAppealSuitNumber(e.target.value)}
                  placeholder="e.g. CA/L/1092/2026 or SC.104/2026"
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Appellate Panel / Presiding Justices</label>
                <input
                  type="text"
                  value={appellatePanel}
                  onChange={(e) => setAppellatePanel(e.target.value)}
                  placeholder="e.g. Hon. Justice M. L. Garba, JCA & Panel"
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setConvertingMatter(null)}
                  className="px-4 py-2 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] font-bold rounded font-serif-heading hover:bg-[#111e38]"
                >
                  Confirm & Transfer to Appeal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Matter Modal */}
      {editingMatter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">
                Edit Matter / Litigation ({editingMatter.code})
              </h3>
              <button onClick={() => setEditingMatter(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSaveEditMatter} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Matter Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Suit Number</label>
                  <input
                    type="text"
                    value={editSuitNumber}
                    onChange={(e) => setEditSuitNumber(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Presiding Judge</label>
                  <input
                    type="text"
                    value={editJudge}
                    onChange={(e) => setEditJudge(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Adjourned">Adjourned</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Next Hearing Date</label>
                  <input
                    type="date"
                    value={editHearingDate}
                    onChange={(e) => setEditHearingDate(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Estimated Fee (₦)</label>
                  <input
                    type="number"
                    value={editFee}
                    onChange={(e) => setEditFee(Number(e.target.value))}
                    className="w-full p-2.5 rounded border border-[#e0ddd5]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingMatter(null)}
                  className="px-4 py-2 border rounded text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] font-bold rounded font-serif-heading hover:bg-[#111e38]"
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
