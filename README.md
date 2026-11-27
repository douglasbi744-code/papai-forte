# Papai Forte — Projeto 90 dias

App pessoal (PWA) feito a partir de [projeto-90-dias.md](projeto-90-dias.md). Roda no navegador do celular, vai para a tela inicial como um app e funciona offline.

**Endereço:** https://papaiforte.testado10.com.br/app/

**Login e nuvem:** entrada com Google (Supabase Auth). Os dados ficam no aparelho (localStorage) e são copiados para a tabela `app_state` do Supabase, que tem RLS liberando leitura e gravação só para o e-mail do dono. O Google está em modo Teste, só com o e-mail do dono como usuário de teste, e o cadastro de novas contas está desligado no Supabase. A sincronização junta os dados dia a dia; quando o mesmo dia muda nos dois lados, vale o lado alterado por último. O backup manual em JSON continua na aba Guia.

## Estrutura

```
app/
  index.html            página única + barra de abas
  styles.css            branding e layout (claro/escuro automático)
  data.js               plano fixo: refeições, treinos A/B/C, agenda, hábitos
  app.js                telas, regras de cálculo, gráficos, cronômetro
  foods.js              tabela de alimentos para estimar calorias pelo texto
  sw.js                 service worker (offline). Mude VERSION a cada atualização
  manifest.webmanifest  nome, cores, ícones e atalhos do app
  icons/                icon.svg (fonte) + PNGs 180/192/512
```

`cut90.html` é a versão anterior em arquivo único e não é usada pelo app novo.

## Branding

**Conceito: "força ao amanhecer".** O treino é às 5:30, então a marca junta a **madrugada** (azul-noite) e o **nascer do sol** (laranja). O logo é um sol nascendo atrás de uma barra com anilhas, que faz o papel de horizonte, com o reflexo do sol embaixo.

| Elemento | Valor |
|---|---|
| Nome | **Papai Forte**, com "FORTE" no gradiente do amanhecer |
| Assinatura | PROJETO 90 DIAS |
| Gradiente Amanhecer | `#FFD27A → #F0A04B → #E3892A → #C9601F` (botões principais, aba ativa, dias feitos) |
| Gradiente Madrugada | `#22344A → #132030 → #0B1118` (cards de destaque, ícone) |
| Cores da especificação | fundo, superfície, texto, linhas, sucesso e alerta conforme a seção 10 do .md, nos modos claro e escuro |
| Tipografia | Barlow Condensed (títulos e números) + Barlow (texto) |
| Água | azul `#6FC3F0 → #2E8BD0` (só nos copos) |

**Movimento:**
- Os anéis de progresso enchem ao abrir a tela.
- Os dias do calendário (aba Dias) aparecem em cascata.
- A aba ativa desliza entre as abas.
- O brilho do sol no card principal "respira".
- Confete e vibração ao concluir um treino, bater a meta de proteína, completar a água ou os hábitos do dia, e ao salvar a pesagem.

Quem tiver "reduzir movimento" ligado no celular vê tudo sem animação.

## Como o app funciona no dia a dia

- **Hoje** mostra só o dia: treino, refeição da vez, pesagem, hábitos e água. O calendário dos 90 dias fica na aba **Dias**, com o número de cada dia e um resumo (feitos, incompletos, perdidos, pesagens).
- **Água:** a referência é uma garrafa de 500 ml, então a meta de 3 L são 6 garrafas. Toque na garrafa quando terminar de beber.
- **Treino guiado:** toque em ▶ Iniciar treino e o app mostra um exercício por vez, com o tempo de treino correndo.
  - "Concluir · próximo exercício" passa para o seguinte.
  - No fim, você anota a dor lombar e toca em 🏁 Finalizar treino.
  - "Ver lista completa" mostra todos os exercícios para corrigir algum registro.
- **Comida:** só aparece a refeição da vez, liberada 30 min antes do horário.
  - Ao registrar ("Comi o plano", "Registrar" ou "Não vou fazer"), o card sai da tela e o app fica esperando a próxima refeição, com contagem regressiva.
  - "Ver todas as refeições do dia" mostra a lista completa. Cada refeição só conta depois de tocar em ✓ Registrar; registrada, ela fica apagadinha (só leitura) com o botão ✏️ Editar.
  - Os horários das refeições podem ser mudados em Guia → Horários das refeições.
  - **Calorias pelo texto:** ao escrever o que comeu (ex.: "2 pães com ovo, 1 copo de suco"), o app estima kcal e proteína com a tabela de `app/foods.js` (cerca de 200 alimentos, com porções como fatia, colher, concha, copo e lata). Se você digitar os números à mão, eles valem. Se passar do plano da refeição ou da meta do dia, aparece um aviso com o que cortar.
- **Lembretes de água (notificações):** o workflow `.github/workflows/lembretes-agua.yml` envia um aviso às 7, 9, 11, 13, 15, 17, 19 e 21 h.
  - A notificação só pergunta. A garrafa só é marcada se você tocar em "✅ Bebi 500 ml" ou confirmar no app.
  - Para ativar: Guia → Lembretes de água → Ativar. Depois, cadastre o celular abrindo uma issue no GitHub; o próprio app monta o texto.
  - Para mudar os horários, edite o `cron` do workflow e `waterTimes` em `app/data.js`.
  - As chaves ficam nos segredos do repositório: `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY`.

## Extras além da especificação

- Cronômetro de descanso (90 s, com +15 s) que vibra quando acaba.
- Exportar e importar backup em JSON.
- Opção de tema claro, escuro ou automático.
- Atalhos no ícone do app (Android): Treino de hoje, Anotar comida, Pesagem.

## Testar no PC

```powershell
npx --yes http-server "C:\Users\dsantos\Desktop\Projetos\app papai forte\app" -c-1 -p 5190
```

Depois, abra http://localhost:5190.

## Colocar no celular

Para instalar e funcionar offline, o PWA precisa estar em um endereço **https**. Com o app hospedado:

- **Android (Chrome):** abra o link → menu ⋮ → **Adicionar à tela inicial / Instalar app**.
- **iPhone (Safari):** abra o link → botão Compartilhar → **Adicionar à Tela de Início**.

Para atualizar o app depois de mexer nos arquivos, aumente `VERSION` em `app/sw.js` e o `?v=` dos arquivos em `app/index.html` e publique de novo. O celular pega a versão nova ao abrir o app.

> Este plano não substitui acompanhamento profissional. Por causa do abaulamento em L4–L5, valide o treino com ortopedista ou fisioterapeuta.

## Vários usuários (convite) e plano personalizado

- **Quem entra:** só e-mails da tabela `allowed_emails` no Supabase. Cada pessoa só vê os próprios dados: as regras do banco (RLS) usam a função `is_allowed()`. O SQL está em `supabase/002-convidados-e-laudos.sql`, sem e-mails, porque o repositório é público.
- **Primeiro acesso:** quem entra sem dados responde um questionário de 8 etapas:
  - consentimento LGPD;
  - dados pessoais;
  - medidas;
  - objetivo;
  - treino;
  - alimentação;
  - saúde (condições, dor e laudo);
  - resumo do plano.
- **Plano:** `app/plan.js` monta tudo por regras:
  - calorias pela fórmula de Mifflin-St Jeor com fator de atividade;
  - proteína por kg;
  - água em 35 ml por kg;
  - refeições com porções e horários;
  - treinos A/B/C a partir de uma biblioteca de exercícios com as condições que proíbem cada exercício (`avoid`) ou pedem cuidado (`care`), mais exercícios de reforço por condição.
  - Problema cardíaco ou gestação: só atividade leve e aviso de liberação médica.
- **Plano original (Douglas):** perfil `mode: 'fixed'`, com o plano de `data.js`. Quem já tinha dados antes do questionário recebe esse modo automaticamente.
- **Laudos:** bucket privado `laudos` no Supabase Storage, numa pasta por usuário. O app guarda e mostra o laudo, mas não lê o conteúdo.
- **Apagar dados:** Guia → Conta → Apagar meus dados.
- **Testar no PC sem login:** http://localhost:5190/?demo=1. Só funciona em localhost.

### Para convidar alguém
1. Supabase → SQL Editor: `insert into public.allowed_emails (email) values ('<e-mail do convidado>');`
2. Google Cloud → projeto Papai Forte → Google Auth Platform → Público-alvo → Usuários de teste → adicionar o e-mail.
3. Supabase → Authentication → Sign In / Providers → ligar **Allow new users to sign up**. A lista de convidados e o modo Teste do Google continuam barrando quem não foi convidado.
