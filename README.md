# CineWord — Programação de Cinema

Projeto acadêmico em Angular 21 para consultar e administrar sessões de cinema. Revisão de entrega: **17/11/2026**.

## Executar

Requisitos: Node.js 24 LTS e npm.

```powershell
npm.cmd ci
npm.cmd start
```

Abra **http://localhost:4200**. O servidor atualiza a aplicação quando os arquivos são salvos. Use `Ctrl+C` no terminal para encerrá-lo. `npm.cmd` funciona também no PowerShell que bloqueia a execução de `npm.ps1`.

## Páginas e recursos

| Página        | Endereço            | Recursos                                                                                   |
| ------------- | ------------------- | ------------------------------------------------------------------------------------------ |
| Início        | `/`                 | Apresentação e seis destaques da programação                                               |
| Programação   | `/programacao`      | Todas as sessões, busca por filme, filtros por gênero, data e disponibilidade              |
| Detalhes      | `/sessoes/:id`      | Filme, classificação, sala, data, horário e status                                         |
| Administração | `/admin`            | Resumo, busca por filme/gênero/sala, filtro por status, edição, disponibilidade e exclusão |
| Cadastro      | `/admin/novo`       | Formulário validado para cadastrar uma sessão                                              |
| Edição        | `/admin/editar/:id` | Carregamento e atualização de uma sessão existente                                         |
| Sobre         | `/sobre`            | Recursos e explicação do armazenamento utilizado                                           |

A exclusão exige confirmação. O formulário valida título, gênero, classificação, sala inteira entre 1 e 99, data e horário. O service também valida os dados e rejeita outra sessão com a mesma combinação de sala, data e horário. A validação permite datas históricas para consulta e manutenção; a programação não oculta registros antigos automaticamente.

## Dados da apresentação

O modo padrão é **local**, identificado no topo da aplicação. No primeiro acesso, o service cria **12 sessões fictícias**, com gêneros e classificações variados, quatro salas e duas sessões indisponíveis. As datas são definidas no primeiro acesso e não são alteradas em recarregamentos posteriores.

Os registros ficam no `localStorage`, na chave `cineword.sessoes.v1`, e persistem depois de atualizar a página ou fechar o navegador. Uma lista vazia é preservada: excluir todas as sessões não recria os exemplos. Dados corrompidos produzem uma mensagem de erro e são preservados.

Cada navegador, perfil e origem tem seu próprio armazenamento. Por exemplo, `localhost:4200` e `127.0.0.1:4200` possuem registros separados. Limpar os dados do site remove os cadastros. Esta versão não sincroniza dados entre dispositivos.

## Firebase Realtime Database

A implementação REST de consulta, cadastro, atualização e exclusão permanece disponível em `SessaoService`. Para selecioná-la, edite `src/app/core/config/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  mode: 'firebase' as 'local' | 'firebase',
  databaseURL: 'https://ID-DO-SEU-BANCO.firebaseio.com',
};
```

Copie a **URL exata** de **Firebase Console → Realtime Database → Dados**. Ela pode terminar em `firebaseio.com` ou `firebasedatabase.app`, conforme a região. Use somente a URL raiz HTTPS, sem `/sessoes`, `.json`, parâmetros ou credenciais. Os dados são armazenados em `/sessoes`.

**Situação desta entrega:** a URL do projeto existente ainda não foi fornecida. O Firebase real não está conectado nem foi validado na conta; a demonstração funciona com armazenamento local. Os testes do contrato HTTP usam respostas simuladas, sem escrever em serviços externos.

O cliente ainda não envia tokens de Firebase Authentication. Se as regras do projeto exigirem autenticação, será necessário integrar o login e a autorização de administradores antes de usar as operações protegidas. Não libere escrita pública para contornar essa etapa e não coloque segredos, chaves privadas ou arquivos de conta de serviço no Angular. Firestore é outro produto e exige adaptar o service.

Selecionar Firebase não importa os exemplos ou os cadastros locais. Falhas remotas são exibidas ao usuário e não alternam silenciosamente para o armazenamento local. A verificação de horário duplicado no modo remoto é feita antes da escrita, no cliente; uma implantação com vários administradores precisa de controle transacional no backend para impedir conflitos simultâneos.

Referência: [API REST do Realtime Database](https://firebase.google.com/docs/database/rest/start).

## Compilar e testar

```powershell
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd test
```

O build fica em `dist/cineword/browser`. Publique essa pasta em um servidor com redirecionamento das rotas da SPA para `index.html`. Não abra o arquivo HTML diretamente pelo sistema de arquivos.

- `npm.cmd run test:service`: validação de domínio e contrato HTTP do Firebase, com requisições simuladas.
- `npm.cmd run test:e2e`: navegação, filtros, CRUD, recarregamento, erros, duplicidade, acessibilidade e tamanhos de tela de 320, 768, 1024 e 1440 pixels.
- `npm.cmd run format`: formata o código e a documentação.

Os testes de navegador usam contextos isolados, sem alterar os cadastros do navegador pessoal. Usam a porta 4200 e reutilizam o servidor de desenvolvimento quando ele já está ativo.

## Organização

```text
src/app/core/config       Seleção do armazenamento e URL do Firebase
src/app/core/data         Sessões fictícias do primeiro acesso
src/app/core/models       Interface Sessao e validações compartilhadas
src/app/core/service      SessaoService e mensagens de falha
src/app/features         Início/programação, detalhes, administração, formulário e sobre
src/app/shared           Cabeçalho, rodapé e cartaz de sessão
tests/unit               Testes do service e do contrato REST
tests/e2e                Testes de navegador e acessibilidade
```

Datas são armazenadas como `YYYY-MM-DD` e horários como `HH:mm`. Classificação `0` significa livre. O projeto gerencia a programação; venda de ingressos, reserva de assentos, pagamento e autenticação de administradores não fazem parte dos fluxos entregues.
