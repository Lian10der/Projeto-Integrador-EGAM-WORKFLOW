'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/sessao';
import { enviarDocumento, validarPdf } from '@/lib/documentos';
import type { Projeto } from '@/types/projeto';

interface ProjetoFormProps {
  onSuccess?: () => void;
  projeto?: Projeto;        // se informado, o formulário edita este projeto
  rota?: string;            // '/projetos' (administrador) ou '/ong/projetos' (ONG)
  cnpjFixo?: string;        // se informado, o CNPJ fica travado com este valor
}

interface Lei {
  id: number;
  nome: string;
}

const CATEGORIAS = ['Cultura', 'Educação', 'Esporte', 'Saúde'];
const TIPOS_ENTIDADE = ['Associação', 'Fundação', 'OSCIP', 'Outro'];

const FORM_INICIAL = {
  titulo: '',
  area_atuacao: 'Cultura',
  lei_incentivo_id: '',
  objetivo: '',
  impacto_social: '',
  estado: '',
  cidade: '',
  razao_social: '',
  tipo_entidade: 'Associação',
  cnpj: '',
  nome_responsavel: '',
  email_contato: '',
  telefone: '',
  site_url: '',
  sobre_instituicao: '',
  valor_total: '',
  teto_captacao: '',
  valor_solicitado: '',
  justificativa_pedido: '',
  pessoas_alcancadas_estimativa: '',
  pessoas_alcancadas_comprovadas: '',
  data_inicio_analise: '',
  data_fim_analise: '',
  data_inicio_execucao: '',
  data_fim_execucao: '',
  tags: '',
};

type NomeCampo = keyof typeof FORM_INICIAL;
type Valores = Record<NomeCampo, string>;

const estiloInput: React.CSSProperties = { width: '100%', marginTop: '6px' };
const estiloTravado: React.CSSProperties = { ...estiloInput, opacity: 0.7, cursor: 'not-allowed' };

function formatarCnpj(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 14);
  let r = d.slice(0, 2);
  if (d.length > 2) r += `.${d.slice(2, 5)}`;
  if (d.length > 5) r += `.${d.slice(5, 8)}`;
  if (d.length > 8) r += `/${d.slice(8, 12)}`;
  if (d.length > 12) r += `-${d.slice(12, 14)}`;
  return r;
}

function numero(valor: string): number | null {
  return valor.trim() ? Number(valor) : null;
}

function inteiro(valor: string): number | null {
  return valor.trim() ? parseInt(valor, 10) : null;
}

function texto(valor: string): string | null {
  return valor.trim() ? valor.trim() : null;
}

function tamanhoArquivo(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Cria uma cópia dos valores (nunca altera a constante FORM_INICIAL).
function valoresIniciais(projeto?: Projeto): Valores {
  if (!projeto) return { ...FORM_INICIAL };

  const origem = projeto as unknown as Record<string, unknown>;
  const valores = {} as Valores;

  (Object.keys(FORM_INICIAL) as NomeCampo[]).forEach((campo) => {
    const v = origem[campo];
    valores[campo] = v === null || v === undefined ? '' : String(v);
  });

  valores.cnpj = formatarCnpj(valores.cnpj);
  if (!valores.area_atuacao) valores.area_atuacao = 'Cultura';
  if (!valores.tipo_entidade) valores.tipo_entidade = 'Associação';
  return valores;
}

export default function ProjetoForm({ onSuccess, projeto, rota = '/projetos', cnpjFixo }: ProjetoFormProps) {
  const modoEdicao = !!projeto;

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<Valores>(() => {
    const v = valoresIniciais(projeto);
    if (cnpjFixo) v.cnpj = formatarCnpj(cnpjFixo);
    return v;
  });
  const [leis, setLeis] = useState<Lei[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('igam_token');

    fetch(`${API_URL}/projetos/leis-incentivo`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Não foi possível carregar as leis.');
        return res.json() as Promise<Lei[]>;
      })
      .then((data) => setLeis(data))
      .catch((err: Error) => setErro(err.message));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    const campo = name as NomeCampo;

    // CNPJ travado: ignora qualquer alteração
    if (campo === 'cnpj' && cnpjFixo) return;

    const valorFinal = campo === 'cnpj' ? formatarCnpj(value) : value;
    setForm((prev) => ({ ...prev, [campo]: valorFinal }));
  }

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setArquivo(null);
      return;
    }

    const msg = validarPdf(file);
    if (msg) {
      setErro(msg);
      setArquivo(null);
      e.target.value = '';
      return;
    }

    setErro(null);
    setArquivo(file);
  }

  function validarEtapa1(): string | null {
    const obrigatorios: [NomeCampo, string][] = [
      ['titulo', 'Nome do projeto'],
      ['lei_incentivo_id', 'Lei aplicável'],
      ['objetivo', 'Resumo executivo'],
      ['impacto_social', 'Finalidade e impacto'],
      ['estado', 'Estado'],
      ['cidade', 'Cidade'],
      ['razao_social', 'Instituição proponente'],
      ['cnpj', 'CNPJ'],
      ['nome_responsavel', 'Nome do contato'],
      ['email_contato', 'E-mail institucional'],
    ];

    for (const [campo, nome] of obrigatorios) {
      if (!form[campo].trim()) return `Preencha o campo: ${nome}.`;
    }
    if (form.cnpj.replace(/\D/g, '').length !== 14) {
      return 'CNPJ inválido. Digite os 14 números.';
    }
    return null;
  }

  function validarEtapa2(): string | null {
    const obrigatorios: [NomeCampo, string][] = [
      ['valor_total', 'Valor total do projeto'],
      ['valor_solicitado', 'Valor solicitado pelo IGAM'],
      ['justificativa_pedido', 'Justificativa do pedido'],
    ];

    for (const [campo, nome] of obrigatorios) {
      if (!form[campo].trim()) return `Preencha o campo: ${nome}.`;
    }

    const solicitado = Number(form.valor_solicitado);
    const teto = Number(form.teto_captacao);
    if (teto > 0 && solicitado > teto) {
      return 'O valor solicitado não pode ser maior que o teto de captação.';
    }

    if (form.data_inicio_analise && form.data_fim_analise && form.data_fim_analise < form.data_inicio_analise) {
      return 'A data final da análise não pode ser anterior à data inicial.';
    }
    if (form.data_inicio_execucao && form.data_fim_execucao && form.data_fim_execucao < form.data_inicio_execucao) {
      return 'A data final da execução não pode ser anterior à data inicial.';
    }
    return null;
  }

  function avancar() {
    const msg = validarEtapa1();
    if (msg) {
      setErro(msg);
      return;
    }
    setErro(null);
    setStep(2);
  }

  function voltar() {
    setErro(null);
    setStep(1);
  }

  function montarPayload() {
    return {
      titulo: form.titulo.trim(),
      area_atuacao: form.area_atuacao,
      lei_incentivo_id: numero(form.lei_incentivo_id),
      objetivo: texto(form.objetivo),
      impacto_social: texto(form.impacto_social),
      estado: texto(form.estado),
      cidade: texto(form.cidade),
      razao_social: texto(form.razao_social),
      tipo_entidade: form.tipo_entidade,
      cnpj: form.cnpj,
      nome_responsavel: texto(form.nome_responsavel),
      email_contato: texto(form.email_contato),
      telefone: texto(form.telefone),
      site_url: texto(form.site_url),
      sobre_instituicao: texto(form.sobre_instituicao),
      valor_total: numero(form.valor_total),
      teto_captacao: numero(form.teto_captacao),
      valor_solicitado: numero(form.valor_solicitado),
      justificativa_pedido: texto(form.justificativa_pedido),
      pessoas_alcancadas_estimativa: inteiro(form.pessoas_alcancadas_estimativa),
      pessoas_alcancadas_comprovadas: inteiro(form.pessoas_alcancadas_comprovadas),
      data_inicio_analise: form.data_inicio_analise || null,
      data_fim_analise: form.data_fim_analise || null,
      data_inicio_execucao: form.data_inicio_execucao || null,
      data_fim_execucao: form.data_fim_execucao || null,
      tags: texto(form.tags),
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const msg = validarEtapa2();
    if (msg) {
      setErro(msg);
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const token = localStorage.getItem('igam_token');
      const cabecalhos = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // ----- EDIÇÃO -----
      if (modoEdicao && projeto) {
        const response = await fetch(`${API_URL}${rota}/${projeto.id}`, {
          method: 'PATCH',
          headers: cabecalhos,
          body: JSON.stringify(montarPayload()),
        });

        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro ao atualizar o projeto.');

        alert('Projeto atualizado com sucesso!');
        onSuccess?.();
        return;
      }

      // ----- CRIAÇÃO -----
      const payload = {
        protocolo: `PROT-${Math.floor(10000 + Math.random() * 90000)}`,
        ...montarPayload(),
      };

      const response = await fetch(`${API_URL}${rota}`, {
        method: 'POST',
        headers: cabecalhos,
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar o projeto.');

      const projetoId: number | undefined = data.data?.id;
      if (arquivo && projetoId) {
        try {
          await enviarDocumento(projetoId, arquivo, rota);
        } catch (errArquivo: any) {
          alert(`Projeto cadastrado, mas o anexo não foi enviado: ${errArquivo.message}`);
          onSuccess?.();
          return;
        }
      }

      alert('Projeto cadastrado com sucesso!');
      onSuccess?.();
    } catch (err: any) {
      setErro(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {step === 1 && (
        <>
          <Secao titulo="Identificação do Projeto">
            <Bloco label="Nome do projeto" obrigatorio>
              <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Insira o nome do projeto" style={estiloInput} />
            </Bloco>

            <Bloco label="Categoria ou tipo" obrigatorio>
              <select name="area_atuacao" value={form.area_atuacao} onChange={handleChange} style={estiloInput}>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Bloco>

            <Bloco label="Resumo executivo" obrigatorio larga>
              <textarea name="objetivo" value={form.objetivo} onChange={handleChange} rows={3} maxLength={500} placeholder="Descreva de forma breve o que é o projeto..." style={estiloInput} />
            </Bloco>

            <Bloco label="Finalidade e impacto" obrigatorio larga>
              <textarea name="impacto_social" value={form.impacto_social} onChange={handleChange} rows={3} maxLength={500} placeholder="Descreva a finalidade e o impacto do projeto..." style={estiloInput} />
            </Bloco>

            <Bloco label="Estado" obrigatorio>
              <input name="estado" value={form.estado} onChange={handleChange} placeholder="Ex: SC" style={estiloInput} />
            </Bloco>

            <Bloco label="Cidade" obrigatorio>
              <input name="cidade" value={form.cidade} onChange={handleChange} placeholder="Ex: Criciúma" style={estiloInput} />
            </Bloco>

            <Bloco label="Lei aplicável" obrigatorio larga>
              <select name="lei_incentivo_id" value={form.lei_incentivo_id} onChange={handleChange} style={estiloInput}>
                <option value="">{leis.length === 0 ? 'Carregando leis...' : 'Selecione uma lei'}</option>
                {leis.map((lei) => (
                  <option key={lei.id} value={lei.id}>{lei.nome}</option>
                ))}
              </select>
            </Bloco>

            {!modoEdicao && (
              <Bloco label="PDF do projeto (opcional)" larga>
                <input type="file" accept="application/pdf" onChange={handleArquivo} style={{ marginTop: '6px' }} />
                {arquivo && (
                  <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)' }}>
                    {arquivo.name} ({tamanhoArquivo(arquivo.size)})
                  </small>
                )}
              </Bloco>
            )}
          </Secao>

          <Secao titulo="Proponente">
            <Bloco label="Instituição proponente" obrigatorio>
              <input name="razao_social" value={form.razao_social} onChange={handleChange} placeholder="Insira o nome da instituição" style={estiloInput} />
            </Bloco>

            <Bloco label="Tipo de entidade" obrigatorio>
              <select name="tipo_entidade" value={form.tipo_entidade} onChange={handleChange} style={estiloInput}>
                {TIPOS_ENTIDADE.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Bloco>

            <Bloco label="CNPJ" obrigatorio>
              <input
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                readOnly={!!cnpjFixo}
                placeholder="00.000.000/0000-00"
                style={cnpjFixo ? estiloTravado : estiloInput}
              />
            </Bloco>

            <Bloco label="Nome do contato" obrigatorio>
              <input name="nome_responsavel" value={form.nome_responsavel} onChange={handleChange} placeholder="Nome do responsável" style={estiloInput} />
            </Bloco>

            <Bloco label="E-mail institucional" obrigatorio>
              <input type="email" name="email_contato" value={form.email_contato} onChange={handleChange} placeholder="contato@instituicao.org" style={estiloInput} />
            </Bloco>

            <Bloco label="Telefone">
              <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" style={estiloInput} />
            </Bloco>

            <Bloco label="Site / perfil institucional" larga>
              <input type="url" name="site_url" value={form.site_url} onChange={handleChange} placeholder="https://" style={estiloInput} />
            </Bloco>

            <Bloco label="Sobre a instituição" larga>
              <textarea name="sobre_instituicao" value={form.sobre_instituicao} onChange={handleChange} rows={3} maxLength={500} placeholder="Descreva a instituição e seu impacto social..." style={estiloInput} />
            </Bloco>
          </Secao>
        </>
      )}

      {step === 2 && (
        <>
          <Secao titulo="Financeiro">
            <Bloco label="Valor total do projeto" obrigatorio>
              <input type="number" step="0.01" min="0" name="valor_total" value={form.valor_total} onChange={handleChange} placeholder="R$ 0,00" style={estiloInput} />
            </Bloco>

            <Bloco label="Teto autorizado para captação">
              <input type="number" step="0.01" min="0" name="teto_captacao" value={form.teto_captacao} onChange={handleChange} placeholder="R$ 0,00" style={estiloInput} />
            </Bloco>

            <Bloco label="Valor solicitado pelo IGAM" obrigatorio>
              <input type="number" step="0.01" min="0" name="valor_solicitado" value={form.valor_solicitado} onChange={handleChange} placeholder="R$ 0,00" style={estiloInput} />
            </Bloco>

            <Bloco label="Tags">
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="Ex: educação, jovens, esporte" style={estiloInput} />
            </Bloco>

            <Bloco label="Justificativa do pedido" obrigatorio larga>
              <textarea name="justificativa_pedido" value={form.justificativa_pedido} onChange={handleChange} rows={3} maxLength={500} placeholder="Descreva o motivo da solicitação de apoio..." style={estiloInput} />
            </Bloco>
          </Secao>

          <Secao titulo="Impacto">
            <Bloco label="Pessoas alcançadas (estimativa)">
              <input type="number" min="0" name="pessoas_alcancadas_estimativa" value={form.pessoas_alcancadas_estimativa} onChange={handleChange} placeholder="Ex: 2500" style={estiloInput} />
            </Bloco>

            <Bloco label="Pessoas alcançadas (comprovadas)">
              <input type="number" min="0" name="pessoas_alcancadas_comprovadas" value={form.pessoas_alcancadas_comprovadas} onChange={handleChange} placeholder="Ex: 2500" style={estiloInput} />
            </Bloco>
          </Secao>

          <Secao titulo="Cronograma">
            <Bloco label="Início da análise">
              <input type="date" name="data_inicio_analise" value={form.data_inicio_analise} onChange={handleChange} style={estiloInput} />
            </Bloco>

            <Bloco label="Fim da análise">
              <input type="date" name="data_fim_analise" value={form.data_fim_analise} onChange={handleChange} style={estiloInput} />
            </Bloco>

            <Bloco label="Início da execução">
              <input type="date" name="data_inicio_execucao" value={form.data_inicio_execucao} onChange={handleChange} style={estiloInput} />
            </Bloco>

            <Bloco label="Fim da execução">
              <input type="date" name="data_fim_execucao" value={form.data_fim_execucao} onChange={handleChange} style={estiloInput} />
            </Bloco>
          </Secao>
        </>
      )}

      {erro && <p className="form-error">{erro}</p>}

      {step === 1 ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="button button--cyan" onClick={avancar}>
            Continuar: Financeiro e Cronograma
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button type="button" className="button button--secondary" onClick={voltar}>
            Voltar
          </button>
          <button type="submit" className="button button--cyan" disabled={loading}>
            {loading ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Cadastrar Projeto'}
          </button>
        </div>
      )}
    </form>
  );
}

// ---------- Blocos auxiliares de layout ----------

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h3
        style={{
          fontSize: '16px',
          color: 'var(--primary)',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '8px',
          marginBottom: '16px',
        }}
      >
        {titulo}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {children}
      </div>
    </section>
  );
}

function Bloco({
  label,
  obrigatorio,
  larga,
  children,
}: {
  label: string;
  obrigatorio?: boolean;
  larga?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="form-group" style={{ gridColumn: larga ? '1 / -1' : 'auto' }}>
      <label className="form-label">
        {label}
        {obrigatorio ? ' *' : ''}
      </label>
      {children}
    </div>
  );
}