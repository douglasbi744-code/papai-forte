/* Papai Forte — monta o plano de cada pessoa a partir do questionário.
   Tudo é regra fixa (sem IA): fórmulas de nutrição + biblioteca de exercícios
   em que cada exercício sabe para quais lesões/condições ele é proibido ou pede cuidado.
   Este plano não substitui profissional de saúde: o app sempre recomenda validar. */
(function () {
  'use strict';

  /* ---------- condições de saúde ---------- */
  // red: exige liberação médica e o app só sugere atividade leve
  const CONDITIONS = [
    { id: 'lombar', label: 'Coluna lombar', hint: 'hérnia, abaulamento, dor lombar, ciático', pain: 'lombar' },
    { id: 'cervical', label: 'Coluna cervical / pescoço', hint: 'hérnia cervical, dor no pescoço', pain: 'pescoço' },
    { id: 'ombro', label: 'Ombro', hint: 'tendinite, bursite, manguito rotador, luxação', pain: 'ombro' },
    { id: 'joelho', label: 'Joelho', hint: 'condromalácia, menisco, ligamento, artrose', pain: 'joelho' },
    { id: 'quadril', label: 'Quadril', hint: 'bursite, artrose, impacto femoroacetabular', pain: 'quadril' },
    { id: 'punho', label: 'Punho ou cotovelo', hint: 'tendinite, epicondilite, túnel do carpo', pain: 'punho/cotovelo' },
    { id: 'pressao', label: 'Pressão alta', hint: 'hipertensão, mesmo controlada com remédio' },
    { id: 'diabetes', label: 'Diabetes ou pré-diabetes', hint: 'tipo 1, tipo 2 ou resistência à insulina' },
    { id: 'coracao', label: 'Problema no coração', hint: 'arritmia, infarto, insuficiência, marca-passo', red: true },
    { id: 'gestante', label: 'Gestante ou pós-parto recente', hint: 'até 6 meses após o parto', red: true, female: true }
  ];
  const condById = Object.fromEntries(CONDITIONS.map(c => [c.id, c]));

  /* ---------- biblioteca de exercícios ----------
     place: gym | home | both
     avoid: condições em que o exercício NÃO entra
     care:  condições em que entra com cuidado (mostra ⚠️ e a dica `careTip[cond]` ou `tip`)
     Os ids repetem os do plano original para manter o histórico de cargas. */
  const EX = {
    aq_a: { name: 'Aquecimento na bike', type: 'warm', place: 'gym', scheme: '5 min leve' },
    aq_b: { name: 'Aquecimento + manguito', type: 'warm', place: 'gym', scheme: '5 min bike + rotação externa com elástico' },
    aq_casa: { name: 'Aquecimento: marcha no lugar + mobilidade', type: 'warm', place: 'home', scheme: '5 min leve' },

    legpress: { name: 'Leg press 45°', type: 'load', place: 'gym', scheme: '3 × 10–12', top: 12, care: ['lombar', 'joelho', 'quadril'],
      tip: 'Quadril e lombar colados no banco. Desça só até onde o quadril não enrola.',
      careTip: { joelho: 'Amplitude curta (joelho até 90°) e sem travar o joelho em cima.' } },
    agach_banco: { name: 'Sentar e levantar do banco', type: 'load', place: 'both', scheme: '3 × 10–12', top: 12, care: ['joelho', 'quadril'],
      tip: 'Peito aberto, desça controlando até encostar no banco e suba empurrando o chão.',
      careTip: { joelho: 'Use um banco mais alto e não deixe o joelho passar muito da ponta do pé.' } },
    extensora: { name: 'Cadeira extensora', type: 'load', place: 'gym', scheme: '3 × 12', top: 12, care: ['joelho'],
      tip: 'Suba controlando, segure 1 s em cima.',
      careTip: { joelho: 'Carga leve e amplitude parcial (do meio para cima). Parou de doer? Mantenha assim.' } },
    flexora: { name: 'Mesa flexora', type: 'load', place: 'gym', scheme: '3 × 12', top: 12, care: ['lombar'],
      tip: 'Quadril colado no banco, sem arquear a lombar.' },
    ponte_uni: { name: 'Ponte de glúteo com uma perna', type: 'load', place: 'home', scheme: '3 × 10 por perna', top: 10, care: ['lombar'],
      tip: 'Empurre pelo calcanhar e suba até alinhar quadril e tronco, sem arquear a lombar.' },
    pelvica: { name: 'Elevação pélvica', type: 'load', place: 'both', scheme: '3 × 10–12', top: 12, care: ['lombar'],
      tip: 'Suba até alinhar quadril e tronco. O trabalho é do glúteo, não da lombar.' },
    abdutora: { name: 'Cadeira abdutora', type: 'load', place: 'gym', scheme: '3 × 15', top: 15,
      tip: 'Tronco apoiado, abra controlando e segure 1 s.' },
    abd_elastico: { name: 'Abdução de quadril com elástico (deitado de lado)', type: 'load', place: 'home', scheme: '3 × 15 cada lado', top: 15,
      tip: 'Joelho esticado, suba a perna sem girar o quadril.' },
    afundo: { name: 'Afundo com halteres', type: 'load', place: 'both', scheme: '3 × 10 por perna', top: 10, avoid: ['joelho', 'quadril'], care: ['lombar'],
      tip: 'Tronco reto, passo médio. Goblet só se não doer.' },
    panturrilha: { name: 'Panturrilha sentado', type: 'load', place: 'gym', scheme: '3 × 15', top: 15, tip: 'Amplitude toda, pausa embaixo.' },
    pant_degrau: { name: 'Panturrilha em pé no degrau', type: 'load', place: 'home', scheme: '3 × 15', top: 15, tip: 'Segure em algo, desça o calcanhar e suba devagar.' },

    supino: { name: 'Supino com halteres', type: 'load', place: 'gym', scheme: '3 × 10–12', top: 12, care: ['ombro', 'punho'],
      tip: 'Pés firmes, glúteo no banco. Peso por halter.',
      careTip: { ombro: 'Cotovelos a 45° do corpo e desça só até a linha do peito.', punho: 'Punho reto, alinhado com o antebraço.' } },
    flexao: { name: 'Flexão de braço (joelhos no chão se precisar)', type: 'load', place: 'home', scheme: '3 × 8–12', top: 12, avoid: ['ombro'], care: ['punho', 'lombar'],
      tip: 'Corpo em linha reta, desça até quase encostar o peito.', careTip: { punho: 'Apoie nos punhos fechados ou em halteres para não dobrar o punho.' } },
    supino_maq: { name: 'Supino na máquina (pegada neutra)', type: 'load', place: 'gym', scheme: '3 × 12', top: 12,
      tip: 'Pegada neutra protege o ombro. Amplitude confortável.' },
    flexao_parede: { name: 'Flexão na parede', type: 'load', place: 'home', scheme: '3 × 12–15', top: 15, care: ['punho'],
      tip: 'Mãos na parede na altura do peito, cotovelos a 45°.' },
    remada: { name: 'Remada com apoio no peito', type: 'load', place: 'gym', scheme: '3 × 10–12', top: 12, care: ['lombar'],
      tip: 'Peito apoiado tira carga da lombar. Nunca remada curvada livre.' },
    remada_elastico: { name: 'Remada com elástico (sentado)', type: 'load', place: 'home', scheme: '3 × 12–15', top: 15,
      tip: 'Coluna reta, puxe o elástico até a barriga juntando as escápulas.' },
    puxada: { name: 'Puxada frente', type: 'load', place: 'gym', scheme: '3 × 10–12', top: 12, care: ['ombro', 'cervical'],
      tip: 'Puxe até o queixo, sem jogar o tronco para trás.', careTip: { cervical: 'Sempre pela frente, nunca atrás da nuca.', ombro: 'Pegada neutra ou média, sem esticar demais em cima.' } },
    puxada_elastico: { name: 'Puxada com elástico (preso no alto)', type: 'load', place: 'home', scheme: '3 × 12–15', top: 15,
      tip: 'Puxe os cotovelos para baixo e para trás, peito aberto.' },
    desenv: { name: 'Desenvolvimento sentado', type: 'load', place: 'gym', scheme: '3 × 10–12', top: 12, avoid: ['ombro', 'cervical'], care: ['lombar'],
      tip: 'Costas coladas no encosto. Lombar arqueou = carga alta.' },
    desenv_casa: { name: 'Desenvolvimento sentado com halter ou garrafa', type: 'load', place: 'home', scheme: '3 × 12', top: 12, avoid: ['ombro', 'cervical'], care: ['lombar'],
      tip: 'Sentado com encosto, suba sem arquear a lombar.' },
    face_pull: { name: 'Face pull (puxada para o rosto)', type: 'load', place: 'gym', scheme: '3 × 15', top: 15,
      tip: 'Corda na altura do rosto, puxe abrindo os cotovelos. Fortalece o ombro e a postura.' },
    crucifixo_inv: { name: 'Crucifixo inverso com elástico', type: 'load', place: 'home', scheme: '3 × 15', top: 15,
      tip: 'Braços à frente, abra o elástico juntando as escápulas.' },
    lateral: { name: 'Elevação lateral', type: 'load', place: 'both', scheme: '3 × 12–15', top: 15, care: ['ombro'],
      tip: 'Cotovelo levemente dobrado, até a linha do ombro.', careTip: { ombro: 'Carga bem leve e só até uns 60°. Doeu, troque pela rotação externa.' } },
    rot_externa: { name: 'Rotação externa com elástico', type: 'load', place: 'both', scheme: '3 × 15 cada lado', top: 15,
      tip: 'Cotovelo colado no corpo a 90°, gire o antebraço para fora devagar. Fortalece o manguito.' },
    triceps: { name: 'Tríceps na polia', type: 'load', place: 'gym', scheme: '3 × 12', top: 12, care: ['punho'], tip: 'Cotovelos parados ao lado do corpo.' },
    triceps_elastico: { name: 'Tríceps com elástico', type: 'load', place: 'home', scheme: '3 × 12–15', top: 15, care: ['punho'], tip: 'Cotovelos colados no corpo, estique até o fim.' },
    rosca: { name: 'Rosca com halteres sentado', type: 'load', place: 'both', scheme: '3 × 12', top: 12, care: ['punho'],
      tip: 'Sentado com encosto, sem balanço.', careTip: { punho: 'Pegada neutra (martelo) costuma doer menos.' } },

    curlup: { name: 'Curl-up de McGill', type: 'core-r', place: 'both', scheme: '3 × 8 (10 s cada)', care: ['lombar'],
      tip: 'Uma perna dobrada, mãos sob a lombar, levante só cabeça e ombros.' },
    pranchalat: { name: 'Prancha lateral', type: 'core-s', place: 'both', scheme: '3 × 20–30 s cada lado', avoid: ['ombro'],
      tip: 'Corpo em linha reta; joelhos apoiados se precisar.' },
    deadbug: { name: 'Dead bug', type: 'core-r', place: 'both', scheme: '3 × 8 cada lado',
      tip: 'Deitado, lombar encostada no chão, estique braço e perna opostos devagar.' },
    perdigueiro: { name: 'Perdigueiro (bird dog)', type: 'core-r', place: 'both', scheme: '3 × 8 cada lado', care: ['punho'],
      tip: 'Braço e perna opostos, segure 5 s. Lombar parada.' },
    chin_tuck: { name: 'Retração do queixo (chin tuck)', type: 'core-r', place: 'both', scheme: '3 × 10 (5 s)',
      tip: 'Sentado ereto, leve o queixo para trás como um "queixo duplo". Fortalece o pescoço.' },
    piriforme: { name: 'Alongamento de glúteo/piriforme', type: 'core-s', place: 'both', scheme: '2 × 30 s cada lado',
      tip: 'Deitado, cruze o tornozelo sobre o joelho e puxe a coxa em direção ao peito.' },
    isometria_quad: { name: 'Isometria de quadríceps (toalha sob o joelho)', type: 'core-r', place: 'both', scheme: '3 × 10 (5 s)',
      tip: 'Sentado com a perna esticada, aperte o joelho contra a toalha contraindo a coxa.' },

    esteira_a: { name: 'Esteira inclinada', type: 'cardio', place: 'gym', scheme: '15–20 min caminhando', avoid: ['joelho'] },
    esteira_b: { name: 'Esteira inclinada', type: 'cardio', place: 'gym', scheme: '15–20 min caminhando', avoid: ['joelho'] },
    bike: { name: 'Bike ergométrica', type: 'cardio', place: 'gym', scheme: '15–20 min em ritmo de conversa' },
    caminhada: { name: 'Caminhada', type: 'cardio', place: 'home', scheme: '20 min em ritmo de conversa' },
    cardio_c: { name: 'Esteira inclinada ou bike', type: 'cardio', place: 'gym', scheme: '30–40 min em ritmo de conversa' },
    cardio_c_bike: { name: 'Bike ergométrica', type: 'cardio', place: 'gym', scheme: '30–40 min em ritmo de conversa' },
    caminhada_longa: { name: 'Caminhada', type: 'cardio', place: 'home', scheme: '30–40 min em ritmo de conversa' }
  };

  // cada vaga do treino tem candidatos em ordem de preferência; entra o primeiro permitido
  const SLOTS = {
    warm: ['aq_a', 'aq_casa'], warmUp: ['aq_b', 'aq_casa'],
    quad: ['legpress', 'agach_banco'], quad2: ['extensora', 'isometria_quad'], hinge: ['flexora', 'ponte_uni'],
    glute: ['pelvica'], uni: ['afundo', 'abdutora', 'abd_elastico'], calf: ['panturrilha', 'pant_degrau'],
    pushH: ['supino', 'supino_maq', 'flexao', 'flexao_parede'], pullH: ['remada', 'remada_elastico'], pullV: ['puxada', 'puxada_elastico'],
    pushV: ['desenv', 'desenv_casa', 'face_pull', 'crucifixo_inv'], lat: ['lateral', 'rot_externa'],
    tri: ['triceps', 'triceps_elastico'], bi: ['rosca'],
    core1: ['curlup'], core2: ['pranchalat', 'deadbug'], core3: ['perdigueiro', 'deadbug'],
    cardio: ['esteira_a', 'bike', 'caminhada'], cardioB: ['esteira_b', 'bike', 'caminhada'], cardioLong: ['cardio_c', 'cardio_c_bike', 'caminhada_longa']
  };
  const TEMPLATES = {
    A: { name: 'Inferiores + core', slots: ['warm', 'quad', 'quad2', 'hinge', 'glute', 'uni', 'calf', 'core1', 'core2', 'core3', 'cardio'] },
    B: { name: 'Superiores', slots: ['warmUp', 'pushH', 'pullH', 'pullV', 'pushV', 'lat', 'tri', 'bi', 'cardioB'] },
    C: { name: 'Cardio + core', slots: ['cardioLong', 'core1', 'core2', 'core3'] },
    Cg: { name: 'Corpo todo', slots: ['warm', 'quad', 'pushH', 'pullH', 'glute', 'pullV', 'core1', 'core2', 'core3'] }
  };
  // reforço específico para cada condição (entra no fim do treino indicado)
  const EXTRA = { ombro: { B: ['rot_externa', 'face_pull'] }, cervical: { B: ['chin_tuck'], C: ['chin_tuck'] }, quadril: { A: ['piriforme'], C: ['piriforme'] }, joelho: { A: ['isometria_quad'] } };

  const allowed = (id, ctx) => {
    const e = EX[id];
    if (!e) return false;
    if (e.place !== 'both' && e.place !== ctx.place) return false;
    return !(e.avoid || []).some(c => ctx.cond.includes(c));
  };
  const placeOk = (id, place) => EX[id] && (EX[id].place === 'both' || EX[id].place === place);
  function exObj(id, ctx) {
    const e = EX[id], care = (e.care || []).filter(c => ctx.cond.includes(c));
    const tip = care.map(c => e.careTip && e.careTip[c]).filter(Boolean).concat(e.tip ? [e.tip] : []).join(' ');
    const o = { id, name: e.name, type: e.type, scheme: e.scheme };
    if (e.top) o.top = e.top;
    if (tip) o.tip = tip;
    if (care.length) o.spine = true; // mostra o ⚠️ de cuidado
    if (ctx.pressao && e.type === 'core-s') o.scheme = e.scheme.replace('20–30 s', '15–20 s');
    return o;
  }
  function buildWorkout(key, ctx) {
    const t = TEMPLATES[key], used = new Set(), ex = [];
    t.slots.forEach(s => {
      const id = (SLOTS[s] || []).find(x => !used.has(x) && allowed(x, ctx));
      if (id) { used.add(id); ex.push(exObj(id, ctx)); }
    });
    const k = key === 'Cg' ? 'C' : key;
    ctx.cond.forEach(c => ((EXTRA[c] || {})[k] || []).forEach(id => {
      if (!used.has(id) && placeOk(id, ctx.place) && allowed(id, ctx)) {
        used.add(id);
        const at = ex.findIndex(x => x.type === 'cardio' && ex.indexOf(x) > 0);
        if (at > 0) ex.splice(at, 0, exObj(id, ctx)); else ex.push(exObj(id, ctx));
      }
    }));
    return { name: t.name, ex };
  }
  // problema cardíaco / gestação: só caminhada leve + respiração, com aviso para liberação médica
  function gentleWorkouts(place) {
    const walk = { id: place === 'gym' ? 'bike' : 'caminhada', name: place === 'gym' ? 'Bike ou esteira bem leve' : 'Caminhada leve', type: 'cardio', scheme: '15–25 min conseguindo conversar' };
    const mob = { id: 'deadbug', name: 'Dead bug', type: 'core-r', scheme: '2 × 6 cada lado', tip: 'Movimento lento, sem prender a respiração.' };
    return { A: { name: 'Leve (com liberação médica)', ex: [walk, mob] }, B: { name: 'Leve (com liberação médica)', ex: [walk] }, C: { name: 'Leve (com liberação médica)', ex: [walk, mob] } };
  }

  /* ---------- nutrição ---------- */
  const ACT = { sed: 1.2, light: 1.375, mod: 1.55, high: 1.725 };
  const GOALS = {
    cut: { label: 'Perder gordura', factor: 0.8, protKg: 2.0, pace: 'Perder 0,5–0,8 kg por semana' },
    recomp: { label: 'Recomposição (perder gordura e ganhar músculo)', factor: 0.9, protKg: 1.8, pace: 'Perder 0,2–0,4 kg por semana ganhando força' },
    gain: { label: 'Ganhar massa muscular', factor: 1.1, protKg: 1.8, pace: 'Ganhar 0,2–0,4 kg por semana' }
  };
  const round = (v, s) => Math.round(v / s) * s;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ageOf = p => p.birthYear ? new Date().getFullYear() - p.birthYear : (p.age || 30);

  function bodyFat(p) {
    const h = p.heightCm, w = p.waistCm, n = p.neckCm, hip = p.hipCm;
    let v = null;
    if (p.sex === 'f' && w && n && hip && w + hip > n) v = 495 / (1.29579 - 0.35004 * Math.log10(w + hip - n) + 0.22100 * Math.log10(h)) - 450;
    if (p.sex !== 'f' && w && n && w > n) v = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    if (v == null || !Number.isFinite(v) || v < 3 || v > 60) {
      // sem medidas: estimativa pelo IMC (Deurenberg)
      const bmi = p.weightKg / Math.pow(h / 100, 2);
      v = 1.2 * bmi + 0.23 * ageOf(p) - 10.8 * (p.sex === 'f' ? 0 : 1) - 5.4;
    }
    return Math.round(clamp(v, 5, 55) * 10) / 10;
  }
  function targets(p) {
    const age = ageOf(p), w = p.weightKg, h = p.heightCm;
    const bmr = 10 * w + 6.25 * h - 5 * age + (p.sex === 'f' ? -161 : 5);
    const tdee = bmr * (ACT[p.activity] || 1.375);
    const g = GOALS[p.goal] || GOALS.cut;
    const floor = p.sex === 'f' ? 1300 : 1600;
    const kcal = round(Math.max(tdee * g.factor, Math.min(floor, tdee)), 50);
    const bmi = w / Math.pow(h / 100, 2);
    // acima do sobrepeso, proteína pelo peso "ajustado" para não exagerar
    const refW = bmi > 30 ? (25 * Math.pow(h / 100, 2) + w) / 2 : w;
    const prot = round(clamp(refW * g.protKg, 80, 220), 5);
    const water = clamp(Math.ceil(w * 35 / 500), 4, 10);
    return { kcal, prot, water, bmr: Math.round(bmr), tdee: Math.round(tdee), bmi: Math.round(bmi * 10) / 10 };
  }

  const pad = n => String(n).padStart(2, '0');
  const hm = m => `${pad(Math.floor(((m % 1440) + 1440) % 1440 / 60))}:${pad(((m % 60) + 60) % 60)}`;
  const toMin = t => /^\d\d:\d\d$/.test(t || '') ? +t.slice(0, 2) * 60 + +t.slice(3) : null;

  function buildMeals(p, kcal, prot) {
    const veg = !!(p.diet && p.diet.veg), lac = !!(p.diet && p.diet.lactose), glu = !!(p.diet && p.diet.gluten), whey = !!p.whey, creat = !!p.creatine;
    const split = { cafe: [0.24, 0.2], almoco: [0.32, 0.3], lanche: [0.17, 0.23], jantar: [0.27, 0.27] };
    const base = { cafe: 450, almoco: 600, lanche: 330, jantar: 520 };
    const mk = id => ({ kcal: round(kcal * split[id][0], 10), prot: round(prot * split[id][1], 5) });
    const f = id => mk(id).kcal / base[id];
    const protSrc = veg ? 'tofu, ovos, grão-de-bico ou proteína de soja' : 'frango, carne magra ou peixe';
    const iog = lac ? 'iogurte sem lactose' : 'iogurte natural';
    const pao = glu ? 'tapioca (2 col. de goma) ou cuscuz' : 'pão integral';

    const eggs = clamp(Math.round(3 * f('cafe')), 1, 5), slices = clamp(Math.round(2 * f('cafe')), 1, 4);
    const cafe = {
      plan: `${eggs} ovo${eggs > 1 ? 's' : ''} mexido${eggs > 1 ? 's' : ''}, ${glu ? pao : `${slices} fatia${slices > 1 ? 's' : ''} de ${pao}`}, 1 fruta e café.${whey ? ' Dia corrido: whey + 40 g de aveia + 1 banana.' : ''}${creat ? ' Creatina 5 g aqui.' : ''}`,
      quick: `${eggs} ovos mexidos, ${glu ? 'tapioca' : `${slices} pães integrais`}, 1 fruta, café${creat ? ' + creatina' : ''}`
    };
    const pg = clamp(round(150 * f('almoco'), 10), 80, 250), rice = clamp(Math.round(4 * f('almoco')), 2, 8);
    const almoco = {
      plan: `${pg} g de ${protSrc}, ${rice} colheres de arroz (~${rice * 30} g), 1 concha de feijão, salada à vontade, 1 colher de chá de azeite.`,
      quick: `${pg} g de proteína, ${rice} col. de arroz, 1 concha de feijão, salada, azeite`
    };
    const extraOat = f('lanche') > 1.25 ? ' + 30 g de aveia' : '';
    const lanche = whey
      ? { plan: `${iog[0].toUpperCase() + iog.slice(1)} + 1 dose de whey + 1 fruta${extraOat}. Ou sanduíche integral de ${veg ? 'ovo' : 'frango ou atum'}.`, quick: `${iog[0].toUpperCase() + iog.slice(1)} + whey + 1 fruta${extraOat}` }
      : { plan: `${iog[0].toUpperCase() + iog.slice(1)} + 1 fruta + 2 ovos cozidos${extraOat}. Ou sanduíche ${glu ? 'de tapioca' : 'integral'} de ${veg ? 'ovo' : 'frango ou atum'}.`, quick: `${iog[0].toUpperCase() + iog.slice(1)} + fruta + 2 ovos cozidos${extraOat}` };
    const jg = clamp(round(150 * f('jantar'), 10), 80, 250), carb = clamp(round(150 * f('jantar'), 10), 60, 300);
    const jantar = {
      plan: `${jg} g de ${protSrc}, ${carb} g de batata, mandioca ou arroz, legumes à vontade.`,
      quick: `${jg} g de proteína, ${carb} g de batata/mandioca/arroz, legumes`
    };

    // horários: acorda → café; treino cedo → pré-treino antes e café depois
    const wake = toMin(p.wake) ?? 360, train = toMin(p.trainTime);
    const early = train != null && train < 9 * 60;
    const tCafe = early ? Math.max(train + 75, wake + 30) : wake + 45;
    const tAlmoco = Math.max(tCafe + 210, 12 * 60), tJantar = Math.max(tAlmoco + 420, 19 * 60 + 30), tLanche = Math.round((tAlmoco + tJantar) / 2 / 15) * 15;
    const meals = [];
    if (early) meals.push({ id: 'pre', time: hm(train - 15), name: 'Pré-treino', opt: true, kcal: 0, prot: 0, plan: `Café preto. Se bater tontura: 1 banana${whey ? ' ou 1 dose de whey com água' : ''}.` });
    meals.push({ id: 'cafe', time: hm(tCafe), name: 'Café da manhã', ...mk('cafe'), ...cafe });
    meals.push({ id: 'almoco', time: hm(tAlmoco), name: 'Almoço', ...mk('almoco'), ...almoco });
    meals.push({ id: 'lanche', time: hm(tLanche), name: 'Lanche', ...mk('lanche'), ...lanche });
    meals.push({ id: 'jantar', time: hm(tJantar), name: 'Jantar', ...mk('jantar'), ...jantar });
    if (p.diabetes) meals.forEach(m => { if (m.id === 'lanche') m.plan += ' Prefira frutas inteiras (não suco) e não pule esta refeição.'; });
    meals.push({ id: 'extra', time: '—', name: 'Fora do plano', opt: true, kcal: 0, prot: 0, plan: 'Beliscos, bebida, doce, fim de semana. Anotar com honestidade é o que permite ajustar.' });
    return meals;
  }

  /* ---------- guia (textos do app) ---------- */
  const DAYN = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  function careSections(cond) {
    const out = [];
    if (cond.includes('lombar')) out.push({ t: '⚠️ Proteção da coluna lombar', items: [
      '<b>Fora do treino:</b> levantamento terra, agachamento livre com barra nas costas, stiff, bom-dia, remada curvada, abdominal tradicional e rotação com carga.',
      'Treino de manhã cedo: os discos estão mais sensíveis à flexão. Evite dobrar a coluna nos primeiros 30–45 min do dia.',
      'O core (curl-up, prancha lateral e perdigueiro) é o que protege a lombar: não pule.'] });
    if (cond.includes('cervical')) out.push({ t: '⚠️ Cuidado com o pescoço', items: ['Puxadas sempre pela frente, nunca atrás da nuca. Sem desenvolvimento acima da cabeça.', 'Retração do queixo todos os dias ajuda a postura.'] });
    if (cond.includes('ombro')) out.push({ t: '⚠️ Cuidado com o ombro', items: ['Fora do treino: desenvolvimento acima da cabeça, mergulho e prancha apoiada nas mãos.', 'Rotação externa e face pull fortalecem o manguito: faça com carga leve e devagar.'] });
    if (cond.includes('joelho')) out.push({ t: '⚠️ Cuidado com o joelho', items: ['Fora do treino: afundo, saltos e corrida. Cardio na bike.', 'Agachar só até 90° e sem travar o joelho em cima. Isometria de quadríceps fortalece sem forçar.'] });
    if (cond.includes('quadril')) out.push({ t: '⚠️ Cuidado com o quadril', items: ['Fora do treino: afundo e amplitudes que forcem o quadril.', 'Alongamento de piriforme e cadeira abdutora ajudam a estabilizar.'] });
    if (cond.includes('punho')) out.push({ t: '⚠️ Cuidado com punho/cotovelo', items: ['Punho sempre reto e alinhado com o antebraço. Pegada neutra (martelo) costuma doer menos.'] });
    if (cond.includes('pressao')) out.push({ t: '⚠️ Pressão alta', items: ['Não prenda a respiração na força: solte o ar ao subir o peso.', 'Meça a pressão antes do treino. Acima de 16/10, faça só caminhada leve.', 'Evite muito sal e embutidos.'] });
    if (cond.includes('diabetes')) out.push({ t: '⚠️ Diabetes', items: ['Meça a glicose antes do treino e tenha um carboidrato rápido por perto.', 'Não pule refeições e prefira frutas inteiras ao suco.'] });
    if (cond.some(c => (condById[c] || {}).red)) out.push({ t: '🛑 Precisa de liberação médica', items: ['Por causa da condição marcada, o app só sugere atividade leve. Mostre o plano ao seu médico antes de aumentar a intensidade.'] });
    return out;
  }
  function painLabel(cond) {
    const zones = cond.map(c => (condById[c] || {}).pain).filter(Boolean);
    return zones.length ? `Dor (${zones.join(', ')}) hoje` : 'Dor ou desconforto hoje';
  }

  function build(p, base) {
    const cond = (p.conditions || []).filter(c => condById[c]);
    const t = targets(p);
    const ctx = { place: p.place === 'home' ? 'home' : 'gym', cond, pressao: cond.includes('pressao') };
    const red = cond.some(c => (condById[c] || {}).red);
    const days = (p.days && p.days.length ? p.days : [1, 3, 5]).slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
    const n = days.length;
    let workouts;
    if (red) workouts = gentleWorkouts(ctx.place);
    else workouts = { A: buildWorkout('A', ctx), B: buildWorkout('B', ctx), C: buildWorkout(p.goal === 'gain' || n <= 2 ? 'Cg' : 'C', ctx) };
    // poucas vezes por semana: corpo todo
    const seq = n <= 1 ? ['C'] : n === 2 ? ['A', 'B'] : ['A', 'B', 'C', 'A', 'B', 'C', 'A'];
    const schedule = {}; days.forEach((d, i) => { schedule[d] = seq[i % seq.length]; });
    const g = GOALS[p.goal] || GOALS.cut;
    const habits = [{ id: 'passos', label: p.activity === 'sed' ? '6 mil passos' : '8 mil passos' }, { id: 'sono', label: 'Sono 7 h' }];
    if (p.creatine) habits.unshift({ id: 'creat', label: 'Creatina 5 g' });
    const sched = days.map(d => `${DAYN[d]} ${schedule[d]}`).join(' · ');
    return {
      ...base,
      mode: 'auto', name: p.name || '', sex: p.sex === 'f' ? 'f' : 'm', goalType: p.goal || 'cut',
      heightCm: p.heightCm,
      goals: { kcal: t.kcal, prot: t.prot, water: t.water },
      meals: buildMeals({ ...p, diabetes: cond.includes('diabetes') }, t.kcal, t.prot),
      workouts, schedule, habits,
      targetsInfo: t,
      guide: {
        line: `${t.kcal.toLocaleString('pt-BR')} kcal · ${t.prot} g de proteína · ${(t.water * base.bottleMl / 1000).toLocaleString('pt-BR')} L de água`,
        sub: `Treino${p.trainTime ? ' ' + p.trainTime : ''} · ${sched} · nos outros dias, descanso ativo. ${g.pace}.`,
        care: careSections(cond),
        painLabel: painLabel(cond),
        footer: 'Este plano foi calculado por regras gerais e não substitui acompanhamento profissional.' + (cond.length ? ' Por causa das condições de saúde informadas, valide o treino com médico ou fisioterapeuta.' : '')
      },
      routine: [[p.wake || '06:00', 'Acordar'], ...(p.trainTime ? [[p.trainTime, 'Treino (dias marcados)']] : []), ['22:00', 'Dormir (mínimo 7 h)']]
    };
  }

  // plano original do Douglas (feito à mão a partir do projeto-90-dias.md)
  function fixed(base) {
    return {
      ...JSON.parse(JSON.stringify(base)),
      mode: 'fixed', name: 'papai', sex: 'm', goalType: 'cut',
      guide: {
        line: '1.900 kcal · 150 g de proteína · 3 L de água',
        sub: 'Treino 5:30 · seg A · ter B · qua C · qui A · sex B · fim de semana descanso ativo. Perder 0,5–0,8 kg por semana.',
        care: [{ t: '⚠️ Proteção da coluna (L4–L5)', items: [
          '<b>Proibidos nos 90 dias:</b> levantamento terra, agachamento livre com barra nas costas, stiff, bom-dia, remada curvada, abdominal tradicional, rotação com carga, qualquer exercício que arredonde a lombar com peso.',
          '<b>Pare na hora</b> se a dor irradiar para a perna ou houver formigamento ou dormência. Mostre o treino ao ortopedista ou fisioterapeuta.',
          'Às 5:30 os discos estão mais hidratados e sensíveis à flexão: evite dobrar a coluna nos primeiros 30–45 min do dia.',
          'Registre a dor lombar de 0 a 10 em todo treino.'] }],
        painLabel: 'Dor lombar hoje',
        footer: 'Este plano não substitui acompanhamento profissional. Por causa do abaulamento em L4–L5, valide o treino com ortopedista ou fisioterapeuta.'
      },
      routine: [['05:00', 'Acordar, café preto'], ['05:30', 'Treino (até 07:00)'], ['22:00', 'Dormir (mínimo 7 h)']]
    };
  }

  window.PlanGen = { CONDITIONS, GOALS, ACT, build, fixed, bodyFat, targets, ageOf };
})();
