import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PrintHeader } from '../common/PrintHeader';
import { LocalFilePicker } from '../common/LocalFilePicker';
import { FileText, Shield, Download, Upload, LogOut, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { UploadedFileMetadata } from '../../types';

export const ClientPortal: React.FC = () => {
  const { authenticatedClient, logoutPortal, matters, invoices, receipts, getActiveBranch, updateMatter, branches } = useApp();
  const [activeTab, setActiveTab] = useState<'matters' | 'documents' | 'billing'>('matters');
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(null);

  if (!authenticatedClient) return null;

  const clientMatters = matters.filter(m => m.clientId === authenticatedClient.id);
  const clientInvoices = invoices.filter(i => i.recipientId === authenticatedClient.id || i.recipientName.toLowerCase() === authenticatedClient.fullName.toLowerCase());
  const clientReceipts = receipts.filter(r => r.payerName.toLowerCase() === authenticatedClient.fullName.toLowerCase());
  const activeBranch = getActiveBranch();
  const clientBranch = branches.find(b => b.id === authenticatedClient.branchId) || activeBranch;

  const handleUploadMatterDocument = (matterId: string, files: UploadedFileMetadata[]) => {
    const targetMatter = matters.find(m => m.id === matterId);
    if (!targetMatter) return;
    updateMatter(matterId, {
      documents: [...targetMatter.documents, ...files]
    });
  };

  return (
    <div className="min-w-full bg-[#f8f6f1] min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-xl border border-[#e0ddd5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#c9a227] font-bold uppercase">
              <Shield className="w-4 h-4" />
              <span>Verified Client Record Portal · {authenticatedClient.code}</span>
            </div>
            <h1 className="font-serif font-black text-2xl text-[#1a2a4a] mt-1">
              Welcome, {authenticatedClient.fullName}
            </h1>
            <p className="text-xs text-[#5a5a5a]">
              {authenticatedClient.clientType} Client · Registered under {clientBranch?.name || 'Head Chambers'} ({clientBranch?.code || 'BBB-LAG'})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Client Summary</span>
            </button>
            <button
              onClick={logoutPortal}
              className="px-3.5 py-1.5 rounded bg-[#1a2a4a] text-white text-xs font-semibold hover:bg-[#111e38] flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#e0ddd5]">
          <button
            onClick={() => setActiveTab('matters')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'matters'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            My Legal Matters ({clientMatters.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'documents'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Matter Documents & Pleadings
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2.5 text-xs font-bold font-serif-heading border-b-2 cursor-pointer transition-colors ${
              activeTab === 'billing'
                ? 'border-[#c9a227] text-[#1a2a4a]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Invoices & Receipts ({clientInvoices.length + clientReceipts.length})
          </button>
        </div>

        {/* Tab 1: Matters */}
        {activeTab === 'matters' && (
          <div className="space-y-4">
            {clientMatters.length > 0 ? (
              clientMatters.map(matter => (
                <div
                  key={matter.id}
                  className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <div>
                      <span className="text-[10px] font-mono-code font-bold bg-[#1a2a4a]/10 text-[#1a2a4a] px-2 py-0.5 rounded mr-2">
                        {matter.code}
                      </span>
                      <span className="font-serif font-bold text-base text-[#1a2a4a]">
                        {matter.title}
                      </span>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full self-start sm:self-auto ${
                      matter.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {matter.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Jurisdiction / Court:</span>
                      <span className="font-medium text-gray-900">{matter.courtCategory}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Suit Number:</span>
                      <span className="font-mono font-medium text-gray-900">{matter.suitNumber || 'Pending Filing'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">Presiding Judge:</span>
                      <span className="font-medium text-gray-900">{matter.presidingJudge || 'Hon. Justice (Assigned)'}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 bg-[#f8f6f1] p-3 rounded border border-gray-200">
                    {matter.description}
                  </p>

                  {/* Upload Document to this matter */}
                  <div className="pt-2 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-gray-700">
                      Upload supporting brief / pleading to this matter:
                    </span>
                    <LocalFilePicker
                      label="Choose File from Device"
                      compact
                      maxSizeMb={30}
                      linkedEntityId={matter.id}
                      linkedEntityType="Matter"
                      uploadedBy={authenticatedClient.fullName}
                      onUploadComplete={(files) => handleUploadMatterDocument(matter.id, files)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-[#e0ddd5] space-y-2">
                <FileText className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="font-serif font-bold text-sm text-[#1a2a4a]">No Active Matters Recorded</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  There are no legal cases currently assigned to code {authenticatedClient.code}. Contact your Chambers counsel for matter registration.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Documents */}
        {activeTab === 'documents' && (
          <div className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Privileged Case Documents</h3>
            <p className="text-xs text-gray-500">
              Files uploaded by Chambers or client under verified attorney-client privilege.
            </p>

            <div className="space-y-2">
              {clientMatters.flatMap(m => m.documents).map(doc => (
                <div key={doc.id} className="p-3 border rounded-lg flex items-center justify-between text-xs hover:border-[#c9a227]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#c9a227]" />
                    <div>
                      <div className="font-semibold text-gray-900">{doc.originalName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Uploaded by {doc.uploadedBy} · {new Date(doc.uploadDate).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                  {doc.dataUrl && (
                    <a
                      href={doc.dataUrl}
                      download={doc.originalName}
                      className="px-3 py-1 bg-[#1a2a4a] text-white rounded text-[11px] font-semibold hover:bg-[#111e38]"
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}

              {clientMatters.flatMap(m => m.documents).length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                  No documents have been uploaded for your matters yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Billing & Receipts */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Invoices */}
            <div className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Chambers Invoices</h3>
              {clientInvoices.length > 0 ? (
                clientInvoices.map(inv => (
                  <div key={inv.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-[#1a2a4a] font-mono">{inv.code}</div>
                      <div className="text-gray-500">Issued: {inv.issueDate} · Due: {inv.dueDate}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-[#1a2a4a]">₦{inv.totalAmount.toLocaleString()}</div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">No invoices issued.</div>
              )}
            </div>

            {/* Receipts */}
            <div className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Payment Receipts</h3>
              {clientReceipts.length > 0 ? (
                clientReceipts.map(rcp => (
                  <div key={rcp.id} className="p-3 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-emerald-800 font-mono">{rcp.code}</div>
                      <div className="text-gray-500">Paid: {rcp.paymentDate} via {rcp.paymentMethod}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-emerald-700">₦{rcp.amountPaid.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-500 font-mono">Ref: {rcp.transactionReference}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">No payment receipts logged.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
