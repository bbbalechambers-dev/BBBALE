import React, { useState } from 'react';
import { X, Shield, Globe, Lock, Server, CheckCircle2, AlertTriangle, Cpu, Terminal, Copy, Check, Gauge, Zap, Database, ArrowDownCircle } from 'lucide-react';
import { GeoAccessStatus } from '../../types';

interface GoogleCloudAfricaModalProps {
  isOpen: boolean;
  onClose: () => void;
  geoStatus: GeoAccessStatus;
  onSimulateOrigin: (countryCode: string) => void;
  onResetSimulation: () => void;
}

export const GoogleCloudAfricaModal: React.FC<GoogleCloudAfricaModalProps> = ({
  isOpen,
  onClose,
  geoStatus,
  onSimulateOrigin,
  onResetSimulation
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quota' | 'countries' | 'cloudArmor' | 'simulator'>('quota');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedQuotaCode, setCopiedQuotaCode] = useState(false);

  if (!isOpen) return null;

  const africanCountries = [
    { code: 'NG', name: 'Nigeria', capital: 'Abuja', region: 'West Africa', status: 'Primary Chambers Hub' },
    { code: 'ZA', name: 'South Africa', capital: 'Pretoria', region: 'Southern Africa', status: 'Primary Cloud Datacenter (africa-south1)' },
    { code: 'KE', name: 'Kenya', capital: 'Nairobi', region: 'East Africa', status: 'Eastern Edge Interconnect' },
    { code: 'GH', name: 'Ghana', capital: 'Accra', region: 'West Africa', status: 'Active' },
    { code: 'EG', name: 'Egypt', capital: 'Cairo', region: 'North Africa', status: 'Active' },
    { code: 'RW', name: 'Rwanda', capital: 'Kigali', region: 'East Africa', status: 'Active' },
    { code: 'UG', name: 'Uganda', capital: 'Kampala', region: 'East Africa', status: 'Active' },
    { code: 'TZ', name: 'Tanzania', capital: 'Dodoma', region: 'East Africa', status: 'Active' },
    { code: 'SN', name: 'Senegal', capital: 'Dakar', region: 'West Africa', status: 'Active' },
    { code: 'CI', name: "Côte d'Ivoire", capital: 'Yamoussoukro', region: 'West Africa', status: 'Active' },
    { code: 'CM', name: 'Cameroon', capital: 'Yaoundé', region: 'Central Africa', status: 'Active' },
    { code: 'ET', name: 'Ethiopia', capital: 'Addis Ababa', region: 'East Africa', status: 'Active' },
    { code: 'MA', name: 'Morocco', capital: 'Rabat', region: 'North Africa', status: 'Active' },
    { code: 'DZ', name: 'Algeria', capital: 'Algiers', region: 'North Africa', status: 'Active' },
    { code: 'TN', name: 'Tunisia', capital: 'Tunis', region: 'North Africa', status: 'Active' },
    { code: 'AO', name: 'Angola', capital: 'Luanda', region: 'Southern Africa', status: 'Active' },
    { code: 'BW', name: 'Botswana', capital: 'Gaborone', region: 'Southern Africa', status: 'Active' },
    { code: 'NA', name: 'Namibia', capital: 'Windhoek', region: 'Southern Africa', status: 'Active' },
    { code: 'ZM', name: 'Zambia', capital: 'Lusaka', region: 'Southern Africa', status: 'Active' },
    { code: 'ZW', name: 'Zimbabwe', capital: 'Harare', region: 'Southern Africa', status: 'Active' },
    { code: 'MZ', name: 'Mozambique', capital: 'Maputo', region: 'Southern Africa', status: 'Active' },
    { code: 'BJ', name: 'Benin', capital: 'Porto-Novo', region: 'West Africa', status: 'Active' },
    { code: 'BF', name: 'Burkina Faso', capital: 'Ouagadougou', region: 'West Africa', status: 'Active' },
    { code: 'BI', name: 'Burundi', capital: 'Gitega', region: 'East Africa', status: 'Active' },
    { code: 'CV', name: 'Cabo Verde', capital: 'Praia', region: 'West Africa', status: 'Active' },
    { code: 'CF', name: 'Central African Republic', capital: 'Bangui', region: 'Central Africa', status: 'Active' },
    { code: 'TD', name: 'Chad', capital: "N'Djamena", region: 'Central Africa', status: 'Active' },
    { code: 'KM', name: 'Comoros', capital: 'Moroni', region: 'East Africa', status: 'Active' },
    { code: 'CG', name: 'Congo', capital: 'Brazzaville', region: 'Central Africa', status: 'Active' },
    { code: 'CD', name: 'DR Congo', capital: 'Kinshasa', region: 'Central Africa', status: 'Active' },
    { code: 'DJ', name: 'Djibouti', capital: 'Djibouti', region: 'East Africa', status: 'Active' },
    { code: 'GQ', name: 'Equatorial Guinea', capital: 'Malabo', region: 'Central Africa', status: 'Active' },
    { code: 'ER', name: 'Eritrea', capital: 'Asmara', region: 'East Africa', status: 'Active' },
    { code: 'SZ', name: 'Eswatini', capital: 'Mbabane', region: 'Southern Africa', status: 'Active' },
    { code: 'GA', name: 'Gabon', capital: 'Libreville', region: 'Central Africa', status: 'Active' },
    { code: 'GM', name: 'The Gambia', capital: 'Banjul', region: 'West Africa', status: 'Active' },
    { code: 'GN', name: 'Guinea', capital: 'Conakry', region: 'West Africa', status: 'Active' },
    { code: 'GW', name: 'Guinea-Bissau', capital: 'Bissau', region: 'West Africa', status: 'Active' },
    { code: 'LS', name: 'Lesotho', capital: 'Maseru', region: 'Southern Africa', status: 'Active' },
    { code: 'LR', name: 'Liberia', capital: 'Monrovia', region: 'West Africa', status: 'Active' },
    { code: 'LY', name: 'Libya', capital: 'Tripoli', region: 'North Africa', status: 'Active' },
    { code: 'MG', name: 'Madagascar', capital: 'Antananarivo', region: 'East Africa', status: 'Active' },
    { code: 'MW', name: 'Malawi', capital: 'Lilongwe', region: 'Southern Africa', status: 'Active' },
    { code: 'ML', name: 'Mali', capital: 'Bamako', region: 'West Africa', status: 'Active' },
    { code: 'MR', name: 'Mauritania', capital: 'Nouakchott', region: 'West Africa', status: 'Active' },
    { code: 'MU', name: 'Mauritius', capital: 'Port Louis', region: 'East Africa', status: 'Active' },
    { code: 'NE', name: 'Niger', capital: 'Niamey', region: 'West Africa', status: 'Active' },
    { code: 'ST', name: 'São Tomé and Príncipe', capital: 'São Tomé', region: 'Central Africa', status: 'Active' },
    { code: 'SC', name: 'Seychelles', capital: 'Victoria', region: 'East Africa', status: 'Active' },
    { code: 'SL', name: 'Sierra Leone', capital: 'Freetown', region: 'West Africa', status: 'Active' },
    { code: 'SO', name: 'Somalia', capital: 'Mogadishu', region: 'East Africa', status: 'Active' },
    { code: 'SS', name: 'South Sudan', capital: 'Juba', region: 'East Africa', status: 'Active' },
    { code: 'SD', name: 'Sudan', capital: 'Khartoum', region: 'North Africa', status: 'Active' },
    { code: 'TG', name: 'Togo', capital: 'Lomé', region: 'West Africa', status: 'Active' }
  ];

  const filteredCountries = africanCountries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gcloudDeployCommand = `# Set target African Region & Deploy on Google Cloud
gcloud config set project smurfy-medley-4xtlg
gcloud run deploy bb-bale-chambers \\
  --source . \\
  --region africa-south1 \\
  --security-policy chambers-africa-only-policy`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gcloudDeployCommand);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] text-white w-full max-w-4xl max-h-[90vh] rounded-xl border-2 border-[#c9a227] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#1e293b] px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#c9a227]/20 border border-[#c9a227] rounded-lg text-[#c9a227]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                  Google Cloud Africa Regional Governance
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green-950 text-green-300 border border-green-700">
                  africa-south1
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Pan-African Sovereign Data Residency & Cloud Armor Geo-Fencing Console
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#111827] px-6 pt-3 border-b border-gray-800 flex items-center gap-4 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('quota')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'quota'
                ? 'border-[#c9a227] text-[#c9a227] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Quota Governor (Africa Only)
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#c9a227] text-[#c9a227] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Regional Architecture
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'countries'
                ? 'border-[#c9a227] text-[#c9a227] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            African Jurisdictions ({africanCountries.length})
          </button>
          <button
            onClick={() => setActiveTab('cloudArmor')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'cloudArmor'
                ? 'border-[#c9a227] text-[#c9a227] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Cloud Armor Rules
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'border-[#c9a227] text-[#c9a227] font-bold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Auditor Simulator
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'quota' && (
            <div className="space-y-6">
              {/* Quota Shield Overview Banner */}
              <div className="bg-[#1e293b] p-5 rounded-xl border border-emerald-500/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 border border-emerald-400 rounded-lg text-emerald-400">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-serif font-bold text-white">
                          Africa-Only Quota Shield & Region Lock
                        </h3>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600 rounded text-[10px] font-mono">
                          1 REGION STRICT
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">
                        Locks your Google Cloud deployment strictly to <strong>africa-south1</strong>. Never consumes multi-region quota tokens, preventing "Resource Exhausted (MaxRegionsPerProject)" errors.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-800">
                    <div className="text-[10px] text-gray-400 uppercase font-mono">Pinned Region</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">africa-south1</div>
                    <div className="text-[10px] text-gray-400">Johannesburg, SA</div>
                  </div>
                  <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-800">
                    <div className="text-[10px] text-gray-400 uppercase font-mono">Max Instances</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">1 Instance</div>
                    <div className="text-[10px] text-gray-400">Zero autoscaling surges</div>
                  </div>
                  <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-800">
                    <div className="text-[10px] text-gray-400 uppercase font-mono">Idle Scale</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">Scale-to-Zero (0)</div>
                    <div className="text-[10px] text-gray-400">Zero idle cost</div>
                  </div>
                  <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-800">
                    <div className="text-[10px] text-gray-400 uppercase font-mono">Multi-Region Lock</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">Hard Blocked</div>
                    <div className="text-[10px] text-gray-400">No extension needed</div>
                  </div>
                </div>
              </div>

              {/* Zero Extension Guarantee Card */}
              <div className="bg-[#0f172a] border border-gray-800 p-5 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#c9a227]" />
                    Safe Deploy Flags (No Quota Extension Required)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`gcloud run deploy bb-bale-chambers --source . --region africa-south1 --max-instances 1 --min-instances 0 --memory 512Mi --cpu 1 --concurrency 80 --security-policy chambers-africa-only-policy`);
                      setCopiedQuotaCode(true);
                      setTimeout(() => setCopiedQuotaCode(false), 2000);
                    }}
                    className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {copiedQuotaCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedQuotaCode ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 bg-black/60 rounded text-emerald-400 font-mono text-[11px] overflow-x-auto">
{`gcloud run deploy bb-bale-chambers \\
  --source . \\
  --region africa-south1 \\
  --max-instances 1 \\
  --min-instances 0 \\
  --memory 512Mi \\
  --cpu 1 \\
  --concurrency 80 \\
  --security-policy chambers-africa-only-policy`}
                </pre>
                <div className="flex items-start gap-2 text-gray-400 text-[11px] pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>By setting <code>--region africa-south1</code> and <code>--max-instances 1</code>, your project utilizes exactly 1 region token out of your allowed regional quota, eliminating the need to request Google Cloud quota increases.</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Status Metric Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
                  <div className="text-[11px] text-gray-400 uppercase font-mono mb-1">Target Cloud Region</div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                    africa-south1
                  </div>
                  <div className="text-xs text-[#c9a227] mt-1 font-mono">Johannesburg, South Africa</div>
                </div>

                <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
                  <div className="text-[11px] text-gray-400 uppercase font-mono mb-1">Geo-Restriction Policy</div>
                  <div className="text-lg font-bold text-green-400 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" />
                    ENFORCED (Active)
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-mono">Cloud Armor L7 Inspection</div>
                </div>

                <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700">
                  <div className="text-[11px] text-gray-400 uppercase font-mono mb-1">Your Detected Access Point</div>
                  <div className="text-lg font-bold text-white truncate">
                    {geoStatus.countryName} ({geoStatus.detectedCountry})
                  </div>
                  <div className="text-xs text-green-400 mt-1 font-mono">
                    {geoStatus.isAfricanJurisdiction ? '✓ African Sovereign Jurisdiction' : '⚠️ Non-African IP'}
                  </div>
                </div>
              </div>

              {/* Data Residency Compliance Section */}
              <div className="bg-[#1e293b]/70 border border-gray-700 rounded-lg p-4 space-y-3">
                <h3 className="text-xs font-bold text-[#c9a227] uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Legal Sovereignty & Regulatory Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
                  <div className="flex items-start gap-2 bg-[#0f172a] p-3 rounded border border-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Nigerian Data Protection Act (NDPA 2023)</strong>
                      Data residency maintained within African continental boundaries. Cross-border transfers restricted to verified bilateral protocols.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-[#0f172a] p-3 rounded border border-gray-800">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">NBA Rules of Professional Conduct</strong>
                      Client confidentiality and legal professional privilege safeguarded against non-African foreign discovery subpoenas.
                    </div>
                  </div>
                </div>
              </div>

              {/* Edge Interconnect Map info */}
              <div className="bg-[#0f172a] border border-gray-800 rounded-lg p-4 space-y-2 text-xs">
                <div className="text-gray-300 font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#c9a227]" />
                  Google Cloud African Backbone Topology
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-400 font-mono text-[11px]">
                  <div className="p-2 bg-[#1e293b] rounded">
                    <div className="text-white font-bold">Johannesburg Primary Node</div>
                    <div>africa-south1 Cloud Run & Firestore</div>
                  </div>
                  <div className="p-2 bg-[#1e293b] rounded">
                    <div className="text-white font-bold">Lagos Edge Interconnect</div>
                    <div>Subsea Equiano & 2Africa Gateway</div>
                  </div>
                  <div className="p-2 bg-[#1e293b] rounded">
                    <div className="text-white font-bold">Nairobi Edge PoP</div>
                    <div>Eastern African Direct Route</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'countries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Search 54 African countries (e.g. Nigeria, Ghana, Kenya)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#c9a227]"
                />
                <span className="text-xs text-gray-400 font-mono">
                  Showing {filteredCountries.length} of {africanCountries.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredCountries.map((c) => (
                  <div
                    key={c.code}
                    className="p-2.5 bg-[#1e293b] hover:bg-[#283852] border border-gray-700/80 rounded-lg text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-[#c9a227] font-mono">[{c.code}]</span> {c.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">{c.region}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-950 text-green-300 border border-green-700/50 font-mono">
                      ALLOWED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cloudArmor' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Google Cloud Armor Policy Definition</h4>
                  <p className="text-gray-400 text-[11px]">Applied to Google Cloud Load Balancing for africa-south1</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 bg-[#1e293b] hover:bg-gray-700 border border-gray-600 rounded text-gray-200 text-xs flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied' : 'Copy gcloud Script'}
                </button>
              </div>

              <div className="bg-[#0b1120] border border-gray-800 rounded-lg p-3 font-mono text-[11px] overflow-x-auto text-green-400">
                <pre>{gcloudDeployCommand}</pre>
              </div>

              <div className="bg-[#1e293b] p-4 rounded-lg border border-gray-700 space-y-2">
                <div className="font-bold text-white">Cloud Armor Rule Priority Matrix:</div>
                <ul className="space-y-2 text-gray-300 list-disc list-inside">
                  <li>
                    <strong className="text-[#c9a227]">Rule 1000 (Allow):</strong> Matches <code className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">origin.region_code in 54 African ISO Codes</code> → Action: <strong>ALLOW</strong>.
                  </li>
                  <li>
                    <strong className="text-[#c9a227]">Rule 1001 (Allow):</strong> Authorized Chambers Counsel Emergency IP / Token Pass → Action: <strong>ALLOW</strong>.
                  </li>
                  <li>
                    <strong className="text-red-400">Rule 2147483647 (Default Deny):</strong> All extra-continental IP origins (* outside Africa) → Action: <strong>DENY (HTTP 403 Forbidden)</strong>.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-600/50 p-3.5 rounded-lg text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Auditor Live Simulation Mode</strong>
                  Test and verify how the portal responds to different geographic origins in real time without setting up external VPNs.
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-300">Test Allowed African Origins:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => onSimulateOrigin('NG')}
                    className="p-3 bg-[#1e293b] hover:bg-green-950/60 border border-green-700/60 rounded-lg text-left text-xs cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-white">Nigeria (NG)</div>
                    <div className="text-green-400 text-[11px]">Chambers HQ • Allowed</div>
                  </button>
                  <button
                    onClick={() => onSimulateOrigin('ZA')}
                    className="p-3 bg-[#1e293b] hover:bg-green-950/60 border border-green-700/60 rounded-lg text-left text-xs cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-white">South Africa (ZA)</div>
                    <div className="text-green-400 text-[11px]">africa-south1 • Allowed</div>
                  </button>
                  <button
                    onClick={() => onSimulateOrigin('KE')}
                    className="p-3 bg-[#1e293b] hover:bg-green-950/60 border border-green-700/60 rounded-lg text-left text-xs cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-white">Kenya (KE)</div>
                    <div className="text-green-400 text-[11px]">East Interconnect • Allowed</div>
                  </button>
                </div>

                <div className="text-xs font-bold text-gray-300 pt-2">Test Blocked Extra-Continental Origins:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => onSimulateOrigin('US')}
                    className="p-3 bg-[#1e293b] hover:bg-red-950/60 border border-red-700/60 rounded-lg text-left text-xs cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-white">United States (US)</div>
                    <div className="text-red-400 text-[11px]">Extra-Continental • Denied (403 Shield)</div>
                  </button>
                  <button
                    onClick={() => onSimulateOrigin('GB')}
                    className="p-3 bg-[#1e293b] hover:bg-red-950/60 border border-red-700/60 rounded-lg text-left text-xs cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-white">United Kingdom (GB)</div>
                    <div className="text-red-400 text-[11px]">Extra-Continental • Denied (403 Shield)</div>
                  </button>
                </div>

                <div className="pt-3">
                  <button
                    onClick={onResetSimulation}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 font-medium transition-colors cursor-pointer"
                  >
                    Reset to Real Geo-IP Detection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#1e293b] px-6 py-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
          <div>Google Cloud Region: africa-south1 (Johannesburg)</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#c9a227] hover:bg-[#d8b030] text-[#1a2a4a] font-bold rounded cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
