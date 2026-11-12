'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login' || pathname.startsWith('/ong');
  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Header fixo no topo */}
      <Header />

      {/* Container que segura a Sidebar e o Conteúdo */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

        {/* Sidebar */}
        <Sidebar />

        {/* Conteúdo Principal com scroll próprio */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', backgroundColor: 'var(--background)', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
}