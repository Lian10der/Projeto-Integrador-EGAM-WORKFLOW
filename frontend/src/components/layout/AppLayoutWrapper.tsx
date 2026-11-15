'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Esconde o menu apenas para a tela de seleção, login do IGAM e área da ONG.
  // A rota '/ongs' (plural, admin) NÃO deve ser escondida.
  const esconderMenu = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname.startsWith('/ong/'); // Note a barra no final para pegar apenas /ong/...

  if (esconderMenu) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', backgroundColor: 'var(--background)', position: 'relative' }}>
          {children}
        </main>
      </div>
    </div>
  );
}