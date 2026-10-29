import React from 'react';
import { Scale, Building2, Shield, Users, Landmark, FileText, Gavel, Award } from 'lucide-react';

export const PracticeAreasPage: React.FC<{ onOpenConsultationModal: () => void }> = ({ onOpenConsultationModal }) => {
  const practices = [
    {
      icon: Scale,
      title: 'Commercial & Corporate Litigation',
      desc: 'Advocacy before the Supreme Court, Court of Appeal, and Federal High Court in contractual disputes, shareholder litigation, winding-up, and banking conflicts.'
    },
    {
      icon: Building2,
      title: 'Real Estate & Tenancy Law',
      desc: 'Title regularisation, governor\'s consent, property portfolio administration, Quit Notice service, and recovery of premises proceedings across Nigeria.'
    },
    {
      icon: Gavel,
      title: 'Arbitration & Alternative Dispute Resolution',
      desc: 'Domestic and international commercial arbitration, mediation, and amicable resolution of multi-party construction and corporate disputes.'
    },
    {
      icon: Landmark,
      title: 'Constitutional & Human Rights Law',
      desc: 'Enforcement of Fundamental Rights under the 1999 Constitution (as amended), unlawful detention redress, and public interest litigation.'
    },
    {
      icon: FileText,
      title: 'Sharia Jurisprudence & Estate Distribution (Mirath)',
      desc: 'Islamic family law, Islamic commercial transactions (Muamalat), endowment trusts (Waqf), and lawful distribution of deceased estates.'
    },
    {
      icon: Users,
      title: 'Labour & Employment Law',
      desc: 'Representation before the National Industrial Court of Nigeria (NICN) in wrongful termination, trade union actions, and pension compliance claims.'
    },
    {
      icon: Shield,
      title: 'Taxation & Regulatory Defense',
      desc: 'Representation before the Tax Appeal Tribunal (TAT) regarding Company Income Tax, PAYE audit reconciliations, and VAT disputes.'
    },
    {
      icon: Award,
      title: 'Election Petition & Democratic Law',
      desc: 'Pre-election party disputes, candidate qualifications, and post-election petitions before National and State Assembly Tribunals.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase font-mono-code">
          Legal Competencies
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#1a2a4a]">
          Practice Areas of B. B. BALE & CO Chambers
        </h1>
        <p className="text-xs sm:text-sm text-[#5a5a5a] leading-relaxed">
          Our Chambers provides comprehensive legal representation, counsel, and strategic advisory across the full spectrum of Nigerian civil, criminal, commercial, and property jurisprudence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {practices.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg border border-[#e0ddd5] shadow-xs hover:border-[#c9a227] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded bg-[#1a2a4a]/5 text-[#1a2a4a] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#c9a227]" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#1a2a4a] mb-2">{p.title}</h3>
                <p className="text-xs text-[#5a5a5a] leading-relaxed">{p.desc}</p>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-[#8c6d17] font-semibold">
                <Shield className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>Supreme & Superior Courts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Unified Consultation Banner (Zero Button Repetition) */}
      <div className="bg-[#1a2a4a] text-white rounded-xl p-8 border-2 border-[#c9a227] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
            Require Legal Counsel in Any of These Practice Areas?
          </h3>
          <p className="text-xs text-gray-300 max-w-xl">
            Our Chambers assigns specialized counsel across civil, criminal, commercial, and property divisions in accordance with NBA RPC 2023.
          </p>
        </div>

        <button
          onClick={onOpenConsultationModal}
          className="px-6 py-2.5 bg-[#c9a227] text-[#1a2a4a] hover:bg-[#dfba43] font-bold text-xs rounded-md shadow transition-colors whitespace-nowrap cursor-pointer font-serif-heading"
        >
          Schedule Legal Consultation
        </button>
      </div>
    </div>
  );
};
