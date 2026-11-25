// Plano do Projeto 90 dias — dados fixos (ver projeto-90-dias.md)
window.PLAN = {
  heightCm: 167,
  defaults: { start: '2026-11-30', w0: 74, bf0: 22 },
  goals: { kcal: 1900, prot: 150, water: 6 },   // água = garrafas de 500 ml (3 L)
  bottleMl: 500,
  // horários dos lembretes de água (horário de Brasília) — iguais ao .github/workflows/lembretes-agua.yml
  waterTimes: ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'],
  // chave pública das notificações (a privada fica só no GitHub, como segredo)
  vapidPublic: 'BFSlNw5ENpbrFr_d7_BjmrSjIPUJUxaKbMNlb1IHjo4yw8yB4ewkfTD-upH8amLgZ6KbC5zXPr3bSV8S27fAQUM',
  repo: 'douglasbi744-code/papai-forte',

  meals: [
    { id: 'pre', time: '05:15', name: 'Pré-treino', opt: true, kcal: 0, prot: 0,
      plan: 'Café preto. Se bater tontura: 1 banana ou 1 dose de whey com água.' },
    { id: 'cafe', time: '07:30', name: 'Café da manhã', kcal: 450, prot: 30,
      plan: '3 ovos mexidos, 2 fatias de pão integral, 1 fruta e café. Dia corrido: whey + 40 g de aveia + 1 banana. Creatina 5 g aqui.',
      quick: '3 ovos mexidos, 2 pães integrais, 1 fruta, café + creatina' },
    { id: 'almoco', time: '11:30', name: 'Almoço', kcal: 600, prot: 45,
      plan: '150 g de frango, carne magra ou peixe, 4 colheres de arroz (~120 g), 1 concha de feijão, salada à vontade, 1 colher de chá de azeite.',
      quick: '150 g de proteína, 4 col. de arroz, 1 concha de feijão, salada, azeite' },
    { id: 'lanche', time: '16:00', name: 'Lanche', kcal: 330, prot: 35,
      plan: 'Iogurte natural + 1 dose de whey + 1 fruta. Ou sanduíche integral de frango ou atum.',
      quick: 'Iogurte natural + whey + 1 fruta' },
    { id: 'jantar', time: '20:00', name: 'Jantar', kcal: 520, prot: 40,
      plan: '150 g de proteína, 150 g de batata, mandioca ou arroz, legumes à vontade.',
      quick: '150 g de proteína, 150 g de batata/mandioca/arroz, legumes' },
    { id: 'extra', time: '—', name: 'Fora do plano', opt: true, kcal: 0, prot: 0,
      plan: 'Beliscos, bebida, doce, fim de semana. Anotar com honestidade é o que permite ajustar.' }
  ],

  // type: warm | load | core-r | core-s | cardio
  workouts: {
    A: { name: 'Inferiores + core', ex: [
      { id: 'aq_a', name: 'Aquecimento na bike', type: 'warm', scheme: '5 min leve' },
      { id: 'legpress', name: 'Leg press 45°', type: 'load', scheme: '3 × 10–12', top: 12, spine: true,
        tip: 'Quadril e lombar colados no banco. Desça só até onde o quadril não enrola.' },
      { id: 'extensora', name: 'Cadeira extensora', type: 'load', scheme: '3 × 12', top: 12,
        tip: 'Suba controlando, segure 1 s em cima.' },
      { id: 'flexora', name: 'Mesa flexora', type: 'load', scheme: '3 × 12', top: 12, spine: true,
        tip: 'Quadril colado no banco, sem arquear a lombar.' },
      { id: 'pelvica', name: 'Elevação pélvica', type: 'load', scheme: '3 × 10–12', top: 12, spine: true,
        tip: 'Suba até alinhar quadril e tronco. O trabalho é do glúteo, não da lombar.' },
      { id: 'afundo', name: 'Afundo com halteres', type: 'load', scheme: '3 × 10 por perna', top: 10,
        tip: 'Tronco reto, passo médio. Goblet só se não doer.' },
      { id: 'panturrilha', name: 'Panturrilha sentado', type: 'load', scheme: '3 × 15', top: 15,
        tip: 'Amplitude toda, pausa embaixo.' },
      { id: 'curlup', name: 'Curl-up de McGill', type: 'core-r', scheme: '3 × 8 (10 s cada)', spine: true,
        tip: 'Uma perna dobrada, mãos sob a lombar, levante só cabeça e ombros.' },
      { id: 'pranchalat', name: 'Prancha lateral', type: 'core-s', scheme: '3 × 20–30 s cada lado',
        tip: 'Corpo em linha reta; joelhos apoiados se precisar.' },
      { id: 'perdigueiro', name: 'Perdigueiro (bird dog)', type: 'core-r', scheme: '3 × 8 cada lado',
        tip: 'Braço e perna opostos, segure 5 s. Lombar parada.' },
      { id: 'esteira_a', name: 'Esteira inclinada', type: 'cardio', scheme: '15–20 min caminhando' }
    ]},
    B: { name: 'Superiores', ex: [
      { id: 'aq_b', name: 'Aquecimento + manguito', type: 'warm', scheme: '5 min bike + rotação externa com elástico' },
      { id: 'supino', name: 'Supino com halteres', type: 'load', scheme: '3 × 10–12', top: 12,
        tip: 'Pés firmes, glúteo no banco. Peso por halter.' },
      { id: 'remada', name: 'Remada com apoio no peito', type: 'load', scheme: '3 × 10–12', top: 12, spine: true,
        tip: 'Peito apoiado tira carga da lombar. Nunca remada curvada livre.' },
      { id: 'puxada', name: 'Puxada frente', type: 'load', scheme: '3 × 10–12', top: 12,
        tip: 'Puxe até o queixo, sem jogar o tronco para trás.' },
      { id: 'desenv', name: 'Desenvolvimento sentado', type: 'load', scheme: '3 × 10–12', top: 12, spine: true,
        tip: 'Costas coladas no encosto. Lombar arqueou = carga alta.' },
      { id: 'lateral', name: 'Elevação lateral', type: 'load', scheme: '3 × 12–15', top: 15,
        tip: 'Cotovelo levemente dobrado, até a linha do ombro.' },
      { id: 'triceps', name: 'Tríceps na polia', type: 'load', scheme: '3 × 12', top: 12,
        tip: 'Cotovelos parados ao lado do corpo.' },
      { id: 'rosca', name: 'Rosca com halteres sentado', type: 'load', scheme: '3 × 12', top: 12,
        tip: 'Sentado com encosto, sem balanço.' },
      { id: 'esteira_b', name: 'Esteira inclinada', type: 'cardio', scheme: '15–20 min caminhando' }
    ]},
    C: { name: 'Cardio + core', ex: [
      { id: 'cardio_c', name: 'Esteira inclinada ou bike', type: 'cardio', scheme: '30–40 min em ritmo de conversa' },
      { id: 'curlup', name: 'Curl-up de McGill', type: 'core-r', scheme: '3 × 8 (10 s)', spine: true,
        tip: 'Uma perna dobrada, mãos sob a lombar, levante só cabeça e ombros.' },
      { id: 'pranchalat', name: 'Prancha lateral', type: 'core-s', scheme: '3 × 20–30 s cada lado',
        tip: 'Corpo em linha reta; joelhos apoiados se precisar.' },
      { id: 'perdigueiro', name: 'Perdigueiro', type: 'core-r', scheme: '3 × 8 cada lado',
        tip: 'Braço e perna opostos, segure 5 s. Lombar parada.' }
    ]}
  },

  // getDay(): 0=dom … 6=sáb
  schedule: { 1: 'A', 2: 'B', 3: 'C', 4: 'A', 5: 'B' },

  habits: [
    { id: 'creat', label: 'Creatina 5 g' },
    { id: 'passos', label: '8 mil passos' },
    { id: 'sono', label: 'Sono 7 h' }
  ]
};
