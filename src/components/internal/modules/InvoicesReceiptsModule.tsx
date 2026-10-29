import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { PrintHeader } from '../../common/PrintHeader';
import { FileText, Printer, Plus, Search, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { Invoice, Receipt } from '../../../types';

export const InvoicesReceiptsModule: React.FC = () => {
  const {
    invoices,
    receipts,
    addInvoice,
    addReceipt,
    updateInvoice,
    clients,
    bankAccounts,
    activeBranchId,
    getActiveBranch,
    branches,
    canAccessBranchData,
    effectiveBranchId
  } = useApp();

  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts' | 'create-invoice'>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State: Create Invoice
  const [recipientType, setRecipientType] = useState<'Client' | 'Tenant' | 'Owner'>('Client');
  const [recipientId, setRecipientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [lineItemDesc, setLineItemDesc] = useState('Professional Legal Services & Advocacy Fees');
  const [lineItemAmount, setLineItemAmount] = useState<number>(350000);
  const [whtRate, setWhtRate] = useState<number>(5); // 5% WHT
  const [invoiceNotes, setInvoiceNotes] = useState('Payment due within 14 days of presentation.');

  const activeBranch = getActiveBranch();
  const targetBranchId = effectiveBranchId;
  const branchInvoices = invoices.filter(i => canAccessBranchData(i.branchId));
  const branchReceipts = receipts.filter(r => canAccessBranchData(r.branchId));
  const branchClients = clients.filter(c => canAccessBranchData(c.branchId));

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const client = branchClients.find(c => c.id === recipientId);
    if (!client) {
      setFormError('Please select a recipient client belonging to this branch division.');
      return;
    }

    const subtotal = Number(lineItemAmount);
    const vatRate = 0.075;
    const vatAmount = subtotal * vatRate;
    const whtAmount = subtotal * (whtRate / 100);
    const totalAmount = subtotal + vatAmount - whtAmount;

    const newInv = addInvoice({
      branchId: targetBranchId,
      recipientType,
      recipientId: client.id,
      recipientName: client.fullName,
      recipientEmail: client.email,
      recipientPhone: client.phone,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      items: [
        {
          description: lineItemDesc,
          quantity: 1,
          unitPrice: subtotal,
          amount: subtotal
        }
      ],
      subtotal,
      vatRate: 7.5,
      vatAmount,
      whtRate,
      whtAmount,
      totalAmount,
      bankAccountId: bankAccountId || (bankAccounts[0]?.id || 'DEFAULT_BNK'),
      paymentStatus: 'Unpaid',
      notes: invoiceNotes
    });

    setSelectedInvoice(newInv);
    setActiveTab('invoices');
  };

  const handleMarkPaid = (inv: Invoice) => {
    updateInvoice(inv.id, { paymentStatus: 'Paid' });

    addReceipt({
      branchId: inv.branchId,
      invoiceId: inv.id,
      payerName: inv.recipientName,
      payerEmail: inv.recipientEmail,
      amountPaid: inv.totalAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      transactionReference: `BNK-TRF-${Date.now()}`,
      bankAccountId: inv.bankAccountId,
      purpose: `Settlement of ${inv.code}`,
      receivedBy: 'Account Officer'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-black text-xl text-[#1a2a4a]">
            Invoices, Receipts & Financial Ledger
          </h2>
          <p className="text-xs text-[#5a5a5a]">
            Branch-prefixed billing with 7.5% Nigerian VAT, Withholding Tax (WHT) deductions, and automated receipt issuance.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create-invoice')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-md font-bold text-xs shadow-sm transition-all cursor-pointer font-serif-heading"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Official Invoice</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e0ddd5]">
        <button
          onClick={() => { setActiveTab('invoices'); setSelectedInvoice(null); }}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'invoices' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Invoices ({branchInvoices.length})
        </button>
        <button
          onClick={() => { setActiveTab('receipts'); setSelectedInvoice(null); }}
          className={`px-4 py-2 text-xs font-bold font-serif-heading border-b-2 cursor-pointer ${
            activeTab === 'receipts' ? 'border-[#c9a227] text-[#1a2a4a]' : 'border-transparent text-gray-500'
          }`}
        >
          Receipts ({branchReceipts.length})
        </button>
      </div>

      {/* Invoice Printable View */}
      {selectedInvoice && (
        <div className="bg-white p-6 sm:p-10 rounded-xl border-2 border-[#1a2a4a] shadow-xl space-y-6">
          <div className="flex justify-between items-center no-print">
            <span className="text-xs font-bold text-[#1a2a4a] bg-gray-100 px-2.5 py-1 rounded border">
              Official Tax Invoice · {selectedInvoice.code}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#1a2a4a] text-white hover:bg-[#111e38] rounded text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#c9a227]" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-100"
              >
                Close Preview
              </button>
            </div>
          </div>

          <PrintHeader
            branch={activeBranch}
            documentTitle="TAX INVOICE & BILL OF CHARGES"
            referenceNumber={selectedInvoice.code}
            date={selectedInvoice.issueDate}
          />

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-semibold block text-[10px] uppercase">BILLED TO:</span>
              <div className="font-serif font-bold text-base text-[#1a2a4a]">{selectedInvoice.recipientName}</div>
              <div className="text-gray-600">{selectedInvoice.recipientEmail}</div>
              <div className="text-gray-600">{selectedInvoice.recipientPhone}</div>
            </div>
            <div className="text-right">
              <div><strong>Issue Date:</strong> {selectedInvoice.issueDate}</div>
              <div><strong>Payment Due Date:</strong> {selectedInvoice.dueDate}</div>
              <div><strong>Status:</strong> <span className="font-bold text-[#c9a227]">{selectedInvoice.paymentStatus}</span></div>
            </div>
          </div>

          <table className="w-full text-left text-xs border border-gray-200 mt-4">
            <thead>
              <tr className="bg-[#1a2a4a] text-white font-mono">
                <th className="p-2.5">Item Description</th>
                <th className="p-2.5 text-right">Quantity</th>
                <th className="p-2.5 text-right">Unit Price (₦)</th>
                <th className="p-2.5 text-right">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {selectedInvoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-medium">{item.description}</td>
                  <td className="p-2.5 text-right">{item.quantity}</td>
                  <td className="p-2.5 text-right font-mono">₦{item.unitPrice.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono font-bold">₦{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono">₦{selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (7.5%):</span>
                <span className="font-mono">+₦{selectedInvoice.vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>WHT Deducted ({selectedInvoice.whtRate}%):</span>
                <span className="font-mono">-₦{selectedInvoice.whtAmount.toLocaleString()}</span>
              </div>
              <div className="w-full h-px bg-gray-300 my-1" />
              <div className="flex justify-between font-bold text-sm text-[#1a2a4a]">
                <span>Total Amount Payable:</span>
                <span className="font-mono text-[#c9a227]">₦{selectedInvoice.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t text-xs text-gray-600 space-y-1">
            <div className="font-bold text-[#1a2a4a]">Remittance Bank Details:</div>
            <div>Account Name: B. B. BALE & CO CHAMBERS (CLIENT TRUST ACCOUNT)</div>
            <div>Bank: First Bank of Nigeria / Zenith Bank Plc · Currency: NGN</div>
            <div>NUBAN Account: 1012398472</div>
          </div>
        </div>
      )}

      {/* Tab 1: Invoices List */}
      {activeTab === 'invoices' && !selectedInvoice && (
        <div className="space-y-4">
          {branchInvoices.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                    <th className="p-3">Invoice Code</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-right">Total (₦)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-[#f8f6f1]">
                      <td className="p-3 font-mono font-bold text-[#1a2a4a]">{inv.code}</td>
                      <td className="p-3 font-semibold text-gray-900">{inv.recipientName}</td>
                      <td className="p-3 font-mono text-gray-600">{inv.issueDate}</td>
                      <td className="p-3 font-mono text-gray-600">{inv.dueDate}</td>
                      <td className="p-3 text-right font-mono font-bold text-[#1a2a4a]">
                        ₦{inv.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-[#1a2a4a] hover:text-[#c9a227] rounded text-[11px] font-semibold"
                        >
                          View / Print
                        </button>
                        {inv.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handleMarkPaid(inv)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-semibold"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
              <FileText className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">No Invoices Issued</h3>
              <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
                Issue tax-compliant bills of charges with automatic 7.5% VAT and WHT deductions.
              </p>
              <button
                onClick={() => setActiveTab('create-invoice')}
                className="px-5 py-2 bg-[#1a2a4a] text-[#c9a227] rounded text-xs font-bold font-serif-heading"
              >
                Create First Invoice
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Receipts List */}
      {activeTab === 'receipts' && (
        <div className="space-y-4">
          {branchReceipts.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#e0ddd5] shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a2a4a] text-white border-b border-[#c9a227] text-[11px] font-mono-code">
                    <th className="p-3">Receipt Code</th>
                    <th className="p-3">Payer Name</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3 text-right">Amount (₦)</th>
                    <th className="p-3">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {branchReceipts.map(rcp => (
                    <tr key={rcp.id} className="hover:bg-[#f8f6f1]">
                      <td className="p-3 font-mono font-bold text-emerald-800">{rcp.code}</td>
                      <td className="p-3 font-semibold text-gray-900">{rcp.payerName}</td>
                      <td className="p-3 font-mono text-gray-600">{rcp.paymentDate}</td>
                      <td className="p-3">{rcp.paymentMethod}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        ₦{rcp.amountPaid.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-gray-500">{rcp.transactionReference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-[#e0ddd5] space-y-3">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">No Receipts Issued</h3>
              <p className="text-xs text-[#5a5a5a] max-w-md mx-auto">
                Receipts are generated automatically upon invoice settlement or consultation fee clearance.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Create Invoice Form */}
      {activeTab === 'create-invoice' && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#e0ddd5] shadow-xs space-y-5">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Generate Official Bill of Charges</h3>
            <p className="text-xs text-gray-500">
              Structured in compliance with the Legal Practitioners' Remuneration Order (LPRO) 2023.
            </p>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Select Client *</label>
                <select
                  required
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value="">-- Choose Billed Client --</option>
                  {branchClients.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Fee Description *</label>
                <input
                  type="text"
                  required
                  value={lineItemDesc}
                  onChange={(e) => setLineItemDesc(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Base Fee (₦) *</label>
                <input
                  type="number"
                  required
                  value={lineItemAmount}
                  onChange={(e) => setLineItemAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded border border-[#e0ddd5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Withholding Tax (WHT Rate %)</label>
                <select
                  value={whtRate}
                  onChange={(e) => setWhtRate(Number(e.target.value))}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value={0}>0% (No Withholding Tax)</option>
                  <option value={5}>5% (Individual / Standard WHT)</option>
                  <option value={10}>10% (Corporate Professional Fee WHT)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Settlement Bank Account</label>
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] bg-white"
                >
                  <option value="DEFAULT_BNK">First Bank of Nigeria (Trust Account - 1012398472)</option>
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>{b.bankName} - {b.accountName} ({b.accountNumber})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button type="button" onClick={() => setActiveTab('invoices')} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded font-serif-heading">
                Issue Invoice & Bill of Charges
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
