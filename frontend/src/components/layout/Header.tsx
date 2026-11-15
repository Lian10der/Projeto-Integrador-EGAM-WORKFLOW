'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { buscarUsuarioAtual, type UsuarioAtual } from '@/lib/sessao';

function getInitials(nome: string): string {
  const partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  }
  return nome.substring(0, 2).toUpperCase();
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioAtual | null>(null);

  useEffect(() => {
    buscarUsuarioAtual().then(setUsuario);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const termo = searchQuery.trim();
    router.push(termo ? `/projetos?busca=${encodeURIComponent(termo)}` : '/projetos');
  };

  const getHelpContent = () => {
    if (pathname === '/home') {
      return 'Esta é a página Inicial. Aqui você acompanha os indicadores gerais e os projetos recentes.';
    }
    if (pathname.includes('/projetos')) {
      return 'Explorador de Projetos. Use a busca ou os filtros laterais para encontrar projetos.';
    }
    if (pathname.includes('/ongs')) {
      return 'Aqui você aprova ou recusa o cadastro de novas organizações (ONGs).';
    }
    if (pathname.includes('/kanban')) {
      return 'Quadro Kanban. Arraste os cards para atualizar o status dos projetos.';
    }
    return 'Sistema centralizado de gestão e triagem de projetos sociais do IGAM.';
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: '#1a1d21',
        borderBottom: '1px solid #343a40',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxSizing: 'border-box',
        height: '72px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#238636',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '13px',
          }}
        >
          {usuario ? getInitials(usuario.nome) : '--'}
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#e6edf3' }}>
            {usuario?.nome ?? 'Carregando...'}
          </div>
          <div style={{ fontSize: '12px', color: '#adb5bd' }}>{usuario?.email ?? ''}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '600px', margin: '0 32px' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
          <Search size={16} color="#6c757d" style={{ position: 'absolute', left: '12px' }} />
          <input
            type="text"
            placeholder="Pesquisar Projetos"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#212529',
              border: '1px solid #343a40',
              borderRadius: '8px',
              padding: '10px 12px 10px 40px',
              color: '#e6edf3',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </form>
        <button
          onClick={() => router.push('/projetos?novo=true')}
          style={{
            background: '#238636',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          + Criar Projeto
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              background: '#212529',
              border: '1px solid #343a40',
              borderRadius: '8px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Bell size={18} color="#adb5bd" />
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                background: '#f85149',
                borderRadius: '50%',
              }}
            />
          </button>
          {notifOpen && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', width: '320px', background: '#212529', border: '1px solid #343a40', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #343a40', fontWeight: 600, fontSize: '14px', color: '#e6edf3' }}>Notificações</div>
              <div style={{ padding: '16px', fontSize: '13px', color: '#adb5bd' }}>Nenhuma notificação no momento.</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setHelpOpen(true)}
          style={{
            background: '#212529',
            border: '1px solid #343a40',
            borderRadius: '8px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <HelpCircle size={18} color="#adb5bd" />
        </button>
      </div>

      {helpOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#212529', border: '1px solid #343a40', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e6edf3', marginBottom: '16px' }}>Ajuda</h3>
            <p style={{ fontSize: '14px', color: '#adb5bd', lineHeight: '1.6', marginBottom: '24px' }}>
              {getHelpContent()}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setHelpOpen(false)} style={{ background: '#238636', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}