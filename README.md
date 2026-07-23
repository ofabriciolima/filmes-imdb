# 🎬 Roleta de Filmes — IMDb Top 250

Aplicação web para um casal decidir, em segundos, qual filme assistir — sorteando aleatoriamente entre os 250 melhores filmes do ranking do IMDb. Cada pessoa tem login próprio (Supabase Auth) e histórico individual de "já assistidos"; duas contas podem entrar na mesma **sessão compartilhada** (via código de convite) para sortear e acompanhar o progresso juntas, em tempo real, em qualquer dispositivo.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (tema configurado via CSS em `app/globals.css`, sem `tailwind.config`)
- [shadcn/ui](https://ui.shadcn.com) (button, card, input, label, switch, dialog, alert-dialog, badge, skeleton, sonner)
- [Framer Motion](https://motion.dev) para as animações (roleta, revelação, confete)
- [Supabase](https://supabase.com) — Auth (contas/sessão), Postgres + Row Level Security + funções `SECURITY DEFINER` (dados e regras de negócio), Realtime (sincronização entre dispositivos)
- [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side) para autenticação com cookies no App Router (client de browser, client de servidor e `proxy.ts`)
- [TMDB API](https://www.themoviedb.org/documentation/api) para a seção "Onde assistir" (disponibilidade em streaming no Brasil)

## Estrutura do projeto

```
/app
  layout.tsx, page.tsx, globals.css   # tema global, ponto de entrada (protegido por proxy.ts)
  /login, /signup                      # páginas públicas de autenticação
  /api/config                           # expõe a config pública do Supabase em runtime
  /api/watch-providers/[imdbId]          # busca "onde assistir" (BR) na TMDB, chave só no servidor
/components
  /roulette               # RouletteApp (orquestrador), peças da roleta, WhereToWatch
  /layout                 # Header, WatchedToggle
  /auth                    # LoginForm, SignupForm
  /session                 # SessionBar, JoinSessionDialog
  /ui                      # componentes gerados pelo shadcn/ui
/hooks                    # useMovieDraw, useWatchedMovies (contexto pessoal/sessão + realtime), useAuth, useSession
/lib
  /supabase/client.ts      # client de browser (cookies, lazy, lança erro amigável sem env vars)
  /supabase/server.ts      # client de servidor (Server Components/Route Handlers)
  utils.ts                  # helper cn() do shadcn
/services
  moviesService.ts          # leitura do dataset local (/data/top250.json)
  watchedService.ts          # RPCs de filmes assistidos (get_watched_ranks, mark_watched, reset_watched_history)
  authService.ts             # signUp/signIn/signOut
  sessionService.ts          # criar/entrar/sair/encerrar sessão, buscar sessão atual + membros
/types                     # Movie, WatchedRow, Profile, Session, SessionMember, WatchProvider
/utils                     # random.ts, format.ts
/data/top250.json           # dataset estático com os 250 filmes
/supabase/migration_auth_sessions.sql   # schema completo (rode no SQL Editor do Supabase)
proxy.ts                    # equivalente ao "middleware" no Next 16 — protege rotas e faz os redirects de auth
```

## Dados dos 250 filmes

O IMDb não oferece uma API pública oficial para o Top 250, então os dados (título, ano, duração, gêneros, nota, pôster, sinopse, direção, elenco) foram consolidados em `data/top250.json` a partir de um scrape público (dados estruturados `schema.org` das próprias páginas do IMDb), atualizado em **2026-07-20**. A posição (`rank`) é calculada localmente ordenando por nota do IMDb (e número de votos como critério de desempate), uma aproximação bem próxima da ordem oficial do ranking. Os pôsteres continuam hospedados no CDN do próprio IMDb (`m.media-amazon.com`).

Como o ranking do IMDb muda com o tempo, o arquivo vai ficar gradualmente desatualizado. Para atualizá-lo, basta pedir para eu regenerar o dataset (ou substituir `data/top250.json` manualmente por um novo dataset no mesmo formato — veja `types/movie.ts`) — nenhuma outra parte do código precisa mudar.

## Configurando o Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com) (se ainda não tiver um).
2. Abra o **SQL Editor** do projeto e rode o arquivo **[`supabase/migration_auth_sessions.sql`](supabase/migration_auth_sessions.sql)** inteiro, de uma vez só. Ele cria:
   - `profiles` (perfil público de cada usuário, criado automaticamente no cadastro via trigger).
   - `sessions` e `session_members` (sessões compartilhadas e seus participantes).
   - `watched_movies` (substitui a antiga `filmes_imdb` para uso do app — veja "Migração" abaixo).
   - As policies de **Row Level Security** de cada tabela.
   - As funções (`create_session`, `join_session_by_code`, `leave_session`, `end_session`, `regenerate_invite_code`, `mark_watched`, `get_watched_ranks`, `reset_watched_history`) que concentram toda a lógica sensível — o client nunca envia `user_id`/`session_id` diretamente, tudo é resolvido no servidor a partir de quem está autenticado.
   - O registro das tabelas no Realtime (para a sincronização ao vivo entre dispositivos).
3. Em **Authentication > Providers > Email**, decida se quer manter a **confirmação de e-mail** ativada (padrão) ou desativada. O app funciona nos dois casos (mostra "confirme seu e-mail" quando necessário).
4. Em **Project Settings > API**, copie a **Project URL** e a **anon public key**.
5. Copie `.env.local.example` para `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public
   ```

> Sem `.env.local` configurado, o `proxy.ts` não consegue validar sessão nenhuma e manda tudo para `/login` — ou seja, autenticação é pré-requisito para usar o app agora (diferente da versão anterior, que funcionava sem Supabase).

### Migração dos dados antigos

A tabela antiga `filmes_imdb` (usada antes de existir login) **não é apagada nem alterada** pela migration — ela fica no banco só como histórico, sem nenhuma FK ou uso pelo código novo. Como não havia usuários antes, não dá para saber automaticamente "de quem" era cada registro, então a migração não é automática. Se quiser recuperar esse histórico depois de criar sua conta e sua sessão compartilhada, rode manualmente (trocando os UUIDs):

```sql
insert into public.watched_movies (user_id, session_id, ranking_imdb, nome_filme, assistido)
select '<seu-user-id>', '<id-da-sua-sessao>', ranking_imdb, nome_filme, true
from public.filmes_imdb
where assistido = true
on conflict do nothing;
```

## Autenticação e sessões compartilhadas

- **Cadastro/login**: `/signup` e `/login`, usando `supabase.auth.signUp` / `signInWithPassword` (nunca senha em texto plano gerenciada por nós). O `proxy.ts` (equivalente ao antigo `middleware.ts` no Next 16) redireciona automaticamente: sem login → `/login`; já logado tentando abrir `/login` ou `/signup` → `/`.
- **Histórico individual por padrão**: todo usuário novo começa com histórico próprio e isolado (tabela `watched_movies` com `session_id = null`), garantido por Row Level Security — ninguém lê ou escreve os dados de outra pessoa por fora de uma sessão compartilhada.
- **Criar sessão / Entrar com código**: no cabeçalho, um usuário sem sessão vê os botões **"Criar sessão"** e **"Entrar com código"**. Criar gera um código de 6 caracteres (reutilizável enquanto válido, expira em 7 dias, regenerável a qualquer momento pelos participantes). Entrar com um código válido junta as duas pessoas na mesma sessão — o histórico de assistidos passa a ser o da sessão para ambas, em qualquer dispositivo, e atualiza **em tempo real** (Supabase Realtime) quando um dos dois marca um filme.
- **Sair da sessão**: qualquer participante pode sair a qualquer momento — o histórico individual (anterior à sessão) volta a valer, intacto.
- **Encerrar sessão**: só quem criou a sessão pode encerrá-la (remove todos os participantes e marca a sessão como `ended`).
- Um usuário só participa de **uma sessão por vez** (garantido por índice único no banco), e uma sessão comporta 2 participantes por padrão — o schema já suporta aumentar esse limite no futuro (`sessions.max_members`) sem migração.

## "Onde assistir" (TMDB)

No modal de detalhes de cada filme, a seção **"Onde assistir no Brasil"** mostra os serviços de streaming disponíveis (assinatura, aluguel, compra, grátis/com anúncios), com logo e link — dados agregados pela [TMDB](https://www.themoviedb.org/) (que por sua vez usa JustWatch) filtrados para a região **BR**.

1. Crie uma conta gratuita em [themoviedb.org](https://www.themoviedb.org/signup) (sem cartão).
2. Em **Configurações > API**, solicite uma API Key tipo "Developer" (aprovação costuma ser instantânea).
3. Copie a **"API Key (v3 auth)"** e adicione em `.env.local`:
   ```
   TMDB_API_KEY=sua-api-key-v3-da-tmdb
   ```

A chave fica só no servidor (rota `app/api/watch-providers/[imdbId]/route.ts`, que resolve o filme na TMDB a partir do `imdbId` e devolve só os dados da região BR já formatados) — o client nunca vê nem chama a TMDB diretamente. As respostas ficam em cache por 24h (Next.js Data Cache) para não estourar limite de requisições.

Se um filme não tiver dado de disponibilidade para o Brasil (ou a `TMDB_API_KEY` não estiver configurada), a seção mostra uma mensagem explicando isso em vez de tentar adivinhar ou mostrar informação de outro país.

> A TMDB exige atribuição visível quando seus dados são usados publicamente — por isso o rodapé da seção linka para "TMDB" como fonte dos dados.

## Instalação e execução

Pré-requisito: [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Outros scripts:

```bash
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # ESLint
```

## Como funciona

- **Login obrigatório**: a tela inicial é sempre `/login` (ou `/signup`) até você entrar. Depois disso, o app principal fica disponível em `/`.
- **Sortear Filme**: gira uma animação de roleta por 3–5s e revela o filme correspondente à posição sorteada.
- **🎲 Sortear novamente**: repete o sorteio dentro do conjunto elegível atual.
- **👁 Marcar como já visto**: marca o filme como assistido no contexto atual (pessoal ou da sessão) e volta pra tela inicial.
- **🍿 Vamos assistir**: ação principal — dispara confete + mensagem comemorativa, marca como assistido e, ao final da animação, volta pra tela inicial.
- **📄 Ver detalhes**: abre um modal com sinopse, direção, elenco, prêmios e onde assistir no Brasil.
- **Toggle "Incluir filmes já vistos"**: quando desligado, remove do sorteio todos os filmes já marcados como assistidos **no contexto atual**. Se todos os 250 já tiverem sido assistidos, a tela mostra uma mensagem de parabéns com a opção de reiniciar o histórico.
- **Sessão compartilhada**: ver seção anterior. Enquanto participa de uma sessão, todo o histórico e o sorteio passam a ser da sessão, não do usuário individualmente.

## Testando cada fluxo

Com o servidor local rodando (`npm run dev`) e a migration já aplicada no Supabase:

1. **Criar conta**: acesse `/signup`, preencha nome/e-mail/senha. Se a confirmação de e-mail estiver ativada, você verá "Confirme seu e-mail" — clique no link recebido e depois faça login normalmente.
2. **Login**: `/login` com as credenciais criadas — deve cair na tela principal (`/`).
3. **Logout**: botão "Sair" no cabeçalho — deve voltar para `/login`.
4. **Redirecionamentos**: tente abrir `/` deslogado (vai para `/login`); logado, tente abrir `/login` (volta para `/`).
5. **Histórico individual**: crie uma segunda conta (outro e-mail) em outra aba/navegador, marque um filme como assistido na primeira conta e confirme que a segunda conta **não** vê esse filme como assistido (contador de elegíveis continua 250 para ela).
6. **Criar sessão**: clique em "Criar sessão" — um código de 6 caracteres aparece no cabeçalho, com botão de copiar.
7. **Entrar com código**: na segunda conta, clique em "Entrar com código" e informe o código gerado — deve mostrar "Sessão: Nome A & Nome B". Um código errado deve mostrar "Código inválido ou sessão não encontrada."
8. **Histórico compartilhado**: marque um filme como assistido em uma das contas; na outra conta (mesma sessão), desligue o toggle "Incluir filmes já vistos" e confirme que o contador de elegíveis caiu e o filme não é mais sorteado.
9. **Tempo real em dois dispositivos**: com as duas contas logadas em abas/navegadores diferentes e na mesma sessão, marque um filme como assistido em uma aba — a outra aba deve atualizar sozinha (via Supabase Realtime), sem precisar recarregar.
10. **Sair da sessão**: clique em "Sair" na barra da sessão — o histórico volta a ser o individual de antes de entrar na sessão.
11. **Isolamento**: confirme que uma conta que nunca recebeu o código não consegue ver nomes, código ou histórico da sessão (ela nunca aparece na lista dela).
12. **Onde assistir**: sorteie um filme, abra "Ver detalhes" e confirme que a seção "Onde assistir no Brasil" carrega os serviços (ou mostra a mensagem de indisponibilidade, se for o caso).

## Deploy (VPS + Easypanel)

O projeto inclui um `Dockerfile` (multi-stage, usando `output: "standalone"` do Next.js) pronto para builds via Easypanel/Docker.

A config pública do Supabase é lida em **runtime** (via `/api/config`, ver `lib/supabase/client.ts`) em vez de embutida no build — isso evita depender de o painel de hospedagem repassar variáveis de ambiente como build args do Docker (nem todos repassam). A mesma imagem Docker funciona em qualquer ambiente; só as env vars do container em runtime mudam.

1. Suba este repositório para o GitHub (ou GitLab).
2. No Easypanel, crie um novo **App** apontando para o repositório, método de build **Dockerfile** (arquivo `Dockerfile`, caminho de build `/`).
3. Em **Environment Variables** do serviço, adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public
   TMDB_API_KEY=sua-api-key-v3-da-tmdb
   ```
4. Na aba **Domínios**, configure o domínio e aponte a porta interna do proxy para **3000** (a porta que o container expõe).
5. No Supabase, em **Authentication > URL Configuration**, adicione a URL de produção (ex.: `https://seudominio.com`) em **Redirect URLs** — sem isso, o link de confirmação de e-mail enviado para usuários em produção não funciona (ele usa a URL configurada aqui, não a do request).
6. Deploy. A cada novo push na branch configurada, o Easypanel reconstrói e publica a nova versão.

Para build/teste local do Docker (requer Docker instalado):

```bash
docker build -t roleta-filmes .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-public \
  -e TMDB_API_KEY=sua-api-key-v3-da-tmdb \
  roleta-filmes
```

## Nota sobre o ambiente de desenvolvimento

Este projeto foi criado dentro de uma pasta sincronizada pelo iCloud Drive. Isso funciona, mas o iCloud tenta sincronizar continuamente a pasta `node_modules` (milhares de arquivos pequenos), o que pode deixar o Finder/iCloud lento. Se notar lentidão, considere:

- Mover o projeto para fora do iCloud Drive (ex.: `~/Developer/roleta-filmes`), ou
- Adicionar `node_modules` à lista de itens não sincronizados do iCloud.

Além disso, o Node.js não estava instalado neste Mac (e o Homebrew local está com um bug de detecção da versão do macOS). O ambiente foi preparado baixando o Node.js LTS oficial (v24) diretamente de nodejs.org e criando links simbólicos em `/opt/homebrew/bin` para disponibilizar `node`/`npm`/`npx` no terminal — nenhuma alteração de sistema além disso foi feita. Para uma instalação definitiva e gerenciável (ex.: para trocar de versão do Node no futuro), recomenda-se instalar via [nvm](https://github.com/nvm-sh/nvm) ou corrigir o Homebrew.
