import React from 'react';
import { Shield, Scale, Building2, BookOpen, ChevronRight, CheckCircle2, Award, Calendar, Users, FileCheck, User, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onOpenConsultationModal: () => void;
  onOpenRegistrationModal?: (tab?: 'client' | 'owner' | 'tenant') => void;
  onOpenStaffLogin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenConsultationModal,
  onOpenRegistrationModal,
  onOpenStaffLogin
}) => {
  const { branches, properties } = useApp();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-[#1a2a4a] text-white overflow-hidden py-16 md:py-24 border-b-4 border-[#c9a227]">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c9a227_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a227]/20 border border-[#c9a227] text-[#c9a227] text-xs font-semibold tracking-wider uppercase font-mono-code">
              <Award className="w-3.5 h-3.5" />
              <span>Chambers of Distinction · Federal Republic of Nigeria</span>
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.15]">
              Authoritative Legal Advocacy & Comprehensive Real Estate Stewardship
            </h1>

            <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl font-light leading-relaxed">
              At <strong className="text-white font-semibold">B. B. BALE & CO Chambers</strong>, we represent commercial enterprises, property owners, and private clients across Nigeria with uncompromising precision, strict integrity, and deep courtroom mastery.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onOpenConsultationModal}
                className="px-6 py-3 rounded bg-[#c9a227] text-[#1a2a4a] hover:bg-[#dfba43] transition-all font-serif-heading font-bold text-sm shadow-lg shadow-black/20 cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Legal Consultation</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenRegistrationModal && onOpenRegistrationModal('client')}
                className="px-6 py-3 rounded bg-[#0f1a30] border-2 border-[#c9a227] text-[#c9a227] hover:bg-[#c9a227] hover:text-[#1a2a4a] transition-all font-serif-heading font-bold text-sm cursor-pointer flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>Register with Branch</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('practice-areas')}
                className="px-6 py-3 rounded border border-white/30 text-white hover:bg-white/10 transition-all font-medium text-sm cursor-pointer"
              >
                Explore Practice Areas
              </button>
            </div>
          </div>

          {/* Chambers Picture of Events Showcase */}
          <div className="lg:col-span-4 bg-[#0f1a30]/90 backdrop-blur-md rounded-2xl border-2 border-[#c9a227]/60 overflow-hidden shadow-2xl space-y-0 group">
            {/* Visual Picture Banner */}
            <div className="relative h-56 sm:h-64 w-full bg-gradient-to-b from-[#1a2a4a] via-[#0f1a30] to-[#0a1222] overflow-hidden flex flex-col justify-end p-4 border-b border-[#c9a227]/40">
              {/* Event Scenic SVG Illustration */}
              <svg
                viewBox="0 0 400 240"
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="hallGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a2a4a" />
                    <stop offset="50%" stopColor="#253a66" />
                    <stop offset="100%" stopColor="#0d182b" />
                  </linearGradient>
                  <linearGradient id="goldBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#c9a227" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="chandelierGlow" cx="50%" cy="20%" r="50%">
                    <stop offset="0%" stopColor="#dfba43" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#1a2a4a" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Grand Conference Auditorium Backdrop */}
                <rect width="400" height="240" fill="url(#hallGlow)" />
                <rect width="400" height="140" fill="url(#chandelierGlow)" />

                {/* Ceiling Arches & Architectural Pillars */}
                <path d="M0 0 L100 80 L100 240 L0 240 Z" fill="#0d1726" opacity="0.6" />
                <path d="M400 0 L300 80 L300 240 L400 240 Z" fill="#0d1726" opacity="0.6" />
                <line x1="100" y1="80" x2="300" y2="80" stroke="#c9a227" strokeWidth="1.5" strokeOpacity="0.5" />

                {/* Stage Lighting Rays */}
                <polygon points="200,0 120,200 280,200" fill="url(#goldBeam)" />

                {/* Stage Backdrop Banner */}
                <rect x="110" y="45" width="180" height="42" rx="4" fill="#0a1222" stroke="#c9a227" strokeWidth="1.2" />
                <text x="200" y="63" fill="#c9a227" fontSize="8.5" fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="1">
                  B. B. BALE &amp; CO CHAMBERS
                </text>
                <text x="200" y="77" fill="#ffffff" fontSize="6.5" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.8">
                  ANNUAL LEGAL SUMMIT &amp; AWARDS DINNER
                </text>

                {/* Dais Podium with Logo Shield */}
                <path d="M165 140 L235 140 L245 200 L155 200 Z" fill="#162238" stroke="#c9a227" strokeWidth="1" />
                <circle cx="200" cy="165" r="10" fill="#c9a227" opacity="0.2" />
                <path d="M200 157 L194 160 V168 C194 173 200 176 200 176 C200 176 206 173 206 168 V160 Z" fill="#c9a227" />

                {/* Assembly of Distinguished Advocates & Guests (Silhouettes in Grand Hall) */}
                <ellipse cx="60" cy="190" rx="14" ry="16" fill="#0b1320" />
                <ellipse cx="90" cy="186" rx="15" ry="18" fill="#09101c" />
                <ellipse cx="120" cy="192" rx="13" ry="15" fill="#0b1320" />
                <ellipse cx="280" cy="192" rx="13" ry="15" fill="#0b1320" />
                <ellipse cx="310" cy="186" rx="15" ry="18" fill="#09101c" />
                <ellipse cx="340" cy="190" rx="14" ry="16" fill="#0b1320" />

                {/* Keynote Legal Practitioner on Stage */}
                <ellipse cx="200" cy="120" rx="9" ry="10" fill="#dfba43" />
                <path d="M188 140 C188 130 212 130 212 140 L216 155 L184 155 Z" fill="#ffffff" />
                <path d="M194 133 L200 142 L206 133" stroke="#c9a227" strokeWidth="1.5" fill="none" />

                {/* Ambient Golden Sparks & Crystal Chandelier */}
                <circle cx="200" cy="20" r="3" fill="#dfba43" />
                <circle cx="185" cy="28" r="2" fill="#c9a227" />
                <circle cx="215" cy="28" r="2" fill="#c9a227" />
                <circle cx="170" cy="34" r="1.5" fill="#dfba43" />
                <circle cx="230" cy="34" r="1.5" fill="#dfba43" />
                <line x1="200" y1="0" x2="200" y2="20" stroke="#c9a227" strokeWidth="1" />
              </svg>

              {/* Overlay Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a2a4a]/90 border border-[#c9a227] text-[#c9a227] text-[10px] font-mono-code font-bold uppercase tracking-wider shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#c9a227] animate-ping" />
                  Chambers Event Snapshot
                </span>
                <span className="text-[10px] font-mono text-gray-300 bg-black/60 px-2 py-0.5 rounded">
                  Lagos &amp; Abuja
                </span>
              </div>
            </div>

            {/* Event Details Card Body */}
            <div className="p-5 space-y-3 bg-[#0a1426] text-white">
              <div>
                <h3 className="font-serif font-bold text-base text-white tracking-wide flex items-center justify-between">
                  <span>Annual Chambers Gala &amp; Legal Summit</span>
                  <Award className="w-4 h-4 text-[#c9a227]" />
                </h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Moments from our annual colloquium celebrating 28+ years of advocacy, real property governance, and judicial excellence across Nigeria.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white/5 p-2.5 rounded-lg border border-white/10">
                <div>
                  <span className="text-gray-400 block text-[10px]">EVENT DATE:</span>
                  <span className="text-[#c9a227] font-semibold">October 2026</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">DELEGATION:</span>
                  <span className="text-gray-200">Partners &amp; Bar Leaders</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('gallery')}
                className="w-full py-2.5 bg-[#c9a227] hover:bg-[#dfba43] text-[#1a2a4a] text-xs font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-serif-heading"
              >
                <span>View Full Branch Event Gallery</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Excellence (Informational, No Button Repetition) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => onNavigate('practice-areas')}
            className="p-6 bg-white rounded-lg border border-[#e0ddd5] shadow-xs hover:border-[#c9a227] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded bg-[#1a2a4a]/5 text-[#1a2a4a] group-hover:bg-[#1a2a4a] group-hover:text-[#c9a227] flex items-center justify-center transition-colors mb-4">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] mb-2">Litigation & Advocacy</h3>
            <p className="text-xs text-[#5a5a5a] leading-relaxed">
              Rigorous representation in high-stakes civil disputes, commercial arbitration, appellate practice, and human rights.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-[#8c6d17] group-hover:text-[#1a2a4a] flex items-center gap-1">
              <span>View Practice Briefs</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('properties')}
            className="p-6 bg-white rounded-lg border border-[#e0ddd5] shadow-xs hover:border-[#c9a227] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded bg-[#1a2a4a]/5 text-[#1a2a4a] group-hover:bg-[#1a2a4a] group-hover:text-[#c9a227] flex items-center justify-center transition-colors mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] mb-2">Real Estate & Tenancy</h3>
            <p className="text-xs text-[#5a5a5a] leading-relaxed">
              Multi-property portfolio management, tenancy agreement drafting, rent recovery, and Quit Notice issuance.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-[#8c6d17] group-hover:text-[#1a2a4a] flex items-center gap-1">
              <span>Explore Portfolio</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('practice-areas')}
            className="p-6 bg-white rounded-lg border border-[#e0ddd5] shadow-xs hover:border-[#c9a227] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded bg-[#1a2a4a]/5 text-[#1a2a4a] group-hover:bg-[#1a2a4a] group-hover:text-[#c9a227] flex items-center justify-center transition-colors mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] mb-2">Corporate & Conveyancing</h3>
            <p className="text-xs text-[#5a5a5a] leading-relaxed">
              Due diligence, Governor's consent, deeds of assignment, mergers, and corporate commercial contract structuring.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-[#8c6d17] group-hover:text-[#1a2a4a] flex items-center gap-1">
              <span>View Corporate Services</span>
              <span>→</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('practice-areas')}
            className="p-6 bg-white rounded-lg border border-[#e0ddd5] shadow-xs hover:border-[#c9a227] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded bg-[#1a2a4a]/5 text-[#1a2a4a] group-hover:bg-[#1a2a4a] group-hover:text-[#c9a227] flex items-center justify-center transition-colors mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1a2a4a] mb-2">Arbitration & Compliance</h3>
            <p className="text-xs text-[#5a5a5a] leading-relaxed">
              Domestic and international commercial arbitration, regulatory mediation, and compliance under Nigerian law.
            </p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] font-semibold text-[#8c6d17] group-hover:text-[#1a2a4a] flex items-center gap-1">
              <span>View Dispute Resolution</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Chambers Overview */}
      <section className="bg-white py-12 border-y border-[#e0ddd5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 border-l-4 border-[#c9a227] pl-6 space-y-3">
            <span className="text-xs font-bold text-[#c9a227] tracking-wider uppercase font-mono-code">
              Office of the Principal Partner
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1a2a4a]">
              "Upholding Justice with Unrivaled Fidelity to Nigerian Law"
            </h2>
            <p className="text-xs text-[#5a5a5a] italic leading-relaxed">
              "Every brief entrusted to B. B. BALE & CO Chambers is handled with supreme diligence. We combine classical Nigerian legal doctrines with modern technology to deliver transparent and effective results for our clients."
            </p>
            <div className="text-xs font-semibold text-[#1a2a4a] pt-1">
              — B. B. Bale, Esq., SAN / Principal Partner
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#f8f6f1] border border-[#e0ddd5]">
              <div className="font-bold text-[#1a2a4a] text-sm mb-1">Decentralized Multi-Branch Reach</div>
              <p className="text-[#5a5a5a] leading-relaxed">
                Operating active divisions with autonomous Heads of Chamber, backed by unified firm-wide standards.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#f8f6f1] border border-[#e0ddd5]">
              <div className="font-bold text-[#1a2a4a] text-sm mb-1">Tenancy & Premises Recovery</div>
              <p className="text-[#5a5a5a] leading-relaxed">
                Lawful Notice to Quit, 7-day statutory processes, and Rent Tribunal representation across Lagos, FCT Abuja, and beyond.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#f8f6f1] border border-[#e0ddd5]">
              <div className="font-bold text-[#1a2a4a] text-sm mb-1">Corporate & Commercial Conveyancing</div>
              <p className="text-[#5a5a5a] leading-relaxed">
                Governor's consent, title perfection, deeds of assignment, mortgages, and commercial lease negotiations.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#f8f6f1] border border-[#e0ddd5]">
              <div className="font-bold text-[#1a2a4a] text-sm mb-1">Immutable Audit & Confidentiality</div>
              <p className="text-[#5a5a5a] leading-relaxed">
                NDPA compliant data protections, role-restricted record access, and encrypted digital communications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Branch Self-Registration & Dual-Site Access Section (User Requirement) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border-2 border-[#c9a227]/70 shadow-lg p-6 sm:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e0ddd5] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a2a4a]/10 text-[#1a2a4a] text-xs font-mono font-bold uppercase mb-2">
                <Building2 className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Branch-Specific Registration & Data Isolation</span>
              </div>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#1a2a4a]">
                Register with Your Local Chambers Branch
              </h2>
              <p className="text-xs sm:text-sm text-[#5a5a5a] max-w-2xl mt-1">
                Statutory Rule: Every client, property owner, and tenant registers under their chosen branch division. All legal work data and portal authentications are strictly isolated to that selected branch.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenRegistrationModal && onOpenRegistrationModal('client')}
                className="px-5 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] rounded-lg font-bold text-xs shadow-sm font-serif-heading flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Begin Branch Registration</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[#f8f6f1] border border-[#e0ddd5] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-[#1a2a4a] text-[#c9a227] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Client Legal Intake</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Select your branch division to open litigation briefs, retainers, and legal advocacy files. Access privileged matter proceedings and bills.
                </p>
              </div>
              <button
                onClick={() => onOpenRegistrationModal && onOpenRegistrationModal('client')}
                className="w-full py-2 bg-white border border-[#1a2a4a] text-[#1a2a4a] hover:bg-[#1a2a4a] hover:text-[#c9a227] rounded text-xs font-bold transition-all"
              >
                Register as Client →
              </button>
            </div>

            <div className="p-5 rounded-xl bg-[#f8f6f1] border border-[#e0ddd5] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-[#1a2a4a] text-[#c9a227] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Landlord / Property Owner</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Entrust your residential or commercial properties to dedicated branch stewards. Receive verified rent remittance statements and tenant tracking.
                </p>
              </div>
              <button
                onClick={() => onOpenRegistrationModal && onOpenRegistrationModal('owner')}
                className="w-full py-2 bg-white border border-[#1a2a4a] text-[#1a2a4a] hover:bg-[#1a2a4a] hover:text-[#c9a227] rounded text-xs font-bold transition-all"
              >
                Register as Landlord →
              </button>
            </div>

            <div className="p-5 rounded-xl bg-[#f8f6f1] border border-[#e0ddd5] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-[#1a2a4a] text-[#c9a227] flex items-center justify-center font-bold">
                  <Home className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Tenant Premises Intake</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Register occupied units under the governing branch division. Verify tenancy agreements, upload rent payments, and access lawful receipts.
                </p>
              </div>
              <button
                onClick={() => onOpenRegistrationModal && onOpenRegistrationModal('tenant')}
                className="w-full py-2 bg-white border border-[#1a2a4a] text-[#1a2a4a] hover:bg-[#1a2a4a] hover:text-[#c9a227] rounded text-xs font-bold transition-all"
              >
                Register as Tenant →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#1a2a4a] text-white rounded-xl p-8 sm:p-12 text-center space-y-4 border-2 border-[#c9a227] shadow-xl">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl">
            Need Expert Legal Counsel or Property Management?
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm max-w-xl mx-auto">
            Schedule an intake appointment with one of our Chambers counsels or start a live chat session directly with our reception desk.
          </p>
          <div className="flex items-center justify-center pt-2">
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-3 bg-[#c9a227] hover:bg-[#dfba43] text-[#1a2a4a] rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer font-serif-heading"
            >
              Contact Chambers Offices &amp; Registry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
