// Envia o lembrete de água para os celulares cadastrados.
// Cadastro = issue aberta pelo dono do repositório com título "[lembretes] ..." e o JSON da inscrição no corpo
// (o app cria esse texto em Guia → Lembretes de água).
import webpush from 'web-push';

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, GITHUB_TOKEN, REPO, OWNER } = process.env;
if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) throw new Error('Faltam os segredos VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY');
webpush.setVapidDetails(`https://github.com/${REPO}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

async function gh(path, init = {}) {
  const r = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {})
    }
  });
  if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}

const issues = await gh(`/repos/${REPO}/issues?state=open&creator=${OWNER}&per_page=100`);
const seen = new Set();
const subs = [];
for (const i of issues) {
  if (i.pull_request || !i.title.startsWith('[lembretes]')) continue;
  const m = (i.body || '').match(/\{[\s\S]*\}/);
  try {
    const sub = JSON.parse(m[0]);
    if (!sub.endpoint || seen.has(sub.endpoint)) continue;
    seen.add(sub.endpoint); subs.push({ issue: i.number, sub });
  } catch { console.log(`Issue #${i.number}: não achei a inscrição no texto, ignorando.`); }
}
console.log(`${subs.length} celular(es) cadastrado(s).`);

const h = (new Date().getUTCHours() + 21) % 24; // hora de Brasília
const msgs = {
  7: 'Bom dia! Primeira garrafa de 500 ml do dia 💧',
  9: 'Bebeu sua garrafa de 500 ml? 💧',
  11: 'Antes do almoço: mais 500 ml 💧',
  13: 'Metade do dia — como está a água? 💧',
  15: 'Garrafa de 500 ml da tarde 💧',
  17: 'Bebeu sua garrafa de 500 ml? Faltam poucas 💧',
  19: 'Reta final: confira se bateu os 3 L 💧',
  21: 'Última chamada da água de hoje 💧'
};
const body = msgs[h] || 'Bebeu sua garrafa de 500 ml? 💧';

for (const { issue, sub } of subs) {
  try {
    await webpush.sendNotification(sub, JSON.stringify({ title: '💧 Hora da água', body }), { TTL: 3600, urgency: 'high' });
    console.log(`Enviado (issue #${issue}).`);
  } catch (e) {
    console.log(`Falhou (issue #${issue}): ${e.statusCode} ${e.body || e.message}`);
    if (e.statusCode === 404 || e.statusCode === 410) {
      await gh(`/repos/${REPO}/issues/${issue}/comments`, { method: 'POST', body: JSON.stringify({ body: 'Este celular não recebe mais notificações (inscrição expirada). Fechando. Para voltar, ative os lembretes de novo no app.' }) });
      await gh(`/repos/${REPO}/issues/${issue}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed' }) });
    }
  }
}
