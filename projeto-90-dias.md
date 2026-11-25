# Projeto 90 dias — especificação do app

App pessoal de recomposição corporal: registrar o que comer nos horários, seguir o treino do dia em ordem, anotar cargas e ver a evolução, e controlar o peso nos dias certos. Este documento contém tudo para montar o app: perfil, plano, telas, dados, regras de cálculo e visual.

---

## 1. Perfil e metas

| Item | Valor |
|---|---|
| Altura | 1,67 m |
| Peso inicial | 74 kg |
| Gordura estimada inicial | 22% (faixa 20–25%) |
| Massa magra estimada | ~57,7 kg |
| Meta realista em 90 dias | ~15% de gordura → **~67,9 kg** |
| Meta final (fase 2) | ~12% de gordura → **~65,6 kg** |
| Ritmo saudável | perder 0,5–0,8 kg por semana |
| Restrição | abaulamento de disco L4–L5 |
| Início do programa | segunda, 30/11/2026 (dia 1) |
| Duração | 90 dias (13 semanas) |

Fórmula das metas de peso:

```
massa_magra = peso_inicial × (1 − gordura_inicial / 100)
peso_meta = massa_magra / (1 − gordura_meta / 100)
```

---

## 2. Rotina diária

| Horário | O quê |
|---|---|
| ~05:00 | Acordar, café preto |
| 05:30–07:00 | Treino |
| 07:30 | Café da manhã (no trabalho) + creatina |
| 11:30 | Almoço (no trabalho) |
| 16:00 | Lanche |
| 20:00 | Jantar |
| ~22:00 | Dormir (mínimo 7 h) |

---

## 3. Alimentação

**Meta diária:** 1.900 kcal · 150 g de proteína · 3 L de água (12 copos de 250 ml).

| ID | Horário | Refeição | Plano | kcal | Proteína |
|---|---|---|---|---|---|
| `pre` | 05:15 | Pré-treino (opcional) | Café preto. Se bater tontura: 1 banana ou 1 dose de whey com água. | 0 | 0 |
| `cafe` | 07:30 | Café da manhã | 3 ovos mexidos, 2 fatias de pão integral, 1 fruta e café. Dia corrido: whey + 40 g de aveia + 1 banana. Creatina 5 g aqui. | 450 | 30 g |
| `almoco` | 11:30 | Almoço | 150 g de frango, carne magra ou peixe, 4 colheres de arroz (~120 g), 1 concha de feijão, salada à vontade, 1 colher de chá de azeite. | 600 | 45 g |
| `lanche` | 16:00 | Lanche | Iogurte natural + 1 dose de whey + 1 fruta. Ou sanduíche integral de frango ou atum. | 330 | 35 g |
| `jantar` | 20:00 | Jantar | 150 g de proteína, 150 g de batata, mandioca ou arroz, legumes à vontade. | 520 | 40 g |
| `extra` | — | Fora do plano (opcional) | Beliscos, bebida, doce, fim de semana. Anotar com honestidade é o que permite ajustar. | 0 | 0 |

Regras: sem álcool, refrigerante e fritura nos 90 dias. Fim de semana conta e vai no "Fora do plano".

---

## 4. Treino

### 4.1 Agenda semanal

| Dia | Treino |
|---|---|
| Segunda | **A** — Inferiores + core |
| Terça | **B** — Superiores |
| Quarta | **C** — Cardio + core |
| Quinta | **A** — Inferiores + core |
| Sexta | **B** — Superiores |
| Sáb/Dom | Descanso ativo: caminhada 30–40 min ou bike leve + Big 3 de McGill |

**Parâmetros gerais:** 3 séries, descanso de 60–90 s, parar 1–2 repetições antes da falha. **Semanas 1–2 (dias 1–14):** adaptação, carga leve, foco em técnica.

### 4.2 Treino A — Inferiores + core

| # | ID | Exercício | Tipo | Séries × reps | Teto | Dica (⚠️ = coluna) |
|---|---|---|---|---|---|---|
| 1 | `aq_a` | Aquecimento na bike | aquecimento | 5 min leve | — | — |
| 2 | `legpress` | Leg press 45° | carga | 3 × 10–12 | 12 | ⚠️ Quadril e lombar colados no banco. Desça só até onde o quadril não enrola. |
| 3 | `extensora` | Cadeira extensora | carga | 3 × 12 | 12 | Suba controlando, segure 1 s em cima. |
| 4 | `flexora` | Mesa flexora | carga | 3 × 12 | 12 | ⚠️ Quadril colado no banco, sem arquear a lombar. |
| 5 | `pelvica` | Elevação pélvica | carga | 3 × 10–12 | 12 | ⚠️ Suba até alinhar quadril e tronco. O trabalho é do glúteo, não da lombar. |
| 6 | `afundo` | Afundo com halteres | carga | 3 × 10 por perna | 10 | Tronco reto, passo médio. Goblet só se não doer. |
| 7 | `panturrilha` | Panturrilha sentado | carga | 3 × 15 | 15 | Amplitude toda, pausa embaixo. |
| 8 | `curlup` | Curl-up de McGill | core (reps) | 3 × 8 (10 s cada) | — | ⚠️ Uma perna dobrada, mãos sob a lombar, levante só cabeça e ombros. |
| 9 | `pranchalat` | Prancha lateral | core (segundos) | 3 × 20–30 s cada lado | — | Corpo em linha reta; joelhos apoiados se precisar. |
| 10 | `perdigueiro` | Perdigueiro (bird dog) | core (reps) | 3 × 8 cada lado | — | Braço e perna opostos, segure 5 s. Lombar parada. |
| 11 | `esteira_a` | Esteira inclinada | cardio | 15–20 min caminhando | — | — |

### 4.3 Treino B — Superiores

| # | ID | Exercício | Tipo | Séries × reps | Teto | Dica (⚠️ = coluna) |
|---|---|---|---|---|---|---|
| 1 | `aq_b` | Aquecimento + manguito | aquecimento | 5 min bike + rotação externa com elástico | — | — |
| 2 | `supino` | Supino com halteres | carga | 3 × 10–12 | 12 | Pés firmes, glúteo no banco. Peso por halter. |
| 3 | `remada` | Remada com apoio no peito | carga | 3 × 10–12 | 12 | ⚠️ Peito apoiado tira carga da lombar. Nunca remada curvada livre. |
| 4 | `puxada` | Puxada frente | carga | 3 × 10–12 | 12 | Puxe até o queixo, sem jogar o tronco para trás. |
| 5 | `desenv` | Desenvolvimento sentado com encosto | carga | 3 × 10–12 | 12 | ⚠️ Costas coladas no encosto. Lombar arqueou = carga alta. |
| 6 | `lateral` | Elevação lateral | carga | 3 × 12–15 | 15 | Cotovelo levemente dobrado, até a linha do ombro. |
| 7 | `triceps` | Tríceps na polia | carga | 3 × 12 | 12 | Cotovelos parados ao lado do corpo. |
| 8 | `rosca` | Rosca com halteres sentado | carga | 3 × 12 | 12 | Sentado com encosto, sem balanço. |
| 9 | `esteira_b` | Esteira inclinada | cardio | 15–20 min caminhando | — | — |

### 4.4 Treino C — Cardio + core

| # | ID | Exercício | Tipo | Volume |
|---|---|---|---|---|
| 1 | `cardio_c` | Esteira inclinada ou bike | cardio | 30–40 min em ritmo de conversa |
| 2 | `curlup` | Curl-up de McGill | core (reps) | 3 × 8 (10 s) |
| 3 | `pranchalat` | Prancha lateral | core (segundos) | 3 × 20–30 s cada lado |
| 4 | `perdigueiro` | Perdigueiro | core (reps) | 3 × 8 cada lado |

### 4.5 Proteção da coluna (L4–L5)

- **Proibidos nos 90 dias:** levantamento terra, agachamento livre com barra nas costas, stiff, bom-dia, remada curvada, abdominal tradicional, rotação com carga, qualquer exercício que arredonde a lombar com peso.
- **Parar na hora** se a dor irradiar para a perna ou houver formigamento ou dormência. Mostrar o treino ao ortopedista ou fisioterapeuta.
- Treinando às 5:30, os discos estão mais hidratados e sensíveis à flexão: evitar dobrar a coluna nos primeiros 30–45 min do dia.
- Registrar dor lombar de 0 a 10 em todo treino.

---

## 5. Peso e medidas

- **Pesagem:** segunda, quarta e sexta, em jejum, depois do banheiro, antes do treino, sempre na mesma balança. Vale a **média semanal**.
- **Medidas:** cintura (altura do umbigo, relaxado) e pescoço (abaixo do pomo de adão) nos dias 1, 15, 29, 43, 57, 71, 85 e 90.
- **% de gordura estimado (fórmula da Marinha dos EUA, homens, em cm):**

```
%gordura = 495 / (1,0324 − 0,19077 × log10(cintura − pescoço) + 0,15456 × log10(altura)) − 450
```

---

## 6. Suplementos

| Suplemento | Uso |
|---|---|
| Creatina | 5 g por dia, todo dia, no café das 7:30 |
| Whey | 1 dose no lanche das 16:00 (ou no café em dias corridos) |
| Café preto | Ao acordar, antes do treino |
| Vitamina D, ômega 3 | Só se exame mostrar deficiência |
| ❌ Termogênicos e "queimadores" | Não usar: pouco efeito, atrapalham sono e pressão |

---

## 7. Telas do app

Navegação por abas fixas embaixo: **Hoje · Comida · Treino · Peso · Guia**.

### 7.1 Hoje
- Cabeçalho "Dia X de 90 · semana Y · N treinos feitos". Antes do início: "X dias para começar".
- **Calendário de 90 dias** em grade de 13 semanas × 7 dias. Estados da célula: treino feito (cor cheia), incompleto (cor clara), descanso (tracejado), futuro (apagado), hoje (contorno). Ponto verde quando houve pesagem.
- Card do treino de hoje com botão "Abrir treino de hoje".
- Card de comida: barras de kcal e proteína do dia, refeições anotadas, próxima refeição pelo horário atual.
- Card de pesagem: "Hoje é dia de pesar" ou "Próxima pesagem: …"; aviso de dia de medir.
- Hábitos: creatina, 8 mil passos, sono 7 h (marcar/desmarcar) e contador de água (12 copos).
- Alerta se o último treino teve dor ≥ 4.

### 7.2 Comida
- Navegação por data (‹ dia anterior · próximo ›, "Voltar para hoje").
- Barras de total do dia (kcal e proteína vs. meta).
- Um card por refeição: horário, nome, plano, campo de texto "O que você comeu", kcal e proteína opcionais, botões "Comi o plano" (preenche texto e valores) e "Limpar". Card fica com borda verde quando preenchido.
- Contador de água.

### 7.3 Treino
- Navegação por data. Seletor A / B / C (padrão pela agenda; dá para trocar para repor treino perdido).
- Fim de semana sem treino escolhido: card de descanso ativo.
- Semanas 1–2: aviso de adaptação.
- Exercícios **numerados na ordem**, cada um com: nome, séries × reps, dica de coluna, botão "Feito".
  - **Carga:** grade por série com Carga (kg) e Reps; placeholder com a carga da última vez; linha "Última vez (dd/mm): 40 kg × 12 · …"; sugestão de progressão; botão "Ver evolução da carga" (gráfico).
  - **Core:** campo de reps ou segundos por série.
  - **Cardio:** minutos, inclinação %, velocidade.
- Dor lombar 0–10 e observações do treino.
- Tabela "Evolução de cargas": exercício, carga inicial, atual, ganho %.

### 7.4 Peso
- Instruções de quando pesar e medir, com a próxima data.
- Formulário: data, peso, cintura, pescoço → "Salvar pesagem".
- Alertas automáticos (ver regras).
- Painel: peso inicial, média da última semana, variação desde o início, % de gordura estimado, meta 90 dias (~15%), meta final (~12%).
- Gráfico da média semanal, gráfico da cintura, histórico com opção de apagar.

### 7.5 Guia
- Regras da coluna, suplementos, regras de rotina.
- Ajustes: data de início, peso inicial, % de gordura inicial (metas recalculam).

---

## 8. Regras de lógica

```text
diaDoPrograma(data)  = dias entre início e data + 1
semana(data)         = floor((diaDoPrograma − 1) / 7) + 1
treinoDoDia(data)    = escolhido manualmente OU agenda[diaDaSemana] (1→A, 2→B, 3→C, 4→A, 5→B)
diaDePesar(data)     = diaDaSemana ∈ {segunda, quarta, sexta}
diaDeMedir(data)     = (diaDoPrograma − 1) % 14 == 0  OU  diaDoPrograma == 90
```

**Status do treino no calendário:** "feito" se ≥ 70% dos exercícios têm registro ou "Feito"; "incompleto" se há algum registro; senão vazio.

**Sugestão de progressão (exercícios de carga):**
1. Dias 1–14 → "Carga leve, foco em técnica e amplitude sem dor."
2. Sem histórico → "Ache a carga em que a última repetição sai difícil, mas limpa."
3. Última sessão bateu o teto de reps em todas as séries → "Suba para ~(maior carga × 1,05, arredondado a 0,5 kg)."
4. Senão → "Mantenha a carga e busque mais repetições até o teto."

**Alertas de peso** (comparando médias de semanas já fechadas):
- 2 semanas seguidas sem cair (≥ semana anterior − 0,1 kg) → "Tire ~150 kcal por dia (ex.: metade do arroz do jantar) ou some 2 mil passos."
- Caiu mais de 1 kg na última semana → "Rápido demais: acrescente ~150 kcal."
- Caiu entre 0,4 e 1 kg → "Ritmo bom, continue igual."

**Dor lombar ≥ 4** → "Reduza a carga do exercício que doeu. Se irradiar, formigar ou adormecer: pare e procure o médico."

---

## 9. Modelo de dados

Quatro coleções, salvas localmente e (se houver) sincronizadas na nuvem.

```json
{
  "config": { "start": "2026-11-30", "w0": 74, "bf0": 22 },

  "food": {
    "2026-11-30": {
      "meals": {
        "cafe":   { "text": "3 ovos, 2 pães integrais, banana", "kcal": 450, "prot": 30 },
        "almoco": { "text": "...", "kcal": 600, "prot": 45 }
      },
      "water": 8,
      "hab": { "creat": true, "passos": false, "sono": true }
    }
  },

  "train": {
    "2026-11-30": {
      "k": "A",
      "ex": {
        "legpress":  { "done": true, "sets": [ { "kg": 80, "r": 12 }, { "kg": 80, "r": 11 }, { "kg": 80, "r": 10 } ] },
        "pranchalat":{ "sets": [ { "r": 25 }, { "r": 25 }, { "r": 20 } ] },
        "esteira_a": { "min": 15, "incl": 8, "vel": 5.5 }
      },
      "pain": 1,
      "note": "leg press incomodou no fim"
    }
  },

  "weight": {
    "2026-11-30": { "kg": 74.0, "waist": 92, "neck": 38 }
  }
}
```

---

## 10. Visual

| Token | Claro | Escuro |
|---|---|---|
| Fundo | `#EDF1F5` | `#0E151D` |
| Superfície | `#FFFFFF` | `#17212C` |
| Texto | `#15202B` | `#E5ECF2` |
| Texto secundário | `#5A6978` | `#93A2B1` |
| Linhas | `#D3DCE5` | `#283646` |
| Destaque (nascer do sol) | `#E3892A` | `#F0A04B` |
| Sucesso | `#2C8559` | `#4CBF88` |
| Alerta | `#BE3F2B` | `#EE7A62` |

- Fontes: **Barlow Condensed** (títulos e números) e **Barlow** (texto).
- Modo claro e escuro automático pelo sistema.
- Campos numéricos com teclado decimal (aceitar vírgula).
- Respeitar áreas seguras do celular (notch e barra inferior).

---

## 11. Como montar o app

| Caminho | Esforço | Resultado |
|---|---|---|
| **PWA** (HTML + JS, como a versão já feita) | Baixo | Abre no navegador e vai para a tela inicial com "Adicionar à tela de início". Funciona offline com service worker. |
| **Expo / React Native** | Médio | App nativo iOS e Android, dados com AsyncStorage ou SQLite, notificações locais nos horários das refeições e da pesagem. |
| **Flutter** | Médio | Mesmo resultado do Expo, em Dart. |

**Ideias para a versão 2:** notificações (05:00 treino, 07:30/11:30/16:00/20:00 refeições, seg/qua/sex pesagem), cronômetro de descanso entre séries, exportar dados em CSV, backup na nuvem, foto de progresso a cada 14 dias.

---

> Este plano não substitui acompanhamento profissional. Por causa do abaulamento em L4–L5, valide o treino com ortopedista ou fisioterapeuta, e um nutricionista pode refinar as quantidades.
