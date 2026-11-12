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

  return (
    <aside style={{ width: '280px', minWidth: '280px', backgroundColor: '#161b22', borderRadius: '12px', border: '1px solid #2d333b', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f0f6fc' }}>Filtros Avançados</h3>

      {/* Buscar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase' }}>Buscar</label>
        <input 
          type="search" 
          placeholder="Digite uma ONG ou Projeto" 
          value={filtros.busca} 
          onChange={(e) => atualizar({ busca: e.target.value })} 
          style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 12px', color: '#f0f6fc', fontSize: '13px' }}
        />
      </div>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase' }}>Status</label>
        <select 
          value={filtros.status} 
          onChange={(e) => atualizar({ status: e.target.value as FiltrosState['status'] })}
          style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 12px', color: '#f0f6fc', fontSize: '13px' }}
        >
          <option value="todos">Todos os status</option>
          {STATUS_PROJETO.map((status) => (
            <option key={status} value={status}>{STATUS_LABEL[status]}</option>
          ))}
        </select>
      </div>

      {/* Melhor Colocação */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase' }}>Melhor Colocação</label>
        <select 
          value={filtros.ordem} 
          onChange={(e) => atualizar({ ordem: e.target.value as FiltrosState['ordem'] })}
          style={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 12px', color: '#f0f6fc', fontSize: '13px' }}
        >
          <option value="ranking">Maior nota em viabilidade</option>
          <option value="valor">Menor valor solicitado</option>
        </select>
      </div>

      {/* Leis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase' }}>Leis</label>
        
        {leis.length === 0 ? (
          <span style={{ fontSize: '12px', color: '#8b949e', fontStyle: 'italic' }}>Nenhuma lei ativa encontrada.</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
            {leis.map((lei) => (
              <label key={lei.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#8b949e', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="lei" 
                  checked={filtros.leiId === String(lei.id)} 
                  onChange={() => atualizar({ leiId: String(lei.id) })} 
                  style={{ accentColor: '#00c4cc', marginTop: '2px' }} 
                /> 
                <span style={{ lineHeight: '1.4' }}>{lei.nome}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Categorias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', textTransform: 'uppercase' }}>Categoria</label>
        {categorias.length === 0 ? (
          <span style={{ fontSize: '12px', color: '#8b949e', fontStyle: 'italic' }}>Nenhuma categoria</span>
        ) : (
          categorias.map((area) => (
            <label key={area} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#8b949e', cursor: 'pointer' }}>
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

      {/* Limpar Filtros */}
      <button 
        type="button" 
        onClick={() => onChange(FILTROS_INICIAIS)}
        style={{ backgroundColor: 'transparent', border: '1px solid #30363d', color: '#f0f6fc', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}
      >
        Limpar Filtros
      </button>
    </aside>
  );
}