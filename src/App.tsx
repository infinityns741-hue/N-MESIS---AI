import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { ActiveScreen, UserRole, UserSession } from './types';
import { isSupabaseReady } from './backend/servicios/supabaseService';
import { HeaderStatus } from './frontend/componentes-compartidos';
import { IndexAcceso as PortalSelector } from './frontend/acceso/IndexAcceso';
import { LoginForm } from './frontend/acceso/LoginForm';
import { ChatAlumnoView as ChatView } from './frontend/portal-alumno/chat/ChatAlumnoView';
import { DeveloperPortal } from './frontend/acceso/DeveloperPortal';
import { DashboardDocenteView as TeacherDashboard } from './frontend/portal-docente/dashboard/DashboardDocenteView';
import { ModalConfiguracionSupabase as SupabaseConfigModal } from './frontend/componentes-compartidos';
import { CintaNemesisTicker as NemesisTicker } from './frontend/componentes-compartidos';
import { FondoAguaFluida as FluidWaterGrid } from './frontend/componentes-compartidos';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('portal-select');
  const [selectedRole, setSelectedRole] = useState<UserRole>('alumno');
  const [session, setSession] = useState<UserSession | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  useEffect(() => {
    setIsSupabaseConnected(isSupabaseReady());
  }, []);

  const handleSelectRole = (role: UserRole) => {
    if (role === 'developer') {
      setActiveScreen('developer-portal');
      return;
    }
    setSelectedRole(role);
    setActiveScreen('login');
  };

  const handleBackToPortals = () => {
    setActiveScreen('portal-select');
  };

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    if (userSession.role === 'docente') {
      setActiveScreen('teacher-dashboard');
    } else {
      setActiveScreen('chat');
    }
  };

  const handleLogout = () => {
    setSession(null);
    setActiveScreen('portal-select');
  };

  const refreshSupabaseStatus = () => {
    setIsSupabaseConnected(isSupabaseReady());
  };

  // IF IN TEACHER DASHBOARD MODE:
  if (activeScreen === 'teacher-dashboard' && session) {
    return (
      <TeacherDashboard
        session={session}
        onLogout={handleLogout}
        onOpenChat={() => setActiveScreen('chat')}
      />
    );
  }

  // IF IN CHAT MODE: Cover 100% full screen, NO FÍSICA UNSAAC header, NO ribbon, NO footer!
  if (activeScreen === 'chat' && session) {
    return (
      <ChatView
        session={session}
        onLogout={handleLogout}
        onOpenDevPortal={() => setActiveScreen('developer-portal')}
        onOpenTeacherDashboard={session.role === 'docente' ? () => setActiveScreen('teacher-dashboard') : undefined}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#040508] text-zinc-100 flex flex-col items-center justify-between overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Living Fluid Undulating Water Grid & Dynamic Color Shifting Canvas */}
      <FluidWaterGrid />

      {/* Persistent System Header */}
      <div className="w-full max-w-5xl z-20 pt-2 sm:pt-4">
        <HeaderStatus
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        />
      </div>

      {/* Main Content View with optional mobile phone frame wrapper */}
      <main className="relative z-10 w-full flex-1 flex items-center justify-center p-3 sm:p-6 my-auto">
        <div className={`w-full transition-all duration-300 ${
          isMobileFrame 
            ? 'max-w-[390px] min-h-[750px] p-4 rounded-[40px] border-[6px] border-zinc-800 bg-[#07080f] shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between my-4' 
            : 'max-w-2xl'
        }`}>
          {isMobileFrame && (
            <div className="w-full flex justify-center pb-2">
              {/* Phone speaker pill */}
              <div className="w-20 h-1 rounded-full bg-zinc-700" />
            </div>
          )}

          <div className="w-full flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeScreen === 'portal-select' && (
                <PortalSelector
                  key="portal-selector"
                  onSelectRole={handleSelectRole}
                />
              )}

              {activeScreen === 'login' && (
                <LoginForm
                  key={`login-${selectedRole}`}
                  role={selectedRole}
                  onBack={handleBackToPortals}
                  onLoginSuccess={handleLoginSuccess}
                  onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
                />
              )}

              {activeScreen === 'developer-portal' && (
                <DeveloperPortal
                  key="developer-portal"
                  onBack={handleBackToPortals}
                  onLaunchChatAsStudent={handleLoginSuccess}
                />
              )}
            </AnimatePresence>
          </div>

          {isMobileFrame && (
            <div className="w-full flex justify-center pt-3 pb-1">
              {/* Home indicator bar */}
              <div className="w-32 h-1 rounded-full bg-zinc-600/60" />
            </div>
          )}
        </div>
      </main>

      {/* Systems Ribbon Ticker & Compact Footer */}
      <footer className="relative z-20 w-full flex flex-col items-center select-none mt-auto">
        <NemesisTicker />
        <div className="w-full text-center py-2 text-[10px] sm:text-[11px] font-mono-code text-zinc-500 bg-[#040508]/80">
          <span>NÉMESIS © 2026</span>
        </div>
      </footer>

      {/* Supabase Configuration & Vercel / GitHub Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigUpdated={refreshSupabaseStatus}
      />
    </div>
  );
}

