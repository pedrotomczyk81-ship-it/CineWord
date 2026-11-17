# CineWord — Roteiro de apresentação

**Data da revisão:** 17/11/2026.

## Preparar

1. Abra a pasta do projeto no VS Code.
2. No terminal, execute `npm.cmd ci` se as dependências ainda não estiverem instaladas.
3. Execute `npm.cmd start` e abra `http://localhost:4200`.
4. Confira o aviso de modo local. Use o mesmo endereço e navegador durante a apresentação para manter os mesmos cadastros.

## Demonstrar os fluxos

1. **Início:** mostre os destaques e abra a programação completa.
2. **Programação:** filtre por animação, data e disponibilidade. Busque um filme inexistente para mostrar o estado vazio; limpe os filtros.
3. **Detalhes:** abra uma sessão e mostre classificação, sala, data, horário e status.
4. **Administração:** mostre o resumo e clique em **Nova sessão**.
5. **Cadastro:** preencha filme, gênero, classificação, sala, data e horário. Use uma sala/horário livre. Salve e confira a confirmação na lista.
6. **Persistência:** recarregue a página e confirme que o cadastro continua visível.
7. **Edição:** altere o título ou o horário e salve. Mostre a mudança na programação.
8. **Disponibilidade:** use **Indisponibilizar** na lista e confira o novo status no catálogo. Use **Disponibilizar** para reabrir.
9. **Validação:** tente cadastrar uma sessão sem título ou repetir a mesma sala, data e horário de outra sessão.
10. **Exclusão:** primeiro cancele a confirmação; depois confirme e mostre que a sessão foi removida.
11. **Sobre:** explique o armazenamento local e os limites do escopo.

## Explicar a implementação

- As páginas são componentes Angular carregados pelas rotas.
- O `SessaoService` centraliza consulta, cadastro, edição, exclusão e persistência.
- O mesmo modelo `Sessao` é usado na listagem e no formulário.
- Validações do formulário são complementadas por validações no service.
- A lista pública e o painel administrativo consultam a mesma fonte de dados.
- A configuração seleciona explicitamente armazenamento local ou Firebase.

## Estado do backend

A apresentação usa armazenamento local funcional. O contrato REST do Firebase foi preparado e testado com respostas simuladas. A conexão real depende da URL do projeto existente e da configuração de autenticação/regras desse banco. Não apresente esta versão como um backend Firebase já conectado.

## Verificação

```powershell
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd test
```

Para entregar os fontes, inclua `src`, `public`, `tests`, `scripts`, os arquivos de configuração, `package.json`, `package-lock.json`, `README.md` e este roteiro. Não inclua `node_modules`, `.angular` ou credenciais. A pasta `dist/cineword/browser` contém a compilação para hospedagem com suporte a rotas de SPA.
