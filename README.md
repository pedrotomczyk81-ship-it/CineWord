# CineWord — Programação de Cinema

Projeto acadêmico Angular, organizado seguindo a estrutura do projeto de referência raxadinha.

## Etapa 1 — 03/11/2026

- Configuração inicial do Angular e das rotas.
- Componentes compartilhados de cabeçalho e rodapé.
- Página inicial responsiva com apresentação do projeto.
- Interface `Sessao` em `src/app/core/models/sessao.model.ts`.

Esta etapa ainda não inclui cadastro, listagem de sessões, serviços ou persistência.

## Executar

Utilize Node.js 24 LTS e npm.

```bash
npm ci
npm start
```

Abra http://localhost:4200. Para compilar: `npm run build`.

## Organização

- `src/app/core/models`: interfaces do domínio.
- `src/app/features/home`: página inicial.
- `src/app/shared/components`: cabeçalho e rodapé.

Datas no formato de sessão: `data` será `YYYY-MM-DD` e `horario` será `HH:mm`; classificação `0` representará livre.

## Próximas etapas previstas

- 06/11: cadastro e listagem de sessões.
- 10/11: edição, exclusão e disponibilidade.
- 17/11: validações e revisão final.

## Commit da primeira etapa

Na pasta local `C:\Fontes\CineWord`, depois de conferir os arquivos:

```bash
git init
git add .
git commit -m "feat: inicia CineWord com pagina inicial e modelo de sessao"
```

Se o repositório já existir, pule `git init`. Faça cada novo commit na data real em que a respectiva etapa for realizada. Este ZIP não contém histórico Git.
