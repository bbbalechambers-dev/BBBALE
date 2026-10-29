import React, { useState } from 'react';
import { Shield, MapPin, Phone, Mail, Award, CheckCircle2, Building2, HelpCircle, FileText, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NIGERIAN_STATES, getLgasForState } from '../../data/nigeriaGeo';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase font-mono-code">
          Institutional Heritage
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#1a2a4a]">
          About B. B. BALE & CO Chambers
        </h1>
        <p className="text-xs sm:text-sm text-[#5a5a5a] max-w-2xl mx-auto leading-relaxed">
          Founded on principles of unwavering integrity, scholarly jurisprudence, and relentless client advocacy across the Nigerian federation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-gray-700 bg-white p-6 sm:p-8 rounded-xl border border-[#e0ddd5] shadow-xs">
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-[#1a2a4a]">Our Chambers Genesis</h2>
          <p>
            B. B. BALE & CO Chambers was established to provide high-calibre legal representation combining classical appellate courtroom rigor with state-of-the-art property management and commercial conveyancing.
          </p>
          <p>
            Headquartered in Lagos and Abuja, with an expansive network of regional divisions, our practitioners regularly appear before the Supreme Court of Nigeria, the Court of Appeal, the Federal and State High Courts, and specialized statutory tribunals.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif font-bold text-lg text-[#1a2a4a]">Statutory & Ethical Compliance</h2>
          <p>
            Our firm practices in strict conformity with the <em>Rules of Professional Conduct for Legal Practitioners (RPC) 2023</em>, the <em>Legal Practitioners’ Remuneration Order (LPRO) 2023</em>, and the <em>Nigeria Data Protection Act (NDPA)</em>.
          </p>
          <div className="p-3 bg-[#f8f6f1] rounded border border-[#c9a227]/40 space-y-1.5 font-mono-code text-[11px]">
            <div className="text-[#1a2a4a] font-bold">Regulatory Accreditations:</div>
            <div>· Nigerian Bar Association (NBA) Corporate Member</div>
            <div>· Notaries Public of the Supreme Court of Nigeria</div>
            <div>· Chartered Institute of Arbitrators (CIArb UK/Nigeria)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TeamPage: React.FC = () => {
  const leadership = [
    {
      name: 'B. B. Bale, Esq.',
      title: 'Principal Partner & Head of Chambers',
      creds: 'LL.B (Hons), B.L, LL.M, Notary Public',
      bio: 'Leading silk with over 28 years of appellate practice, constitutional law, and multi-billion Naira commercial conveyancing.'
    },
    {
      name: 'Adewale O. Johnson, Esq.',
      title: 'Head of Chamber (Lagos Division)',
      creds: 'LL.B, B.L, MCIArb',
      bio: 'Specialist in commercial litigation, banking defense, and recovery of premises under Lagos State Tenancy Law.'
    },
    {
      name: 'Fatima Z. Bello, Esq.',
      title: 'Head of Chamber (FCT Abuja Division)',
      creds: 'LL.B, B.L, Sharia Specialist',
      bio: 'Authority in Federal High Court administrative litigation, Sharia succession (Mirath), and government regulatory compliance.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase font-mono-code">
          Legal Practitioners & Partners
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#1a2a4a]">
          Chambers Leadership & Counsel
        </h1>
        <p className="text-xs sm:text-sm text-[#5a5a5a] max-w-xl mx-auto">
          Distinguished barristers, solicitors, and legal arbitrators committed to exceptional legal advocacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leadership.map((member, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg border border-[#e0ddd5] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-full bg-[#1a2a4a] text-[#c9a227] flex items-center justify-center font-serif font-bold text-lg mb-4">
                {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">{member.name}</h3>
              <div className="text-[11px] font-semibold text-[#c9a227] uppercase mt-0.5">{member.title}</div>
              <div className="text-[10px] text-gray-400 font-mono mt-0.5">{member.creds}</div>
              <p className="text-xs text-[#5a5a5a] mt-3 leading-relaxed">{member.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { branches } = useApp();
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || '');
  const [selectedState, setSelectedState] = useState('Lagos');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const lgas = getLgasForState(selectedState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#c9a227] tracking-widest uppercase font-mono-code">
          Get In Touch
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#1a2a4a]">
          Contact Chambers Offices
        </h1>
        <p className="text-xs sm:text-sm text-[#5a5a5a] max-w-xl mx-auto">
          Reach our legal consultation desks across Nigeria or dispatch an inquiry to our central reception.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Branch Offices List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-serif font-bold text-lg text-[#1a2a4a]">Chambers Branch Network</h2>
          
          <div className="space-y-3">
            {branches.length > 0 ? (
              branches.map(b => (
                <div key={b.id} className="p-4 bg-white rounded-lg border border-[#e0ddd5] shadow-xs text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#1a2a4a] text-sm">{b.name}</span>
                    <span className="font-mono text-[10px] text-[#c9a227] bg-[#1a2a4a] px-2 py-0.5 rounded">{b.code}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-[#c9a227] mt-0.5 flex-shrink-0" />
                    <span>{b.address}, {b.city}, {b.state} State</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-[#c9a227] flex-shrink-0" />
                    <span>{b.phone} (WhatsApp: {b.whatsapp})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-[#c9a227] flex-shrink-0" />
                    <span>{b.email}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-white rounded-lg border border-[#e0ddd5] text-xs space-y-2">
                <div className="font-bold text-[#1a2a4a]">Chambers Head Office (Lagos & FCT Abuja)</div>
                <p className="text-gray-600">Plot 14B Victoria Island, Lagos & Three Arms Zone, FCT Abuja</p>
                <p className="text-gray-600">Tel: +234 (0) 803 000 0000 | Email: chambers@bbbaleandco.ng</p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Inquiry Form with Nigerian State -> LGA Cascade (Section 28) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-[#e0ddd5] shadow-xs">
          <h2 className="font-serif font-bold text-lg text-[#1a2a4a] mb-1">Dispatch an Official Inquiry</h2>
          <p className="text-xs text-[#5a5a5a] mb-4">
            Our Chambers reception reviews all submissions within 2 hours during active business hours.
          </p>

          {submitted ? (
            <div className="p-6 text-center space-y-3 bg-[#f8f6f1] rounded-lg border border-[#c9a227]">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-base text-[#1a2a4a]">Inquiry Dispatched Successfully</h3>
              <p className="text-xs text-gray-600">
                Thank you, {name}. A member of our legal administration has received your message and will reach out via {email} or {phone}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#1a2a4a]">Target Chambers Branch Division *</label>
                <select
                  required
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227] bg-white font-medium"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code}) — {b.city}, {b.state} State
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Select the specific Chambers office to receive your legal brief and inquiry.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State of Residence *</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    {NIGERIAN_STATES.map(s => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Local Government (LGA)</label>
                  <select
                    className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                  >
                    {lgas.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Message or Brief Description *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="State the nature of your inquiry or consultation request..."
                  className="w-full p-2.5 rounded border border-[#e0ddd5] focus:outline-none focus:border-[#c9a227]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#1a2a4a] text-[#c9a227] hover:bg-[#111e38] font-bold rounded shadow transition-colors flex items-center gap-2 cursor-pointer font-serif-heading"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry to Chambers</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'How are consultation fees determined at B. B. BALE & CO Chambers?',
      a: 'All legal consultation fees are determined in compliance with the Legal Practitioners\' Remuneration Order (LPRO) 2023. Fees reflect practitioner seniority, complexity, and session duration, and are uniformly transparent with statutory 7.5% VAT.'
    },
    {
      q: 'How does the Sensitive Record Access Portal work?',
      a: 'In accordance with the Nigeria Data Protection Act (NDPA), clients, landlords, and tenants receive a unique Chambers code (e.g., BBB-LAG/CLI/0001). Access requires entering this code plus one verified personal identifier (email, phone, or NIN/CAC).'
    },
    {
      q: 'What is the procedure for serving a Notice to Quit on a tenant?',
      a: 'Under the Lagos State Tenancy Law 2011 and the Recovery of Premises Act, the required statutory notice period depends on the tenancy term (yearly = 6 months; half-yearly = 3 months; monthly = 1 month). This is followed by a mandatory 7-Day Notice of Owner\'s Intention to Apply to Court.'
    },
    {
      q: 'Can landlords register multiple properties under one account?',
      a: 'Yes. Our Chambers provides a hierarchical property management module enabling property owners to register unlimited properties, review individual and consolidated rent rolls, and receive direct net remittances.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <HelpCircle className="w-10 h-10 text-[#c9a227] mx-auto" />
        <h1 className="font-serif font-black text-3xl text-[#1a2a4a]">Frequently Asked Questions</h1>
        <p className="text-xs text-[#5a5a5a]">Answers regarding legal appointments, tenancy, fees, and client record security.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-[#e0ddd5] shadow-xs space-y-2">
            <h3 className="font-serif font-bold text-sm text-[#1a2a4a]">{f.q}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs text-gray-700 leading-relaxed bg-white p-6 sm:p-10 rounded-xl border border-[#e0ddd5]">
      <h1 className="font-serif font-black text-2xl text-[#1a2a4a]">NDPA Privacy Policy & Data Protection Charter</h1>
      <p className="text-[11px] text-gray-500 font-mono">Last Updated: October 2026 · Compliant with Nigeria Data Protection Act (NDPA) 2023</p>

      <div className="space-y-3 pt-2">
        <h2 className="font-serif font-bold text-sm text-[#1a2a4a]">1. Legal Basis & Data Controller</h2>
        <p>B. B. BALE & CO Chambers operates as a Data Controller under the Nigeria Data Protection Commission (NDPC). We process confidential client information, property title documents, and KYC records strictly for the discharge of professional legal services, conveyancing, and dispute representation.</p>

        <h2 className="font-serif font-bold text-sm text-[#1a2a4a]">2. Sensitive Record Access & Isolation</h2>
        <p>All client, property owner, and tenant records are sequestered behind dual-factor credential verification (Assigned Code + Identifier). Cross-branch access is strictly restricted by role permissions.</p>

        <h2 className="font-serif font-bold text-sm text-[#1a2a4a]">3. Local Device File Uploads</h2>
        <p>All documents uploaded into our system originate directly from the user's local device file system. Files are encrypted at rest with AES-256 and transmitted exclusively over TLS 1.3 encrypted sockets.</p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs text-gray-700 leading-relaxed bg-white p-6 sm:p-10 rounded-xl border border-[#e0ddd5]">
      <h1 className="font-serif font-black text-2xl text-[#1a2a4a]">Terms of Legal Engagement & Professional Mandate</h1>
      <p className="text-[11px] text-gray-500 font-mono">Governed by the Rules of Professional Conduct (RPC) 2023 & Laws of the Federal Republic of Nigeria</p>

      <div className="space-y-3 pt-2">
        <h2 className="font-serif font-bold text-sm text-[#1a2a4a]">1. Attorney-Client Privilege</h2>
        <p>All consultations, pleadings, advice, and documents shared with B. B. BALE & CO Chambers enjoy privileged protection under Section 192 of the Evidence Act 2011.</p>

        <h2 className="font-serif font-bold text-sm text-[#1a2a4a]">2. Remuneration & Client Account Funds</h2>
        <p>All fees are charged in harmony with the Legal Practitioners' Remuneration Order (LPRO) 2023. Client advance fees are held in dedicated Chambers Trust Accounts with separate ledgers.</p>
      </div>
    </div>
  );
};

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs text-gray-700 leading-relaxed bg-white p-6 sm:p-10 rounded-xl border border-[#e0ddd5]">
      <h1 className="font-serif font-black text-2xl text-[#1a2a4a]">Consultation & Retainer Refund Policy</h1>
      <div className="space-y-3 pt-2">
        <p>Consultation cancellations made with at least 24 hours notice are eligible for full refund or rescheduling. Unutilized portions of litigation retainers are returned upon formal disengagement and conclusion of taxed accounts.</p>
      </div>
    </div>
  );
};
