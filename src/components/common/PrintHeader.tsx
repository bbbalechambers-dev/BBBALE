import React from 'react';
import { Logo } from './Logo';
import { Branch } from '../../types';

interface PrintHeaderProps {
  branch?: Branch | null;
  documentTitle: string;
  referenceNumber: string;
  date?: string;
  confidential?: boolean;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({
  branch,
  documentTitle,
  referenceNumber,
  date = new Date().toLocaleDateString('en-GB'),
  confidential = false
}) => {
  return (
    <div className="w-full border-b-2 border-[#1a2a4a] pb-4 mb-6 text-left">
      {/* Top Banner with Logo and Chambers Details */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="compact" size="lg" />
          <div>
            <h1 className="font-serif font-black text-2xl tracking-wide text-[#1a2a4a]">
              B. B. BALE & CO
            </h1>
            <p className="text-xs font-semibold tracking-wider text-[#c9a227] uppercase">
              CHAMBERS · BARRISTERS, SOLICITORS & LEGAL ARBITRATORS
            </p>
            <p className="text-[11px] text-[#5a5a5a] italic mt-0.5">
              Notaries Public · Property Consultants · Corporate Solicitors
            </p>
          </div>
        </div>

        {/* Branch / Chambers Contact Details */}
        <div className="text-right text-[11px] text-[#444] space-y-0.5 max-w-xs">
          <div className="font-bold text-[#1a2a4a] text-xs">
            {branch ? `${branch.name} Division` : 'Principal Chambers Head Office'}
          </div>
          <div>{branch ? `${branch.address}, ${branch.lga}, ${branch.state} State` : 'Plot 14B, Victoria Island / Three Arms Zone'}</div>
          <div>Tel: {branch ? branch.phone : '+234 (0) 803 000 0000'} | WhatsApp: {branch ? branch.whatsapp : '+234 (0) 803 000 0000'}</div>
          <div>Email: {branch ? branch.email : 'chambers@bbbaleandco.ng'}</div>
          {branch?.rcNumber && <div className="text-[10px] text-gray-500">RC: {branch.rcNumber} | VAT: {branch.vatNumber}</div>}
        </div>
      </div>

      {/* Gold Divider Line */}
      <div className="w-full h-1 bg-[#c9a227] my-3 rounded-full" />

      {/* Meta Bar: Document Reference, Date, Confidentiality */}
      <div className="flex items-center justify-between text-xs font-mono-code pt-1">
        <div>
          <span className="font-semibold text-gray-600">REF NO: </span>
          <span className="font-bold text-[#1a2a4a] bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
            {referenceNumber}
          </span>
        </div>

        {confidential && (
          <div className="text-red-700 font-bold uppercase tracking-widest text-[11px] border border-red-300 bg-red-50 px-2 py-0.5 rounded">
            STRICTLY CONFIDENTIAL · PRIVILEGED
          </div>
        )}

        <div className="text-gray-600">
          <span className="font-semibold">DATE: </span>
          <span>{date}</span>
        </div>
      </div>

      {/* Central Document Title */}
      <div className="mt-4 text-center">
        <h2 className="font-serif font-bold text-lg md:text-xl text-[#1a2a4a] tracking-wide uppercase underline decoration-[#c9a227] decoration-2 underline-offset-4">
          {documentTitle}
        </h2>
      </div>
    </div>
  );
};
