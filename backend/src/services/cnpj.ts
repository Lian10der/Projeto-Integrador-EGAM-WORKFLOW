// Remove tudo que não é número.
export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

// Formata como 00.000.000/0000-00.
export function formatarCnpj(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 14);
  let r = d.slice(0, 2);
  if (d.length > 2) r += `.${d.slice(2, 5)}`;
  if (d.length > 5) r += `.${d.slice(5, 8)}`;
  if (d.length > 8) r += `/${d.slice(8, 12)}`;
  if (d.length > 12) r += `-${d.slice(12, 14)}`;
  return r;
}

// Confere os dígitos verificadores do CNPJ (cálculo oficial da Receita).
export function cnpjValido(d: string): boolean {
  if (!/^\d{14}$/.test(d) || /^(\d)\1{13}$/.test(d)) return false;

  const calcular = (base: string, pesos: number[]) => {
    const soma = base.split('').reduce((acc, n, i) => acc + Number(n) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const dv1 = calcular(d.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = calcular(d.slice(0, 12) + dv1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === Number(d[12]) && dv2 === Number(d[13]);
}

export interface DadosReceita {
  razao_social: string;
  situacao: string;
  email: string | null;
}

// Consulta a BrasilAPI (gratuita, sem chave).
// Lança erro com code NAO_ENCONTRADO ou INDISPONIVEL.
export async function consultarCnpj(d: string): Promise<DadosReceita> {
  let res: Response;
  try {
    res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw Object.assign(new Error('Serviço indisponível'), { code: 'INDISPONIVEL' });
  }

  if (res.status === 404 || res.status === 400) {
    throw Object.assign(new Error('Não encontrado'), { code: 'NAO_ENCONTRADO' });
  }
  if (!res.ok) {
    throw Object.assign(new Error('Serviço indisponível'), { code: 'INDISPONIVEL' });
  }

  const j = await res.json();
  return {
    razao_social: j.razao_social ?? '',
    situacao: j.descricao_situacao_cadastral ?? '',
    email: j.email ?? null,
  };
}