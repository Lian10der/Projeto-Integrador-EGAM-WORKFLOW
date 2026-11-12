'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sair } from '@/lib/sessao';

// Abas que aparecem no menu lateral.
const MENU = [
  { name: 'Home', href: '/' },
  { name: 'Explorar Projetos', href: '/projetos' },
  { name: 'Usuários', href: '/usuarios' },
  { name: 'KanBan', href: '/kanban' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        background: '#161b22',
        borderRight: '1px solid #2d333b',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
        zIndex: 30,
      }}
    >
      <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#f0f6fc', lineHeight: '1.3' }}>
          Instituto Genésio <span style={{ color: '#00c4cc' }}>Antônio Mendes</span>
        </h2>
        <span style={{ fontSize: '11px', color: '#8b949e', marginTop: '4px', display: 'block' }}>
          Gestão de Projetos Sociais
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {MENU.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#f0f6fc' : '#8b949e',
                background: isActive ? 'rgba(0, 196, 204, 0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(0, 196, 204, 0.3)' : '1px solid transparent',
                textDecoration: 'none',
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid #2d333b', paddingTop: '16px' }}>
        <button
          onClick={sair}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ee5268',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 14px',
            width: '100%',
            textAlign: 'left',
            borderRadius: '8px',
          }}
        >
          Sair da Conta
        </button>
      </div>
    </aside>
  );
}