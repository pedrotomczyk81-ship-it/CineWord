import { Sessao } from './sessao.model';

export const GENEROS = [
  'Ação',
  'Animação',
  'Aventura',
  'Comédia',
  'Documentário',
  'Drama',
  'Ficção científica',
  'Romance',
  'Suspense',
  'Terror',
];
export const CLASSIFICACOES = [0, 10, 12, 14, 16, 18];

export function dataValida(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export function validarSessao(value: Omit<Sessao, 'id'>): Omit<Sessao, 'id'> {
  const sessao = { ...value, filme: value.filme?.trim(), genero: value.genero?.trim() };
  if (!sessao.filme || sessao.filme.length < 2 || sessao.filme.length > 120)
    throw new Error('Informe um título entre 2 e 120 caracteres.');
  if (!GENEROS.includes(sessao.genero)) throw new Error('Selecione um gênero válido.');
  if (!CLASSIFICACOES.includes(sessao.classificacaoIndicativa))
    throw new Error('Selecione uma classificação válida.');
  if (!Number.isInteger(sessao.sala) || sessao.sala < 1 || sessao.sala > 99)
    throw new Error('A sala deve ser um número inteiro entre 1 e 99.');
  if (!dataValida(sessao.data)) throw new Error('Informe uma data válida.');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(sessao.horario))
    throw new Error('Informe um horário válido.');
  if (typeof sessao.disponivel !== 'boolean')
    throw new Error('Informe a disponibilidade da sessão.');
  return {
    filme: sessao.filme,
    genero: sessao.genero,
    classificacaoIndicativa: sessao.classificacaoIndicativa,
    sala: sessao.sala,
    data: sessao.data,
    horario: sessao.horario,
    disponivel: sessao.disponivel,
  };
}
