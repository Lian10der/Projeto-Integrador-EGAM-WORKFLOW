import { useState } from 'react';
import { STATUS_LABEL, STATUS_PROJETO, type StatusProjeto } from '@/types/projeto';

export interface FiltrosState {
  busca: string;
  status: StatusProjeto | 'todos';
  area: string;
  leiId: string;
  ordem: 'ranking' | 'valor';
}

export const FILTROS_INICIAIS: FiltrosState = {
  busca: '',
  status: 'todos',
  area: '',
  leiId: '',
  ordem: 'ranking',
};

interface ProjetoFiltrosProps {
  filtros: FiltrosState;
  onChange: (filtros: FiltrosState) => void;
  leis: { id: number; nome: string; esfera: string; status: string }[];
  categorias: string[];
}

export function ProjetoFiltros({ filtros, onChange, leis, categorias }: ProjetoFiltrosProps) {
  const atualizar = (parcial: Partial<FiltrosState>) => onChange({ ...filtros, ...parcial });

  const [buscaLei, setBuscaLei] = useState('');
  const [buscaCategoria, setBuscaCategoria] = useState('');

  const leisFiltradas = leis.filter(l => l.nome.toLowerCase().includes(buscaLei.toLowerCase()));
  const categoriasFiltradas = categorias.filter(c => c.toLowerCase().includes(buscaCategoria.toLowerCase()));

  const inputStyle = {
    backgroundColor: '#212529', 
    border: '1px solid #343a40', 
    borderRadius: '8px', 
    padding: '10px 12px', 
    color: '#e6edf3', 
    fontSize: '13px',
    outline: 'none',
  };

  const labelStyle = { 
    fontSize: '12px', 
    fontWeight: 600, 
    color: '#adb5bd', 
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em'
  };

  return (
    <aside style={{ width: '280px', minWidth: '280px', backgroundColor: '#1a1d21', borderRadius: '12px', border: '1px solid #343a40', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>Filtros</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={labelStyle}>Buscar</label>
        <input 
          type="search" 
          placeholder="Digite uma ONG ou Projeto" 
          value={filtros.busca} 
          onChange={(e) => atualizar({ busca: e.target.value })} 
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={labelStyle}>Status</label>
        <select 
          value={filtros.status} 
          onChange={(e) => atualizar({ status: e.target.value as FiltrosState['status'] })}
          style={inputStyle}
        >
          <option value="todos">Todos os status</option>
          {STATUS_PROJETO.map((status) => (
            <option key={status} value={status}>{STATUS_LABEL[status]}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={labelStyle}>Melhor Colocação</label>
        <select 
          value={filtros.ordem} 
          onChange={(e) => atualizar({ ordem: e.target.value as FiltrosState['ordem'] })}
          style={inputStyle}
        >
          <option value="ranking">Maior nota em viabilidade</option>
          <option value="valor">Menor valor solicitado</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={labelStyle}>Leis</label>
        <input 
          type="text" 
          placeholder="Pesquisar lei..." 
          value={buscaLei}
          onChange={(e) => setBuscaLei(e.target.value)}
          style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
          {leisFiltradas.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#adb5bd', fontStyle: 'italic' }}>Nenhuma lei encontrada</span>
          ) : (
            leisFiltradas.map((lei) => (
              <label key={lei.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#adb5bd', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="lei" 
                  checked={filtros.leiId === String(lei.id)} 
                  onChange={() => atualizar({ leiId: String(lei.id) })} 
                  style={{ accentColor: '#00c4cc', marginTop: '2px' }} 
                /> 
                <span style={{ lineHeight: '1.4' }}>{lei.nome}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={labelStyle}>Categoria</label>
        <input 
          type="text" 
          placeholder="Pesquisar categoria..." 
          value={buscaCategoria}
          onChange={(e) => setBuscaCategoria(e.target.value)}
          style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
          {categoriasFiltradas.length === 0 ? (
            <span style={{ fontSize: '12px', color: '#adb5bd', fontStyle: 'italic' }}>Nenhuma categoria</span>
          ) : (
            categoriasFiltradas.map((area) => (
              <label key={area} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#adb5bd', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="area_atuacao" 
                  checked={filtros.area === area} 
                  onChange={() => atualizar({ area: area })} 
                  style={{ accentColor: '#00c4cc' }} 
                /> {area}
              </label>
            ))
          )}
        </div>
      </div>

      <button 
        type="button" 
        onClick={() => onChange(FILTROS_INICIAIS)}
        style={{ backgroundColor: 'transparent', border: '1px solid #343a40', color: '#e6edf3', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#212529'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Limpar Filtros
      </button>
    </aside>
  );
}