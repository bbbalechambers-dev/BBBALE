import React from 'react';
import { Logo } from '../common/Logo';
import { Shield, Phone, Mail, MapPin, Award, CheckCircle } from 'lucide-react';

export const PublicFooter: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#0f1a30] text-gray-300 border-t-4 border-[#c9a227]">
      {/* Upper Footer: Chambers Overview & Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Chambers Identity */}
        <div className="space-y-4">
          <Logo variant="full" theme="dark" size="md" />
          <p className="text-xs text-gray-400 leading-relaxed">
            B. B. BALE & CO Chambers is a premier multi-branch Nigerian law firm offering sophisticated advocacy, commercial conveyancing, multi-property portfolio management, and dispute resolution across all Superior Courts of Record.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-[#c9a227]">
            <Award className="w-4 h-4 flex-shrink-0" />
            <span>Regulated by the Nigerian Bar Association (NBA)</span>
          </div>
        </div>

        {/* Practice Areas */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase font-serif-heading mb-3 border-b border-gray-700 pb-1">
            Core Practice Areas
          </h3>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('practice-areas')} className="hover:text-[#c9a227] transition-colors">Commercial & Corporate Litigation</button></li>
            <li><button onClick={() => onNavigate('practice-areas')} className="hover:text-[#c9a227] transition-colors">Real Property, Title & Tenancy Law</button></li>
            <li><button onClick={() => onNavigate('practice-areas')} className="hover:text-[#c9a227] transition-colors">Arbitration & Alternative Dispute Resolution</button></li>
            <li><button onClick={() => onNavigate('practice-areas')} className="hover:text-[#c9a227] transition-colors">Constitutional & Human Rights Enforcement</button></li>
            <li><button onClick={() => onNavigate('practice-areas')} className="hover:text-[#c9a227] transition-colors">Sharia Jurisprudence & Mirath (Estate)</button></li>
            <li><button onClick={() => onNavigate('practice-areas')} className="hover:text-[#c9a227] transition-colors">Labour & National Industrial Court Matters</button></li>
          </ul>
        </div>

        {/* Sensitive Portals & Client Services */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase font-serif-heading mb-3 border-b border-gray-700 pb-1">
            Access Portals
          </h3>
          <ul className="space-y-2 text-xs">
            <li><button onClick={() => onNavigate('client-access')} className="hover:text-[#c9a227] transition-colors flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-[#c9a227]" /> Client Matter Portal</button></li>
            <li><button onClick={() => onNavigate('owner-access')} className="hover:text-[#c9a227] transition-colors flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-[#c9a227]" /> Property Owner & Remittance</button></li>
            <li><button onClick={() => onNavigate('tenant-access')} className="hover:text-[#c9a227] transition-colors flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-[#c9a227]" /> Tenant Rent & Maintenance Portal</button></li>
            <li><button onClick={() => onNavigate('book')} className="hover:text-[#c9a227] transition-colors flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-[#c9a227]" /> Book Legal Consultation</button></li>
            <li><button onClick={() => onNavigate('faq')} className="hover:text-[#c9a227] transition-colors">Frequently Asked Questions</button></li>
          </ul>
        </div>

        {/* Chambers Principal Address */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase font-serif-heading mb-3 border-b border-gray-700 pb-1">
            Chambers Headquarters
          </h3>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#c9a227] flex-shrink-0 mt-0.5" />
              <span>Three Arms Zone, FCT Abuja & Victoria Island, Lagos State, Nigeria</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
              <span>+234 (0) 803 000 0000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
              <span>chambers@bbbaleandco.ng</span>
            </div>
            <div className="pt-2 text-[11px] text-gray-500 font-mono-code">
              Monday – Friday: 8:00 AM – 6:00 PM (WAT)
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Regulatory & Legal Bar */}
      <div className="bg-[#0a1222] py-4 px-4 text-[11px] text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span>© 2026 B. B. BALE & CO Chambers. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">
              NDPA Privacy Policy
            </button>
            <span className="hidden sm:inline">·</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">
              Terms of Engagement
            </button>
            <span className="hidden sm:inline">·</span>
            <button onClick={() => onNavigate('refund')} className="hover:text-white transition-colors">
              Consultation Refund Policy
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono-code text-[10px] text-gray-400">
            <Shield className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>RPC 2023 · LPRO 2023 · NDPA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
