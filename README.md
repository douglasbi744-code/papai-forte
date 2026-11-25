# Papai Forte — Projeto 90 dias

App pessoal (PWA) feito a partir de [projeto-90-dias.md](projeto-90-dias.md). Roda no navegador do celular, vai para a tela inicial como um app e funciona offline. Os dados ficam **só no celular** (localStorage), com backup manual em JSON na aba Guia.

## Estrutura

```
app/
  index.html            página única + barra de abas
  styles.css            branding e layout (claro/escuro automático)
  data.js               plano fixo: refeições, treinos A/B/C, agenda, hábitos
  app.js                telas, regras de cálculo, gráficos, cronômetro
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
- Os dias do calendário de 90 dias aparecem em cascata.
- A aba ativa desliza entre as abas.
- O brilho do sol no card principal "respira".
- Confete e vibração ao concluir um treino, bater a meta de proteína, completar a água ou os hábitos do dia, e ao salvar a pesagem.

Quem tiver "reduzir movimento" ligado no celular vê tudo sem animação.

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

Para atualizar o app depois de mexer nos arquivos, aumente `VERSION` em `app/sw.js` e publique de novo. O celular pega a versão nova ao abrir o app.

> Este plano não substitui acompanhamento profissional. Por causa do abaulamento em L4–L5, valide o treino com ortopedista ou fisioterapeuta.
