import React, { useState } from 'react';
import { X, Calendar, Clock, CreditCard, CheckCircle2, Shield, User, FileText, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NIGERIAN_STATES, getLgasForState } from '../../data/nigeriaGeo';
import { COURT_CATEGORIES, CASE_TYPES, SUB_CATEGORIES_BY_CASE_TYPE } from '../../data/legalHierarchy';
import { LocalFilePicker } from '../common/LocalFilePicker';
import { CourtCategory, CaseType, UploadedFileMetadata } from '../../types';

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationBookingModal: React.FC<ConsultationBookingModalProps> = ({ isOpen, onClose }) => {
  const { branches, addBooking, fees, getActiveBranch } = useApp();

  // Wizard Steps: 1: Service & Branch, 2: Legal Hierarchy, 3: Intake & Cascade, 4: Payment & Confirm
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || 'BRN-LAG');
  const [consultationType, setConsultationType] = useState<'In-person' | 'Virtual Video' | 'Telephone'>('In-person');
  const [duration, setDuration] = useState<number>(45); // 30, 45, 60
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('10:00 AM');

  // Hierarchy
  const [courtCategory, setCourtCategory] = useState<CourtCategory>('State High Court');
  const [caseType, setCaseType] = useState<CaseType>('Civil');
  const [subCategory, setSubCategory] = useState<string>('Breach of Contract');

  // Intake & Nigerian Cascade (State -> LGA -> City)
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setPhone] = useState('');
  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [selectedLga, setSelectedLga] = useState<string>('');
  const [city, setCity] = useState('');
  const [matterSummary, setMatterSummary] = useState('');
  const [uploadedBriefs, setUploadedBriefs] = useState<UploadedFileMetadata[]>([]);

  // Payment Simulation
  const [paymentGateway, setPaymentGateway] = useState<'Paystack' | 'Flutterwave' | 'Bank Transfer'>('Paystack');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0];
  const lgas = getLgasForState(selectedState);
  const subCategories = SUB_CATEGORIES_BY_CASE_TYPE[caseType] || [];

  // Fee calculation
  const baseFee = duration === 30 ? 35000 : duration === 45 ? 50000 : 75000;
  const vatRate = 0.075; // 7.5% Nigerian VAT
  const vatAmount = baseFee * vatRate;
  const totalPayable = baseFee + vatAmount;

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const newLgas = getLgasForState(newState);
    setSelectedLga(newLgas[0] || '');
  };

  const handleProceedToPayment = () => {
    setFormError(null);
    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim() || !selectedState) {
      setFormError('Please complete all required intake fields (Name, Email, Phone, State).');
      return;
    }
    setStep(4);
  };

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const newBooking = addBooking({
        branchId: selectedBranchId || (branches[0]?.id || 'BBB-LAG'),
        clientName,
        clientEmail,
        clientPhone,
        state: selectedState,
        lga: selectedLga || lgas[0] || 'Ikeja',
        city: city || 'Central',
        courtCategory,
        caseType,
        subCategory,
        consultationType,
        preferredDate: preferredDate || new Date().toISOString().split('T')[0],
        timeSlot: preferredTime,
        durationMinutes: duration,
        feeAmount: totalPayable,
        paymentReference: `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        paymentStatus: 'Paid',
        status: 'Confirmed'
      });

      setIsProcessingPayment(false);
      setConfirmedBookingCode(newBooking.code);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-[#e0ddd5] max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-[#1a2a4a] text-white p-4 flex items-center justify-between border-b-2 border-[#c9a227]">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#c9a227]" />
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg">
                Book a Confidential Legal Consultation
              </h2>
              <p className="text-[11px] text-[#c9a227]">
                B. B. BALE & CO Chambers · Step {step} of 4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-300 hover:text-white rounded hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto bg-[#f8f6f1]">
          {confirmedBookingCode ? (
            /* Booking Confirmation View */
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1a2a4a]">
                  Consultation Confirmed & Paid
                </h3>
                <p className="text-xs text-[#5a5a5a] mt-1">
                  Your legal consultation has been recorded on the Chambers roster. A confirmation notice and official invoice receipt have been logged.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-[#e0ddd5] text-left max-w-md mx-auto space-y-2 text-xs font-mono-code">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Booking Reference:</span>
                  <span className="font-bold text-[#1a2a4a]">{confirmedBookingCode}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Client Name:</span>
                  <span className="font-semibold text-gray-800">{clientName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Mode & Duration:</span>
                  <span>{consultationType} ({duration} mins)</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-500">Date & Slot:</span>
                  <span>{preferredDate || 'Tomorrow'} at {preferredTime}</span>
                </div>
                <div className="flex justify-between text-[#1a2a4a] font-bold pt-1">
                  <span>Amount Paid:</span>
                  <span>₦{totalPayable.toLocaleString()} (Incl. 7.5% VAT)</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 bg-[#1a2a4a] text-white rounded font-bold text-xs hover:bg-[#111e38] transition-colors"
              >
                Close & Return to Website
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: Branch, Type, Date & Duration */}
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#1a2a4a] border-b pb-1">
                    1. Select Chambers Branch & Consultation Format
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Select Branch</label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                    >
                      {branches.length > 0 ? (
                        branches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code}) - {b.city}, {b.state} State
                          </option>
                        ))
                      ) : (
                        <option value="BBB-LAG">Head Office Chambers (Victoria Island, Lagos / Three Arms Zone, Abuja)</option>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['In-person', 'Virtual Video', 'Telephone'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setConsultationType(mode)}
                        className={`p-3 text-left rounded-lg border text-xs cursor-pointer transition-all ${
                          consultationType === mode
                            ? 'border-[#c9a227] bg-[#1a2a4a] text-white'
                            : 'border-[#e0ddd5] bg-white text-gray-800 hover:border-[#1a2a4a]'
                        }`}
                      >
                        <div className="font-bold">{mode}</div>
                        <div className="text-[10px] opacity-80 mt-1">
                          {mode === 'In-person' ? 'At Chambers branch office' : mode === 'Virtual Video' ? 'Google Meet / Zoom' : 'Direct cellular call'}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Time Slot</label>
                      <select
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                      >
                        <option value="09:00 AM">09:00 AM (Morning Session)</option>
                        <option value="10:30 AM">10:30 AM (Morning Session)</option>
                        <option value="12:00 PM">12:00 PM (Midday Session)</option>
                        <option value="02:30 PM">02:30 PM (Afternoon Session)</option>
                        <option value="04:00 PM">04:00 PM (Evening Session)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Session Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[30, 45, 60].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDuration(mins)}
                          className={`py-2 text-xs font-semibold rounded border cursor-pointer ${
                            duration === mins
                              ? 'bg-[#c9a227] text-[#1a2a4a] border-[#c9a227]'
                              : 'bg-white border-gray-300 text-gray-700'
                          }`}
                        >
                          {mins} Minutes
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 text-right">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2 bg-[#1a2a4a] text-white text-xs font-bold rounded hover:bg-[#111e38] transition-colors"
                    >
                      Next: Legal Hierarchy →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Legal Hierarchy (Court Category -> Case Type -> Sub-Category) */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#1a2a4a] border-b pb-1">
                    2. Classification of Legal Matter
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Court Category / Jurisdiction</label>
                    <select
                      value={courtCategory}
                      onChange={(e) => setCourtCategory(e.target.value as CourtCategory)}
                      className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                    >
                      {COURT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Case Type</label>
                    <select
                      value={caseType}
                      onChange={(e) => {
                        const newType = e.target.value as CaseType;
                        setCaseType(newType);
                        setSubCategory(SUB_CATEGORIES_BY_CASE_TYPE[newType][0] || 'General');
                      }}
                      className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                    >
                      {CASE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Sub-Category</label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                    >
                      {subCategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border rounded text-xs font-semibold text-gray-700 bg-white"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2 bg-[#1a2a4a] text-white text-xs font-bold rounded hover:bg-[#111e38]"
                    >
                      Next: Client Intake →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Intake Form & Nigerian State -> LGA Cascade */}
              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#1a2a4a] border-b pb-1">
                    3. Client Intake Details & Nigerian Location
                  </h3>

                  {formError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">State of Residence *</label>
                      <select
                        value={selectedState}
                        onChange={handleStateChange}
                        className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                      >
                        {NIGERIAN_STATES.map(s => (
                          <option key={s.state} value={s.state}>{s.state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">LGA (Local Govt) *</label>
                      <select
                        value={selectedLga}
                        onChange={(e) => setSelectedLga(e.target.value)}
                        className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                      >
                        {lgas.map(lga => (
                          <option key={lga} value={lga}>{lga}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Town / City / Street Address</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Victoria Island / Wuse 2"
                      className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">Summary of Legal Issue</label>
                    <textarea
                      rows={2}
                      value={matterSummary}
                      onChange={(e) => setMatterSummary(e.target.value)}
                      placeholder="Brief overview for the assigned Legal Practitioner..."
                      className="w-full text-xs p-2 rounded border border-[#e0ddd5] bg-white focus:outline-none focus:border-[#c9a227]"
                    />
                  </div>

                  {/* Section 20 Local File Picker for Consultation Brief Documents */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1">
                      Upload Supporting Documents / Pleadings (Device Picker)
                    </label>
                    <LocalFilePicker
                      label="Choose Document from Device"
                      multiple
                      maxSizeMb={30}
                      currentFiles={uploadedBriefs}
                      onUploadComplete={(files) => setUploadedBriefs(prev => [...prev, ...files])}
                      onRemoveFile={(id) => setUploadedBriefs(prev => prev.filter(f => f.id !== id))}
                      compact
                    />
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border rounded text-xs font-semibold text-gray-700 bg-white"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="px-5 py-2 bg-[#1a2a4a] text-white text-xs font-bold rounded hover:bg-[#111e38]"
                    >
                      Next: Review & Payment →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Fee Breakdown & Payment Gateway */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#1a2a4a] border-b pb-1">
                    4. Statutory Fee Breakdown & Secure Payment
                  </h3>

                  {/* Invoice Breakdown Card */}
                  <div className="bg-white p-4 rounded-lg border border-[#e0ddd5] shadow-xs space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Legal Consultation Fee ({duration} mins · {consultationType}):</span>
                      <span>₦{baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Value Added Tax (VAT @ 7.5%):</span>
                      <span>₦{vatAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-px bg-gray-200 my-1" />
                    <div className="flex justify-between text-base font-bold text-[#1a2a4a]">
                      <span>Total Amount Payable:</span>
                      <span className="text-[#c9a227]">₦{totalPayable.toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1c1c1c] mb-1.5">
                      Select Payment Channel (Nigerian Gateway)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Paystack', 'Flutterwave', 'Bank Transfer'] as const).map(gw => (
                        <button
                          key={gw}
                          type="button"
                          onClick={() => setPaymentGateway(gw)}
                          className={`p-2.5 text-xs font-semibold rounded border cursor-pointer text-center ${
                            paymentGateway === gw
                              ? 'border-[#c9a227] bg-[#1a2a4a] text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {gw}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                    <Shield className="w-4 h-4 inline-block mr-1 text-[#c9a227]" />
                    In compliance with the Legal Practitioners' Remuneration Order (LPRO) 2023 and the Rules of Professional Conduct, all consultation fees are held securely in the Chambers client account and an official receipt is issued immediately.
                  </div>

                  <div className="flex justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 border rounded text-xs font-semibold text-gray-700 bg-white"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={isProcessingPayment}
                      onClick={handleSimulatePayment}
                      className="px-6 py-2.5 bg-[#c9a227] text-[#1a2a4a] text-xs font-bold rounded shadow hover:bg-[#dfba43] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer font-serif-heading"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{isProcessingPayment ? 'Processing Gateway...' : `Authorize ₦${totalPayable.toLocaleString()} (${paymentGateway})`}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
