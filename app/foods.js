/* Tabela de alimentos para estimar calorias pelo texto (valores aproximados, base TACO/rótulos).
   Cada item: [nomes separados por |, kcal por 100 g, proteína por 100 g, porção padrão em g, unidades próprias {unidade: g}]
   Para acrescentar um alimento, copie uma linha e ajuste. */
(function () {
  const F = [
    // ovos
    ['ovo frito|ovos fritos', 240, 15.6, 50],
    ['ovo|ovo cozido|ovo mexido|ovos mexidos|ovo poche', 143, 13, 50],
    ['omelete|omelete de queijo', 154, 11, 120],
    ['clara|clara de ovo', 52, 11, 33],
    // pães e cereais
    ['pao frances|pao de sal|pao carioca|pao|paozinho', 300, 8, 50, { fatia: 25 }],
    ['pao integral|pao de forma integral', 253, 9.4, 25],
    ['pao de forma|pao de forma branco', 265, 8, 25],
    ['pao de queijo', 330, 5, 40],
    ['pao sirio|pao arabe', 275, 9, 60],
    ['bisnaguinha', 300, 8, 20],
    ['torrada', 400, 10, 10],
    ['wrap|rap10|tortilha', 300, 8, 40],
    ['tapioca', 240, 0.2, 70],
    ['cuscuz|cuscuz nordestino', 112, 2.2, 150],
    ['biscoito cream cracker|cream cracker|bolacha agua e sal|biscoito agua e sal', 430, 10, 6, { pacote: 26 }],
    ['biscoito recheado|bolacha recheada|oreo|negresco', 470, 5, 13, { pacote: 130 }],
    ['biscoito maizena|bolacha maizena|biscoito maria', 440, 8, 5],
    ['biscoito|bolacha', 440, 8, 7, { pacote: 130 }],
    ['aveia|farelo de aveia', 394, 14, 30, { colher: 15 }],
    ['granola', 420, 10, 40, { colher: 12 }],
    ['sucrilhos|cereal matinal|cereal', 380, 7, 30],
    // laticínios
    ['cafe com leite|pingado', 45, 2, 200],
    ['leite desnatado', 35, 3.4, 200],
    ['leite semidesnatado', 45, 3.3, 200],
    ['leite|leite integral', 61, 3.2, 200],
    ['leite com achocolatado|achocolatado|nescau|toddy|toddynho', 85, 3, 250, { colher: 10 }],
    ['iogurte grego', 115, 5.5, 100],
    ['iogurte natural|iogurte desnatado', 51, 4, 170],
    ['iogurte|danone|danoninho', 85, 3, 170],
    ['leite fermentado|yakult', 70, 1, 80],
    ['queijo mussarela|mussarela|muçarela|queijo mucarela', 300, 22, 20],
    ['queijo prato', 360, 23, 20],
    ['queijo minas|queijo branco|queijo frescal|queijo', 264, 17, 30],
    ['queijo cottage|cottage', 98, 11, 50, { colher: 25 }],
    ['ricota', 140, 11, 40],
    ['requeijao|catupiry|cream cheese', 260, 9, 15],
    ['manteiga', 726, 0.4, 10, { colher: 10, ponta: 5 }],
    ['margarina', 600, 0, 10, { colher: 10, ponta: 5 }],
    ['creme de leite', 220, 2, 15],
    ['leite condensado', 320, 8, 20],
    ['whey|whey protein|proteina em po', 400, 80, 30, { dose: 30, scoop: 30, medida: 30, colher: 15 }],
    // ---- carne de boi (grelhada/assada, por 100 g) ----
    ['patinho|bife de patinho|patinho moido', 219, 35.9, 100, { bife: 100, pedaco: 60, colher: 25, fatia: 60 }],
    ['coxao mole|chã de dentro|cha de dentro', 219, 32, 100, { bife: 100, pedaco: 60, fatia: 60 }],
    ['coxao duro|chã de fora|cha de fora', 217, 31, 100, { bife: 100, pedaco: 60, fatia: 60 }],
    ['lagarto|carne assada|rosbife', 200, 30, 100, { fatia: 50, pedaco: 60 }],
    ['file mignon|medalhao|mignon', 220, 32, 120, { bife: 120, medalhao: 120, pedaco: 60 }],
    ['alcatra|bife de alcatra|miolo de alcatra|baby beef|top sirloin', 235, 32, 120, { bife: 120, fatia: 60, pedaco: 60 }],
    ['maminha|maminha de alcatra', 230, 30, 120, { fatia: 60, pedaco: 60 }],
    ['fraldinha|vazio', 250, 28, 120, { fatia: 60, pedaco: 60 }],
    ['contra file|contrafile|bife ancho|ancho|chorizo|entrecot|entrecote|bife de chorizo', 278, 32, 150, { bife: 150, fatia: 60, pedaco: 60 }],
    ['picanha|picanha bovina|picanha de boi', 290, 26, 120, { fatia: 60, pedaco: 60 }],
    ['cupim', 330, 20, 120, { fatia: 60, pedaco: 60 }],
    ['acem|carne de panela|carne cozida|paleta|peito bovino|carne de segunda', 215, 27, 120, { pedaco: 60, fatia: 60, colher: 25 }],
    ['musculo|ossobuco', 190, 31, 120, { pedaco: 60, colher: 25 }],
    ['costela|costela bovina|costela de boi|costela no bafo|janela', 370, 20, 150, { pedaco: 150 }],
    ['chuleta|t bone|t-bone|bisteca bovina', 290, 25, 200, { bife: 200 }],
    ['carne moida|carne moida refogada|moida', 212, 27, 100, { colher: 25 }],
    ['carne seca|charque|jabá|jaba', 250, 31, 80, { colher: 25, pedaco: 40 }],
    ['carne de sol', 260, 30, 100, { pedaco: 60 }],
    ['figado|bife de figado|figado acebolado', 190, 27, 100, { bife: 100 }],
    ['lingua|lingua bovina', 230, 19, 100, { fatia: 30 }],
    ['rabada', 300, 20, 150],
    ['dobradinha|bucho', 130, 20, 150],
    ['churrasco|espetinho de carne|espeto de carne', 260, 27, 120, { espeto: 90, espetinho: 90, pedaco: 60 }],
    ['bife|carne|carne vermelha|carne magra|carne grelhada', 219, 32, 100, { bife: 100, pedaco: 60, colher: 25, fatia: 60 }],
    // ---- carne de porco ----
    ['picanha de porco|picanha suina|picanha de porco assada', 260, 26, 120, { fatia: 60, pedaco: 60 }],
    ['lombo|lombo de porco|lombo suino|lombinho|lombo assado|file suino|file de porco|file mignon suino|mignon suino', 210, 35.7, 120, { fatia: 50, bife: 100, pedaco: 60, medalhao: 80 }],
    ['pernil|pernil de porco|pernil assado|pernil suino', 262, 32, 120, { fatia: 60, pedaco: 60 }],
    ['bisteca|bisteca de porco|bisteca suina|costeleta de porco|costeleta suina', 280, 29, 120, { bife: 120, unidade: 120 }],
    ['costelinha|costelinha de porco|costela de porco|costela suina|costelinha suina|costelinha barbecue', 400, 26, 150, { pedaco: 50, ripa: 150 }],
    ['carre|carre de porco|carre suino', 230, 28, 150],
    ['copa lombo|sobrepaleta|paleta suina|paleta de porco', 250, 22, 120, { fatia: 60, pedaco: 60 }],
    ['panceta|barriga de porco|pancetta', 500, 15, 80, { fatia: 40, pedaco: 40 }],
    ['torresmo|pururuca', 550, 30, 30, { pedaco: 10, porcao: 100 }],
    ['carne de porco|porco|suino|carne suina', 250, 28, 120, { bife: 100, pedaco: 60, fatia: 60 }],
    // ---- aves ----
    ['frango grelhado|peito de frango|file de frango|frango desfiado|frango cozido|frango|sassami|peito', 160, 32, 120, { file: 120, bife: 100, pedaco: 80, colher: 25 }],
    ['coxa de frango|sobrecoxa|frango assado|coxa e sobrecoxa|coxa|sobrecoxa assada', 215, 26, 90, { pedaco: 90, unidade: 90 }],
    ['frango frito|asa de frango|coxinha da asa|tulipa|frango a passarinho|asinha', 260, 24, 90, { pedaco: 40, unidade: 40 }],
    ['frango empanado|nuggets|nugget|file de frango empanado', 270, 15, 20, { file: 120 }],
    ['coracao de frango|coracao|coracaozinho', 207, 22, 100, { espeto: 80, espetinho: 80, unidade: 6 }],
    ['moela|moela de frango', 150, 25, 100],
    ['peru|peito de peru assado|chester|tender', 160, 26, 100, { fatia: 30 }],
    ['pato|marreco', 240, 23, 120],
    // ---- outras carnes ----
    ['cordeiro|carneiro|costela de cordeiro|pernil de cordeiro|cabrito|bode', 260, 25, 120, { pedaco: 60 }],
    ['coelho', 170, 30, 120],
    // ---- peixes e frutos do mar ----
    ['peixe|tilapia|merluza|pescada|file de peixe|cacao|linguado|robalo|pescada amarela|saint peter|panga|badejo', 125, 26, 120, { file: 120, posta: 150, pedaco: 80 }],
    ['peixe frito|file de peixe frito|peixe empanado|isca de peixe', 230, 20, 120, { file: 120, isca: 15 }],
    ['salmao|truta', 210, 23, 120, { file: 120, posta: 150 }],
    ['bacalhau|bacalhoada', 140, 30, 120, { posta: 150, lasca: 30 }],
    ['atum|atum em lata|atum em agua|atum fresco', 117, 26, 60, { lata: 120, colher: 20, posta: 150 }],
    ['sardinha|sardinha em lata|sardinha frita', 200, 24, 80, { lata: 84, unidade: 40 }],
    ['camarao|camarao frito|camarao alho e oleo', 100, 21, 100, { unidade: 10, colher: 25 }],
    ['lula|polvo|mexilhao|marisco|siri|caranguejo', 95, 18, 100],
    // ---- embutidos ----
    ['linguica|calabresa|linguica toscana|linguica de frango|linguica de porco', 300, 16, 60, { gomo: 60, fatia: 10, rodela: 6 }],
    ['salsicha', 260, 12, 45],
    ['presunto', 94, 14, 15],
    ['peito de peru|blanquet', 100, 16, 15],
    ['mortadela|salame', 300, 14, 15],
    ['bacon', 500, 30, 15, { fatia: 8, tira: 8 }],
    ['hamburguer de carne|hamburguer caseiro|carne de hamburguer|burger', 250, 17, 90],
    ['tofu', 76, 8, 100],
    // arroz, massas, feijão, tubérculos
    ['arroz integral', 124, 2.6, 120, { colher: 30, escumadeira: 90 }],
    ['arroz|arroz branco', 128, 2.5, 120, { colher: 30, escumadeira: 90 }],
    ['feijao tropeiro|tropeiro', 230, 9, 150, { colher: 30 }],
    ['feijoada', 150, 9, 250, { concha: 150 }],
    ['feijao|caldo de feijao', 76, 4.8, 140, { concha: 140, colher: 20 }],
    ['lentilha', 93, 6, 100, { concha: 140, colher: 20 }],
    ['grao de bico', 164, 9, 100, { colher: 22 }],
    ['ervilha', 75, 5, 60, { colher: 20 }],
    ['milho|milho verde', 98, 3, 60, { colher: 20, espiga: 100 }],
    ['macarrao|espaguete|massa|miojo|macarrao instantaneo', 158, 5.8, 200, { colher: 25, pegador: 100, pacote: 400 }],
    ['lasanha', 160, 9, 300, { pedaco: 300, fatia: 300 }],
    ['nhoque', 130, 3, 200],
    ['batata frita|fritas', 274, 3.4, 100, { porcao: 150 }],
    ['pure de batata|pure', 90, 2, 150, { colher: 40 }],
    ['batata doce', 77, 0.6, 150, { colher: 40, fatia: 40 }],
    ['batata|batata cozida|batata inglesa|batata assada', 52, 1.2, 150, { colher: 40, fatia: 30 }],
    ['mandioca|aipim|macaxeira|mandioca cozida', 125, 0.6, 150, { pedaco: 60, colher: 40 }],
    ['mandioca frita|aipim frito', 300, 1.5, 100],
    ['inhame|cara', 97, 2, 150],
    ['farofa', 400, 2, 30, { colher: 15 }],
    ['farinha|farinha de mandioca', 360, 1.5, 20, { colher: 15 }],
    ['polenta|angu', 70, 1.6, 150],
    ['polenta frita', 280, 2, 100],
    ['quinoa', 120, 4.4, 100, { colher: 20 }],
    ['pipoca', 400, 9, 25, { saco: 100, pacote: 100, balde: 120 }],
    // frutas
    ['banana', 98, 1.3, 80],
    ['maca', 56, 0.3, 130],
    ['laranja', 46, 1, 140],
    ['tangerina|mexerica|bergamota|ponkan', 38, 0.8, 130],
    ['mamao|papaia', 40, 0.5, 150, { fatia: 150 }],
    ['melancia', 33, 0.9, 200, { fatia: 200 }],
    ['melao', 30, 0.7, 150, { fatia: 120 }],
    ['manga', 64, 0.4, 200],
    ['abacaxi', 48, 1, 100, { fatia: 100, rodela: 100 }],
    ['uva', 60, 0.6, 100, { cacho: 150 }],
    ['morango', 30, 0.9, 12],
    ['pera', 53, 0.6, 130],
    ['abacate', 96, 1.2, 100, { colher: 30 }],
    ['kiwi', 51, 1.1, 75],
    ['goiaba', 54, 1, 150],
    ['caqui', 71, 0.4, 150],
    ['acai', 110, 1, 300, { tigela: 300, copo: 300 }],
    ['salada de frutas', 55, 0.7, 200],
    ['fruta', 55, 0.7, 130],
    // verduras e legumes
    ['salada|alface|rucula|agriao|folhas|couve', 15, 1.2, 80, { prato: 80 }],
    ['tomate', 15, 1, 80, { rodela: 15, fatia: 15 }],
    ['pepino', 10, 0.7, 60],
    ['cenoura', 34, 1, 60, { colher: 20 }],
    ['beterraba', 32, 1.3, 60, { colher: 20 }],
    ['brocolis|couve flor|couve-flor', 25, 2.1, 80, { ramo: 25 }],
    ['abobrinha|chuchu|vagem|berinjela|quiabo|jilo|repolho|legume|legumes|verdura|verduras', 25, 1.3, 100, { colher: 25 }],
    ['abobora|moranga', 40, 1, 100, { colher: 30 }],
    ['sopa|caldo|canja', 50, 3, 300, { concha: 150, prato: 300 }],
    // gorduras e oleaginosas
    ['azeite|azeite de oliva', 884, 0, 8, { colher: 8, fio: 5 }],
    ['oleo', 884, 0, 8, { colher: 8 }],
    ['pasta de amendoim|manteiga de amendoim', 590, 25, 15, { colher: 15 }],
    ['amendoim', 580, 26, 30, { punhado: 30, colher: 15 }],
    ['castanha do para|castanha-do-para', 650, 14, 4],
    ['castanha de caju|castanha', 580, 18, 2.5, { punhado: 30 }],
    ['nozes|noz|amendoas|amendoa|mix de castanhas', 620, 18, 4, { punhado: 30 }],
    ['chia|linhaca', 490, 17, 10, { colher: 10 }],
    // doces e beliscos
    ['acucar|acucar mascavo', 387, 0, 5, { colher: 12 }],
    ['adocante', 0, 0, 1],
    ['mel', 309, 0.3, 15, { colher: 15 }],
    ['doce de leite', 315, 5, 20, { colher: 20 }],
    ['geleia', 250, 0.4, 15, { colher: 15 }],
    ['chocolate|barra de chocolate|bombom|kit kat|kitkat|bis', 540, 7, 25, { quadrado: 5, quadradinho: 5, barra: 90, tablete: 25 }],
    ['brigadeiro|beijinho|docinho', 400, 4, 20],
    ['bolo|bolo de chocolate|bolo de cenoura|bolo de fuba', 350, 5, 60, { fatia: 60, pedaco: 60 }],
    ['sorvete|picole|acai na tigela com leite condensado', 200, 4, 100, { bola: 60 }],
    ['pudim', 280, 6, 100, { fatia: 100, pedaco: 100 }],
    ['gelatina', 60, 1.5, 120],
    ['paçoca|pacoca|pacoquinha', 480, 15, 20],
    ['batata chips|chips|salgadinho|doritos|ruffles|cheetos', 530, 6, 30, { pacote: 45 }],
    ['barra de cereal|barrinha de cereal', 380, 5, 25],
    ['barra de proteina|barrinha de proteina', 350, 30, 45],
    // salgados e lanches
    ['pizza', 270, 11, 110, { fatia: 110, pedaco: 110 }],
    ['x burguer|x-burguer|x salada|x-salada|x tudo|x-tudo|hamburguer|lanche|sanduiche de lanchonete|big mac', 255, 13, 220],
    ['misto quente|misto', 270, 14, 110],
    ['sanduiche natural|sanduiche|sanduba|sanduiche de', 220, 12, 150],
    ['cachorro quente|hot dog', 250, 9, 170],
    ['coxinha|kibe|quibe|risole|bolinha de queijo|enroladinho|salgado|salgadinho de festa', 290, 9, 80],
    ['pastel', 300, 8, 100],
    ['esfiha|esfirra', 270, 9, 80],
    ['empada|empadinha', 380, 8, 50],
    ['pao de batata', 290, 7, 70],
    ['croissant', 410, 8, 60],
    ['pao doce|sonho|rosca|donut', 340, 7, 70],
    ['strogonoff|estrogonofe', 160, 10, 200, { colher: 30, concha: 150 }],
    ['escondidinho', 130, 8, 250],
    ['prato feito|pf|marmita|marmitex|prato de comida', 150, 7, 450],
    ['parmegiana|parmegiana de frango|bife a parmegiana', 220, 16, 200],
    ['yakisoba', 120, 6, 400],
    ['sushi|temaki|sashimi', 150, 6, 30, { temaki: 160, combinado: 300 }],
    // bebidas
    ['cafe|cafe preto|cafe sem acucar|expresso|cafezinho', 2, 0.1, 60, { xicara: 60, copo: 150 }],
    ['cafe com acucar|cafe adocado', 30, 0.1, 60, { xicara: 60, copo: 150 }],
    ['capuccino|cappuccino', 80, 2.5, 200],
    ['cha', 1, 0, 200],
    ['refrigerante zero|refri zero|coca zero|coca-cola zero|guarana zero|refrigerante diet', 0, 0, 350, { lata: 350, copo: 250, garrafa: 600 }],
    ['refrigerante|refri|coca|coca-cola|guarana|fanta|sprite|pepsi', 42, 0, 350, { lata: 350, copo: 250, garrafa: 600 }],
    ['suco de caixinha|suco de caixa|del valle|tang|suco em po', 55, 0.2, 250, { caixinha: 200 }],
    ['suco|suco natural|suco de laranja|suco de fruta', 45, 0.5, 250],
    ['vitamina|vitamina de banana|smoothie', 90, 3, 300],
    ['agua de coco', 22, 0, 300],
    ['caldo de cana|garapa', 70, 0, 300],
    ['energetico|red bull|monster', 45, 0, 250, { lata: 250 }],
    ['isotonico|gatorade', 25, 0, 500],
    ['cerveja|chopp|chope|latao', 43, 0.4, 350, { lata: 350, latao: 473, long: 355, garrafa: 600, copo: 300, tulipa: 300 }],
    ['vinho', 85, 0.1, 150, { taca: 150 }],
    ['cachaca|pinga|whisky|uisque|vodka|vodca|gin|dose', 230, 0, 50, { dose: 50 }],
    ['caipirinha|drink|drinque', 150, 0, 250],
    ['agua|agua com gas', 0, 0, 500],
    ['creatina', 0, 0, 5],
  ];

  // singular simples (pães → pão, integrais → integral, ovos → ovo)
  const KEEP = new Set(['tres', 'mais', 'menos', 'pires', 'lapis', 'arroz', 'gas', 'atras', 'tenis', 'oes']);
  const sing = w => {
    if (w.length <= 3 || KEEP.has(w)) return w;
    if (/(oes|aes|aos)$/.test(w)) return w.slice(0, -3) + 'ao';
    if (/ais$/.test(w)) return w.slice(0, -3) + 'al';
    if (/eis$/.test(w)) return w.slice(0, -3) + 'el';
    if (/(res|zes|les)$/.test(w)) return w.slice(0, -2);
    if (/s$/.test(w)) return w.slice(0, -1);
    return w;
  };
  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/(\d)\s*,\s*(\d)/g, '$1.$2').replace(/-/g, ' ').replace(/[^a-z0-9./]+/g, ' ')
    .split(' ').filter(Boolean).map(sing).join(' ');

  const ACC = { pao: 'pão', frances: 'francês', feijao: 'feijão', macarrao: 'macarrão', requeijao: 'requeijão', maca: 'maçã', mamao: 'mamão', melao: 'melão',
    acucar: 'açúcar', cafe: 'café', cha: 'chá', salmao: 'salmão', camarao: 'camarão', file: 'filé', pure: 'purê', linguica: 'linguiça', brocolis: 'brócolis',
    abobora: 'abóbora', agua: 'água', acai: 'açaí', cachaca: 'cachaça', grao: 'grão', sirio: 'sírio', proteina: 'proteína', energetico: 'energético',
    isotonico: 'isotônico', figado: 'fígado', tilapia: 'tilápia', hamburguer: 'hambúrguer', parmegiana: 'parmegiana', cuscuz: 'cuscuz', oleo: 'óleo', geleia: 'geleia', amendoim: 'amendoim', mussarela: 'muçarela', sanduiche: 'sanduíche', coxao: 'coxão', acem: 'acém', musculo: 'músculo', carre: 'carré', suina: 'suína', suino: 'suíno', lingua: 'língua', coracao: 'coração', cacao: 'cação', medalhao: 'medalhão', cha: 'chá', jaba: 'jabá', file: 'filé' };
  const foods = F.map(([names, kcal, prot, d, units]) => {
    const all = names.split('|').map(n => n.trim());
    return { name: all[0].split(' ').map(w => ACC[w] || w).join(' '), keys: all.map(norm), kcal, prot, d, units: units ? Object.fromEntries(Object.entries(units).map(([k, v]) => [norm(k), v])) : {} };
  });
  const keyList = [];
  foods.forEach(f => f.keys.forEach(k => keyList.push({ k, f })));
  keyList.sort((a, b) => b.k.length - a.k.length);

  const NUMW = { um: 1, uma: 1, dois: 2, dua: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, meia: 0.5, meio: 0.5, metade: 0.5, duzia: 12 };
  // unidades genéricas em gramas (quando o alimento não define a sua)
  const UNITS = {
    colher: 25, colherinha: 5, 'colher de cha': 5, 'colher de sopa': null, concha: 140, escumadeira: 90, fatia: 25, rodela: 10,
    xicara: 200, copo: 250, caneca: 300, taca: 150, lata: 350, garrafa: 600, prato: 300, porcao: null, pedaco: null,
    unidade: null, un: null, file: 120, bife: 100, pote: 170, potinho: 100, pacote: null, punhado: 30, dose: 30, scoop: 30, medida: 30,
    tigela: 300, gomo: 60, quadrado: 5, barra: 90, saco: 100, bola: 60, pegador: 100, fio: 5, ponta: 5, tira: 8, ramo: 25, espiga: 100, cacho: 150, long: 355, latao: 473,
    posta: 150, espeto: 90, espetinho: 90, medalhao: 100, ripa: 150, lasca: 30, isca: 15, tablete: 25, quadradinho: 5, caixinha: 200, temaki: 160, combinado: 300, tulipa: 300
  };
  const unitKeys = Object.keys(UNITS).map(u => [norm(u), u]).sort((a, b) => b[0].length - a[0].length);
  const SIZE = { pequeno: 0.7, pequena: 0.7, grande: 1.4, generoso: 1.4, generosa: 1.4, cheio: 1.3, cheia: 1.3, rasa: 0.7, raso: 0.7, duplo: 2, dupla: 2 };

  const re = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parseNum = t => {
    if (t == null) return null;
    if (/^\d+\/\d+$/.test(t)) { const [a, b] = t.split('/'); return +a / +b; }
    if (/^\d+(\.\d+)?$/.test(t)) return +t;
    return NUMW[t] != null ? NUMW[t] : null;
  };

  // lê quantidade + unidade num trecho de texto ("2 fatia de", "150 g de", "meia xicara de")
  function readQty(txt, atEnd) {
    const words = txt.trim().split(' ').filter(Boolean);
    if (!words.length) return {};
    let qty = null, unit = null, grams = null, size = 1;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const g = w.match(/^(\d+(?:\.\d+)?)(g|gr|grama|kg|ml|l)$/);
      if (g) { const v = +g[1]; grams = /kg|^l$/.test(g[2]) ? v * 1000 : v; continue; }
      if (/^(g|gr|grama|ml)$/.test(w) && qty != null) { grams = qty; qty = null; continue; }
      if (/^(kg|litro|l)$/.test(w) && qty != null) { grams = qty * 1000; qty = null; continue; }
      if (SIZE[w]) { size *= SIZE[w]; continue; }
      const n = parseNum(w);
      if (n != null) { qty = qty != null && n === 0.5 ? qty + 0.5 : n; continue; }
      const rest = words.slice(i).join(' ');
      const u = unitKeys.find(([k]) => rest === k || rest.startsWith(k + ' '));
      if (u) { unit = u[1] === 'colher de sopa' ? 'colher' : u[1]; i += u[0].split(' ').length - 1; continue; }
    }
    return { qty, unit, grams, size, any: qty != null || unit != null || grams != null || size !== 1 };
  }

  function estimate(text) {
    const segs = (text || '').split(/[,;\n+]|\s+e\s+|\s+mais\s+/i).map(norm).filter(Boolean);
    const items = [], unknown = [];
    for (const seg of segs) {
      const found = [];
      let s = ' ' + seg + ' ';
      for (const { k, f } of keyList) {
        const r = new RegExp(' ' + re(k) + ' ');
        let m;
        while ((m = r.exec(s))) {
          found.push({ f, start: m.index, end: m.index + m[0].length - 1 });
          s = s.slice(0, m.index) + ' ' + '#'.repeat(m[0].length - 2) + ' ' + s.slice(m.index + m[0].length);
        }
      }
      if (!found.length) {
        if (!/^(com|sem|de|do|da|e|um|uma|so|tambem|pouco|pouca)( |$)/.test(seg) || seg.split(' ').length > 2) unknown.push(seg);
        continue;
      }
      found.sort((a, b) => a.start - b.start);
      const orig = ' ' + seg + ' ';
      found.forEach((it, i) => {
        const before = orig.slice(i ? found[i - 1].end : 0, it.start);
        const after = orig.slice(it.end, i < found.length - 1 ? found[i + 1].start : orig.length);
        let q = readQty(before);
        const qa = readQty(after);
        if (!q.any && qa.any) q = qa;
        else if (qa.grams != null && q.grams == null) q.grams = qa.grams;
        if (qa.size !== 1 && q.size === 1) q.size = qa.size;
        const f = it.f;
        let grams;
        if (q.grams != null) grams = q.grams;
        else {
          const per = q.unit ? (f.units[norm(q.unit)] != null ? f.units[norm(q.unit)] : UNITS[q.unit] != null ? UNITS[q.unit] : f.d) : f.d;
          grams = (q.qty != null ? q.qty : 1) * per;
        }
        grams *= q.size || 1;
        items.push({ name: f.name, qty: q.qty, unit: q.unit, grams: Math.round(grams), unitG: f.d,
          kcal: Math.round(grams * f.kcal / 100), prot: Math.round(grams * f.prot / 10) / 10, kcal100: f.kcal, prot100: f.prot });
      });
    }
    const kcal = items.reduce((a, b) => a + b.kcal, 0), prot = Math.round(items.reduce((a, b) => a + b.prot, 0));
    return { items, unknown, kcal, prot };
  }

  window.FOOD = { estimate, norm, count: foods.length };
})();
