'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { buscarUsuarioAtual, sair, type UsuarioAtual } from '@/lib/sessao';

// Descrição de cada aba do menu lateral, na linguagem do dia a dia.
const AJUDA_ABAS = [
  {
    rota: '/',
    nome: 'Home',
    texto:
      'É a página inicial. Mostra um resumo do sistema: o total aprovado, quantos projetos foram apoiados, o potencial de incentivo fiscal e o número de vidas impactadas. Logo abaixo aparecem os projetos mais recentes. Clique em um deles para ver os detalhes.',
  },
  {
    rota: '/projetos',
    nome: 'Explorar Projetos',
    texto:
      'É onde você encontra todos os projetos. Use a busca para achar um projeto pelo nome ou pela instituição. Use os filtros para separar por lei de incentivo, categoria, status ou ordem. Em cada card, clique em "Ver Detalhes" para ver a ficha completa, gerar o relatório em PDF e abrir os documentos anexados. Para cadastrar um projeto novo, use o botão "+ Criar Projeto".',
  },
  {
    rota: '/usuarios',
    nome: 'Usuários',
    texto:
      'Mostra as pessoas que têm acesso ao sistema. Aqui você cadastra um novo usuário, edita o nome, o e-mail e o status (ATIVO ou INATIVO) e exclui quem não deve mais entrar. Ao excluir, o acesso da pessoa ao sistema é removido.',
  },
  {
    rota: '/kanban',
    nome: 'KanBan',
    texto:
      'Mostra os projetos em colunas, de acordo com o status: Rascunho, Submetido, Em Análise, Aprovado e Reprovado. Para mudar o status de um projeto, arraste o card para outra coluna. A mudança é salva automaticamente. Use o ícone de olho para abrir os detalhes do projeto.',
  },
];

// Descobre a aba atual pela rota. Subcaminhos (ex.: /projetos/12) usam a aba da rota principal.
function abaDaRota(pathname: string) {
  if (pathname === '/') return AJUDA_ABAS[0];
  return (
    AJUDA_ABAS.find((aba) => aba.rota !== '/' && (pathname === aba.rota || pathname.startsWith(aba.rota + '/'))) ?? null
  );
}

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioAtual | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const abaAtual = abaDaRota(pathname);

  useEffect(() => {
    buscarUsuarioAtual().then(setUsuario);

    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const termo = searchQuery.trim();
    router.push(termo ? `/projetos?busca=${encodeURIComponent(termo)}` : '/projetos');
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: '#161b22',
        borderBottom: '1px solid #2d333b',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxSizing: 'border-box',
      }}
    >
      {/* ESQUERDA: PERFIL */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <div
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#21262d')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
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
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f6fc' }}>{usuario?.nome ?? 'Carregando...'}</div>
            <div style={{ fontSize: '12px', color: '#8b949e' }}>{usuario?.email ?? ''}</div>
          </div>
        </div>

        {profileMenuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', width: '240px', background: '#1c2128', border: '1px solid #2d333b', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100 }}>
            <button
              onClick={sair}
              style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', color: '#ee5268', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#22272e')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Sair da Conta
            </button>
          </div>
        )}
      </div>

      {/* CENTRO: BUSCA E CRIAR PROJETO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '600px', margin: '0 32px' }}>
        <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
          <span style={{ position: 'absolute', left: '12px', fontSize: '14px', color: '#8b949e' }}>🔍</span>
          <input
            type="text"
            placeholder="Pesquisar Projetos"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 12px 10px 36px', color: '#f0f6fc', fontSize: '13px', outline: 'none' }}
          />
        </form>
        <button
          onClick={() => router.push('/projetos?novo=true')}
          style={{ background: '#238636', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Criar Projeto
        </button>
      </div>

      {/* DIREITA: NOTIFICAÇÕES E AJUDA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '8px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
          >
            🔔
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#f85149', borderRadius: '50%' }} />
          </button>
          {notifOpen && (
            <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', width: '320px', background: '#1c2128', border: '1px solid #2d333b', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #2d333b', fontWeight: 600, fontSize: '14px', color: '#f0f6fc' }}>Notificações</div>
              <div style={{ padding: '16px', fontSize: '13px', color: '#8b949e' }}>Nenhuma notificação no momento.</div>
            </div>
          )}
        </div>

        <button
          onClick={() => setHelpOpen(true)}
          title={abaAtual ? `Ajuda: ${abaAtual.nome}` : 'Ajuda'}
          style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '8px', width: '38px', height: '38px', color: '#f0f6fc', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ?
        </button>
      </div>

      {/* JANELA DE AJUDA: descrição da aba em que o usuário está */}
      {helpOpen && (
        <div
          onClick={() => setHelpOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 16px 32px rgba(0,0,0,0.6)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f6fc' }}>
                {abaAtual ? `Ajuda: ${abaAtual.nome}` : 'Ajuda'}
              </h3>
              <button onClick={() => setHelpOpen(false)} style={{ background: 'transparent', border: 'none', color: '#8b949e', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '14px', color: '#c9d1d9', lineHeight: '1.6', marginBottom: '24px' }}>
              {abaAtual
                ? abaAtual.texto
                : 'Esta página não tem uma descrição específica. Use o menu lateral para navegar entre as abas do sistema.'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setHelpOpen(false)}
                style={{ background: '#238636', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}