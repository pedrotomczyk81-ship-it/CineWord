import { Sessao } from '../models/sessao.model';

// Programação fictícia para a apresentação, criada só no primeiro acesso local.
export function criarSessoesExemplo(): Sessao[] {
  const filmes = [
    ['Além das Estrelas', 'Ficção científica', 12],
    ['O Jardim Encantado', 'Animação', 0],
    ['Último Trem para Casa', 'Drama', 12],
    ['Operação Horizonte', 'Ação', 14],
    ['Um Verão em Paraty', 'Romance', 10],
    ['A Casa do Farol', 'Suspense', 16],
    ['Os Exploradores', 'Aventura', 10],
    ['Confusão em Família', 'Comédia', 12],
    ['Vozes da Floresta', 'Documentário', 0],
    ['O Segredo da Meia-Noite', 'Terror', 18],
    ['Pequenos Gigantes', 'Animação', 0],
    ['Depois da Chuva', 'Drama', 14],
  ] as const;
  return filmes.map(([filme, genero, classificacaoIndicativa], index) => {
    const data = new Date();
    data.setDate(data.getDate() + Math.floor(index / 4));
    const dia = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
    return {
      id: `exemplo-${index + 1}`,
      filme,
      genero,
      classificacaoIndicativa,
      sala: (index % 4) + 1,
      data: dia,
      horario: ['14:00', '16:30', '19:00', '21:30'][index % 4]!,
      disponivel: index !== 5 && index !== 9,
    };
  });
}
