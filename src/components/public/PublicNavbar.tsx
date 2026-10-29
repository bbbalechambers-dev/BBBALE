import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { Shield, Menu, X, ChevronDown, Lock, UserCheck, Home, Calendar, PhoneCall, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PublicNavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenStaffLogin: () => void;
  onOpenConsultationModal: () => void;
  onOpenRegistrationModal?: (tab?: 'client' | 'owner' | 'tenant') => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  activePage,
  onNavigate,
  onOpenStaffLogin,
  onOpenConsultationModal,
  onOpenRegistrationModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);
  const { branches } = useApp();

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'practice-areas', label: 'Practice Areas' },
    { id: 'team', label: 'Our Team' },
    { id: 'gallery', label: 'Branch Gallery' },
    { id: 'properties', label: 'Properties' },
    { id: 'news', label: 'Announcements' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e0ddd5] shadow-xs">
      {/* Top Gold & Navy Notice Bar */}
      <div className="bg-[#1a2a4a] text-white py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[#c9a227] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a227] animate-pulse"></span>
              B. B. BALE & CO CHAMBERS
            </span>
            <span className="hidden md:inline text-gray-300">
              Solicitors, Advocates of the Supreme Court of Nigeria & Notaries Public
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono-code">
            <span className="hidden md:inline text-gray-300">
              Branches: {branches.length > 0 ? branches.map(b => b.code).join(' · ') : 'Lagos · Abuja (HQ)'}
            </span>

            {/* Disguised Staff Login Button per Section 8.3 */}
            <button
              onClick={onOpenStaffLogin}
              title="Secure Staff Sign In"
              aria-label="Secure staff sign in"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-white bg-[#0f1a30] hover:bg-[#c9a227] hover:text-[#1a2a4a] transition-all font-semibold border border-[#c9a227]/40 text-[11px] cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>STAFF SIGN IN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Chambers Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="cursor-pointer text-left focus:outline-none"
        >
          <Logo variant="full" size="md" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1c1c1c]">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`hover:text-[#c9a227] transition-colors cursor-pointer py-1 ${
                activePage === link.id
                  ? 'text-[#1a2a4a] font-bold border-b-2 border-[#c9a227]'
                  : 'text-[#5a5a5a]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons: Portals Dropdown & Book Consultation CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Sensitive Record Access Dropdown (Section 7) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-[#1a2a4a] text-[#1a2a4a] hover:bg-[#1a2a4a]/5 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Sensitive Portals</span>
              <ChevronDown className="w-3 h-3 text-[#5a5a5a]" />
            </button>

            {portalDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-[#e0ddd5] py-2 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setPortalDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Verified Record Access (Code + ID)
                </div>
                <button
                  onClick={() => {
                    setPortalDropdownOpen(false);
                    onNavigate('client-access');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#1a2a4a]" />
                  <div>
                    <div className="font-semibold text-[#1a2a4a]">Client Access</div>
                    <div className="text-[10px] text-gray-500">Matters, pleader briefs & bills</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setPortalDropdownOpen(false);
                    onNavigate('owner-access');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#1a2a4a]" />
                  <div>
                    <div className="font-semibold text-[#1a2a4a]">Landlord / Owner Access</div>
                    <div className="text-[10px] text-gray-500">Statements, rent remittances & units</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setPortalDropdownOpen(false);
                    onNavigate('tenant-access');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[#1a2a4a]" />
                  <div>
                    <div className="font-semibold text-[#1a2a4a]">Tenant Portal</div>
                    <div className="text-[10px] text-gray-500">Rent schedule, payments & receipts</div>
                  </div>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    setPortalDropdownOpen(false);
                    onOpenRegistrationModal && onOpenRegistrationModal('client');
                  }}
                  className="w-full text-left px-3 py-2 text-xs bg-amber-50/50 hover:bg-amber-100/50 text-[#1a2a4a] flex items-center gap-2 cursor-pointer font-semibold"
                >
                  <UserCheck className="w-4 h-4 text-[#c9a227]" />
                  <div>
                    <div className="font-bold text-[#1a2a4a]">Register with Branch</div>
                    <div className="text-[10px] text-gray-600">Onboard client, landlord or tenant</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Registration Button (Client / Landlord / Tenant Intake with Branch Selection) */}
          <button
            type="button"
            onClick={() => onOpenRegistrationModal && onOpenRegistrationModal('client')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-[#c9a227] text-[#1a2a4a] hover:bg-[#c9a227]/15 transition-all shadow-2xs cursor-pointer font-serif-heading"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Register with Branch</span>
          </button>

          {/* Book Consultation Button */}
          <button
            type="button"
            onClick={onOpenConsultationModal}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded bg-[#c9a227] text-[#1a2a4a] hover:bg-[#dfba43] transition-all shadow-xs cursor-pointer font-serif-heading"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Consultation</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={onOpenStaffLogin}
            title="Secure Access"
            className="p-1.5 rounded text-[#1a2a4a] hover:bg-gray-100"
          >
            <Shield className="w-4 h-4 text-[#c9a227]" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-[#1a2a4a] hover:bg-gray-100 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#e0ddd5] px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-100">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-2 py-1.5 text-xs rounded ${
                  activePage === link.id
                    ? 'bg-[#1a2a4a] text-white font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold uppercase text-gray-400">
              Verified Portals
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onNavigate('client-access');
                  setMobileMenuOpen(false);
                }}
                className="p-2 border rounded text-center text-xs font-medium text-gray-700 hover:border-[#c9a227]"
              >
                Client
              </button>
              <button
                onClick={() => {
                  onNavigate('owner-access');
                  setMobileMenuOpen(false);
                }}
                className="p-2 border rounded text-center text-xs font-medium text-gray-700 hover:border-[#c9a227]"
              >
                Landlord
              </button>
              <button
                onClick={() => {
                  onNavigate('tenant-access');
                  setMobileMenuOpen(false);
                }}
                className="p-2 border rounded text-center text-xs font-medium text-gray-700 hover:border-[#c9a227]"
              >
                Tenant
              </button>
            </div>

            <button
              onClick={() => {
                if (onOpenRegistrationModal) onOpenRegistrationModal('client');
                setMobileMenuOpen(false);
              }}
              className="w-full mt-3 py-2 text-xs font-bold rounded border border-[#c9a227] text-[#1a2a4a] bg-[#c9a227]/10 text-center"
            >
              Register with Branch (Client / Owner / Tenant)
            </button>

            <button
              onClick={() => {
                onOpenConsultationModal();
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 py-2 text-xs font-bold rounded bg-[#c9a227] text-[#1a2a4a] text-center"
            >
              Book a Consultation
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
