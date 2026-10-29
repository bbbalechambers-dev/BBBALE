// Nigerian Legal Hierarchy, Court Categories, Case Types, and Statutory Sub-Categories

import { CourtCategory, CaseType } from '../types';

export const COURT_CATEGORIES: CourtCategory[] = [
  'Supreme Court of Nigeria',
  'Court of Appeal',
  'Federal High Court',
  'State High Court',
  'National Industrial Court (NICN)',
  'Magistrate Court',
  'Customary Court of Appeal / Customary Court',
  'Sharia Court of Appeal / Sharia Court',
  'Rent Tribunal',
  'Election Petition Tribunal',
  'Tax Appeal Tribunal',
  'Investment & Securities Tribunal',
  'Other (Specify Manually)'
];

export const CASE_TYPES: CaseType[] = [
  'Civil',
  'Criminal',
  'Sharia',
  'Family & Matrimonial',
  'Commercial & Corporate',
  'Constitutional & Human Rights',
  'Land & Property',
  'Labour & Employment',
  'Taxation',
  'Election Petition',
  'Other'
];

export const SUB_CATEGORIES_BY_CASE_TYPE: Record<CaseType, string[]> = {
  'Civil': [
    'Breach of Contract',
    'Tort & Negligence',
    'Debt Recovery',
    'Defamation (Libel & Slander)',
    'Enforcement of Fundamental Rights',
    'Recovery of Premises',
    'Inheritance & Probate Administration',
    'Intellectual Property Infringement',
    'Insurance Claims',
    'Banking & Financial Disputes',
    'Consumer Protection Claims',
    'Partnership Dissolution',
    'Other Civil Matters'
  ],
  'Criminal': [
    'Capital Offences (Homicide / Armed Robbery)',
    'Economic & Financial Crimes (EFCC / ICPC Matters)',
    'Advance Fee Fraud & Cybercrimes (Cybercrimes Act)',
    'Non-Capital Offences',
    'Bail Applications & Fundamental Rights Incarceration',
    'Sexual & Gender-Based Offences',
    'Drugs & Narcotics Offences (NDLEA)',
    'Appeals Against Criminal Conviction',
    'Other Criminal Matters'
  ],
  'Sharia': [
    'Islamic Family & Marriage (Nikah & Talaq)',
    'Inheritance & Estate Distribution (Mirath)',
    'Islamic Commercial Transactions (Muamalat)',
    'Endowment & Trust (Waqf)',
    'Guardianship & Custody (Hadhanah)',
    'Paternity & Legitimacy (Nasab)',
    'Other Islamic Law Matters'
  ],
  'Family & Matrimonial': [
    'Dissolution of Statutory Marriage (Divorce)',
    'Judicial Separation',
    'Child Custody & Maintenance Orders',
    'Property Settlement upon Matrimonial Dissolution',
    'Adoption & Fosterage',
    'Domestic Violence Protection Orders',
    'Intestate Succession Disputes',
    'Other Family Matters'
  ],
  'Commercial & Corporate': [
    'Corporate Insolvency & Winding-Up',
    'Shareholder & Boardroom Disputes',
    'Mergers & Acquisitions Legal Due Diligence',
    'Commercial Arbitration & Mediation Enforcement',
    'Securities & Capital Markets Enforcement',
    'Maritime & Admiralty Claims',
    'Aviation & Carriage by Air Disputes',
    'Oil & Gas / Energy Commercial Contracts',
    'Other Corporate Matters'
  ],
  'Constitutional & Human Rights': [
    'Fundamental Rights Enforcement Procedure (FREP) Rules',
    'Constitutional Interpretation (Supreme / High Court)',
    'Federalism & Inter-Governmental Revenue Disputes',
    'Unlawful Detention & Police Brutality Redress',
    'Freedom of Information (FOI) Applications',
    'Other Constitutional Claims'
  ],
  'Land & Property': [
    'Declaration of Title to Land',
    'Trespass to Land & Perpetual Injunction',
    'Recovery of Possession & Mesne Profits',
    'Compulsory Acquisition & Compensation Claims',
    'Land Use Charge & Property Tax Contests',
    'Mortgage Foreclosure & Perfection Disputes',
    'Boundary & Communal Land Clashes',
    'Governor’s Consent & Title Regularisation',
    'Other Real Property Matters'
  ],
  'Labour & Employment': [
    'Unlawful Termination & Wrongful Dismissal',
    'Workplace Discrimination & Harassment',
    'Trade Union & Industrial Action Injunctions',
    'Non-Payment of Salaries & Severance Packages',
    'Employee Compensation for Workplace Injury',
    'Restrictive Covenants & Trade Secret Enforcement',
    'Pension Reform Act Non-Remittance Claims',
    'Other Employment Disputes'
  ],
  'Taxation': [
    'Company Income Tax (CIT) Assessment Disputes',
    'Value Added Tax (VAT) Assessment Appeal',
    'Personal Income Tax (PAYE) Audit Defense',
    'Withholding Tax (WHT) Regularisation',
    'Customs & Excise Duty Classification Appeal',
    'Pioneer Status & Tax Incentive Disputes',
    'Other Tax Matters'
  ],
  'Election Petition': [
    'Gubernatorial Election Petition',
    'National Assembly Election Petition (Senate / Reps)',
    'State House of Assembly Election Petition',
    'Local Government Council Election Contest',
    'Pre-Election Party Primary Disputes',
    'Other Electoral Litigation'
  ],
  'Other': [
    'General Legal Consultation',
    'Administrative Review of Government Action',
    'Coroner’s Inquest Representation',
    'Alternative Dispute Resolution (ADR)',
    'Miscellaneous Legal Proceedings'
  ]
};

export const STANDARD_COURT_DIVISIONS = [
  { name: 'Supreme Court of Nigeria, Three Arms Zone, Abuja', category: 'Supreme Court of Nigeria' },
  { name: 'Court of Appeal, Lagos Division (Igbosere/Lagos)', category: 'Court of Appeal' },
  { name: 'Court of Appeal, Abuja Division', category: 'Court of Appeal' },
  { name: 'Court of Appeal, Port Harcourt Division', category: 'Court of Appeal' },
  { name: 'Court of Appeal, Ibadan Division', category: 'Court of Appeal' },
  { name: 'Court of Appeal, Kaduna Division', category: 'Court of Appeal' },
  { name: 'Court of Appeal, Enugu Division', category: 'Court of Appeal' },
  { name: 'Court of Appeal, Benin Division', category: 'Court of Appeal' },
  { name: 'Federal High Court, Ikoyi Judicial Division, Lagos', category: 'Federal High Court' },
  { name: 'Federal High Court, Headquarters Judicial Division, Abuja', category: 'Federal High Court' },
  { name: 'Federal High Court, Port Harcourt Judicial Division', category: 'Federal High Court' },
  { name: 'Federal High Court, Kano Judicial Division', category: 'Federal High Court' },
  { name: 'High Court of Lagos State, Ikeja Judicial Division', category: 'State High Court' },
  { name: 'High Court of Lagos State, Lagos Judicial Division (TBS)', category: 'State High Court' },
  { name: 'High Court of the Federal Capital Territory, Maitama, Abuja', category: 'State High Court' },
  { name: 'High Court of Rivers State, Port Harcourt', category: 'State High Court' },
  { name: 'National Industrial Court of Nigeria, Lagos Judicial Division', category: 'National Industrial Court (NICN)' },
  { name: 'National Industrial Court of Nigeria, Abuja Headquarters', category: 'National Industrial Court (NICN)' },
  { name: 'Chief Magistrate Court of Lagos State, Yaba', category: 'Magistrate Court' },
  { name: 'Chief Magistrate Court of Lagos State, Igbosere', category: 'Magistrate Court' },
  { name: 'Chief Magistrate Court, Wuse Zone 2, Abuja', category: 'Magistrate Court' },
  { name: 'Lagos State Rent Tribunal / Citizens Mediation Centre (CMC)', category: 'Rent Tribunal' },
  { name: 'FCT Rent Assessment Tribunal, Abuja', category: 'Rent Tribunal' },
  { name: 'Tax Appeal Tribunal, Lagos Zone', category: 'Tax Appeal Tribunal' },
  { name: 'Tax Appeal Tribunal, Abuja Zone', category: 'Tax Appeal Tribunal' },
  { name: 'Customary Court of Appeal of Lagos State', category: 'Customary Court of Appeal / Customary Court' },
  { name: 'Sharia Court of Appeal of the FCT, Abuja', category: 'Sharia Court of Appeal / Sharia Court' }
];

export const TENANCY_NOTICE_TEMPLATES = [
  {
    type: 'Notice to Quit (6 Months)',
    title: 'Statutory Notice to Quit (Yearly Tenancy)',
    statute: 'Recovery of Premises Act & Lagos State Tenancy Law 2011, Section 13',
    description: 'Mandatory 6 full calendar months notice to determine a yearly tenancy.'
  },
  {
    type: 'Notice to Quit (3 Months)',
    title: 'Statutory Notice to Quit (Half-Yearly Tenancy)',
    statute: 'Lagos State Tenancy Law 2011, Section 13(1)(c)',
    description: 'Statutory 3 months notice to quit for half-yearly tenant.'
  },
  {
    type: 'Notice to Quit (1 Month)',
    title: 'Statutory Notice to Quit (Monthly Tenancy)',
    statute: 'Lagos State Tenancy Law 2011, Section 13(1)(b)',
    description: 'One full calendar month notice for monthly tenancy.'
  },
  {
    type: '7-Day Notice of Owner’s Intention to Apply to Court for Possession',
    title: '7-Day Notice of Owner’s Intention to Apply to Court for Possession (Form TL5)',
    statute: 'Section 16, Lagos State Tenancy Law 2011 & Recovery of Premises Act, Section 7',
    description: 'Mandatory statutory 7 clear days notice served after the expiration of Notice to Quit before filing in Court/Tribunal.'
  },
  {
    type: 'Demand Letter for Outstanding Rent & Arrears',
    title: 'Final Demand Notice for Immediate Payment of Rent Arrears and Mesne Profits',
    statute: 'Rules of Professional Conduct & Common Law Debt Pre-action Protocol',
    description: 'Pre-action formal demand letter issued by Solicitors before initiating recovery claims.'
  },
  {
    type: 'Rent Tribunal Claim Form & Statement of Claim',
    title: 'Rent Tribunal / Magistrate Court Plaint for Possession and Arrears of Rent',
    statute: 'Lagos State Tenancy Law 2011 Schedule Forms',
    description: 'Originating process initiating action for possession, arrears of rent and mesne profits.'
  }
];
