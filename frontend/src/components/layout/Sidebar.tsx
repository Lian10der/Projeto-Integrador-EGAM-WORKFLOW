'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Folder, Users, Shield, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { sair } from '@/lib/sessao';

const MENU = [
  { name: 'Home', href: '/home', icon: Home },
  { name: 'Explorar Projetos', href: '/projetos', icon: Folder },
  { name: 'ONGs', href: '/ongs', icon: Shield },
  { name: 'Usuários', href: '/usuarios', icon: Users },
  { name: 'KanBan', href: '/kanban', icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  const [aberta, setAberta] = useState(true);

  return (
    <aside
      style={{
        width: aberta ? '260px' : '72px',
        minWidth: aberta ? '260px' : '72px',
        background: '#1a1d21',
        borderRight: '1px solid #343a40',
        display: 'flex',
        flexDirection: 'column',
        padding: aberta ? '24px 16px' : '24px 8px',
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
        transition: 'width 0.2s ease, min-width 0.2s ease, padding 0.2s ease',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: aberta ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: aberta ? 'space-between' : 'center',
          marginBottom: '32px',
          gap: '8px',
        }}
      >
        {aberta && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#e6edf3', lineHeight: '1.3' }}>
              Instituto Genésio <span style={{ color: '#adb5bd' }}>Antônio Mendes</span>
            </h2>
            <span style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px', display: 'block' }}>
              Gestão de Projetos Sociais
            </span>
          </div>
        )}

        <button
          onClick={() => setAberta(!aberta)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#adb5bd',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: '4px',
          }}
        >
          <Menu size={20} />
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {MENU.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: aberta ? 'flex-start' : 'center',
                gap: '12px',
                padding: aberta ? '10px 14px' : '10px 0',
                borderRadius: '8px',
                fontSize: aberta ? '14px' : '16px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#adb5bd',
                background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                border: isActive ? '1px solid #495057' : '1px solid transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <Icon size={18} color={isActive ? '#ffffff' : '#adb5bd'} />
              {aberta && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid #343a40', paddingTop: '16px' }}>
        <button
          onClick={sair}
          title="Sair da conta"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ee5268',
            fontSize: aberta ? '13px' : '16px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: aberta ? '8px 14px' : '8px 0',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: aberta ? 'flex-start' : 'center',
            gap: '12px',
            borderRadius: '8px',
          }}
        >
          <LogOut size={18} color="#ee5268" />
          {aberta && <span>Sair da Conta</span>}
        </button>
      </div>
    </aside>
  );
}