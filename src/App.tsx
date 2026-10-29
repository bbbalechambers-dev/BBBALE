import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicLiveChatWidget } from './components/public/PublicLiveChatWidget';
import { ConsultationBookingModal } from './components/public/ConsultationBookingModal';
import { StaffLoginModal } from './components/internal/StaffLoginModal';
import { InternalLayout } from './components/internal/InternalLayout';

// Public Pages
import { HomePage } from './components/public/HomePage';
import { PracticeAreasPage } from './components/public/PracticeAreasPage';
import { GalleryPage } from './components/public/GalleryPage';
import { PublicPropertiesPage } from './components/public/PublicPropertiesPage';
import {
  AboutPage,
  TeamPage,
  ContactPage,
  FaqPage,
  PrivacyPolicyPage,
  TermsPage,
  RefundPolicyPage
} from './components/public/LegalPages';
import { SensitiveAccessPage } from './components/public/SensitiveAccessPages';
import { PublicRegistrationModal } from './components/public/PublicRegistrationModal';

// Portals
import { ClientPortal } from './components/portal/ClientPortal';
import { OwnerPortal } from './components/portal/OwnerPortal';
import { TenantPortal } from './components/portal/TenantPortal';

const MainApp: React.FC = () => {
  const {
    currentUser,
    authenticatedClient,
    authenticatedOwner,
    authenticatedTenant
  } = useApp();

  const [activePage, setActivePage] = useState<string>('home');
  const [showStaffLoginModal, setShowStaffLoginModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationDefaultTab, setRegistrationDefaultTab] = useState<'client' | 'owner' | 'tenant'>('client');

  const [viewMode, setViewMode] = useState<'internal' | 'public'>('internal');

  // If internal staff user is signed in and in internal mode -> show full internal management site
  if (currentUser && viewMode === 'internal') {
    return (
      <InternalLayout
        onReturnToPublic={() => {
          setViewMode('public');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // If verified sensitive portal user is signed in -> show specific portal
  if (authenticatedClient) {
    return <ClientPortal />;
  }

  if (authenticatedOwner) {
    return <OwnerPortal />;
  }

  if (authenticatedTenant) {
    return <TenantPortal />;
  }

  // Otherwise, render Public Site (Section 5 Dual-Site Architecture)
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f6f1]">
      {/* Internal Staff Administrator Browsing Banner */}
      {currentUser && (
        <aside
          aria-label="Staff management navigation banner"
          className="bg-[#1a2a4a] text-white px-4 py-2 text-xs flex items-center justify-between border-b-2 border-[#c9a227] shadow-sm sticky top-0 z-50"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">
              Browsing Public Website as {currentUser.role}: <span className="text-[#c9a227]">{currentUser.fullName}</span>
            </span>
          </div>
          <button
            onClick={() => {
              setViewMode('internal');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-3 py-1 bg-[#c9a227] text-[#1a2a4a] hover:bg-[#dfba43] rounded font-bold font-serif-heading text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>← Return to Chambers Portal</span>
          </button>
        </aside>
      )}

      {/* Public Navbar */}
      <PublicNavbar
        activePage={activePage}
        onNavigate={(page) => {
          if (page === 'book') {
            setShowConsultationModal(true);
          } else if (page === 'register') {
            setRegistrationDefaultTab('client');
            setShowRegistrationModal(true);
          } else {
            setActivePage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenStaffLogin={() => setShowStaffLoginModal(true)}
        onOpenConsultationModal={() => setShowConsultationModal(true)}
        onOpenRegistrationModal={(tab) => {
          setRegistrationDefaultTab(tab || 'client');
          setShowRegistrationModal(true);
        }}
      />

      {/* Main Public Page Viewport */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            onNavigate={(page) => {
              if (page === 'register') {
                setRegistrationDefaultTab('client');
                setShowRegistrationModal(true);
              } else {
                setActivePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onOpenConsultationModal={() => setShowConsultationModal(true)}
            onOpenRegistrationModal={(tab) => {
              setRegistrationDefaultTab(tab || 'client');
              setShowRegistrationModal(true);
            }}
            onOpenStaffLogin={() => setShowStaffLoginModal(true)}
          />
        )}

        {activePage === 'about' && <AboutPage />}
        {activePage === 'practice-areas' && (
          <PracticeAreasPage onOpenConsultationModal={() => setShowConsultationModal(true)} />
        )}
        {activePage === 'team' && <TeamPage />}
        {activePage === 'gallery' && <GalleryPage />}
        {activePage === 'properties' && (
          <PublicPropertiesPage onOpenConsultationModal={() => setShowConsultationModal(true)} />
        )}
        {activePage === 'contact' && <ContactPage />}
        {activePage === 'faq' && <FaqPage />}
        {activePage === 'news' && <AboutPage />}
        {activePage === 'privacy' && <PrivacyPolicyPage />}
        {activePage === 'terms' && <TermsPage />}
        {activePage === 'refund' && <RefundPolicyPage />}

        {/* Sensitive Access Control Pages (Section 7) */}
        {activePage === 'client-access' && (
          <SensitiveAccessPage
            portalType="client"
            onSuccess={() => {}}
            onSwitchPortal={(type) => setActivePage(`${type}-access`)}
            onOpenRegistration={() => {
              setRegistrationDefaultTab('client');
              setShowRegistrationModal(true);
            }}
          />
        )}

        {activePage === 'owner-access' && (
          <SensitiveAccessPage
            portalType="owner"
            onSuccess={() => {}}
            onSwitchPortal={(type) => setActivePage(`${type}-access`)}
            onOpenRegistration={() => {
              setRegistrationDefaultTab('owner');
              setShowRegistrationModal(true);
            }}
          />
        )}

        {activePage === 'tenant-access' && (
          <SensitiveAccessPage
            portalType="tenant"
            onSuccess={() => {}}
            onSwitchPortal={(type) => setActivePage(`${type}-access`)}
            onOpenRegistration={() => {
              setRegistrationDefaultTab('tenant');
              setShowRegistrationModal(true);
            }}
          />
        )}
      </main>

      {/* Public Footer */}
      <PublicFooter
        onNavigate={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Public Live Chat with Administrator & WhatsApp Fallback Widget (Section 31) */}
      <PublicLiveChatWidget />

      {/* Disguised Staff Login Modal (Section 8 & 9) */}
      <StaffLoginModal
        isOpen={showStaffLoginModal}
        onClose={() => setShowStaffLoginModal(false)}
        onLoginSuccess={() => setShowStaffLoginModal(false)}
      />

      {/* Public Consultation Booking Modal with Nigerian Cascade & Payment (Section 17 & 18) */}
      <ConsultationBookingModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
      />

      {/* Public Intake & Registration Modal with Branch Selection (User Requirement) */}
      <PublicRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        defaultTab={registrationDefaultTab}
        onOpenPortalAccess={(type) => setActivePage(`${type}-access`)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
