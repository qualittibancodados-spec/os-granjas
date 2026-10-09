/* =====================================================================
   OS Granjas — protótipo de interface (do zero)
   Usa a mesma API do sistema real (sb.from / sb.rpc / sb.functions),
   aqui ligada a um simulador com dados de exemplo.
   ===================================================================== */
"use strict";
const C = window.CONFIG;
const VERSAO = "8.0";
// Toda chamada ao servidor tem prazo: com sinal fraco, em vez de ficar "carregando" para sempre, avisa e deixa tentar de novo
function fetchComPrazo(url, opts = {}) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), 20000);
  opts.signal?.addEventListener("abort", () => c.abort());
  return fetch(url, { ...opts, signal: c.signal }).finally(() => clearTimeout(t));
}
const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { global: { fetch: fetchComPrazo } });
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const TZ = "America/Sao_Paulo";
const isMob = () => matchMedia("(max-width: 860px)").matches;

/* ---------------- ícones (traço Lucide) ---------------- */
const P = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .7-1.5l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  list: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  pin: '<path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  cog: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  back: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  send: '<path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.94l7.93 3.18a2 2 0 0 1 1.11 1.11zM21.85 2.15 10.91 13.09"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  box: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12"/><path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  fan: '<path d="M10.83 12.66a2 2 0 1 1 2.34-3.32M12 12c-4 0-7-2-7-5a3 3 0 0 1 6 0M12 12c0 4-2 7-5 7a3 3 0 0 1 0-6M12 12c4 0 7 2 7 5a3 3 0 0 1-6 0M12 12c0-4 2-7 5-7a3 3 0 0 1 0 6"/>',
  wheat: '<path d="M2 22 16 8M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94ZM7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94ZM11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  blinds: '<path d="M3 3h18M20 7H8M20 11H8M10 19h10M8 15h12M4 3v14"/><circle cx="4" cy="19" r="2"/>',
  cloud: '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.24M16 14v6M8 14v6M12 16v6"/>',
  silo: '<path d="M6 21V8a6 6 0 0 1 12 0v13M4 21h16M6 12h12M6 16h12"/>',
  roof: '<path d="M3 11 12 4l9 7M5 10v10h14V10M9 20v-6h6v6"/>',
  gate: '<path d="M3 21V5M21 21V5M3 9h18M3 15h18M8 9v6M13 9v6M18 9v6"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2M15 18H9M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  coffee: '<path d="M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  wifioff: '<path d="M12 20h.01M8.5 16.43a5 5 0 0 1 7 0M2 8.82a15 15 0 0 1 4.17-2.65M10.66 5c4.01-.36 8.14.9 11.34 3.76M16.85 11.25a10 10 0 0 1 2.22 1.68M5 13a10 10 0 0 1 5.24-2.76M2 2l20 20"/>',
  bell: '<path d="M10.27 21a2 2 0 0 0 3.46 0M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  sheet: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
  battery: '<rect width="16" height="10" x="2" y="7" rx="2"/><path d="M22 11v2M6 11v2M10 11v2"/>',
};
const ic = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;

/* ---------------- domínio ---------------- */
const STATUS = {
  "ABERTA": { rot: "Aberta", c: "var(--s-aberta)", i: "inbox" },
  "DIRECIONADA": { rot: "Direcionada", c: "var(--s-direcionada)", i: "send" },
  "EM ATENDIMENTO": { rot: "Em atendimento", c: "var(--s-atendimento)", i: "tool" },
  "AGUARDANDO CONFIRMAÇÃO": { rot: "Aguardando confirmação", c: "var(--s-aguardando)", i: "clock" },
  "PENDENTE DE ATENDIMENTO": { rot: "Pendente", c: "var(--s-pendente)", i: "undo" },
  "CONCLUÍDA": { rot: "Concluída", c: "var(--s-concluida)", i: "checkc" },
};
const ABERTOS = ["ABERTA", "DIRECIONADA", "EM ATENDIMENTO", "AGUARDANDO CONFIRMAÇÃO", "PENDENTE DE ATENDIMENTO"];
const PRIO = {
  EMERGENCIA: { rot: "Emergência", n: 4, desc: "Risco imediato às aves ou às pessoas: sem água, ventilação ou energia; risco elétrico." },
  ALTA: { rot: "Alta", n: 3, desc: "Afeta o lote, mas há contorno provisório." },
  MEDIA: { rot: "Média", n: 2, desc: "Atrapalha a rotina, sem efeito direto no lote nos próximos dias." },
  BAIXA: { rot: "Baixa", n: 1, desc: "Pode ser programada: cerca, pintura, roçada, aviário vazio." },
};
const PCOR = { EMERGENCIA: "#D11A2A", ALTA: "#D9590B", MEDIA: "#C9A227", BAIXA: "#9AA0A8" };
const PERFIS = {
  tecnico: { nome: "Técnico Agropecuário", faz: "abre e confirma OS" },
  gestor: { nome: "Gestor de Manutenção", faz: "classifica e direciona" },
  manutentor: { nome: "Manutentor", faz: "executa OS" },
  gerente: { nome: "Gerente das Granjas", faz: "acompanha o painel" },
  admin: { nome: "Administrador", faz: "gerencia acessos" },
};
const EQUIP = [
  ["Linha de ração", "wheat"], ["Linha de água / bebedouros", "drop"], ["Comedouros", "wheat"], ["Exaustores / ventilação", "fan"],
  ["Cortinas", "blinds"], ["Nebulização / resfriamento", "cloud"], ["Aquecimento / fornalha", "flame"], ["Elétrica / iluminação", "zap"],
  ["Silo", "silo"], ["Estrutura / telhado", "roof"], ["Portão / cerca", "gate"], ["Gerador", "battery"],
];
// Pausas do atendimento (lim = minutos a partir dos quais o cartão alerta)
const MOTIVOS = {
  ALMOCO: { rot: "Almoço / intervalo", i: "coffee", lim: 90 },
  PECA: { rot: "Aguardando peça ou material", i: "box", lim: null },
  EXPEDIENTE: { rot: "Fim do expediente", i: "moon", lim: 16 * 60 },
  OUTRA_OS: { rot: "Atender outra OS", i: "alert", lim: null },
  OUTRO: { rot: "Outro motivo", i: "dots", lim: 120 },
  // etapas do atendimento: contam como TRABALHO (horas), mas não como execução do serviço
  DESLOCAMENTO: { rot: "Deslocamento", i: "truck", lim: 90, etapa: "Em deslocamento", volta: "Cheguei · iniciar serviço" },
  MATERIAL: { rot: "Buscando material (almoxarifado)", i: "box", lim: 60, etapa: "Buscando material", volta: "Voltei · continuar serviço" },
};
const ehEtapa = (m) => !!MOTIVOS[m]?.etapa;
const pausaMin = (o) => (o.pausada_em ? (Date.now() - new Date(o.pausada_em)) / 6e4 : 0);
const pausaLonga = (o) => o.pausada_em && MOTIVOS[o.pausa_motivo]?.lim != null && pausaMin(o) > MOTIVOS[o.pausa_motivo].lim;
const UNIDADES = ["un", "m", "kg", "L", "pç", "cx", "rolo", "par"];

/* ---------------- formatação ---------------- */
const osId = (n) => `OS-${String(n).padStart(4, "0")}`;
const fmtDH = (ts) => ts ? new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(ts)).replace(",", " ·") : "—";
function fmtMin(m) {
  if (m == null || isNaN(m)) return "—";
  m = Math.max(0, Math.round(+m));
  if (m < 60) return `${m} min`;
  if (m < 1440) { const h = Math.floor(m / 60), r = m % 60; return r ? `${h} h ${r} min` : `${h} h`; }
  const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60); return h ? `${d} d ${h} h` : `${d} d`;
}
const idade = (ts) => fmtMin((Date.now() - new Date(ts)) / 6e4);
const nomeU = (id) => (id && S.usuarios[id] ? S.usuarios[id].nome : "—");
// avatar com foto (quando houver) ou iniciais
const av = (id, cls = "") => { const u = S.usuarios[id]; return u?.foto ? `<span class="avatar ${cls}"><img src="${u.foto}" alt=""></span>` : `<span class="avatar ${cls}">${ini(u?.nome)}</span>`; };
const ini = (n) => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
const nomeN = (id) => S.nucleoPorId[id]?.nome ?? "—";
const local = (l) => { const v = [...(l || [])].sort((a, b) => a - b); return !v.length ? "Toda a granja" : v.length === 1 ? `Aviário ${v[0]}` : `Aviários ${v.join(", ")}`; };
const localCurto = (l) => { const v = [...(l || [])].sort((a, b) => a - b); return !v.length ? "Granja toda" : `Av. ${v.join(", ")}`; };
const sev = (p) => p ? `<span class="sev" style="--pc:${PCOR[p]}">${PRIO[p].rot}</span>` : `<span class="sev none">A classificar</span>`;
const stTag = (s, o) => o?.pausada_em && s === "EM ATENDIMENTO" && ehEtapa(o.pausa_motivo)
  ? `<span class="st etapa${pausaLonga(o) ? " longa" : ""}">${ic(MOTIVOS[o.pausa_motivo].i)}${MOTIVOS[o.pausa_motivo].etapa} · ${fmtMin(pausaMin(o))}</span>`
  : o?.pausada_em && s === "EM ATENDIMENTO"
  ? `<span class="st pausa${pausaLonga(o) ? " longa" : ""}">${ic("pause")}Pausada · ${MOTIVOS[o.pausa_motivo].rot.split(" /")[0].split(" ou")[0]} · ${fmtMin(pausaMin(o))}</span>`
  : `<span class="st" style="--sc:${STATUS[s].c}">${ic(STATUS[s].i)}${STATUS[s].rot}</span>`;
const eqIcon = (e) => (EQUIP.find(([n]) => n === e) || [0, "cog"])[1];
const hojeISO = (d = 0) => new Date(Date.now() + d * 864e5).toLocaleDateString("sv-SE", { timeZone: TZ });

/* ---------------- estado ---------------- */
const S = { eu: null, nucleos: [], nucleoPorId: {}, usuarios: {}, rota: null, sel: null, tok: 0, lista: { grupo: "abertas", q: "", nuc: "", prio: "" } };
const tem = (p) => S.eu?.perfis.includes(p);
const podeVerTudo = () => tem("gestor") || tem("gerente") || tem("admin");

function toast(msg, bad = false) {
  const t = $("#toast"); t.innerHTML = `${ic(bad ? "alert" : "checkc")}<span>${esc(msg)}</span>`; t.className = "on" + (bad ? " bad" : "");
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = ""), bad ? 5000 : 2600);
}
const erroRede = (e) => /fetch|network|abort|timeout|Load failed/i.test(e?.message || e?.name || String(e));
const errMsg = (e) => { const m = e?.message || String(e); return erroRede(e) ? (navigator.onLine ? "O servidor demorou para responder. Verifique o sinal e tente de novo." : "Sem conexão. Verifique a internet e tente de novo.") : m; };
async function rpc(n, a) { const { data, error } = await sb.rpc(n, a); if (error) throw error; return data; }
// O Supabase devolve no máximo 1.000 linhas por consulta: busca em partes até acabar (painel, relatórios, controles)
async function todas(q, limite = 200000) {
  const LOTE = 1000; let tudo = [];
  for (let i = 0; i < limite; i += LOTE) {
    const { data, error } = await q.range(i, i + LOTE - 1);
    if (error) return { data: null, error };
    tudo = tudo.concat(data || []);
    if (!data || data.length < LOTE) break;
  }
  return { data: tudo, error: null };
}
// OS preventivas: ids (são poucas) para separar corretiva × preventiva no painel e no relatório
async function idsPreventivas() { const { data } = await todas(sb.from("ordens_servico").select("id").eq("tipo", "PREVENTIVA").order("id")); return new Set((data || []).map((x) => x.id)); }
const filtroTipo = (tipo, prev, id) => !tipo || (tipo === "PREVENTIVA" ? prev.has(id) : !prev.has(id));
async function busy(btn, fn) { btn.disabled = true; try { await fn(); } catch (e) { toast(errMsg(e), true); } finally { btn.disabled = false; } }

/* ---------------- login ---------------- */
function telaLogin(msg = "") {
  S.eu = null; S.tok++;
  const chk = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
  $("#app").innerHTML = `
  <section class="login">
    <div class="login-marca">
      <img src="${C.LOGO}" alt="${esc(C.NOME_EMPRESA)}">
      <h1>${esc(C.NOME_SISTEMA)}</h1>
      <p>Abertura e acompanhamento das ordens de serviço de manutenção dos núcleos.</p>
      <ul class="login-pontos"><li>${chk}Abra a OS direto da granja, pelo celular</li><li>${chk}Acompanhe cada etapa do atendimento</li><li>${chk}Histórico completo de cada serviço</li></ul>
    </div>
    <div class="login-lado">
      <form class="caixa-login" id="fLogin">
        ${S.status?.em_manutencao ? `<div class="note" style="margin-bottom:14px"><b>Sistema em manutenção.</b> ${esc(S.status.mensagem || "Voltamos em breve.")} Só administradores conseguem entrar agora.</div>` : ""}
        <h2>Entrar</h2>
        <p class="sub-login">Use o usuário e a senha fornecidos pelo administrador.</p>
        <label class="lg">Usuário<span class="campo-ic">${ic("user", "")}<input name="login" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="ex.: joao.silva"></span></label>
        <label class="lg">Senha<span class="campo-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          <input name="senha" type="password" autocomplete="current-password" placeholder="Sua senha"><button type="button" class="ver-senha" id="verSenha">Mostrar</button></span></label>
        <p class="err" id="erroLogin">${esc(msg)}</p>
        <button class="btn-login" type="submit">Entrar</button>
        <p class="login-rodape">Esqueceu a senha? Fale com o administrador do sistema.</p>
        ${window.DEMO ? `<div class="demo-users">Demonstração — entre como:<div>
          ${[["joao", "João", "Técnico"], ["marcos", "Marcos", "Gestor"], ["pedro", "Pedro", "Manutentor"], ["rafael", "Rafael", "Manutentor"], ["ana", "Ana", "Gerente"], ["admin", "Admin", "Administrador"]]
            .map(([l, n, p]) => `<button type="button" data-l="${l}"><b>${n}</b><span>${p}</span></button>`).join("")}
        </div></div>` : ""}
      </form>
    </div>
  </section>`;
  const f = $("#fLogin");
  $("#verSenha").onclick = (e) => { const m = f.senha.type === "password"; f.senha.type = m ? "text" : "password"; e.currentTarget.textContent = m ? "Ocultar" : "Mostrar"; };
  if ($(".demo-users")) $(".demo-users").onclick = (e) => { const b = e.target.closest("[data-l]"); if (b) { f.login.value = b.dataset.l; f.senha.value = "demo"; f.requestSubmit(); } };
  f.onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await sb.auth.signInWithPassword({ email: `${f.login.value.trim().toLowerCase()}@${C.DOMINIO_LOGIN}`, password: f.senha.value });
    if (error) { $("#erroLogin").textContent = /banned/i.test(error.message) ? "Seu acesso foi retirado. Procure o administrador." : "Usuário ou senha incorretos."; return; }
    iniciar();
  };
}

// usuários sem a foto (a lista fica leve mesmo com muita gente); as fotos vêm do cache local e só baixam quando mudam
const COLS_USU = "id,nome,login,perfis,ativo,excluido_em,foto_em,push_em";
async function carregarUsuarios() {
  const { data, error } = await sb.from("usuarios").select(COLS_USU).order("nome");
  if (error) throw error;
  let cache = {}; try { cache = JSON.parse(localStorage.getItem("osg_fotos") || "{}"); } catch {}
  const faltam = data.filter((u) => u.foto_em && cache[u.id]?.em !== u.foto_em).map((u) => u.id);
  if (faltam.length) {
    const { data: f } = await sb.from("usuarios").select("id,foto,foto_em").in("id", faltam);
    (f || []).forEach((x) => (cache[x.id] = { em: x.foto_em, foto: x.foto }));
    try { localStorage.setItem("osg_fotos", JSON.stringify(cache)); } catch {}
  }
  S.usuarios = Object.fromEntries(data.map((u) => [u.id, { ...u, foto: u.foto_em ? cache[u.id]?.foto || null : null }]));
}
async function statusSistema() {
  try { const { data, error } = await sb.from("app_status").select("em_manutencao,mensagem,atualizado_em").maybeSingle(); return error ? { erro: error } : data || {}; }
  catch (e) { return { erro: e }; }
}
async function iniciar() {
  const st = await statusSistema();
  if (st.erro && erroRede(st.erro)) return telaForaDoAr();
  S.status = st;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return telaLogin();
  const { data: eu, error: eEu } = await sb.from("usuarios").select(COLS_USU).eq("id", session.user.id).maybeSingle();
  if (eEu && erroRede(eEu)) return telaForaDoAr();
  if (!eu?.ativo || eu.excluido_em || !eu.perfis.length) { await sb.auth.signOut(); return telaLogin("Seu usuário não tem acesso liberado. Procure o administrador."); }
  S.eu = eu;
  if (st.em_manutencao && !eu.perfis.includes("admin")) return telaManutencao(st);
  const [n, g, c, j] = await Promise.all([sb.from("nucleos").select("*").order("nome"), sb.from("galpoes").select("*").order("numero"),
    sb.from("carros_almoxarifado").select("*").order("codigo"), sb.from("jornada_config").select("*").maybeSingle(), carregarUsuarios()]);
  if (n.error || g.error) return telaForaDoAr();
  S.nucleos = n.data.map((x) => ({ ...x, galpoes: g.data.filter((y) => y.nucleo_id === x.id).map((y) => y.numero) }));
  S.nucleoPorId = Object.fromEntries(S.nucleos.map((x) => [x.id, x]));
  S.carros = (c.data || []).filter((x) => x.ativo);
  S.jornada = j.data || { fim_expediente: "17:00:00", almoco_max_min: 120 };
  MOTIVOS.ALMOCO.lim = S.jornada.almoco_max_min;
  vigiarAcesso();
  const r = rotas();
  ir(r.find((x) => x.id === S.rota) ? S.rota : r[0].id);
  setTimeout(sugerirNotificacoes, 1500);
  const mOs = location.hash.match(/#os=(\d+)/);
  if (mOs) { history.replaceState(null, "", location.pathname + location.search); setTimeout(() => abrirOS(+mOs[1]), 500); }
}
// toque na notificação com o app já aberto: o service worker manda abrir a OS
if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", (e) => { const m = String(e.data?.abrirOS || "").match(/os=(\d+)/); if (m && S.eu) abrirOS(+m[1]); });
// Telas de "fora do ar": manutenção programada (ligada pelo admin) e servidor sem resposta. Ambas se atualizam sozinhas.
function telaAviso({ icone, titulo, texto, detalhe = "", seg = 30, acao }) {
  clearInterval(telaAviso.t); S.eu = S.eu && acao === "manut" ? S.eu : null;
  $$(".sheet-wrap, .page").forEach((x) => x.remove());
  $("#app").innerHTML = `<section class="fora"><div class="fora-box">
    <img src="${C.LOGO}" alt="${esc(C.NOME_EMPRESA)}">
    <div class="fora-ic">${ic(icone)}</div><h1>${titulo}</h1><p>${texto}</p>${detalhe ? `<div class="fora-msg">${detalhe}</div>` : ""}
    <p class="fora-cont" id="foraCont"></p>
    <button class="btn btn-primary" id="foraTentar">${ic("refresh")}Tentar agora</button>
    ${acao === "manut" ? `<button class="btn btn-ghost" id="foraSair">Entrar com outro usuário</button>` : ""}</div></section>`;
  let falta = seg;
  const tick = () => { $("#foraCont").textContent = `Nova tentativa automática em ${falta} s`; if (--falta < 0) { clearInterval(telaAviso.t); iniciar().catch(() => telaForaDoAr()); } };
  tick(); telaAviso.t = setInterval(tick, 1000);
  $("#foraTentar").onclick = () => { clearInterval(telaAviso.t); $("#foraCont").textContent = "Conectando…"; iniciar().catch(() => telaForaDoAr()); };
  $("#foraSair")?.addEventListener("click", () => { clearInterval(telaAviso.t); sair(); });
}
function telaManutencao(st) {
  telaAviso({ icone: "tool", titulo: "Sistema em manutenção", acao: "manut",
    texto: "Estamos fazendo uma atualização. O app volta sozinho assim que terminar — não precisa fazer nada.",
    detalhe: st?.mensagem ? esc(st.mensagem) : "", seg: 30 });
}
function telaForaDoAr() {
  const off = !navigator.onLine;
  telaAviso({ icone: off ? "wifioff" : "cloud", titulo: off ? "Sem internet" : "Sistema temporariamente fora do ar",
    texto: off ? "Seu celular está sem conexão. Assim que a internet voltar, o app reconecta sozinho."
      : "Não conseguimos falar com o servidor agora. Pode ser uma instabilidade passageira ou uma atualização em andamento. Aguarde: o app tenta de novo sozinho.",
    detalhe: "Nada do que já foi registrado se perde: tudo fica guardado no banco de dados.", seg: 20 });
}

// Bloqueio vale na hora: o banco já nega os dados; aqui o app confere o acesso a cada minuto e ao voltar para a tela
function vigiarAcesso() {
  clearInterval(vigiarAcesso.t);
  const conferir = async () => {
    if (!S.eu || $(".fora")) return;
    let { data, error } = await sb.from("usuarios").select("ativo,excluido_em").eq("id", S.eu.id).maybeSingle();
    if (error && !erroRede(error)) {   // token vencido (celular parado muito tempo): renova antes de desistir
      await sb.auth.refreshSession().catch(() => {});
      ({ data, error } = await sb.from("usuarios").select("ativo,excluido_em").eq("id", S.eu.id).maybeSingle());
      if (error && !erroRede(error)) return sair("Sua sessão expirou. Entre novamente.");
    }
    if (!error && (!data || !data.ativo || data.excluido_em)) return sair("Seu acesso foi retirado pelo administrador.");
    const st = await statusSistema();
    if (!st.erro) { S.status = st; if (st.em_manutencao && !tem("admin")) return telaManutencao(st); }
    const bm = $("#bannerManut"); if (bm) bm.hidden = !(st.em_manutencao && tem("admin"));
  };
  vigiarAcesso.t = setInterval(conferir, 60000);
  if (!vigiarAcesso.ligado) { vigiarAcesso.ligado = true; document.addEventListener("visibilitychange", () => { if (!document.hidden) conferir(); }); }
}
// Atualizar: botão no topo e automático ao voltar para o app depois de alguns minutos
async function atualizarTudo() {
  const b = $("#btnAtualizar"); b?.classList.add("girando");
  try { await carregarUsuarios(); recarregar(); toast("Atualizado."); } catch (e) { toast(errMsg(e), true); }
  setTimeout(() => $("#btnAtualizar")?.classList.remove("girando"), 600);
}
let saiuEm = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { saiuEm = Date.now(); return; }
  if (S.eu && saiuEm && Date.now() - saiuEm > 120000 && !$(".sheet-wrap") && !$(".page")) recarregar();
});
// Sem internet: faixa no topo; ao voltar, atualiza sozinho
function avisoConexao() {
  let f = $("#offline");
  if (!f) { f = document.createElement("div"); f.id = "offline"; f.innerHTML = `${ic("wifioff")}<span><b>Sem internet.</b> Você pode ver o que já está na tela, mas abrir, direcionar, iniciar, pausar ou finalizar só funciona com conexão.</span>`; document.body.appendChild(f); }
  f.classList.toggle("on", !navigator.onLine);
}
addEventListener("offline", avisoConexao);
addEventListener("online", () => { avisoConexao(); if (S.eu) { toast("Conexão restabelecida."); recarregar(); } });
function relatarErro(e) {
  console.error(e);
  if (!S.eu || erroRede(e)) return;
  clearTimeout(relatarErro.t); relatarErro.t = setTimeout(() => toast("Algo não saiu como esperado. Toque em Atualizar (↻) e tente de novo.", true), 80);
}
addEventListener("error", (e) => relatarErro(e.error || e.message));
addEventListener("unhandledrejection", (e) => relatarErro(e.reason));
async function sair(msg) { clearInterval(vigiarAcesso.t); S.eu = null; S.avisou = false; S.avisos = null; badgesEm = 0; $$(".sheet-wrap, .page").forEach((x) => x.remove()); await sb.auth.signOut(); telaLogin(msg); }
// a rolagem acontece dentro do app (não na página), o que mantém a barra inferior no lugar no iOS e no Android
const rolagem = () => $(".main") || document.scrollingElement;

/* ---------------- navegação ---------------- */
function rotas() {
  const r = [];
  if (tem("tecnico") || tem("gestor") || tem("manutentor")) r.push({ id: "inicio", rot: "Início", i: "home" });
  r.push({ id: "ordens", rot: tem("tecnico") && !podeVerTudo() ? "Minhas OS" : tem("manutentor") && !podeVerTudo() ? "Histórico" : "Ordens", i: "list" });
  if (podeVerTudo()) r.push({ id: "painel", rot: "Painel", i: "chart" });
  if (tem("admin")) r.push({ id: "controles", rot: "Controles", i: "box" }, { id: "usuarios", rot: "Usuários", i: "users" });
  if (podeVerTudo()) r.splice(r.findIndex((x) => x.id === "painel") + 1, 0, { id: "relatorios", rot: "Relatórios", i: "file" });
  if (tem("gerente") && !tem("gestor") && !tem("admin")) r.unshift(r.splice(r.findIndex((x) => x.id === "painel"), 1)[0]);
  return r;
}
const TITULOS = {
  inicio: () => ["Início", "O que precisa da sua atenção agora"],
  ordens: () => [tem("tecnico") && !podeVerTudo() ? "Minhas OS" : "Ordens de serviço", "Busque e acompanhe as OS"],
  painel: () => ["Painel", "Tempos, classificação, equipe e locais"],
  usuarios: () => ["Usuários", "Quem acessa o sistema e o que pode fazer"],
  relatorios: () => ["Relatórios", "Resumo consolidado para exportar em PDF ou Excel"],
  controles: () => ["Controles", "Materiais dos carros e jornada da equipe"],
};
function ir(id) {
  S.rota = id; S.sel = null; S.tok++;
  const [t, sub] = TITULOS[id]();
  $("#app").innerHTML = `
  <div class="shell">
    <nav class="rail" aria-label="Menu">
      <div class="rail-logo"><img src="${C.LOGO}" alt="${esc(C.NOME_EMPRESA)}"></div>
      ${rotas().map((r) => `<a href="#" data-r="${r.id}" ${r.id === id ? 'aria-current="page"' : ""}>${ic(r.i)}${r.rot}<span class="dot" data-badge="${r.id}" hidden></span></a>`).join("")}
      <div class="rail-bottom"><button class="av-btn" id="btnPerfil" title="${esc(S.eu.nome)} — perfil">${av(S.eu.id)}</button></div>
    </nav>
    <div class="main">
      <header class="topbar">
        <div class="mark mob-only"><img src="${C.LOGO}" alt=""></div>
        <div><h1>${t}</h1><div class="sub">${sub}</div></div>
        <div class="grow"></div>
        ${tem("tecnico") ? `<button class="btn btn-brand btn-sm desk-only" id="btnNovaTop">${ic("plus")}Nova OS</button>` : ""}
        <button class="bell" id="btnAtualizar" aria-label="Atualizar" title="Atualizar">${ic("refresh")}</button>
        <button class="bell" id="btnAvisos" aria-label="Avisos">${ic("bell")}<span class="bell-n" id="bellN" hidden></span></button>
        <div class="who"><div class="txt"><b>${esc(S.eu.nome)}</b><small>${S.eu.perfis.map((p) => PERFIS[p].nome).join(" · ")}</small></div>
          <button class="av-btn mob-only" id="btnPerfilM">${av(S.eu.id)}</button></div>
      </header>
      <div class="banner-manut" id="bannerManut" ${S.status?.em_manutencao && tem("admin") ? "" : "hidden"}>${ic("tool")}Sistema em manutenção: só administradores estão acessando. Desligue em Controles → Sistema.</div>
      <div id="view"></div>
    </div>
  </div>`;
  $(".rail").onclick = (e) => { const a = e.target.closest("[data-r]"); if (a) { e.preventDefault(); ir(a.dataset.r); rolagem().scrollTop = 0; } };
  $("#btnPerfil").onclick = $("#btnPerfilM").onclick = folhaPerfil;
  $("#btnNovaTop")?.addEventListener("click", novaOS);
  $("#btnAvisos").onclick = async (e) => { e.currentTarget.classList.add("girando"); await atualizarBadges(true); $("#btnAvisos")?.classList.remove("girando"); folhaAvisos(); };
  $("#btnAtualizar").onclick = atualizarTudo;
  ({ inicio: viewInicio, ordens: viewOrdens, painel: viewPainel, usuarios: viewUsuarios, relatorios: viewRelatorios, controles: viewControles })[id]();
  atualizarBadges();
}
/* ---------------- avisos (pendências de cada perfil) ---------------- */
async function pendencias() {
  const itens = [], q = () => sb.from("ordens_servico").select(CAMPOS);
  const add = (o, tipo, titulo, texto, urg = false) => itens.push({ os: o?.id, tipo, titulo, texto, urg: urg || o?.prioridade === "EMERGENCIA", quando: o?.aberta_em, o });
  if (tem("tecnico") || tem("gestor")) {
    const { data } = await q().eq("solicitante_id", S.eu.id).eq("status", "AGUARDANDO CONFIRMAÇÃO").range(0, 199);
    data.forEach((o) => add(o, "confirmar", `Confirme o serviço · ${osId(o.id)}`, `${o.descricao} — ${nomeU(o.manutentor_id)} finalizou.`));
  }
  if (tem("gestor")) {
    const { data } = await q().in("status", ["ABERTA", "PENDENTE DE ATENDIMENTO"]).range(0, 499);
    const ids = data.filter((o) => o.status === "PENDENTE DE ATENDIMENTO").map((o) => o.id);
    const { data: at } = ids.length ? await sb.from("os_atendimentos").select("os_id,ciclo,resultado,motivo_recusa").in("os_id", ids) : { data: [] };
    data.forEach((o) => {
      const ult = at.filter((a) => a.os_id === o.id).sort((a, b) => b.ciclo - a.ciclo)[0];
      if (o.status === "ABERTA") add(o, "direcionar", `Nova OS para direcionar · ${osId(o.id)}`, `${o.descricao} — ${nomeN(o.nucleo_id)}`);
      else add(o, "devolvida", `${ult?.resultado === "RECUSADO" ? "Recusada pelo manutentor" : ult?.resultado === "DEVOLVIDO" ? "Devolvida pelo administrador" : "Não resolvida"} · ${osId(o.id)}`, ult?.motivo_recusa ? `Motivo: ${ult.motivo_recusa}` : `${o.descricao} — direcione novamente.`);
    });
    const { data: ab } = await q().in("status", ["DIRECIONADA", "EM ATENDIMENTO"]).range(0, 999);
    ab.filter(pausaLonga).forEach((o) => add(o, "pausa", `Pausa longa · ${osId(o.id)}`, `${nomeU(o.manutentor_id)}: ${MOTIVOS[o.pausa_motivo].rot.toLowerCase()} há ${fmtMin(pausaMin(o))}.`));
    const velhas = [...data, ...ab].filter((o) => (Date.now() - new Date(o.aberta_em)) / 36e5 > 72).length;
    if (velhas) itens.push({ tipo: "paradas", titulo: `${velhas} OS abertas há mais de 3 dias`, texto: "Veja em Ordens → Em aberto.", grupo: "abertas" });
  }
  if (tem("manutentor")) {
    const { data } = await q().eq("manutentor_id", S.eu.id).in("status", ["DIRECIONADA", "EM ATENDIMENTO"]).range(0, 199);
    data.filter((o) => o.status === "DIRECIONADA").forEach((o) => add(o, "atender", `${o.prioridade === "EMERGENCIA" ? "EMERGÊNCIA para atender" : "OS para atender"} · ${osId(o.id)}`, `${o.descricao} — ${nomeN(o.nucleo_id)} · ${localCurto(o.galpoes)}`));
    data.filter(pausaLonga).forEach((o) => add(o, "pausa", `Retome ou finalize · ${osId(o.id)}`, `Pausada (${MOTIVOS[o.pausa_motivo].rot.toLowerCase()}) há ${fmtMin(pausaMin(o))}.`));
  }
  if ((tem("gerente") || tem("admin")) && !tem("gestor")) {
    const { data } = await q().in("status", ABERTOS).range(0, 999);
    data.filter((o) => o.prioridade === "EMERGENCIA").forEach((o) => add(o, "emergencia", `Emergência em aberto · ${osId(o.id)}`, `${o.descricao} — ${STATUS[o.status].rot.toLowerCase()}${o.manutentor_id ? ` com ${nomeU(o.manutentor_id)}` : ""}.`, true));
    const muitoVelhas = data.filter((o) => (Date.now() - new Date(o.aberta_em)) / 36e5 > 168).length;
    if (muitoVelhas) itens.push({ tipo: "paradas", titulo: `${muitoVelhas} OS abertas há mais de 7 dias`, texto: "Veja em Ordens → Em aberto.", grupo: "abertas", urg: true });
  }
  if (tem("admin")) {   // lembrete: backup com mais de 7 dias (ou nunca feito)
    const { data: bk, error: eBk } = await sb.from("backup_registro").select("feito_em").order("feito_em", { ascending: false }).limit(1);
    if (!eBk) {
      const ult = bk?.[0]?.feito_em, dias = ult ? Math.floor((Date.now() - new Date(ult)) / 864e5) : null;
      if (dias === null || dias >= 7) itens.push({ tipo: "backup", titulo: dias === null ? "Nenhum backup baixado ainda" : `Faz ${dias} dias desde o último backup`,
        texto: "Baixe uma cópia dos dados: leva 1 minuto (Controles → Sistema → Backup).", rota: "controles", aba: "sis", grupo: dias === null ? "b-nunca" : `b${Math.floor(dias / 7)}` });
    }
  }
  return itens.sort((a, b) => (b.urg - a.urg) || (new Date(a.quando || 0) - new Date(b.quando || 0)));
}
// Tarefas (precisam de ação) somem sozinhas quando feitas; informativos somem depois de vistos.
const ACAO = ["confirmar", "direcionar", "devolvida", "atender"];
const chaveAv = (x) => `${x.tipo}:${x.os ?? x.grupo}:${x.tipo === "paradas" ? x.titulo : x.o?.status || ""}`;
const vistosKey = () => `osg_avisos_vistos_${S.eu?.id}`;
const lerVistos = () => { try { return new Set(JSON.parse(localStorage.getItem(vistosKey()) || "[]")); } catch { return new Set(); } };
const gravarVistos = (set) => { try { localStorage.setItem(vistosKey(), JSON.stringify([...set].slice(-400))); } catch {} };
function marcarVistos(itens) { const v = lerVistos(); itens.forEach((x) => v.add(chaveAv(x))); gravarVistos(v); }
let badgesEm = 0, badgesP = null;
function atualizarBadges(forcar = false) {
  if (badgesP) return badgesP;
  if (!forcar && Date.now() - badgesEm < 20000) return Promise.resolve();
  badgesP = atualizarBadgesAgora().catch(() => {}).finally(() => { badgesEm = Date.now(); badgesP = null; });
  return badgesP;
}
async function atualizarBadgesAgora() {
  const lst = await pendencias(), v = lerVistos();
  lst.forEach((x) => { x.acao = ACAO.includes(x.tipo); x.visto = !x.acao && v.has(chaveAv(x)); });
  S.avisos = lst;
  const vis = lst.filter((x) => !x.visto), n = vis.length, urg = vis.some((x) => x.urg);
  const bn = $("#bellN"); if (bn) { bn.hidden = !n; bn.textContent = n > 99 ? "99+" : n; bn.classList.toggle("urg", urg); }
  const b = $('[data-badge="inicio"]'); if (b) { const t = lst.filter((x) => x.acao).length; b.hidden = !t; b.textContent = t; }
  if (n && !S.avisou) { S.avisou = true; folhaAvisos(true); }
}
const TIPO_AV = { confirmar: ["checkc", "var(--s-aguardando)", "Confirmar"], direcionar: ["send", "var(--s-aberta)", "Direcionar"], devolvida: ["undo", "var(--s-pendente)", "Direcionar de novo"],
  atender: ["tool", "var(--s-direcionada)", "Abrir"], pausa: ["pause", "#6A6E75"], paradas: ["clock", "var(--s-pendente)"], emergencia: ["alert", "var(--p-EMERGENCIA)"], backup: ["box", "var(--s-atendimento)"] };
function folhaAvisos(auto = false) {
  const lst = S.avisos || [], tarefas = lst.filter((x) => x.acao), info = lst.filter((x) => !x.acao && !x.visto), vistos = lst.filter((x) => x.visto);
  const item = (x) => { const [icn, cor, rotAcao] = TIPO_AV[x.tipo], i = lst.indexOf(x);
    return `<div class="aviso${x.urg ? " urg" : ""}${x.visto ? " visto" : ""}" style="--ac:${x.urg ? "var(--p-EMERGENCIA)" : cor}">
      <span class="aviso-ic">${ic(x.urg && x.tipo !== "pausa" ? "alert" : icn)}</span>
      <button class="aviso-tx" data-abrir="${i}"><b>${esc(x.titulo)}</b><small>${esc(x.texto)}</small>${x.quando ? `<em>${idade(x.quando)}</em>` : ""}</button>
      ${x.acao ? `<button class="btn btn-sm btn-primary" data-fazer="${i}">${rotAcao}</button>` : x.visto ? "" : `<button class="btn btn-sm" data-visto="${i}" title="Marcar como visto">${ic("check")}Visto</button>`}
    </div>`; };
  const n = tarefas.length + info.length;
  folha({
    titulo: auto ? `Olá, ${esc(S.eu.nome.split(" ")[0])}! ${n === 1 ? "Você tem 1 aviso" : `Você tem ${n} avisos`}` : "Avisos",
    sub: "Tarefas saem daqui sozinhas quando você as conclui. Informativos saem depois de vistos.",
    corpo: (tarefas.length ? `<div class="av-grupo"><div class="av-h">${ic("flag")}Precisa de você <span>${tarefas.length}</span></div><div class="avisos">${tarefas.map(item).join("")}</div></div>` : "")
      + (info.length ? `<div class="av-grupo"><div class="av-h">${ic("bell")}Para acompanhar <span>${info.length}</span><button class="linkish" id="todosVistos">Marcar todos como vistos</button></div><div class="avisos">${info.map(item).join("")}</div></div>` : "")
      + (!n ? `<div class="av-vazio">${ic("checkc")}<b>Tudo em dia</b><small>Nenhuma tarefa ou aviso novo para você.</small></div>` : "")
      + (vistos.length ? `<details class="av-vistos"><summary>Vistos (${vistos.length})</summary><div class="avisos">${vistos.map(item).join("")}</div></details>` : ""),
    rodape: `<button class="btn btn-primary" data-fechar id="avOk">${auto ? "Entendi" : "Fechar"}</button>`,
    aoAbrir: (el, fechar) => {
      el.addEventListener("click", (e) => {
        const abrir = e.target.closest("[data-abrir]"), fazer = e.target.closest("[data-fazer]"), visto = e.target.closest("[data-visto]");
        if (visto) { const x = lst[+visto.dataset.visto]; marcarVistos([x]); x.visto = true; const d = visto.closest(".aviso"); d.classList.add("saindo"); setTimeout(() => d.remove(), 220); visto.remove(); atualizarBadges(); return; }
        if (abrir || fazer) {
          const it = lst[+(abrir?.dataset.abrir ?? fazer.dataset.fazer)]; if (!it.acao) marcarVistos([it]); fechar();
          if (fazer && ["direcionar", "devolvida"].includes(it.tipo)) return executar("direcionar", it.os, fazer);
          if (it.rota) { if (it.aba) S.abaCtl = it.aba; ir(it.rota); } else if (it.os) abrirOS(it.os); else if (it.grupo) { S.lista.grupo = it.grupo; ir("ordens"); }
          atualizarBadges();
        }
      });
      $("#todosVistos", el)?.addEventListener("click", () => { marcarVistos(info); fechar(); toast("Avisos marcados como vistos."); atualizarBadges(); });
      // ao fechar pelo "Entendi" na abertura, os informativos contam como vistos
      if (auto) $("#avOk", el).addEventListener("click", () => { marcarVistos(info); atualizarBadges(); });
    },
  });
}

// carrega bibliotecas só quando precisa (PDF/Excel)
const scriptsCarregados = {};
function carregarScript(src, pronto) {
  if (pronto()) return Promise.resolve();
  return (scriptsCarregados[src] ??= new Promise((ok, erro) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => erro(new Error("Não foi possível carregar " + src)); document.head.appendChild(s); }));
}

function folhaPerfil() {
  folha({
    titulo: "Seu perfil", sub: S.eu.perfis.map((p) => PERFIS[p].nome).join(" · "),
    corpo: `<div class="perfil-top">${av(S.eu.id, "xl")}<div><b>${esc(S.eu.nome)}</b><small class="mono">${esc(S.eu.login)}</small>
        <div class="acoes-foto"><label class="btn btn-sm">${ic("camera")}${S.usuarios[S.eu.id]?.foto ? "Trocar foto" : "Adicionar foto"}<input type="file" accept="image/*" id="fFoto" hidden></label>
        ${S.usuarios[S.eu.id]?.foto ? `<button class="btn btn-sm btn-ghost" id="rmFoto">Remover</button>` : ""}</div></div></div>
      <p class="muted" style="font-size:12px;margin:-2px 0 10px">OS Granjas · versão ${VERSAO}</p>
      <div class="label">Notificações no celular</div>
      <div class="notif-st ${estadoNotif() === "ativa" ? "on" : ""}">${ic("bell")}<span>${{ ativa: "Ativas neste aparelho", desligada: "Desligadas", bloqueada: "Bloqueadas nas configurações do celular", instalar: "Instale o app na Tela de Início para ativar", "sem-suporte": "Este navegador não aceita notificações" }[estadoNotif()]}</span>
        <button class="btn btn-sm" id="btnNotif">${estadoNotif() === "ativa" ? "Ver" : "Ativar"}</button></div>
      <div class="label">O que você pode fazer</div><div class="checks">${S.eu.perfis.map((p) => `<label>${esc(PERFIS[p].nome)}<small>${PERFIS[p].faz}</small></label>`).join("")}</div>`,
    rodape: `<button class="btn" id="btnSenha">${ic("cog")}Alterar senha</button><button class="btn btn-primary" id="btnSair">${ic("logout")}Sair</button>`,
    aoAbrir: (el, fechar) => {
      $("#btnSair", el).onclick = async () => { fechar(); sair(); };
      $("#btnSenha", el).onclick = () => { fechar(); folhaSenha(); };
      $("#btnNotif", el).onclick = () => { fechar(); folhaNotificacoes("perfil"); };
      const salvar = async (foto) => { await rpc("definir_foto", { p_foto: foto }); await carregarUsuarios(); fechar(); toast(foto ? "Foto atualizada." : "Foto removida."); recarregar(); };
      $("#rmFoto", el)?.addEventListener("click", () => salvar(null).catch((e) => toast(errMsg(e), true)));
      $("#fFoto", el).onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { salvar(await reduzirFoto(f)); } catch (err) { toast("Não foi possível usar essa imagem.", true); }
      };
    },
  });
}
// Alterar a própria senha: confirma a senha atual antes (o administrador continua podendo redefinir em Usuários)
function folhaSenha() {
  folha({
    titulo: "Alterar senha", sub: "Use pelo menos 8 caracteres. Não use a mesma senha de outros sistemas.",
    corpo: `<label class="field"><span>Senha atual</span><input class="input" type="password" id="sAtual" autocomplete="current-password"></label>
      <label class="field"><span>Nova senha</span><input class="input" type="password" id="sNova" autocomplete="new-password"></label>
      <label class="field"><span>Repita a nova senha</span><input class="input" type="password" id="sConf" autocomplete="new-password"></label>
      <label class="checks" style="margin-bottom:6px"><label><input type="checkbox" id="sVer">Mostrar senhas</label></label><p class="err" id="sErr"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="sOk">Salvar nova senha</button>`,
    aoAbrir: (el, fechar) => {
      $("#sVer", el).onchange = (e) => ["sAtual", "sNova", "sConf"].forEach((i) => ($("#" + i, el).type = e.target.checked ? "text" : "password"));
      $("#sAtual", el).focus();
      $("#sOk", el).onclick = (e) => {
        const erro = (t) => ($("#sErr", el).textContent = t), atual = $("#sAtual", el).value, nova = $("#sNova", el).value, conf = $("#sConf", el).value;
        if (!atual) return erro("Digite a senha atual.");
        if (nova.length < 8) return erro("A nova senha precisa de pelo menos 8 caracteres.");
        if (nova !== conf) return erro("As duas senhas novas não são iguais.");
        if (nova === atual) return erro("A nova senha precisa ser diferente da atual.");
        busy(e.currentTarget, async () => {
          const { error: e1 } = await sb.auth.signInWithPassword({ email: `${S.eu.login}@${C.DOMINIO_LOGIN}`, password: atual });
          if (e1) return erro(/banned/i.test(e1.message) ? "Seu acesso foi retirado." : "Senha atual incorreta.");
          const { error: e2 } = await sb.auth.updateUser({ password: nova });
          if (e2) return erro(/different/i.test(e2.message) ? "A nova senha precisa ser diferente da atual." : /weak|short|characters/i.test(e2.message) ? "Senha fraca: use pelo menos 8 caracteres, misturando letras e números." : errMsg(e2));
          fechar(); toast("Senha alterada. Use a nova senha no próximo acesso.");
        });
      };
    },
  });
}
// recorta no centro e reduz para 160×160 (JPEG ~8 KB) antes de salvar
function reduzirFoto(arquivo) {
  return new Promise((ok, erro) => {
    const img = new Image(), url = URL.createObjectURL(arquivo);
    img.onload = () => { const t = 160, c = document.createElement("canvas"); c.width = c.height = t;
      const lado = Math.min(img.width, img.height); c.getContext("2d").drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, t, t);
      URL.revokeObjectURL(url); ok(c.toDataURL("image/jpeg", 0.82)); };
    img.onerror = erro; img.src = url;
  });
}

/* ---------------- folhas (painéis de ação) ---------------- */
function folha({ titulo, sub = "", corpo, rodape = "", tam = "", aoAbrir, aoFechar }) {
  const wrap = document.createElement("div");
  wrap.className = "sheet-wrap";
  wrap.innerHTML = `<div class="sheet ${tam}" role="dialog" aria-modal="true">
    <div class="sheet-h"><div><h3>${titulo}</h3>${sub ? `<small>${sub}</small>` : ""}</div><button class="icon-btn" data-fechar aria-label="Fechar">${ic("x")}</button></div>
    <div class="sheet-b">${corpo}</div>${rodape ? `<div class="sheet-f">${rodape}</div>` : ""}</div>`;
  document.body.appendChild(wrap);
  document.body.style.overflow = "hidden";
  const fechar = () => { wrap.remove(); if (!$(".sheet-wrap") && !$(".page")) document.body.style.overflow = ""; document.removeEventListener("keydown", tecla); aoFechar?.(); };
  const tecla = (e) => { if (e.key === "Escape") fechar(); };
  document.addEventListener("keydown", tecla);
  wrap.addEventListener("click", (e) => { if (e.target === wrap || e.target.closest("[data-fechar]")) fechar(); });
  aoAbrir?.(wrap, fechar);
  return { el: wrap, fechar };
}
function sucesso({ titulo, texto, linhas = [], primario, secundario }) {
  folha({
    titulo: "Pronto", corpo: `<div class="done"><div class="ck">${ic("check")}</div><h3>${titulo}</h3><p>${texto}</p>
      ${linhas.length ? `<dl class="review">${linhas.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>` : ""}</div>`,
    rodape: `${secundario ? `<button class="btn" id="sSec">${secundario.rot}</button>` : ""}<button class="btn btn-primary" id="sPri">${primario.rot}</button>`,
    aoAbrir: (el, fechar) => {
      $("#sPri", el).onclick = () => { fechar(); primario.fn?.(); };
      if (secundario) $("#sSec", el).onclick = () => { fechar(); secundario.fn?.(); };
      $("#sPri", el).focus();
    },
  });
}
function recarregar() { const sel = S.sel; const y = rolagem().scrollTop; ir(S.rota); if (sel && !isMob()) abrirOS(sel); rolagem().scrollTop = y; atualizarBadges(true); }

/* ---------------- cartão de OS ---------------- */
function acoesRapidas(o) {
  const b = (a, rot, cls = "", i = "") => `<button class="btn btn-sm ${cls}" data-acao="${a}" data-id="${o.id}">${i ? ic(i) : ""}${rot}</button>`;
  if (tem("manutentor") && o.manutentor_id === S.eu.id) {
    if (o.status === "DIRECIONADA") return `<div class="os-actions">${b("recusar", "Recusar", "btn-danger")}${b("iniciar", "Iniciar", "btn-primary", "play")}</div>`;
    if (o.status === "EM ATENDIMENTO" && o.pausada_em) return `<div class="os-actions">${b("retomar", ehEtapa(o.pausa_motivo) ? MOTIVOS[o.pausa_motivo].volta : "Retomar atendimento", "btn-primary", "play")}</div>`;
    if (o.status === "EM ATENDIMENTO") return `<div class="os-actions">${b("material", "Material", "", "box")}${b("pausar", "Pausar", "", "pause")}${b("finalizar", "Finalizar", "btn-primary", "flag")}</div>`;
  }
  if ((tem("tecnico") || tem("gestor")) && o.solicitante_id === S.eu.id && o.status === "AGUARDANDO CONFIRMAÇÃO")
    return `<div class="os-actions">${b("naoresolvido", "Não resolvido", "btn-danger")}${b("confirmar", "Resolvido", "btn-primary", "check")}</div>`;
  if (tem("gestor") && ["ABERTA", "PENDENTE DE ATENDIMENTO"].includes(o.status))
    return `<div class="os-actions">${b("direcionar", "Classificar e direcionar", "btn-primary", "send")}</div>`;
  return "";
}
function card(o, { acoes = false } = {}) {
  const late = o.status !== "CONCLUÍDA" && (Date.now() - new Date(o.aberta_em)) / 36e5 > 72;
  const emerg = o.prioridade === "EMERGENCIA" && o.status !== "CONCLUÍDA";
  const resp = o.manutentor_id && o.status !== "ABERTA" ? o.manutentor_id : o.solicitante_id;
  return `<article class="os${emerg ? " emerg" : ""}${S.sel === o.id ? " sel" : ""}" style="--pc:${PCOR[o.prioridade] || "var(--line)"}" data-os="${o.id}" tabindex="0">
    <div class="os-top"><span class="os-id">${osId(o.id)}</span>${sev(o.prioridade)}${o.tipo === "PREVENTIVA" ? `<span class="tag-prev">${ic("shield")}Preventiva</span>` : ""}<span class="os-age${late ? " late" : ""}" title="Aberta em ${fmtDH(o.aberta_em)}">${idade(o.aberta_em)}</span></div>
    <div class="os-title">${esc(o.descricao)}</div>
    <div class="os-meta"><span>${ic("pin")}${esc(nomeN(o.nucleo_id))} · ${localCurto(o.galpoes)}</span>${o.equipamento ? `<span>${ic(eqIcon(o.equipamento))}${esc(o.equipamento)}</span>` : ""}</div>
    <div class="os-foot">${stTag(o.status, o)}<span class="who">${av(resp)}${esc(nomeU(resp).split(" ")[0])}</span></div>
    ${acoes ? acoesRapidas(o) : ""}
  </article>`;
}
const CAMPOS = "id,status,nucleo_id,galpoes,equipamento,descricao,aberta_em,solicitante_id,manutentor_id,prioridade,pausada_em,pausa_motivo,tipo";
function ligarLista(el) {
  el.addEventListener("click", (e) => {
    const a = e.target.closest("[data-acao]");
    if (a) { e.stopPropagation(); return executar(a.dataset.acao, +a.dataset.id, a); }
    const c = e.target.closest("[data-os]"); if (c) abrirOS(+c.dataset.os);
  });
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches("[data-os]")) abrirOS(+e.target.dataset.os); });
}
const secao = (tit, itens, { acoes = false, vazio = "Nada por aqui.", link = "" } = {}) => `<section class="section">
  <div class="section-h"><h3>${tit}</h3><span class="count">${itens.length}</span>${link}</div>
  ${itens.length ? `<div class="stack">${itens.map((o) => card(o, { acoes })).join("")}</div>` : `<div class="zero">${vazio}</div>`}</section>`;

/* ---------------- Início ---------------- */
async function viewInicio() {
  const tok = S.tok;
  $("#view").innerHTML = `<div class="split"><div class="pane-list" id="pl"><div class="stack"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div></div>
    <div class="pane-detail" id="pd">${vazioDetalhe()}</div></div>`;
  const h = new Date().toLocaleString("pt-BR", { timeZone: TZ, hour: "numeric", hour12: false });
  const dia = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" }).format(new Date());
  let html = `<div class="hello"><small>${dia[0].toUpperCase() + dia.slice(1)}</small><h2>${+h < 12 ? "Bom dia" : +h < 18 ? "Boa tarde" : "Boa noite"}, ${esc(S.eu.nome.split(" ")[0])}</h2></div>`;
  const q = () => sb.from("ordens_servico").select(CAMPOS);

  if (tem("tecnico")) {
    const { data } = await q().eq("solicitante_id", S.eu.id).in("status", ABERTOS).order("id", { ascending: false }).range(0, 199);
    html += `<button class="cta-nova" id="ctaNova"><span class="ic">${ic("plus")}</span><span><b>Abrir nova OS</b><span>Granja, aviários, equipamento e o que precisa</span></span><span class="go">${ic("right")}</span></button>`;
    html += secao("Confirme o serviço", data.filter((o) => o.status === "AGUARDANDO CONFIRMAÇÃO"), { acoes: true, vazio: "Nenhum serviço esperando sua confirmação." });
    html += secao("Suas OS em andamento", data.filter((o) => o.status !== "AGUARDANDO CONFIRMAÇÃO").slice(0, 8),
      { vazio: "Você não tem OS em andamento.", link: `<a href="#" data-ir="ordens">Ver todas</a>` });
  }
  if (tem("gestor")) {
    const { data } = await q().in("status", ABERTOS).range(0, 999);
    const velhas = data.filter((o) => (Date.now() - new Date(o.aberta_em)) / 36e5 > 72);
    const dir = data.filter((o) => ["ABERTA", "PENDENTE DE ATENDIMENTO"].includes(o.status)).sort((a, b) => a.id - b.id);
    const emerg = data.filter((o) => o.prioridade === "EMERGENCIA" && ["DIRECIONADA", "EM ATENDIMENTO"].includes(o.status));
    const stat = (n, rot, c, g, hot) => `<button class="stat${hot ? " hot" : ""}" style="--c:${c}" data-grupo="${g}"><small><i></i>${rot}</small><b>${n}</b></button>`;
    html += `<div class="stats">
      ${stat(dir.length, "A direcionar", "var(--s-aberta)", "classificar", dir.length > 0)}
      ${stat(data.filter((o) => o.prioridade === "EMERGENCIA").length, "Emergências abertas", "var(--p-EMERGENCIA)", "emergencia", data.some((o) => o.prioridade === "EMERGENCIA"))}
      ${stat(data.filter((o) => o.status === "AGUARDANDO CONFIRMAÇÃO").length, "Esperando o técnico", "var(--s-aguardando)", "aguardando")}
      ${stat(velhas.length, "Abertas há +3 dias", "var(--s-pendente)", "abertas", velhas.length > 0)}</div>`;
    const conferir = data.filter((o) => o.status === "AGUARDANDO CONFIRMAÇÃO" && o.solicitante_id === S.eu.id);
    html += `<button class="cta-nova" id="ctaPrev"><span class="ic">${ic("shield")}</span><span><b>Abrir OS preventiva</b><span>Aproveite quando a equipe estiver com tempo livre</span></span><span class="go">${ic("right")}</span></button>`;
    if (conferir.length) html += secao("Preventivas para conferir", conferir, { acoes: true });
    html += secao("Para direcionar", dir, { acoes: true, vazio: "Tudo direcionado. Nenhuma OS esperando." });
    if (emerg.length) html += secao("Emergências em andamento", emerg);
    if (velhas.length) html += secao("Paradas há mais de 3 dias", velhas.filter((o) => !dir.includes(o)).slice(0, 10));
  }
  if (tem("manutentor")) {
    const { data } = await q().eq("manutentor_id", S.eu.id).in("status", ["DIRECIONADA", "EM ATENDIMENTO"]).order("prioridade_ordem", { ascending: false }).order("id").range(0, 199);
    html += secao("Em atendimento agora", data.filter((o) => o.status === "EM ATENDIMENTO"), { acoes: true, vazio: "Nenhum atendimento em andamento." });
    html += secao("Sua fila", data.filter((o) => o.status === "DIRECIONADA").sort((a, b) => (a.tipo === "PREVENTIVA") - (b.tipo === "PREVENTIVA")), { acoes: true, vazio: "Sua fila está vazia. Bom trabalho!" });
  }
  if (tok !== S.tok) return;
  if (!S.avisos) await atualizarBadges();
  const pend = (S.avisos || []).filter((x) => x.urg && x.os && !x.visto);
  if (pend.length) html = html.replace('</h2></div>', `</h2></div><button class="alerta-emerg" id="verAvisos">${ic("alert")}<span><b>${pend.length} ${pend.length > 1 ? "avisos urgentes" : "aviso urgente"}</b><small>${esc(pend[0].titulo)}</small></span>${ic("right")}</button>`);
  $("#pl").innerHTML = html;
  $("#verAvisos")?.addEventListener("click", () => folhaAvisos());
  $("#ctaNova")?.addEventListener("click", () => novaOS());
  $("#ctaPrev")?.addEventListener("click", () => novaOS(true));
  $("#pl").addEventListener("click", (e) => {
    const s = e.target.closest("[data-grupo]"); if (s) { S.lista.grupo = s.dataset.grupo; ir("ordens"); }
    const l = e.target.closest("[data-ir]"); if (l) { e.preventDefault(); ir(l.dataset.ir); }
  });
  ligarLista($("#pl"));
}
const vazioDetalhe = () => `<div class="empty-detail"><div>${ic("inbox")}<p>Selecione uma OS para ver os detalhes</p></div></div>`;

/* ---------------- Ordens (busca e filtros) ---------------- */
// filtros da lista: [chave, rótulo, ícone, consulta no banco, teste local p/ contagem]
const GRUPOS = () => [
  ["abertas", "Em aberto", "inbox", (q) => q.in("status", ABERTOS), (o) => ABERTOS.includes(o.status)],
  ...(tem("gestor") ? [["classificar", "A direcionar", "send", (q) => q.in("status", ["ABERTA", "PENDENTE DE ATENDIMENTO"]), (o) => ["ABERTA", "PENDENTE DE ATENDIMENTO"].includes(o.status)]] : []),
  ...(podeVerTudo() ? [["emergencia", "Emergências", "alert", (q) => q.in("status", ABERTOS).eq("prioridade", "EMERGENCIA"), (o) => ABERTOS.includes(o.status) && o.prioridade === "EMERGENCIA"]] : []),
  ["atendimento", "Em atendimento", "tool", (q) => q.in("status", ["DIRECIONADA", "EM ATENDIMENTO"]), (o) => ["DIRECIONADA", "EM ATENDIMENTO"].includes(o.status)],
  ["aguardando", "Aguardando técnico", "clock", (q) => q.eq("status", "AGUARDANDO CONFIRMAÇÃO"), (o) => o.status === "AGUARDANDO CONFIRMAÇÃO"],
  ...(podeVerTudo() ? [["preventivas", "Preventivas", "shield", (q) => q.eq("tipo", "PREVENTIVA").in("status", ABERTOS), (o) => o.tipo === "PREVENTIVA" && ABERTOS.includes(o.status)]] : []),
  ["concluidas", "Concluídas", "checkc", (q) => q.eq("status", "CONCLUÍDA"), (o) => o.status === "CONCLUÍDA"],
  ["todas", "Todas", "list", (q) => q, () => true],
];
async function viewOrdens() {
  const L = S.lista; if (!GRUPOS().some((g) => g[0] === L.grupo)) L.grupo = "abertas";
  const rotG = () => GRUPOS().find((g) => g[0] === L.grupo);
  let cont = {};
  $("#view").innerHTML = `<div class="split tri">
    <aside class="pane-folders" aria-label="Filtros">
      <div class="pf-t">Mostrar</div>
      <div id="folders">${GRUPOS().map(([k, r, i]) => `<button data-g="${k}" aria-pressed="${k === L.grupo}">${ic(i)}<span>${r}</span><b data-c="${k}"></b></button>`).join("")}</div>
    </aside>
    <div class="pane-list">
      ${tem("tecnico") ? `<button class="btn btn-brand btn-block mob-only" id="btnNovaL" style="margin-bottom:12px">${ic("plus")}Abrir nova OS</button>` : ""}
      <button class="mostrar" id="btnMostrar"><small>Mostrar</small><span id="mostrarRot"></span>${ic("right")}</button>
      <div class="toolbar"><label class="search">${ic("search")}<input class="input" id="busca" placeholder="Buscar nº, serviço ou equipamento" value="${esc(L.q)}"></label>
        ${podeVerTudo() ? `<select class="input" id="fNuc"><option value="">Todas as granjas</option>${S.nucleos.map((n) => `<option value="${n.id}" ${+L.nuc === n.id ? "selected" : ""}>${esc(n.nome)}</option>`).join("")}</select>` : ""}</div>
      <div id="res" class="stack"><div class="skel"></div><div class="skel"></div></div>
      <button class="btn btn-sm more" id="mais" hidden>Mostrar mais</button>
    </div><div class="pane-detail" id="pd">${vazioDetalhe()}</div></div>`;
  let limite = 30, total = 0;
  const tok = S.tok;
  const escopo = (q) => { if (!podeVerTudo()) q = tem("tecnico") ? q.eq("solicitante_id", S.eu.id) : q.eq("manutentor_id", S.eu.id); return L.nuc ? q.eq("nucleo_id", +L.nuc) : q; };
  const pintarRot = () => { const g = rotG(); $("#mostrarRot").innerHTML = `${ic(g[2])}${g[1]}${cont[g[0]] != null ? `<b>${cont[g[0]]}</b>` : ""}`; };
  async function contar() {
    // o banco devolve só os totais por status e classificação (poucas linhas, mesmo com milhares de OS)
    const { data } = await sb.rpc("contagem_os", { p_nucleo: L.nuc ? +L.nuc : null,
      p_solicitante: !podeVerTudo() && tem("tecnico") ? S.eu.id : null, p_manutentor: !podeVerTudo() && !tem("tecnico") ? S.eu.id : null });
    if (tok !== S.tok || !data) return;
    cont = Object.fromEntries(GRUPOS().map((g) => [g[0], data.filter((x) => g[4](x)).reduce((a2, x) => a2 + Number(x.qtd), 0)]));
    $$("#folders [data-c]").forEach((b) => (b.textContent = cont[b.dataset.c]));
    pintarRot();
  }
  async function buscar() {
    // só a página visível vem do banco; a busca também é feita no banco
    let q = rotG()[3](escopo(sb.from("ordens_servico").select(CAMPOS)));
    const t = L.q.trim().replace(/[%*,()]/g, " ").trim(), num = t.toLowerCase().replace(/^os-?0*/, "");
    if (t) q = /^\d+$/.test(num) ? q.eq("id", +num) : q.or(`descricao.ilike.*${t}*,equipamento.ilike.*${t}*`);
    const { data, error } = await q.order("id", { ascending: false }).range(0, limite);
    if (tok !== S.tok) return;
    if (error) return toast(errMsg(error), true);
    $("#res").innerHTML = data.length ? data.slice(0, limite).map((o) => card(o)).join("") : `<div class="zero">Nenhuma OS encontrada com esses filtros.</div>`;
    $("#mais").hidden = data.length <= limite;
  }
  const escolher = (k) => { L.grupo = k; $$("#folders button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.g === k)); pintarRot(); limite = 30; buscar(); };
  $("#folders").onclick = (e) => { const b = e.target.closest("[data-g]"); if (b) escolher(b.dataset.g); };
  // celular e telas menores: lista vertical em folha
  $("#btnMostrar").onclick = () => folha({ titulo: "Mostrar", corpo: `<div class="folders-v">${GRUPOS().map(([k, r, i]) =>
      `<button data-g="${k}" aria-pressed="${k === L.grupo}">${ic(i)}<span>${r}</span><b>${cont[k] ?? ""}</b>${k === L.grupo ? ic("check") : ""}</button>`).join("")}</div>`,
    aoAbrir: (el, fechar) => { $(".folders-v", el).onclick = (e) => { const b = e.target.closest("[data-g]"); if (b) { fechar(); escolher(b.dataset.g); } }; } });
  $("#busca").oninput = (e) => { L.q = e.target.value; limite = 30; clearTimeout(viewOrdens.t); viewOrdens.t = setTimeout(buscar, 350); };
  $("#fNuc")?.addEventListener("change", (e) => { L.nuc = e.target.value; contar(); buscar(); });
  $("#mais").onclick = () => { limite += 30; buscar(); };
  $("#btnNovaL")?.addEventListener("click", novaOS);
  ligarLista($("#res"));
  pintarRot(); contar(); buscar();
}

/* ---------------- Detalhe da OS ---------------- */
async function abrirOS(id) {
  S.sel = id;
  $$(".os.sel").forEach((x) => x.classList.remove("sel"));
  $$(`.os[data-os="${id}"]`).forEach((x) => x.classList.add("sel"));
  let alvo;
  if (isMob() || !$("#pd")) {
    $(".page")?.remove();
    const pg = document.createElement("div"); pg.className = "page";
    pg.innerHTML = `<div class="page-bar"><button class="icon-btn" id="voltar" aria-label="Voltar">${ic("back")}</button><b>${osId(id)}</b>
      <button class="btn btn-sm fechar-t" id="fecharPg">${ic("x")}Fechar</button></div><div id="pgc"><div class="det"><div class="skel"></div></div></div>`;
    document.body.appendChild(pg); document.body.style.overflow = "hidden";
    $("#voltar", pg).onclick = $("#fecharPg", pg).onclick = () => { pg.remove(); document.body.style.overflow = ""; S.sel = null; $$(".os.sel").forEach((x) => x.classList.remove("sel")); };
    alvo = $("#pgc", pg);
  } else { alvo = $("#pd"); alvo.innerHTML = `<div class="det"><div class="skel"></div></div>`; }
  const [os, hist, at, lead, pzq] = await Promise.all([
    sb.from("ordens_servico").select("*").eq("id", id).single(),
    sb.from("os_historico").select("*").eq("os_id", id).order("id"),
    sb.from("os_atendimentos").select("*").eq("os_id", id).order("ciclo"),
    podeVerTudo() ? sb.from("vw_os_lead").select("*").eq("id", id).maybeSingle() : Promise.resolve({ data: null }),
    sb.from("os_pausas").select("*").eq("os_id", id).order("id"),
  ]);
  const pausas = pzq.data || [];
  if (os.error) { alvo.innerHTML = `<div class="det"><p class="err">${esc(errMsg(os.error))}</p></div>`; return; }
  alvo.innerHTML = (alvo.id === "pd" ? `<div class="det-bar"><span class="os-id">${osId(id)}</span><button class="icon-btn" data-fechar-det aria-label="Fechar detalhe" title="Fechar (Esc)">${ic("x")}</button></div>` : "")
    + detalheHTML(os.data, hist.data, at.data, lead.data, pausas);
  alvo.onclick = (e) => {
    if (e.target.closest("[data-fechar-det]")) return fecharDetalhe();
    const a = e.target.closest("[data-acao]"); if (a) executar(a.dataset.acao, id, a); };
  $$(".tabs button", alvo).forEach((b) => (b.onclick = () => {
    $$(".tabs button", alvo).forEach((x) => x.setAttribute("aria-selected", x === b));
    $$("[data-tab]", alvo).forEach((p) => (p.hidden = p.dataset.tab !== b.dataset.t));
  }));
}
function fecharDetalhe() {
  S.sel = null; $$(".os.sel").forEach((x) => x.classList.remove("sel"));
  if ($("#pd")) $("#pd").innerHTML = vazioDetalhe();
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$(".sheet-wrap")) { if ($(".page")) $("#voltar")?.click(); else if (S.sel) fecharDetalhe(); } });
function proximoPasso(o) {
  const b = (a, rot, cls, i) => `<button class="btn ${cls}" data-acao="${a}">${i ? ic(i) : ""}${rot}</button>`;
  const box = (tom, icone, tit, txt, botoes, sticky = true) => `<div class="next tone${sticky ? " sticky" : ""}" style="--tc:${tom}">
    <div class="next-h">${ic(icone)}${tit}</div><p>${txt}</p><div class="row">${botoes}</div></div>`;
  if (tem("gestor") && ["ABERTA", "PENDENTE DE ATENDIMENTO"].includes(o.status))
    return box("var(--s-aberta)", "send", "Precisa de direcionamento", "Defina a classificação e escolha quem vai atender.", b("direcionar", "Classificar e direcionar", "btn-primary", "send"));
  if (tem("manutentor") && o.manutentor_id === S.eu.id && o.status === "DIRECIONADA")
    return box("var(--s-direcionada)", "tool", "Direcionada para você", "Ao sair para atender, toque em Iniciar e diga se está indo até o local, indo buscar material ou se já vai começar o serviço. Se não puder atender, recuse explicando o motivo.",
      b("recusar", "Recusar", "btn-danger") + b("iniciar", "Iniciar atendimento", "btn-primary", "play"));
  if (tem("manutentor") && o.manutentor_id === S.eu.id && o.status === "EM ATENDIMENTO" && o.pausada_em && ehEtapa(o.pausa_motivo))
    return box("#2F6BD9", MOTIVOS[o.pausa_motivo].i, `${MOTIVOS[o.pausa_motivo].etapa} · há ${fmtMin(pausaMin(o))}`, o.pausa_motivo === "DESLOCAMENTO" ? "O deslocamento conta como trabalho, mas não como tempo de serviço. Chegou ao local? Toque abaixo para começar o serviço." : "A ida ao almoxarifado conta como trabalho, mas não como tempo de serviço. Voltou? Toque abaixo para continuar.",
      b("retomar", MOTIVOS[o.pausa_motivo].volta, "btn-primary", "play"));
  if (tem("manutentor") && o.manutentor_id === S.eu.id && o.status === "EM ATENDIMENTO" && o.pausada_em)
    return box("#6A6E75", "pause", `Pausado · ${MOTIVOS[o.pausa_motivo].rot} · há ${fmtMin(pausaMin(o))}`, "O tempo da pausa não conta como execução. Retome quando voltar ao serviço.",
      b("retomar", "Retomar atendimento", "btn-primary", "play"));
  if (tem("manutentor") && o.manutentor_id === S.eu.id && o.status === "EM ATENDIMENTO")
    return box("var(--s-atendimento)", "flag", `Executando o serviço · atendimento iniciado há ${idade(o.iniciada_em)}`, "Precisa ir ao almoxarifado? Toque em Material. Vai almoçar ou parar? Pause. Ao terminar, finalize descrevendo o que foi feito.",
      b("material", "Material", "", "box") + b("pausar", "Pausar", "", "pause") + b("finalizar", "Finalizar atendimento", "btn-primary", "flag"));
  if ((tem("tecnico") || tem("gestor")) && o.solicitante_id === S.eu.id && o.status === "AGUARDANDO CONFIRMAÇÃO")
    return box("var(--s-aguardando)", "checkc", "O manutentor finalizou", "Confira no local e confirme se o serviço foi resolvido.",
      b("naoresolvido", "Não resolvido", "btn-danger") + b("confirmar", "Confirmar: resolvido", "btn-primary", "check"));
  const info = {
    "ABERTA": "Aguardando o gestor classificar e direcionar.",
    "DIRECIONADA": `Com ${nomeU(o.manutentor_id)}, aguardando início.`,
    "EM ATENDIMENTO": o.pausada_em ? `${nomeU(o.manutentor_id)} pausou o atendimento: ${MOTIVOS[o.pausa_motivo].rot.toLowerCase()} (há ${fmtMin(pausaMin(o))}).` : `${nomeU(o.manutentor_id)} está atendendo há ${idade(o.iniciada_em)}.`,
    "AGUARDANDO CONFIRMAÇÃO": `Aguardando ${nomeU(o.solicitante_id)} confirmar.`,
    "PENDENTE DE ATENDIMENTO": "Voltou para o gestor direcionar novamente.",
    "CONCLUÍDA": `Concluída em ${fmtDH(o.confirmada_em)}.`,
  }[o.status];
  const alt = (tem("gerente") || tem("admin")) && o.prioridade && o.status !== "CONCLUÍDA" ? `<div class="row">${b("classificar", "Alterar classificação", "btn-sm")}</div>` : "";
  return `<div class="next"><div class="next-h">${ic(o.pausada_em ? "pause" : STATUS[o.status].i)}${o.pausada_em ? "Pausada" : STATUS[o.status].rot}</div><p${alt ? "" : ' style="margin-bottom:0"'}>${info}</p>${alt}</div>`;
}
function detalheHTML(o, hist, at, lead, pausas = []) {
  const T = ["ABERTA", "DIRECIONADA", "EM ATENDIMENTO", "AGUARDANDO CONFIRMAÇÃO", "CONCLUÍDA"], TR = ["Aberta", "Direcionada", "Atendimento", "Confirmação", "Concluída"];
  const quando = [o.aberta_em, o.direcionada_em, o.iniciada_em, o.finalizada_em, o.confirmada_em];
  const pos = T.indexOf(o.status), pend = o.status === "PENDENTE DE ATENDIMENTO";
  const steps = T.map((_, i) => `<div class="${pend ? (i === 0 ? "on" : i === 1 ? "bad" : "") : i <= pos ? "on" : ""}"><i></i>${TR[i]}${quando[i] && (pend ? i === 0 : i <= pos) ? `<small>${fmtDH(quando[i])}</small>` : ""}</div>`).join("");
  const ult = [...hist].reverse().find((h) => h.status === "PENDENTE DE ATENDIMENTO");
  const RES = { CONFIRMADO: ["ok", "Resolvido"], NAO_RESOLVIDO: ["bad", "Não resolvido"], RECUSADO: ["bad", "Recusada"], DEVOLVIDO: ["", "Devolvida pelo administrador"] };
  const ciclos = [...at].reverse().map((a) => `<div class="cycle">
    <div class="cycle-h">${av(a.manutentor_id, "sm")}<b>${esc(nomeU(a.manutentor_id))}</b><small>Atendimento ${a.ciclo}</small>${a.resultado ? `<span class="tag ${RES[a.resultado][0]}">${RES[a.resultado][1]}</span>` : a.finalizada_em ? `<span class="tag">Aguardando técnico</span>` : `<span class="tag">Em curso</span>`}</div>
    <small>Direcionada ${fmtDH(a.direcionada_em)}${a.iniciada_em ? ` · início ${fmtDH(a.iniciada_em)}` : ""}${a.finalizada_em ? ` · término ${fmtDH(a.finalizada_em)}` : ""}</small>
    ${(() => { const pz = pausas.filter((p) => p.atendimento_id === a.id); if (!pz.length) return "";
      const dur = (p) => ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4, soma = (f) => pz.filter(f).reduce((s2, p) => s2 + dur(p), 0);
      const tot = soma(() => true), des = soma((p) => p.motivo === "DESLOCAMENTO"), mat = soma((p) => p.motivo === "MATERIAL"), par = tot - des - mat;
      const bruto = a.finalizada_em ? (new Date(a.finalizada_em) - new Date(a.iniciada_em)) / 6e4 : null;
      return `<div class="kv"><b>${[bruto != null ? `Serviço ${fmtMin(bruto - tot)}` : "", des ? `Deslocamento ${fmtMin(des)}` : "", mat ? `Material ${fmtMin(mat)}` : "", par ? `Pausas ${fmtMin(par)}` : ""].filter(Boolean).join(" · ")}</b>
        <ul class="mats">${pz.map((p) => `<li><span>${ic(MOTIVOS[p.motivo].i)} ${MOTIVOS[p.motivo].rot}${p.detalhe ? `<small class="muted">${esc(p.detalhe)}</small>` : ""}</span><b>${p.fim ? fmtMin((new Date(p.fim) - new Date(p.inicio)) / 6e4) : ehEtapa(p.motivo) ? "agora" : "em pausa"}</b></li>`).join("")}</ul></div>`; })()}
    ${a.motivo_recusa ? `<div class="kv"><b>Motivo da recusa</b><p>${esc(a.motivo_recusa)}</p></div>` : ""}
    ${a.servico_realizado ? `<div class="kv"><b>O que foi feito</b><p>${esc(a.servico_realizado)}</p></div>` : ""}
    ${a.finalizada_em ? `<div class="kv"><b>Material do estoque do carro${a.materiais_carro?.[0]?.almoxarifado ? ` · carro ${a.materiais_carro[0].almoxarifado}` : ""}</b>${a.materiais_carro?.length ? `<ul class="mats">${a.materiais_carro.map((m) => `<li><span>${esc(m.material)}<small class="muted mono">${esc(m.codigo)}${m.controle ? ` · ${esc(m.controle)}` : ""}</small></span><b>${m.quantidade} ${esc(m.unidade)}</b></li>`).join("")}</ul>` : `<p class="muted">Não usou</p>`}</div>` : ""}
  </div>`).join("");
  const EVI = { "OS aberta": "inbox", "Direcionada": "send", "Redirecionada após pendência": "send", "Atendimento iniciado": "play", "Atendimento finalizado": "flag",
    "Serviço confirmado pelo técnico": "checkc", "Técnico informou que não foi resolvido": "undo", "Recusada pelo manutentor": "undo", "Classificação alterada": "alert", "Atendimento pausado": "pause", "Atendimento retomado": "play" };
  const linha = hist.map((h) => `<li style="--sc:${STATUS[h.status].c}"><span class="tdot">${ic(EVI[h.evento] || "clock")}</span><div><b>${esc(h.evento)}</b>${h.detalhe ? `<p>${esc(h.detalhe)}</p>` : ""}<small>${fmtDH(h.em)} · ${esc(nomeU(h.usuario_id))}</small></div></li>`).join("");
  const grid = [["Granja", esc(nomeN(o.nucleo_id))], ["Local", local(o.galpoes)], ["Equipamento", esc(o.equipamento || "—")],
    ["Solicitante", esc(nomeU(o.solicitante_id))], ["Aberta em", fmtDH(o.aberta_em)], ["Manutentor", esc(nomeU(o.manutentor_id))]];
  return `<div class="det">
    <div class="det-head"><span class="os-id">${osId(o.id)}</span>${sev(o.prioridade)}${stTag(o.status, o)}</div>
    <h2>${esc(o.descricao)}</h2>
    <div class="steps">${steps}</div>
    ${pend && ult ? `<div class="pend-box">${ic("undo")}<div><b>${esc(ult.evento)}</b>${ult.detalhe ? `<p>“${esc(ult.detalhe)}”</p>` : ""}</div></div>` : ""}
    <dl class="det-grid">${grid.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
    ${proximoPasso(o)}
    <div class="tabs" role="tablist"><button data-t="at" aria-selected="true">Atendimentos (${at.length})</button><button data-t="hist" aria-selected="false">Linha do tempo</button>${lead ? `<button data-t="lead" aria-selected="false">Tempos</button>` : ""}</div>
    <div data-tab="at">${ciclos || `<div class="zero">Ainda não foi direcionada.</div>`}</div>
    <div data-tab="hist" hidden><ul class="timeline">${linha}</ul></div>
    ${lead ? `<div data-tab="lead" hidden><div class="lead-strip">
      <div><b>${fmtMin(lead.min_abertura_direcionamento)}</b><small>Até direcionar</small></div><div><b>${fmtMin(lead.min_espera_inicio)}</b><small>Espera p/ iniciar</small></div>
      <div><b>${fmtMin(lead.min_execucao)}</b><small>Serviço (execução)${(() => { const d = (m) => pausas.filter((p) => p.motivo === m).reduce((s2, p) => s2 + ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4, 0); const des = d("DESLOCAMENTO"), mat = d("MATERIAL"); return (des ? ` · ${fmtMin(des)} deslocamento` : "") + (mat ? ` · ${fmtMin(mat)} material` : ""); })()}</small></div><div><b>${fmtMin(lead.min_lead_total)}</b><small>Lead total</small></div></div></div>` : ""}
  </div>`;
}

/* ---------------- ações ---------------- */
async function executar(acao, id, btn) {
  const { data: o, error } = await sb.from("ordens_servico").select("*").eq("id", id).single();
  if (error) return toast(errMsg(error), true);
  const resumo = [["OS", `<span class="mono">${osId(o.id)}</span>`], ["Serviço", esc(o.descricao)], ["Onde", `${esc(nomeN(o.nucleo_id))} · ${local(o.galpoes)}`]];
  const fim = (titulo, texto, linhas) => { fecharPagina(); recarregar(); sucesso({ titulo, texto, linhas,
    primario: { rot: "Concluir", fn: () => {} }, secundario: { rot: "Ver a OS", fn: () => abrirOS(o.id) } }); };
  if (acao === "iniciar") return folhaIniciar(o);
  if (acao === "material") return busy(btn, async () => { await rpc("pausar_atendimento", { p_os: id, p_motivo: "MATERIAL", p_detalhe: "" });
    toast("Buscando material. Ao voltar, toque em “Voltei · continuar serviço”."); recarregar(); if (isMob()) abrirOS(id); });
  if (acao === "retomar") return busy(btn, async () => { const r = await rpc("retomar_atendimento", { p_os: id });
    if (ehEtapa(o.pausa_motivo)) { toast(o.pausa_motivo === "DESLOCAMENTO" ? `Serviço iniciado. Deslocamento: ${fmtMin(r.minutos)}.` : `Serviço retomado. Tempo buscando material: ${fmtMin(r.minutos)}.`); recarregar(); if (isMob()) abrirOS(id); return; }
    const exc = o.pausa_motivo === "ALMOCO" ? r.minutos - (S.jornada?.almoco_max_min || 120) : 0;
    toast(exc > 0 ? `Retomado. O almoço passou ${fmtMin(exc)} do padrão de ${fmtMin(S.jornada?.almoco_max_min || 120)} e ficará registrado.` : `Atendimento retomado após ${fmtMin(r.minutos)} de pausa.${r.pausou ? ` ${osId(r.pausou)} foi pausada.` : ""}`, exc > 0);
    recarregar(); if (isMob()) abrirOS(id); });
  if (acao === "pausar") return folhaPausa(o);
  if (acao === "confirmar") return busy(btn, async () => { await rpc("confirmar_os", { p_os: id, p_resolvido: true }); fim(`${osId(id)} concluída`, "Obrigado por confirmar. O atendimento foi encerrado.", resumo); });
  if (acao === "direcionar") return folhaDirecionar(o, fim);
  if (acao === "recusar") return folhaTexto(o, { titulo: "Recusar OS", sub: "A OS volta para o gestor com o seu motivo.", campo: "Motivo da recusa", ph: "Ex.: precisa de eletricista terceirizado; falta a peça no estoque",
    min: 10, botao: "Enviar recusa", perigo: true, ok: async (t) => { await rpc("recusar_os", { p_os: id, p_motivo: t }); fim("Recusa enviada ao gestor", "A OS voltou para o gestor de manutenção direcionar de novo.", [["Motivo", esc(t)], ...resumo]); } });
  if (acao === "naoresolvido") return folhaTexto(o, { titulo: "Não foi resolvido", sub: "A OS volta para o gestor direcionar um novo atendimento.", campo: "O que ainda falta?", ph: "Ex.: continua vazando na junção da linha 3",
    min: 0, botao: "Devolver para o gestor", perigo: true, ok: async (t) => { await rpc("confirmar_os", { p_os: id, p_resolvido: false, p_observacao: t }); fim(`${osId(id)} devolvida`, "O gestor vai direcionar um novo atendimento.", resumo); } });
  if (acao === "finalizar") return folhaFinalizar(o, fim);
  if (acao === "classificar") return folhaClassificar(o);
}
function fecharPagina() { $(".page")?.remove(); if (!$(".sheet-wrap")) document.body.style.overflow = ""; }
const prioOpts = (sel = "") => `<div class="prio-opts" id="prios">${Object.entries(PRIO).map(([k, v]) =>
  `<button type="button" class="prio-opt" style="--pc:${PCOR[k]}" data-p="${k}" aria-checked="${k === sel}"><b>${v.rot}</b><small>${v.desc}</small></button>`).join("")}</div>`;
function marcar(el, sel) { el.onclick = (e) => { const b = e.target.closest(sel); if (!b) return; $$(sel, el).forEach((x) => x.setAttribute("aria-checked", x === b)); }; }

async function folhaDirecionar(o, fim) {
  const { data: fila } = await sb.from("ordens_servico").select("manutentor_id,status").in("status", ["DIRECIONADA", "EM ATENDIMENTO"]).range(0, 999);
  const mnts = Object.values(S.usuarios).filter((u) => u.ativo && u.perfis.includes("manutentor"));
  folha({
    titulo: "Classificar e direcionar", sub: `${osId(o.id)} · ${esc(o.descricao)}`,
    corpo: `<div class="label">Classificação</div>${prioOpts(o.prioridade || "")}
      <div class="label">Manutentor <span class="muted" style="font-weight:400">— carga atual entre parênteses</span></div>
      <div class="people" id="pessoas">${mnts.map((u) => { const n = fila.filter((f) => f.manutentor_id === u.id).length;
        return `<button type="button" class="person" data-u="${u.id}" aria-checked="false">${av(u.id)}<span><b>${esc(u.nome)}</b><small>Manutentor</small></span><span class="load"><b>${n}</b>na fila</span></button>`; }).join("")}</div>
      <p class="err" id="erroD"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okD">${ic("send")}Direcionar</button>`,
    aoAbrir: (el, fechar) => {
      marcar($("#prios", el), ".prio-opt"); marcar($("#pessoas", el), ".person");
      $("#okD", el).onclick = (e) => {
        const p = $(".prio-opt[aria-checked=true]", el)?.dataset.p, u = $(".person[aria-checked=true]", el)?.dataset.u;
        if (!p) return ($("#erroD", el).textContent = "Escolha a classificação.");
        if (!u) return ($("#erroD", el).textContent = "Escolha o manutentor.");
        busy(e.currentTarget, async () => { await rpc("direcionar_os", { p_os: o.id, p_manutentor: u, p_prioridade: p }); fechar();
          fim(`${osId(o.id)} direcionada`, `${esc(nomeU(u))} já vê esta OS na fila.`, [["Manutentor", esc(nomeU(u))], ["Classificação", sev(p)], ["Serviço", esc(o.descricao)]]); });
      };
    },
  });
}
function folhaTexto(o, { titulo, sub, campo, ph, min, botao, perigo, ok }) {
  folha({
    titulo, sub,
    corpo: `<label class="field"><span>${campo}${min ? "" : " <em>(opcional)</em>"}</span><textarea class="input" id="txt" placeholder="${esc(ph)}" maxlength="1000"></textarea></label><p class="err" id="erroT"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn ${perigo ? "btn-brand" : "btn-primary"}" id="okT">${botao}</button>`,
    aoAbrir: (el, fechar) => {
      $("#txt", el).focus();
      $("#okT", el).onclick = (e) => {
        const t = $("#txt", el).value.trim();
        if (t.length < min) return ($("#erroT", el).textContent = `Explique com pelo menos ${min} caracteres.`);
        busy(e.currentTarget, async () => { await ok(t); fechar(); });
      };
    },
  });
}
function folhaFinalizar(o, fim) {
  const linha = () => `<div class="mat">
    <label class="a-cod">Código<input class="input m-cod" placeholder="10452"></label>
    <label class="a-nome">Produto<input class="input m-nome" placeholder="Abraçadeira de nylon 20cm"></label>
    <label class="a-ctrl">Controle <span class="muted">(se houver)</span><input class="input m-ctrl" placeholder="Opcional"></label>
    <label class="a-qtd">Qtd<input class="input m-qtd" type="number" inputmode="decimal" min="0" step="any"></label>
    <label class="a-un">Unid.<select class="input m-un">${UNIDADES.map((u) => `<option>${u}</option>`).join("")}</select></label>
    <button type="button" class="rm" aria-label="Remover">${ic("x")}</button></div>`;
  folha({
    titulo: "Finalizar atendimento", sub: `${osId(o.id)} · ${esc(o.descricao)}`, tam: "lg",
    corpo: `<label class="field"><span>O que foi feito</span><textarea class="input" id="serv" maxlength="2000" placeholder="Ex.: troquei a vedação do registro da linha 3 e testei a pressão"></textarea></label>
      <div class="label">Material do estoque do carro</div>
      <div class="choice" id="usou"><button type="button" data-v="nao" aria-pressed="false">Não usei</button><button type="button" data-v="sim" aria-pressed="false">Usei material do carro</button></div>
      <div class="note"><b>Só o que saiu do seu carro.</b> Material retirado do almoxarifado já tem o custo lançado automaticamente e não deve ser registrado aqui.</div>
      <div id="blocoCarro" hidden><div class="label">De qual carro saiu o material? <span class="obrig">obrigatório</span></div>
        <div class="carros" id="carros">${(S.carros || []).map((c) => `<button type="button" data-c="${c.codigo}" aria-pressed="false"><small>Almox.</small>${c.codigo}</button>`).join("")}</div></div>
      <div id="mats" hidden></div><button type="button" class="btn btn-sm" id="addM" hidden>${ic("plus")}Adicionar produto</button>
      <p class="err" id="erroF"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okF">${ic("flag")}Finalizar</button>`,
    aoAbrir: (el, fechar) => {
      let usou = null;
      $("#usou", el).onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; usou = b.dataset.v;
        $$("#usou button", el).forEach((x) => x.setAttribute("aria-pressed", x === b));
        $("#mats", el).hidden = $("#addM", el).hidden = $("#blocoCarro", el).hidden = usou !== "sim";
        if (usou === "sim" && !$("#mats", el).children.length) $("#mats", el).insertAdjacentHTML("beforeend", linha()); };
      let carro = null;
      $("#carros", el).onclick = (e) => { const b = e.target.closest("[data-c]"); if (!b) return; carro = +b.dataset.c;
        $$("#carros button", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); $("#erroF", el).textContent = ""; };
      $("#addM", el).onclick = () => $("#mats", el).insertAdjacentHTML("beforeend", linha());
      $("#mats", el).onclick = (e) => { if (e.target.closest(".rm")) e.target.closest(".mat").remove(); };
      $("#okF", el).onclick = (e) => {
        const err = (t) => ($("#erroF", el).textContent = t), serv = $("#serv", el).value.trim();
        if (serv.length < 10) return err("Descreva o que foi feito (mínimo 10 caracteres).");
        if (!usou) return err("Informe se usou material do estoque do carro.");
        const mats = usou === "nao" ? [] : $$(".mat", el).map((m) => ({ codigo: $(".m-cod", m).value.trim(), material: $(".m-nome", m).value.trim(),
          controle: $(".m-ctrl", m).value.trim() || null, quantidade: +$(".m-qtd", m).value, unidade: $(".m-un", m).value })).filter((m) => m.codigo || m.material || m.quantidade);
        if (usou === "sim" && !mats.length) return err("Adicione pelo menos um produto ou marque \"Não usei\".");
        if (mats.some((m) => !m.codigo || !m.material || !(m.quantidade > 0))) return err("Preencha código, produto e quantidade de cada item.");
        if (mats.length && !carro) { $("#blocoCarro", el).scrollIntoView({ behavior: "smooth", block: "center" }); return err("Selecione o código do carro de onde saiu o material."); }
        busy(e.currentTarget, async () => { await rpc("finalizar_atendimento", { p_os: o.id, p_servico: serv, p_materiais: mats, p_almoxarifado: mats.length ? carro : null }); fechar();
          fim(`Atendimento de ${osId(o.id)} finalizado`, "Enviada para o técnico confirmar se foi resolvido.", [["O que foi feito", esc(serv)], ["Material do carro", mats.length ? `${mats.length} produto(s) · carro ${carro}` : "Não usou"]]); });
      };
    },
  });
}
// Iniciar: o manutentor diz o que está fazendo agora (deslocamento e material contam como trabalho, mas não como serviço)
function folhaIniciar(o) {
  const OP = [["DESLOCAMENTO", "truck", "Estou indo até o local", "Conta como deslocamento até você tocar em “Cheguei”."],
    ["MATERIAL", "box", "Vou buscar material no almoxarifado", "Conta como busca de material até você tocar em “Voltei”."],
    ["", "tool", "Já estou no local: começar o serviço", "Começa direto a contar o tempo de serviço."]];
  folha({
    titulo: "Iniciar atendimento", sub: `${osId(o.id)} · o que você vai fazer agora?`,
    corpo: `<div class="people" id="etapas">${OP.map(([k, i, t, d]) => `<button type="button" class="person" data-e="${k}" aria-checked="false"><span class="avatar" style="background:var(--surface-2);color:var(--ink-2)">${ic(i)}</span><span><b>${t}</b><small>${d}</small></span></button>`).join("")}</div>
      <p class="muted" style="font-size:12.5px;margin-top:10px">Os horários são gravados sozinhos. Assim o tempo de serviço fica só com o serviço de fato, e o deslocamento e a busca de material ficam separados.</p><p class="err" id="erroI"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okI">${ic("play")}Iniciar</button>`,
    aoAbrir: (el, fechar) => {
      marcar($("#etapas", el), ".person");
      $("#okI", el).onclick = (e) => {
        const sel = $(".person[aria-checked=true]", el); if (!sel) return ($("#erroI", el).textContent = "Escolha uma opção.");
        const etapa = sel.dataset.e || null;
        busy(e.currentTarget, async () => { const r = await rpc("iniciar_atendimento", { p_os: o.id, p_etapa: etapa }); fechar();
          const msg = etapa === "DESLOCAMENTO" ? "Deslocamento iniciado. Ao chegar, toque em “Cheguei · iniciar serviço”." : etapa === "MATERIAL" ? "Busca de material iniciada. Ao voltar, toque em “Voltei · continuar serviço”." : "Serviço iniciado. Bom trabalho!";
          toast(r?.pausou ? `${msg} ${osId(r.pausou)} foi pausada automaticamente.` : msg); recarregar(); if (isMob()) abrirOS(o.id); });
      };
    },
  });
}
function folhaPausa(o) {
  folha({
    titulo: "Pausar atendimento", sub: `${osId(o.id)} · o tempo da pausa não conta como execução`,
    corpo: `<div class="people" id="motivos">${Object.entries(MOTIVOS).filter(([k]) => k !== "OUTRA_OS" && !ehEtapa(k)).map(([k, m]) =>
        `<button type="button" class="person" data-m="${k}" aria-checked="false"><span class="avatar" style="background:var(--surface-2);color:var(--ink-2)">${ic(m.i)}</span><span><b>${m.rot}</b>${m.lim ? `<small>alerta se passar de ${fmtMin(m.lim)}</small>` : ""}</span></button>`).join("")}</div>
      <label class="field" style="margin-top:12px"><span>Detalhe <em id="detOpc">(opcional)</em></span><input class="input" id="pDet" maxlength="120" placeholder="Ex.: disjuntor 3x40A pedido ao almoxarifado"></label>
      <div class="note" id="infoAlmoco" hidden></div>
      <p class="muted" style="font-size:12.5px">O horário de início e de retorno é registrado automaticamente. Para atender outra OS, não precisa pausar: ao iniciar a outra, esta é pausada sozinha.</p><p class="err" id="erroP"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okP">${ic("pause")}Pausar</button>`,
    aoAbrir: (el, fechar) => {
      marcar($("#motivos", el), ".person");
      $("#motivos", el).addEventListener("click", () => { const m = $(".person[aria-checked=true]", el)?.dataset.m; $("#detOpc", el).textContent = m === "OUTRO" ? "(obrigatório)" : "(opcional)";
        const lim = S.jornada?.almoco_max_min || 120, volta = new Date(Date.now() + lim * 6e4).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
        $("#infoAlmoco", el).hidden = m !== "ALMOCO"; $("#infoAlmoco", el).innerHTML = `<b>Almoço padrão: ${fmtMin(lim)}.</b> Retorno previsto até <b>${volta}</b>. Passando disso, a diferença fica registrada para o administrador.`; });
      $("#okP", el).onclick = (e) => {
        const m = $(".person[aria-checked=true]", el)?.dataset.m, d = $("#pDet", el).value.trim();
        if (!m) return ($("#erroP", el).textContent = "Escolha o motivo da pausa.");
        if (m === "OUTRO" && d.length < 3) return ($("#erroP", el).textContent = "Escreva o motivo.");
        busy(e.currentTarget, async () => { await rpc("pausar_atendimento", { p_os: o.id, p_motivo: m, p_detalhe: d }); fechar();
          toast(`Atendimento pausado: ${MOTIVOS[m].rot.toLowerCase()}.`); recarregar(); if (isMob()) abrirOS(o.id); });
      };
    },
  });
}
function folhaClassificar(o) {
  folha({
    titulo: "Alterar classificação", sub: `${osId(o.id)} · a mudança fica no histórico`, corpo: prioOpts(o.prioridade),
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okC">Salvar</button>`,
    aoAbrir: (el, fechar) => {
      marcar($("#prios", el), ".prio-opt");
      $("#okC", el).onclick = (e) => { const p = $(".prio-opt[aria-checked=true]", el).dataset.p;
        if (p === o.prioridade) return fechar();
        busy(e.currentTarget, async () => { await rpc("alterar_prioridade", { p_os: o.id, p_prioridade: p }); fechar(); toast(`Classificação alterada para ${PRIO[p].rot}.`); abrirOS(o.id); }); };
    },
  });
}

/* ---------------- Nova OS em 3 passos ---------------- */
function novaOS(prev = false) {
  const D = { nuc: null, toda: false, av: new Set(), eq: "", desc: "", mnt: "" };
  let passo = 1, carga = null;
  const f = folha({ titulo: prev ? "Nova OS preventiva" : "Nova ordem de serviço", sub: prev ? "Manutenção programada, sem problema aberto" : "Leva menos de um minuto", tam: "lg full", corpo: "", rodape: `<button class="btn" id="wVolta">Cancelar</button><button class="btn btn-primary" id="wSegue">Continuar</button>` });
  const el = f.el, corpo = $(".sheet-b", el);
  $(".sheet-h", el).insertAdjacentHTML("afterend", `<div class="wiz-prog" id="prog"></div>`);
  function render() {
    $("#prog", el).innerHTML = ["Onde", "O quê", "Revisar"].map((r, i) => `<div class="${i < passo ? "on" : ""}"><i></i>${i + 1}. ${r}</div>`).join("");
    $("#wVolta", el).textContent = passo === 1 ? "Cancelar" : "Voltar";
    $("#wSegue", el).innerHTML = passo === 3 ? `${ic(prev ? "shield" : "send")}${prev ? "Abrir preventiva" : "Abrir OS"}` : "Continuar";
    $("#wSegue", el).className = `btn ${passo === 3 ? "btn-brand" : "btn-primary"}`;
    if (passo === 1) {
      const n = S.nucleoPorId[D.nuc];
      corpo.innerHTML = `<div class="label">Granja</div>
        <div class="farms" id="farms">${S.nucleos.map((x) => `<button type="button" class="farm" data-n="${x.id}" aria-pressed="${x.id === D.nuc}"><b>${esc(x.nome)}</b><small>${x.galpoes.length} aviários</small></button>`).join("")}</div>
        ${n ? `<div class="label" id="lblAv">Aviários <span class="muted" style="font-weight:400">— toque em um ou mais</span></div>
        <div class="aviarios" id="avs"><button type="button" class="all" data-g="" aria-pressed="${D.toda}">Toda a granja</button>${n.galpoes.map((g) => `<button type="button" data-g="${g}" aria-pressed="${D.av.has(g)}">${g}</button>`).join("")}</div>` : ""}
        <p class="err" id="erroW"></p>`;
      $("#farms", el).onclick = (e) => { const b = e.target.closest("[data-n]"); if (!b) return; if (+b.dataset.n !== D.nuc) { D.nuc = +b.dataset.n; D.av.clear(); D.toda = false; } render(); $("#lblAv", el)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
      $("#avs", el)?.addEventListener("click", (e) => { const b = e.target.closest("[data-g]"); if (!b) return;
        if (b.dataset.g === "") { D.toda = !D.toda; if (D.toda) D.av.clear(); } else { D.toda = false; const g = +b.dataset.g; D.av.has(g) ? D.av.delete(g) : D.av.add(g); }
        $$("#avs button", el).forEach((x) => x.setAttribute("aria-pressed", x.dataset.g === "" ? D.toda : D.av.has(+x.dataset.g))); });
    } else if (passo === 2) {
      corpo.innerHTML = `<div class="label">Local ou equipamento</div>
        <div class="equips" id="eqs">${EQUIP.map(([n, i]) => `<button type="button" class="equip" data-e="${esc(n)}" aria-pressed="${n === D.eq}">${ic(i)}${esc(n)}</button>`).join("")}</div>
        <label class="field" style="margin-top:10px"><span>Outro <em>(se não estiver na lista)</em></span><input class="input" id="eqOutro" maxlength="80" placeholder="Ex.: Balança do silo" value="${EQUIP.some(([n]) => n === D.eq) ? "" : esc(D.eq)}"></label>
        <label class="field"><span>O que precisa ser feito</span><textarea class="input" id="desc" maxlength="2000" placeholder="${prev ? "Ex.: limpeza e revisão dos exaustores; verificar correias e lubrificar." : "Ex.: comedouro da linha 2 não desce ração no fundo do aviário. Se for urgente, explique o motivo."}">${esc(D.desc)}</textarea></label>
        <p class="err" id="erroW"></p>`;
      $("#eqs", el).onclick = (e) => { const b = e.target.closest("[data-e]"); if (!b) return; D.eq = b.dataset.e; $("#eqOutro", el).value = "";
        $$("#eqs .equip", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); $("#desc", el).focus(); };
      $("#eqOutro", el).oninput = (e) => { D.eq = e.target.value; $$("#eqs .equip", el).forEach((x) => x.setAttribute("aria-pressed", "false")); };
      $("#desc", el).oninput = (e) => (D.desc = e.target.value);
    } else {
      if (prev && !carga) { carga = {}; sb.from("ordens_servico").select("manutentor_id").in("status", ["DIRECIONADA", "EM ATENDIMENTO"]).then(({ data }) => { (data || []).forEach((x) => (carga[x.manutentor_id] = (carga[x.manutentor_id] || 0) + 1)); if (passo === 3) render(); }); }
      const mnts = Object.values(S.usuarios).filter((u) => u.perfis.includes("manutentor") && u.ativo && !u.excluido_em).sort((a, b) => (carga?.[a.id] || 0) - (carga?.[b.id] || 0) || a.nome.localeCompare(b.nome));
      corpo.innerHTML = `${prev ? `<div class="note" style="margin-bottom:12px"><b>Preventiva:</b> entra na fila do manutentor <b>depois das corretivas</b> e, ao ser finalizada, <b>volta para você conferir</b>.</div>
        <div class="label">Direcionar para <span class="muted" style="font-weight:400">— opcional; quem está com menos OS aparece primeiro</span></div>
        <div class="people" id="pMnt"><button type="button" class="person" data-u="" aria-checked="${!D.mnt}"><span class="avatar" style="background:var(--surface-2);color:var(--ink-2)">${ic("clock")}</span><span><b>Direcionar depois</b><small>Fica em “A direcionar”</small></span></button>
        ${mnts.map((u) => `<button type="button" class="person" data-u="${u.id}" aria-checked="${D.mnt === u.id}">${av(u.id)}<span><b>${esc(u.nome)}</b><small>${carga ? `${carga[u.id] || 0} OS em mãos` : "…"}</small></span></button>`).join("")}</div>` : `<p class="muted" style="margin-bottom:12px">Confira antes de enviar. O gestor de manutenção vai classificar e direcionar.</p>`}
        <dl class="review"><div><dt>Granja</dt><dd>${esc(nomeN(D.nuc))}</dd></div><div><dt>Local</dt><dd>${D.toda ? "Toda a granja" : local([...D.av])}</dd></div>
        <div><dt>Equipamento</dt><dd>${esc(D.eq)}</dd></div><div><dt>O que precisa</dt><dd>${esc(D.desc)}</dd></div></dl>
        <p style="margin-top:10px"><button class="linkish" id="editar">Corrigir alguma coisa</button></p><p class="err" id="erroW"></p>`;
      $("#editar", el).onclick = () => { passo = 1; render(); };
      $("#pMnt", el)?.addEventListener("click", (e) => { const b = e.target.closest("[data-u]"); if (!b) return; D.mnt = b.dataset.u; $$("#pMnt .person", el).forEach((x) => x.setAttribute("aria-checked", x === b)); });
    }
    corpo.scrollTop = 0;
  }
  $("#wVolta", el).onclick = () => (passo === 1 ? f.fechar() : (passo--, render()));
  $("#wSegue", el).onclick = (e) => {
    const err = (t) => ($("#erroW", el).textContent = t);
    if (passo === 1) { if (!D.nuc) return err("Escolha a granja."); if (!D.toda && !D.av.size) return err("Escolha um ou mais aviários, ou \"Toda a granja\"."); }
    if (passo === 2) { if (D.eq.trim().length < 3) return err("Escolha ou escreva o local/equipamento."); if (D.desc.trim().length < 3) return err("Descreva o que precisa ser feito."); }
    if (passo < 3) { passo++; return render(); }
    busy(e.currentTarget, async () => {
      const id = await rpc("abrir_os", { p_nucleo_id: D.nuc, p_galpoes: D.toda ? [] : [...D.av], p_equipamento: D.eq.trim(), p_descricao: D.desc.trim(), ...(prev ? { p_tipo: "PREVENTIVA", p_manutentor: D.mnt || null } : {}) });
      f.fechar(); recarregar();
      sucesso({ titulo: `${osId(id)} ${prev ? "preventiva " : ""}aberta com sucesso`, texto: prev ? (D.mnt ? `Direcionada para ${esc(nomeU(D.mnt))}. Entra na fila depois das corretivas e volta para você conferir.` : "Ficou em “A direcionar”. Direcione quando alguém estiver livre.") : "O gestor de manutenção vai classificar e direcionar. Você acompanha tudo em Minhas OS.",
        linhas: [["Granja", esc(nomeN(D.nuc))], ["Local", D.toda ? "Toda a granja" : local([...D.av])], ["Equipamento", esc(D.eq)]],
        primario: { rot: prev ? "Abrir outra preventiva" : "Abrir outra OS", fn: () => novaOS(prev) }, secundario: { rot: "Ver a OS", fn: () => abrirOS(id) } });
    });
  };
  render();
}

/* ---------------- Painel ---------------- */
/* ---------------- gráficos (SVG, sem biblioteca) ---------------- */
function donut(partes, { centro = "", sub = "", tam = 170, esp = 20 } = {}) {
  const p = partes.filter((x) => x.v > 0), tot = p.reduce((a, x) => a + x.v, 0), r = (tam - esp) / 2, cx = tam / 2, circ = 2 * Math.PI * r;
  let off = 0; const gap = p.length > 1 ? 2.5 : 0;
  const arcos = p.map((x) => { const len = (x.v / tot) * circ, el = `<circle r="${r}" cx="${cx}" cy="${cx}" fill="none" style="stroke:${x.c}" stroke-width="${esp}"
      stroke-dasharray="${Math.max(0.01, len - gap)} ${circ}" stroke-dashoffset="${-off}"><title>${x.l}: ${x.v}</title></circle>`; off += len; return el; }).join("");
  return `<div class="donut" style="--t:${tam}px"><svg viewBox="0 0 ${tam} ${tam}"><circle r="${r}" cx="${cx}" cy="${cx}" fill="none" stroke="#F1ECE6" stroke-width="${esp}"/>${arcos}</svg>
    <div class="donut-c"><b>${centro}</b><small>${sub}</small></div></div>`;
}
const legenda = (partes, tot) => `<div class="leg">${partes.map((x) => `<div><i style="background:${x.c}"></i><span>${x.l}</span><b>${x.txt ?? x.v}</b>${tot ? `<em>${pct(x.v, tot)}%</em>` : ""}</div>`).join("")}</div>`;
const donutBloco = (partes, opts) => { const tot = partes.reduce((a, x) => a + x.v, 0); return tot ? `<div class="donut-bloco">${donut(partes, opts)}${legenda(partes, tot)}</div>` : `<div class="zero">Sem dados no período.</div>`; };
function suave(pts) { // curva suave passando pelos pontos
  if (pts.length < 2) return pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("");
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[Math.max(0, i - 1)], [x1, y1] = pts[i], [x2, y2] = pts[i + 1], [x3, y3] = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${x1 + (x2 - x0) / 6},${y1 + (y2 - y0) / 6} ${x2 - (x3 - x1) / 6},${y2 - (y3 - y1) / 6} ${x2},${y2}`; }
  return d;
}
let gid = 0;
function linhas(rotulos, series, { alt = 230, largura = 640 } = {}) {
  const W = Math.max(300, Math.round(largura)), H = alt, pl = 34, pr = 14, pt = 16, pb = 28, n = rotulos.length;
  const bruto = Math.max(1, ...series.flatMap((s2) => s2.v)), passo = Math.max(1, Math.ceil(bruto / 4)), max = passo * 4;
  const x = (i) => pl + (n < 2 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (n - 1)), y = (v) => pt + (H - pt - pb) * (1 - v / max);
  const grade = [0, 1, 2, 3, 4].map((k) => `<line x1="${pl}" x2="${W - pr}" y1="${y(k * passo)}" y2="${y(k * passo)}" class="gl"/><text x="${pl - 8}" y="${y(k * passo) + 4}" class="gy">${k * passo}</text>`).join("");
  const cada = Math.max(1, Math.ceil(n / 7));
  const eixo = rotulos.map((r2, i) => (i % cada === 0 || i === n - 1 ? `<text x="${x(i)}" y="${H - 8}" class="gx">${r2}</text>` : "")).join("");
  const desenhos = series.map((s2) => { const id = `g${++gid}`, pts = s2.v.map((v, i) => [x(i), y(v)]);
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s2.c}" stop-opacity=".22"/><stop offset="1" stop-color="${s2.c}" stop-opacity="0"/></linearGradient></defs>
      <path d="${suave(pts)} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z" fill="url(#${id})"/>
      <path d="${suave(pts)}" fill="none" stroke="${s2.c}" stroke-width="2.6" stroke-linecap="round"/>
      ${pts.map((p2, i) => `<circle cx="${p2[0]}" cy="${p2[1]}" r="3.6" fill="#fff" stroke="${s2.c}" stroke-width="2"><title>${rotulos[i]} · ${s2.l}: ${s2.v[i]}</title></circle>`).join("")}`; }).join("");
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img">${grade}${desenhos}${eixo}</svg>
    <div class="leg leg-h">${series.map((s2) => `<div><i style="background:${s2.c}"></i><span>${s2.l}</span><b>${s2.v.reduce((a, b) => a + b, 0)}</b></div>`).join("")}</div></div>`;
}
function medidor(p, { rot = "", cor = "var(--brand)" } = {}) {
  const r = 70, c = Math.PI * r, len = (Math.max(0, Math.min(100, p)) / 100) * c;
  return `<div class="gauge"><svg viewBox="0 0 180 104"><path d="M20,94 A70,70 0 0 1 160,94" fill="none" stroke="#F1ECE6" stroke-width="16" stroke-linecap="round"/>
    <path d="M20,94 A70,70 0 0 1 160,94" fill="none" style="stroke:${cor}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${len} ${c}"/></svg>
    <div class="gauge-c"><b>${p}%</b><small>${rot}</small></div></div>`;
}
const delta = (atual, antes, menorMelhor = false, fmt = (v) => v) => {
  if (antes == null || atual == null || !antes) return "";
  const d = Math.round(((atual - antes) / antes) * 100); if (!d) return `<span class="dl">= período anterior</span>`;
  const bom = menorMelhor ? d < 0 : d > 0;
  return `<span class="dl ${bom ? "up" : "down"}">${d > 0 ? "▲" : "▼"} ${Math.abs(d)}%<em> vs ${fmt(antes)}</em></span>`;
};


const vals = (a) => a.filter((x) => x != null && !isNaN(x)).map(Number);
const media = (a) => { const v = vals(a); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const mediana = (a) => { const v = vals(a).sort((x, y) => x - y); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const minEntre = (f, i) => (f && i ? (new Date(f) - new Date(i)) / 6e4 : null);
const barras = (it, max) => `<div class="bars">${it.map((x) => `<div class="bar"><span class="l">${x.l}</span><span class="t"><i style="width:${max ? (x.v / max) * 100 : 0}%;--bc:${x.c || "var(--ink-2)"}"></i></span><b>${x.txt ?? x.v}</b>${x.e !== undefined ? `<em>${x.e}</em>` : ""}</div>`).join("")}</div>`;
const card2 = (t, sub, id, wide = false) => `<section class="card${wide ? " wide" : ""}"><h3>${t}</h3><p class="muted">${sub}</p><div id="${id}"></div></section>`;

async function viewPainel() {
  $("#view").innerHTML = `<div class="content">
    <div class="dash-bar">
      <select class="input" id="pPer"><option value="7">Últimos 7 dias</option><option value="30" selected>Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select>
      <select class="input" id="pTipo"><option value="">Corretivas e preventivas</option><option value="CORRETIVA">Só corretivas</option><option value="PREVENTIVA">Só preventivas</option></select>
      <select class="input" id="pNuc"><option value="">Todas as granjas</option>${S.nucleos.map((n) => `<option value="${n.id}">${esc(n.nome)}</option>`).join("")}</select>
    </div>
    <div class="seg" id="pSeg">${[["geral", "Visão geral"], ["prio", "Classificação"], ["equipe", "Equipe"], ["locais", "Granjas e equipamentos"], ["mat", "Materiais"]]
      .map(([k, r], i) => `<button data-v="${k}" aria-pressed="${i === 0}">${r}</button>`).join("")}</div>
    <div data-v="geral"><div class="kpis" id="kpis"></div><div class="grid2">
      ${card2("Em aberto agora", "OS não concluídas, de qualquer data, por etapa.", "gSit")}
      ${card2("Há quanto tempo estão em aberto", "Quanto mais à direita, mais antiga a pendência.", "gIdade")}
      ${card2("Onde o tempo é gasto", "Média por etapa das OS concluídas no período.", "gEtapas")}
      ${card2("Retornos ao gestor", "OS que precisaram de novo direcionamento.", "gRet")}
      ${card2("Abertas × concluídas", "Por semana. Abertas acima das concluídas por várias semanas = fila crescendo.", "gSerie", true)}</div></div>
    <div data-v="prio" hidden><div class="grid2">
      ${card2("Fila agora por classificação", "OS não concluídas, de qualquer data.", "gFila")}
      ${card2("Como as OS do período foram classificadas", "Distribuição definida pelo gestor.", "gMix")}
      ${card2("Tempo para começar o serviço", "Mediana da abertura até o manutentor iniciar. O esperado é Emergência ser a menor.", "gComeca")}
      ${card2("Lead típico por classificação", "Mediana da abertura até a confirmação (concluídas).", "gLeadP")}</div></div>
    <div data-v="equipe" hidden>
      <p class="muted" style="margin-bottom:14px">Atendimentos direcionados no período. “Horas líquidas” = tempo entre Iniciar e Finalizar menos as pausas; não inclui deslocamento.</p>
      <section class="card" style="margin-bottom:14px"><h3>Desempenho por manutentor</h3><p class="muted">Toque em um manutentor para ver o detalhamento completo.</p><div id="gTeam"></div></section>
      <div class="grid2">${card2("OS atendidas por manutentor", "Finalizadas no período, divididas pela classificação.", "gAtend", true)}
      ${card2("Tempo parado por motivo", "Soma das pausas no período. Não conta como execução.", "gPausas")}
      ${card2("Tempo parado por manutentor", "Horas pausadas no período, por motivo.", "gPausasM")}</div>
      </div>
    <div data-v="locais" hidden><div class="grid2">
      ${card2("OS por granja", "Abertas no período · lead típico das concluídas.", "gGranja")}
      ${card2("Aviários com mais OS", "Em laranja: 2 ou mais OS no período (problema que se repete).", "gAv")}
      ${card2("OS por local ou equipamento", "Quantidade no período · lead típico das concluídas.", "gEq", true)}</div></div>
    <div data-v="mat" hidden><section class="card"><h3>${ic("box")} Material do estoque dos carros</h3><p class="muted">Somado pelo código. Material do almoxarifado não entra aqui.</p><div id="gMat"></div></section></div>
  </div>`;
  $("#pSeg").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; $$("#pSeg button").forEach((x) => x.setAttribute("aria-pressed", x === b)); $$("#view [data-v]:not(button)").forEach((p) => (p.hidden = p.dataset.v !== b.dataset.v)); };
  $("#pPer").onchange = $("#pNuc").onchange = $("#pTipo").onchange = carregarPainel;
  carregarPainel();
}
async function carregarPainel() {
  const tok = S.tok, dias = +$("#pPer").value, nuc = $("#pNuc").value ? +$("#pNuc").value : null;
  const ini0 = new Date(`${hojeISO(-dias + 1)}T00:00:00-03:00`), fim0 = new Date(Date.now() + 864e5);
  let qL = sb.from("vw_os_lead").select("*").gte("aberta_em", ini0.toISOString()).lt("aberta_em", fim0.toISOString()).order("id");
  let qA = sb.from("ordens_servico").select("id,status,aberta_em,nucleo_id,manutentor_id,prioridade,pausada_em,pausa_motivo").in("status", ABERTOS).order("id");
  const qP = sb.from("os_pausas").select("*").gte("inicio", ini0.toISOString()).order("id");
  const qT = sb.from("os_atendimentos").select("*, ordens_servico(nucleo_id,prioridade)").gte("direcionada_em", ini0.toISOString()).order("id");
  if (nuc) { qL = qL.eq("nucleo_id", nuc); qA = qA.eq("nucleo_id", nuc); }
  let qAnt = sb.from("vw_os_lead").select("status,min_lead_total,min_ate_inicio").gte("aberta_em", new Date(ini0 - dias * 864e5).toISOString()).lt("aberta_em", ini0.toISOString()).order("id");
  if (nuc) qAnt = qAnt.eq("nucleo_id", nuc);
  const [rL, rA, rT, rP, rAnt] = await Promise.all([todas(qL), todas(qA), todas(qT), todas(qP), todas(qAnt)]);
  if (tok !== S.tok) return;
  const tipo = $("#pTipo").value, prev = tipo ? await idsPreventivas() : new Set(); if (tok !== S.tok) return;
  const L = rL.data.filter((r) => filtroTipo(tipo, prev, r.id)), A = rA.data.filter((o) => filtroTipo(tipo, prev, o.id)), T = rT.data.filter((a) => (!nuc || a.ordens_servico?.nucleo_id === nuc) && filtroTipo(tipo, prev, a.os_id));
  const idsT = new Set(T.map((a) => a.id)), PZ = rP.data.filter((p) => idsT.has(p.atendimento_id));
  const durP = (p) => ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4;
  const pausaAt = (atId) => PZ.filter((p) => p.atendimento_id === atId && p.fim).reduce((s2, p) => s2 + durP(p), 0);
  const etapaAt = (atId) => PZ.filter((p) => p.atendimento_id === atId && p.fim && ehEtapa(p.motivo)).reduce((s2, p) => s2 + durP(p), 0);
  const concl = L.filter((r) => r.status === "CONCLUÍDA"), volt = L.filter((r) => r.recusas > 0 || r.nao_resolvidos > 0);
  const h = (o) => (Date.now() - new Date(o.aberta_em)) / 36e5, emerg = A.filter((o) => o.prioridade === "EMERGENCIA").length, velhas = A.filter((o) => h(o) > 168).length;
  const An = (rAnt.data || []).filter((r) => filtroTipo(tipo, prev, r.id)), cAn = An.filter((r) => r.status === "CONCLUÍDA");
  const kpi = (i, cor, v, l, s2, d = "", hot = false) => `<div class="kpi${hot ? " hot" : ""}"><div class="kpi-h"><span class="kpi-ic" style="--kc:${cor}">${ic(i)}</span><small>${l}</small></div><b>${v}</b><span class="kpi-s">${s2}</span>${d}</div>`;
  const leadA = mediana(concl.map((r) => r.min_lead_total)), leadB = mediana(cAn.map((r) => r.min_lead_total));
  const comA = mediana(L.map((r) => r.min_ate_inicio)), comB = mediana(An.map((r) => r.min_ate_inicio));
  $("#kpis").innerHTML = kpi("inbox", "#2F6BD9", L.length, "OS abertas", "no período", delta(L.length, An.length, false))
    + kpi("checkc", "#1E8E4E", `${pct(concl.length, L.length)}%`, "Finalizadas", `${concl.length} concluídas`, delta(pct(concl.length, L.length), pct(cAn.length, An.length), false, (v) => v + "%"))
    + kpi("clock", "#E8A317", fmtMin(leadA), "Lead típico", "abertura → confirmação", delta(leadA, leadB, true, fmtMin))
    + kpi("play", "#6D4AD4", fmtMin(comA), "Até começar", "abertura → início", delta(comA, comB, true, fmtMin))
    + kpi("undo", "#B8325B", `${pct(volt.length, L.length)}%`, "Voltaram ao gestor", `${volt.length} recusadas ou não resolvidas`)
    + kpi("alert", "#DF2331", A.length, "Em aberto agora", [emerg ? `${emerg} emergência(s)` : "", velhas ? `${velhas} há +7 dias` : ""].filter(Boolean).join(" · ") || "sem emergência", "", emerg > 0 || velhas > 0);

  // geral
  const st = ABERTOS.map((k) => ({ l: STATUS[k].rot, v: A.filter((o) => o.status === k).length, c: STATUS[k].c }));
  $("#gSit").innerHTML = donutBloco(ABERTOS.map((k) => ({ l: STATUS[k].rot, v: A.filter((o) => o.status === k && !o.pausada_em).length, c: STATUS[k].c }))
    .concat([{ l: "Pausadas", v: A.filter((o) => o.pausada_em).length, c: "#B9B0A6" }]), { centro: A.length, sub: "em aberto" });
  const fx = [["Até 1 dia", 0, 24], ["1 a 3 dias", 24, 72], ["3 a 7 dias", 72, 168], ["+7 dias", 168, 1e9]].map(([l, a, b]) => [l, A.filter((o) => h(o) >= a && h(o) < b).length]);
  const mf = Math.max(1, ...fx.map((x) => x[1]));
  $("#gIdade").innerHTML = `<div class="cols">${fx.map(([l, n], i) => `<div class="col${i === 3 && n ? " hot" : ""}"><b>${n}</b><div class="h"><i style="height:${(n / mf) * 100}%"></i></div><span>${l}</span></div>`).join("")}</div>`;
  const ET = [["min_abertura_direcionamento", "Até direcionar", "#2563EB"], ["min_espera_inicio", "Espera até iniciar", "#D97706"], ["min_execucao", "Execução", "#7C3AED"], ["min_confirmacao", "Esperando o técnico confirmar", "#0D9488"]]
    .map(([k, l, c]) => ({ l, c, v: media(concl.map((r) => r[k])) || 0 }));
  const tot = ET.reduce((s, x) => s + x.v, 0);
  $("#gEtapas").innerHTML = concl.length ? `<div class="stacked">${ET.map((x) => `<i style="flex:${Math.max(x.v, tot * .01)};background:${x.c}"></i>`).join("")}</div>
    <div class="legend">${ET.map((x) => `<div><i style="background:${x.c}"></i><span>${x.l}</span><b>${fmtMin(x.v)}</b><em>${pct(x.v, tot)}%</em></div>`).join("")}</div>` : `<div class="zero">Nenhuma OS concluída no período.</div>`;
  const rec = L.filter((r) => r.recusas > 0).length, nr = L.filter((r) => r.nao_resolvidos > 0).length;
  $("#gRet").innerHTML = barras([{ l: "Voltaram ao gestor (total)", v: volt.length, c: "var(--ink-2)", e: `${pct(volt.length, L.length)}%` },
    { l: "Recusadas pelo manutentor", v: rec, c: "var(--s-direcionada)", e: "antes de iniciar" }, { l: "Técnico: não resolvido", v: nr, c: "var(--s-pendente)", e: "retrabalho" }], Math.max(1, volt.length));
  const passo = dias <= 14 ? 1 : 7, n = Math.ceil(dias / passo), ab = Array(n).fill(0), co = Array(n).fill(0);
  const ix = (ts) => Math.floor((new Date(ts) - ini0) / (864e5 * passo));
  L.forEach((r) => { const i = ix(r.aberta_em); if (i >= 0 && i < n) ab[i]++; if (r.confirmada_em) { const j = ix(r.confirmada_em); if (j >= 0 && j < n) co[j]++; } });
  const mb = Math.max(1, ...ab, ...co), rot = (i) => new Date(ini0.getTime() + i * passo * 864e5).toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });
  $("#gSerie").innerHTML = linhas(ab.map((_, i) => rot(i)), [{ l: "Abertas", v: ab, c: "#DF2331" }, { l: "Concluídas", v: co, c: "#1E8E4E" }], { largura: $("#gSerie").clientWidth || 640, alt: isMob() ? 200 : 240 });

  // classificação
  const KP = [...Object.keys(PRIO), null], rotP = (k) => (k ? PRIO[k].rot : "A classificar");
  const fila = KP.map((k) => ({ l: rotP(k), v: A.filter((o) => (o.prioridade ?? null) === k).length, c: PCOR[k] || "#D6D6D1" }));
  $("#gFila").innerHTML = barras(fila, Math.max(1, ...fila.map((x) => x.v)));
  const mix = KP.map((k) => ({ k, v: L.filter((r) => (r.prioridade ?? null) === k).length })).filter((x) => x.v);
  $("#gMix").innerHTML = donutBloco(mix.map((x) => ({ l: rotP(x.k), v: x.v, c: PCOR[x.k] || "#CFC7BE" })), { centro: L.length, sub: "OS no período" });
  const porP = (campo, base) => Object.keys(PRIO).map((k) => { const g = base.filter((r) => r.prioridade === k); return { l: PRIO[k].rot, c: PCOR[k], m: mediana(g.map((r) => r[campo])), n: g.length }; });
  const cm = porP("min_ate_inicio", L), lp = porP("min_lead_total", concl);
  $("#gComeca").innerHTML = barras(cm.map((x) => ({ l: x.l, v: x.m || 0, txt: fmtMin(x.m), c: x.c, e: `${x.n} OS` })), Math.max(1, ...cm.map((x) => x.m || 0)));
  $("#gLeadP").innerHTML = barras(lp.map((x) => ({ l: x.l, v: x.m || 0, txt: fmtMin(x.m), c: x.c, e: `${x.n} OS` })), Math.max(1, ...lp.map((x) => x.m || 0)));

  // equipe
  const mnts = Object.values(S.usuarios).filter((u) => u.perfis.includes("manutentor")).sort((a, b) => a.nome.localeCompare(b.nome));
  const eq = mnts.map((u) => { const at = T.filter((a) => a.manutentor_id === u.id), fin = at.filter((a) => a.finalizada_em), ex = fin.map((a) => minEntre(a.finalizada_em, a.iniciada_em) - pausaAt(a.id));
    const av = fin.filter((a) => ["CONFIRMADO", "NAO_RESOLVIDO"].includes(a.resultado));
    const des = PZ.filter((p) => p.manutentor_id === u.id && p.motivo === "DESLOCAMENTO").reduce((s2, p) => s2 + durP(p), 0), mat = PZ.filter((p) => p.manutentor_id === u.id && p.motivo === "MATERIAL").reduce((s2, p) => s2 + durP(p), 0);
    return { u, rec: at.length, fin: fin.length, horas: ex.reduce((s, x) => s + (x || 0), 0) + fin.reduce((s, a) => s + etapaAt(a.id), 0), servico: ex.reduce((s, x) => s + (x || 0), 0), des, mat, exec: mediana(ex), resp: mediana(at.map((a) => minEntre(a.iniciada_em, a.direcionada_em))),
      retr: av.length ? pct(av.filter((a) => a.resultado === "NAO_RESOLVIDO").length, av.length) : null, recusas: at.filter((a) => a.resultado === "RECUSADO").length,
      maos: A.filter((o) => o.manutentor_id === u.id && ["DIRECIONADA", "EM ATENDIMENTO"].includes(o.status)).length, longos: ex.filter((x) => x > 720).length,
      mix: Object.keys(PRIO).map((k) => [k, fin.filter((a) => a.ordens_servico?.prioridade === k).length]),
      parado: PZ.filter((p) => p.manutentor_id === u.id && !ehEtapa(p.motivo)).reduce((s2, p) => s2 + durP(p), 0),
      media: media(ex), respMed: media(at.map((a) => minEntre(a.iniciada_em, a.direcionada_em))),
      porMot: Object.keys(MOTIVOS).filter((k) => !ehEtapa(k)).map((k) => [k, PZ.filter((p) => p.manutentor_id === u.id && p.motivo === k).reduce((s2, p) => s2 + durP(p), 0)]) }; });
  const COR_M = { ALMOCO: "#A1A4A9", PECA: "#D9590B", EXPEDIENTE: "#5B6470", OUTRA_OS: "#7C3AED", OUTRO: "#C9A227", DESLOCAMENTO: "#2F6BD9", MATERIAL: "#E39A12" };
  const pm = Object.keys(MOTIVOS).filter((k) => !ehEtapa(k)).map((k) => { const g = PZ.filter((p) => p.motivo === k); return { k, n: g.length, m: g.reduce((s2, p) => s2 + durP(p), 0) }; });
  $("#gPausas").innerHTML = PZ.length ? barras(pm.map((x) => ({ l: `${ic(MOTIVOS[x.k].i)} ${MOTIVOS[x.k].rot}`, v: x.m, txt: fmtMin(x.m), c: COR_M[x.k], e: `${x.n} pausa(s)` })), Math.max(1, ...pm.map((x) => x.m)))
    + `<p class="muted" style="font-size:12px;margin-top:12px">“Aguardando peça” alto indica falta de material no carro ou demora do almoxarifado.</p>` : `<div class="zero">Nenhuma pausa registrada no período.</div>`;
  const mF = Math.max(1, ...eq.map((e) => e.fin)), mP = Math.max(1, ...eq.map((e) => e.parado));
  $("#gPausasM").innerHTML = `<div class="bars">${eq.map((e) => `<div class="bar" style="grid-template-columns:minmax(110px,30%) 1fr max-content"><span class="l">${esc(e.u.nome)}</span>
    <span class="t" style="height:12px;background:none"><span class="stacked" style="height:12px;width:${Math.max(2, (e.parado / mP) * 100)}%">${e.porMot.filter((m) => m[1] > 0).map(([k, v]) => `<i style="flex:${v};background:${COR_M[k]}"></i>`).join("")}</span></span><b>${fmtMin(e.parado)}</b></div>`).join("")}</div>
    <div class="legend" style="grid-template-columns:repeat(3,max-content);gap:6px 16px">${Object.keys(MOTIVOS).map((k) => `<div style="grid-template-columns:10px auto"><i style="background:${COR_M[k]}"></i><span>${MOTIVOS[k].rot}</span></div>`).join("")}</div>`;
  $("#gAtend").innerHTML = `<div class="bars">${eq.map((e) => `<div class="bar" style="grid-template-columns:minmax(110px,22%) 1fr 44px"><span class="l">${esc(e.u.nome)}</span>
    <span class="t" style="height:14px;background:none"><span class="stacked" style="height:14px;width:${Math.max(2, (e.fin / mF) * 100)}%">${e.mix.filter((m) => m[1]).map(([k, v]) => `<i style="flex:${v};background:${PCOR[k]}"></i>`).join("")}</span></span><b>${e.fin}</b></div>`).join("")}</div>
    <div class="legend" style="grid-template-columns:repeat(4,max-content);gap:16px">${Object.keys(PRIO).map((k) => `<div style="grid-template-columns:10px auto"><i style="background:${PCOR[k]}"></i><span>${PRIO[k].rot}</span></div>`).join("")}</div>`;
  S.painel = { T, PZ, A, ini0, dias, pausaAt, durP };
  const eqMed = (f) => media(eq.map(f).filter((x) => x != null));
  const linhaT = (e) => `<tr data-u="${e.u.id}"><td data-l="Manutentor"><span class="who-cell">${av(e.u.id)}${esc(e.u.nome)}</span></td>
    <td class="n" data-l="OS atendidas">${e.fin}</td><td class="n" data-l="Horas trabalhadas">${fmtHoras(e.horas)}</td><td class="n" data-l="Deslocamento">${fmtMin(e.des)}</td><td class="n" data-l="Material">${fmtMin(e.mat)}</td><td class="n" data-l="Tempo médio">${fmtMin(e.media)}</td><td class="n" data-l="Resposta média">${fmtMin(e.respMed)}</td>
    <td class="n" data-l="Retrabalho">${e.retr == null ? "—" : e.retr + "%"}</td><td class="n" data-l="Recusas">${e.recusas}</td><td class="n" data-l="Tempo parado">${fmtMin(e.parado)}</td><td class="n" data-l="Em mãos">${e.maos}${e.longos ? ` <span title="Atendimento com mais de 12 h">${ic("alert")}</span>` : ""}</td></tr>`;
  $("#gTeam").innerHTML = `<div class="tbl"><table class="t team-t"><thead><tr><th>Manutentor</th><th class="n">OS atendidas</th><th class="n">Horas trabalhadas</th><th class="n">Deslocamento</th><th class="n">Material</th><th class="n">Tempo médio por OS</th>
    <th class="n">Resposta média</th><th class="n">Retrabalho</th><th class="n">Recusas</th><th class="n">Tempo parado</th><th class="n">Em mãos</th></tr></thead>
    <tbody>${eq.map(linhaT).join("")}</tbody>
    <tfoot><tr><td data-l="">Média da equipe</td><td class="n">${Math.round(eqMed((e) => e.fin) || 0)}</td><td class="n">${fmtHoras(eqMed((e) => e.horas))}</td><td class="n">${fmtMin(eqMed((e) => e.des))}</td><td class="n">${fmtMin(eqMed((e) => e.mat))}</td><td class="n">${fmtMin(eqMed((e) => e.media))}</td>
    <td class="n">${fmtMin(eqMed((e) => e.respMed))}</td><td class="n">${eqMed((e) => e.retr) == null ? "—" : Math.round(eqMed((e) => e.retr)) + "%"}</td><td class="n">${(eqMed((e) => e.recusas) || 0).toFixed(1).replace(".", ",")}</td>
    <td class="n">${fmtMin(eqMed((e) => e.parado))}</td><td class="n">—</td></tr></tfoot></table></div>
    <p class="muted" style="font-size:12px;margin-top:10px">Horas trabalhadas = tempo registrado entre Iniciar e Finalizar, menos as pausas. Não inclui deslocamento nem serviço feito sem OS.</p>`;
  $("#gTeam").onclick = (ev) => { const tr = ev.target.closest("tr[data-u]"); if (tr) folhaDesempenho(tr.dataset.u, eq); };

  // locais
  const g = {}; L.forEach((r) => { (g[r.nucleo_id] ??= []).push(r); });
  const og = Object.entries(g).sort((a, b) => b[1].length - a[1].length);
  $("#gGranja").innerHTML = og.length ? barras(og.map(([id, rs]) => ({ l: esc(nomeN(+id)), v: rs.length, e: fmtMin(mediana(rs.map((r) => r.min_lead_total))) })), og[0][1].length) : `<div class="zero">Sem OS no período.</div>`;
  const porAv = {}; let toda = 0; L.forEach((r) => { if (!(r.galpoes || []).length) toda++; (r.galpoes || []).forEach((x) => { const k = `${r.nucleo_id}|${x}`; porAv[k] = (porAv[k] || 0) + 1; }); });
  const ta = Object.entries(porAv).sort((a, b) => b[1] - a[1]).slice(0, 10);
  $("#gAv").innerHTML = ta.length ? barras(ta.map(([k, v]) => { const [nn, x] = k.split("|"); return { l: `${esc(nomeN(+nn))} · Av. ${x}`, v, c: v > 1 ? "#D9590B" : "#A1A4A9" }; }), ta[0][1])
    + `<p class="muted" style="font-size:12px;margin-top:12px">${toda} OS foram para a granja toda e não entram nesta lista.</p>` : `<div class="zero">Sem OS com aviário no período.</div>`;
  const e2 = {}; L.forEach((r) => { (e2[(r.equipamento || "Não informado").trim()] ??= []).push(r); });
  const oe = Object.entries(e2).sort((a, b) => b[1].length - a[1].length).slice(0, 12);
  $("#gEq").innerHTML = oe.length ? barras(oe.map(([k, rs]) => ({ l: `${ic(eqIcon(k))} ${esc(k)}`, v: rs.length, e: fmtMin(mediana(rs.map((r) => r.min_lead_total))) })), oe[0][1].length) : `<div class="zero">Sem OS no período.</div>`;

  // materiais
  const mt = {}; L.forEach((r) => (r.materiais_carro || []).forEach((m) => { const k = `${String(m.codigo).toUpperCase()}|${m.unidade}`;
    (mt[k] ??= { c: m.codigo, n: m.material, u: m.unidade, q: 0, os: new Set(), locais: {} }).q += +m.quantidade; mt[k].os.add(r.id);
    const lc = (mt[k].locais[r.nucleo_id] ??= { todo: false, av: new Set() }); if (!(r.galpoes || []).length) lc.todo = true; (r.galpoes || []).forEach((x) => lc.av.add(x)); }));
  const lm = Object.values(mt).sort((a, b) => b.os.size - a.os.size);
  $("#gMat").innerHTML = lm.length ? `<div class="tbl"><table class="t"><thead><tr><th>Código</th><th>Produto</th><th class="n">Quantidade</th><th>Onde foi usado (granja / aviário)</th><th class="n">OS</th></tr></thead>
    <tbody>${lm.map((m) => `<tr><td class="mono">${esc(m.c)}</td><td>${esc(m.n)}</td><td class="n">${m.q.toLocaleString("pt-BR")} ${esc(m.u)}</td><td style="white-space:normal;min-width:200px">${esc(ondeTexto(m.locais))}</td><td class="n">${m.os.size}</td></tr>`).join("")}</tbody></table></div>` : `<div class="zero">Nenhum material de carro no período.</div>`;
}

const fmtHoras = (m) => (m == null ? "—" : `${(m / 60).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h`);
function folhaDesempenho(uid, eq) {
  const P = S.painel, u = S.usuarios[uid], e = eq.find((x) => x.u.id === uid);
  const at = P.T.filter((a) => a.manutentor_id === uid), fin = at.filter((a) => a.finalizada_em).sort((a, b) => new Date(b.finalizada_em) - new Date(a.finalizada_em));
  const liq = (a) => minEntre(a.finalizada_em, a.iniciada_em) - P.pausaAt(a.id);
  const eqMed = (f) => media(eq.map(f).filter((x) => x != null));
  const cmp = (v, ref, menorMelhor = true, fmt = fmtMin) => ref == null || v == null ? "" :
    `<span class="cmp">equipe: ${fmt(ref)}</span>`;
  const kpi = (l, v, sub) => `<div class="kpi"><small>${l}</small><b>${v}</b><span>${sub}</span></div>`;
  // por semana
  const passo = 7, n = Math.max(1, Math.ceil(P.dias / passo)), osS = Array(n).fill(0), hS = Array(n).fill(0);
  fin.forEach((a) => { const i = Math.floor((new Date(a.finalizada_em) - P.ini0) / (864e5 * passo)); if (i >= 0 && i < n) { osS[i]++; hS[i] += liq(a); } });
  const mo = Math.max(1, ...osS), mh = Math.max(1, ...hS), rot = (i) => new Date(P.ini0.getTime() + i * passo * 864e5).toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });
  // por classificação e por equipamento
  const porP = Object.keys(PRIO).map((k) => { const g = fin.filter((a) => a.ordens_servico?.prioridade === k); return { l: PRIO[k].rot, c: PCOR[k], n: g.length, m: media(g.map(liq)) }; });
  const eqs = {}; fin.forEach((a) => { const k = a.ordens_servico?.equipamento || "Não informado"; (eqs[k] ??= []).push(liq(a)); });
  const oe = Object.entries(eqs).sort((a, b) => b[1].length - a[1].length).slice(0, 8);
  const pz = Object.keys(MOTIVOS).filter((k) => !ehEtapa(k)).map((k) => ({ k, m: P.PZ.filter((p) => p.manutentor_id === uid && p.motivo === k).reduce((s2, p) => s2 + P.durP(p), 0) })).filter((x) => x.m > 0);
  const RES = { CONFIRMADO: ["ok", "Resolvido"], NAO_RESOLVIDO: ["bad", "Não resolvido"] };
  folha({
    titulo: `Desempenho · ${esc(u.nome)}`, sub: `Últimos ${P.dias} dias · atendimentos direcionados no período`, tam: "xl full",
    corpo: `<div class="kpis kpis-4">
        ${kpi("OS atendidas", e.fin, `${e.rec} recebidas · ${e.recusas} recusada(s) · ${cmp(e.fin, eqMed((x) => x.fin), false, (v) => Math.round(v))}`)}
        ${kpi("Horas trabalhadas", fmtHoras(e.horas), `serviço + deslocamento + material · ${cmp(e.horas, eqMed((x) => x.horas), false, fmtHoras)}`)}
        ${kpi("Tempo médio por OS", fmtMin(e.media), `mediana ${fmtMin(e.exec)} · ${cmp(e.media, eqMed((x) => x.media))}`)}
        ${kpi("Resposta média", fmtMin(e.respMed), `do direcionamento ao início · ${cmp(e.respMed, eqMed((x) => x.respMed))}`)}
        ${kpi("Retrabalho", e.retr == null ? "—" : e.retr + "%", `técnico informou não resolvido`)}
        ${kpi("Tempo parado", fmtMin(e.parado), `em pausas no período`)}
        ${kpi("Em mãos agora", e.maos, `direcionadas + em atendimento`)}
        ${kpi("OS por dia útil", (e.fin / Math.max(1, Math.round(P.dias * 5 / 7))).toFixed(1).replace(".", ","), `média no período`)}</div>
      <div class="grid2">
        <section class="card wide"><h3>Por semana</h3><p class="muted">OS finalizadas e horas trabalhadas (líquidas).</p>
          <div class="series">${osS.map((v, i) => `<div><div class="pair"><i style="height:${(v / mo) * 100}%;background:var(--ink-2)"><em>${v || ""}</em></i><i style="height:${(hS[i] / mh) * 100}%;background:#9EA2A8"><em>${hS[i] ? fmtHoras(hS[i]).replace(" h", "h") : ""}</em></i></div><span>${rot(i)}</span></div>`).join("")}</div>
          <div class="legend" style="grid-template-columns:repeat(2,max-content);gap:18px"><div style="grid-template-columns:10px auto"><i style="background:var(--ink-2)"></i><span>OS finalizadas</span></div><div style="grid-template-columns:10px auto"><i style="background:#9EA2A8"></i><span>Horas trabalhadas</span></div></div></section>
        <section class="card"><h3>Tempo médio por classificação</h3><p class="muted">Execução líquida média.</p>${barras(porP.map((x) => ({ l: x.l, v: x.m || 0, txt: fmtMin(x.m), c: x.c, e: `${x.n} OS` })), Math.max(1, ...porP.map((x) => x.m || 0)))}</section>
        <section class="card"><h3>Por local ou equipamento</h3><p class="muted">OS atendidas · tempo médio.</p>${oe.length ? barras(oe.map(([k, v]) => ({ l: esc(k), v: v.length, e: fmtMin(media(v)) })), oe[0][1].length) : `<div class="zero">Sem OS no período.</div>`}</section>
        <section class="card"><h3>Onde o tempo foi gasto</h3><p class="muted">Atendimentos do período.</p>${barras([["Serviço (execução)", e.servico, "#1E8E4E"], ["Deslocamento", e.des, "#2F6BD9"], ["Buscando material", e.mat, "#E39A12"], ["Pausas", e.parado, "#A1A4A9"]].map(([l, v, c]) => ({ l, v, txt: fmtMin(v), c })), Math.max(1, e.servico, e.des, e.mat, e.parado))}</section>
        <section class="card"><h3>Pausas</h3><p class="muted">Tempo parado por motivo.</p>${pz.length ? barras(pz.map((x) => ({ l: MOTIVOS[x.k].rot, v: x.m, txt: fmtMin(x.m) })), Math.max(...pz.map((x) => x.m))) : `<div class="zero">Nenhuma pausa no período.</div>`}</section>
        <section class="card"><h3>Qualidade</h3><p class="muted">Resultado confirmado pelo técnico.</p>${barras([
          { l: "Resolvido", v: fin.filter((a) => a.resultado === "CONFIRMADO").length, c: "var(--s-concluida)" },
          { l: "Não resolvido", v: fin.filter((a) => a.resultado === "NAO_RESOLVIDO").length, c: "var(--s-pendente)" },
          { l: "Aguardando técnico", v: fin.filter((a) => !a.resultado).length, c: "#9EA2A8" }], Math.max(1, fin.length))}</section>
        <section class="card wide"><h3>Últimas OS atendidas</h3><p class="muted">Toque para abrir a OS.</p>
          <div class="tbl"><table class="t users"><thead><tr><th>OS</th><th>Serviço</th><th>Onde</th><th class="n">Execução</th><th>Resultado</th></tr></thead><tbody>
          ${fin.slice(0, 12).map((a) => `<tr data-os="${a.os_id}"><td class="mono">${osId(a.os_id)}</td><td>${esc(a.ordens_servico?.descricao || "")}</td><td>${esc(nomeN(a.ordens_servico?.nucleo_id))}</td><td class="n">${fmtMin(liq(a))}</td>
            <td>${a.resultado ? `<span class="tag ${RES[a.resultado][0]}">${RES[a.resultado][1]}</span>` : `<span class="tag">Aguardando técnico</span>`}</td></tr>`).join("") || `<tr><td colspan="5">Nenhuma OS finalizada no período.</td></tr>`}
          </tbody></table></div></section>
      </div>
      <p class="muted" style="font-size:12px;margin-top:12px">Horas trabalhadas são as registradas no sistema (Iniciar → Finalizar, menos pausas). Deslocamento e serviços fora de OS não entram. Use como acompanhamento, não como avaliação isolada: tipo de serviço, distância entre núcleos e classificação influenciam os tempos.</p>`,
    aoAbrir: (el, fechar) => { el.addEventListener("click", (ev) => { const tr = ev.target.closest("tr[data-os]"); if (tr) { fechar(); abrirOS(+tr.dataset.os); } }); },
  });
}

/* ---------------- Usuários ---------------- */
async function invocarAdmin(body) {
  const { data, error } = await sb.functions.invoke("admin-usuarios", { body });
  if (error) { let m = error.message; try { m = (await error.context.json()).erro || m; } catch {} throw new Error(m); }
  return data;
}
const situacaoU = (u) => (u.excluido_em ? "excluido" : u.ativo ? "ativo" : "bloqueado");
function viewUsuarios(aba = S.abaUsu || "ativo") {
  S.abaUsu = aba;
  const todos = Object.values(S.usuarios), n = (k) => todos.filter((u) => situacaoU(u) === k).length;
  const u = todos.filter((x) => situacaoU(x) === aba).sort((a, b) => a.nome.localeCompare(b.nome));
  const sit = { ativo: ["Com acesso", "onoff"], bloqueado: ["Bloqueado", "onoff off"], excluido: ["Excluído", "onoff off"] };
  $("#view").innerHTML = `<div class="content">
    <div class="dash-bar"><div class="seg" id="uAba" style="margin:0">${[["ativo", "Com acesso"], ["bloqueado", "Bloqueados"], ["excluido", "Excluídos"]]
      .map(([k, r]) => `<button data-a="${k}" aria-pressed="${k === aba}">${r}<b>${n(k)}</b></button>`).join("")}</div><div style="flex:1"></div>
      <button class="btn btn-primary" id="novoU">${ic("plus")}Cadastrar usuário</button></div>
    ${u.length ? `<div class="tbl" style="background:var(--surface)"><table class="t users"><thead><tr><th>Nome</th><th>Login</th><th>Perfis</th><th>Notificações</th><th>Situação</th></tr></thead>
    <tbody>${u.map((x) => `<tr data-u="${x.id}"><td><span class="who-cell">${av(x.id)}${esc(x.nome)}</span></td><td class="mono">${esc(x.login)}</td>
      <td>${x.perfis.map((p) => `<span class="chip">${PERFIS[p].nome}</span>`).join("")}</td><td>${x.push_em ? `<span class="tag ok">${ic("bell")}Ativas</span>` : `<span class="muted">—</span>`}</td><td><span class="${sit[aba][1]}">${sit[aba][0]}</span></td></tr>`).join("")}</tbody></table></div>`
      : `<div class="zero">Nenhum usuário nesta situação.</div>`}
    <p class="muted" style="font-size:12.5px;margin-top:10px">Bloquear ou excluir não apaga o histórico: as OS, atendimentos, materiais e pausas continuam com o nome da pessoa.</p></div>`;
  $("#uAba").onclick = (e) => { const b = e.target.closest("[data-a]"); if (b) viewUsuarios(b.dataset.a); };
  $("#novoU").onclick = () => folhaUsuario(null);
  $(".users tbody")?.addEventListener("click", (e) => { const tr = e.target.closest("[data-u]"); if (tr) folhaUsuario(S.usuarios[tr.dataset.u]); });
}
function folhaUsuario(u) {
  const novo = !u, sit = u ? situacaoU(u) : "ativo";
  const fim = async (fechar, msg, r) => { await carregarUsuarios(); fechar(); toast(msg + (r?.devolvidas ? ` ${r.devolvidas} OS que estavam com a pessoa voltaram para o gestor.` : "")); viewUsuarios(); };
  folha({
    titulo: novo ? "Cadastrar usuário" : esc(u.nome), sub: novo ? "O login é usado para entrar; não precisa de e-mail." : `Login: ${esc(u.login)} · ${{ ativo: "com acesso", bloqueado: "bloqueado", excluido: "excluído" }[sit]}`,
    corpo: sit === "excluido" ? `<div class="note">Este usuário foi excluído em ${fmtDH(u.excluido_em)}. Ele não entra no sistema, mas o histórico dele continua preservado.
        Se foi um engano, restaure: ele volta bloqueado e você libera quando quiser.</div><p class="err" id="erroU"></p>`
      : `<label class="field"><span>Nome completo</span><input class="input" id="uNome" value="${esc(u?.nome ?? "")}"></label>
      ${novo ? `<label class="field"><span>Login</span><input class="input" id="uLogin" autocapitalize="none" placeholder="ex.: joao.silva"></label>
      <label class="field"><span>Senha inicial <em>(mín. 8)</em></span><input class="input" id="uSenha"></label>` : ""}
      <div class="label">Perfis</div><div class="checks">${Object.entries(PERFIS).map(([k, p]) => `<label><input type="checkbox" value="${k}" ${u?.perfis.includes(k) ? "checked" : ""}>${p.nome}<small>${p.faz}</small></label>`).join("")}</div>
      ${novo ? "" : `<div class="label">Redefinir senha</div><div style="display:flex;gap:8px"><input class="input" id="uNova" placeholder="Nova senha (mín. 8)"><button class="btn" id="uSenhaBtn">Redefinir</button></div>
      <div class="zona">
        <div><b>${sit === "ativo" ? "Bloquear acesso" : "Desbloquear acesso"}</b><small>${sit === "ativo" ? "A pessoa sai do sistema em até 1 minuto e não consegue entrar. OS em mãos voltam para o gestor." : "A pessoa volta a entrar com o mesmo login e senha."}</small></div>
        <button class="btn ${sit === "ativo" ? "btn-danger" : ""}" id="uBloq">${sit === "ativo" ? "Bloquear" : "Desbloquear"}</button></div>
      <div class="zona perigo"><div><b>Excluir usuário</b><small>Some das listas e perde o acesso. O histórico é preservado (exclusão lógica).</small></div><button class="btn btn-danger" id="uExc">Excluir</button></div>`}
      <p class="err" id="erroU"></p>`,
    rodape: sit === "excluido" ? `<button class="btn" data-fechar>Fechar</button><button class="btn btn-primary" id="uRest">Restaurar usuário</button>`
      : `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okU">${novo ? "Cadastrar" : "Salvar"}</button>`,
    aoAbrir: (el, fechar) => {
      const erro = (t) => ($("#erroU", el).textContent = t);
      $("#uRest", el)?.addEventListener("click", (e) => busy(e.currentTarget, async () => { await invocarAdmin({ acao: "restaurar", id: u.id }); await fim(fechar, "Usuário restaurado (bloqueado)."); }));
      $("#uSenhaBtn", el)?.addEventListener("click", (e) => { const s2 = $("#uNova", el).value; if (s2.length < 8) return erro("A senha precisa de 8 caracteres.");
        busy(e.currentTarget, async () => { await invocarAdmin({ acao: "senha", id: u.id, senha: s2 }); $("#uNova", el).value = ""; toast("Senha redefinida."); }); });
      $("#uBloq", el)?.addEventListener("click", (e) => {
        const bloquear = sit === "ativo";
        if (bloquear && u.id === S.eu.id) return erro("Você não pode bloquear o seu próprio usuário.");
        confirmar({ titulo: bloquear ? `Bloquear ${esc(u.nome)}?` : `Desbloquear ${esc(u.nome)}?`, texto: bloquear ? "A pessoa perde o acesso imediatamente. As OS que estiverem com ela voltam para o gestor direcionar." : "A pessoa volta a acessar o sistema normalmente.",
          botao: bloquear ? "Bloquear acesso" : "Desbloquear", perigo: bloquear,
          ok: async () => { const r = await invocarAdmin({ acao: "atualizar", id: u.id, nome: u.nome, perfis: u.perfis, ativo: !bloquear }); await fim(fechar, bloquear ? "Acesso bloqueado." : "Acesso liberado.", r); } });
      });
      $("#uExc", el)?.addEventListener("click", () => {
        if (u.id === S.eu.id) return erro("Você não pode excluir o seu próprio usuário.");
        confirmar({ titulo: "Tem certeza que deseja excluir este usuário?", texto: `<b>${esc(u.nome)}</b> perde o acesso e sai das listas. O histórico de OS, materiais e pausas é mantido. Dá para restaurar depois em “Excluídos”.`,
          botao: "Sim, excluir", perigo: true, digitar: "EXCLUIR",
          ok: async () => { const r = await invocarAdmin({ acao: "excluir", id: u.id }); await fim(fechar, "Usuário excluído.", r); } });
      });
      $("#okU", el)?.addEventListener("click", (e) => {
        const perfis = $$(".checks input[value]:checked", el).map((c) => c.value), nome = $("#uNome", el).value.trim();
        if (!nome) return erro("Informe o nome.");
        if (!perfis.length) return erro("Marque pelo menos um perfil.");
        busy(e.currentTarget, async () => {
          if (novo) await invocarAdmin({ acao: "criar", nome, login: $("#uLogin", el).value, senha: $("#uSenha", el).value, perfis });
          else await invocarAdmin({ acao: "atualizar", id: u.id, nome, perfis, ativo: u.ativo });
          await fim(fechar, novo ? "Usuário cadastrado." : "Alterações salvas.");
        });
      });
    },
  });
}
// confirmação com botão de perigo (e, se pedido, digitar uma palavra)
function confirmar({ titulo, texto, botao, perigo, digitar, ok }) {
  folha({ titulo, corpo: `<p style="margin-bottom:12px">${texto}</p>${digitar ? `<label class="field"><span>Para confirmar, digite <b>${digitar}</b></span><input class="input" id="cfTxt" autocapitalize="characters"></label>` : ""}<p class="err" id="cfErr"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn ${perigo ? "btn-danger-cheio" : "btn-primary"}" id="cfOk">${botao}</button>`,
    aoAbrir: (el, fechar) => { $("#cfOk", el).onclick = (e) => { if (digitar && $("#cfTxt", el).value.trim().toUpperCase() !== digitar) return ($("#cfErr", el).textContent = `Digite ${digitar} para confirmar.`);
      busy(e.currentTarget, async () => { await ok(); fechar(); }); }; } });
}

/* ---------------- início ---------------- */
sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") telaLogin(); });
iniciar().catch((e) => (erroRede(e) ? telaForaDoAr() : telaLogin(errMsg(e))));

/* ---------------- Relatórios (resumo consolidado + PDF + Excel) ---------------- */
function faixaPeriodo(sel, de, ate) {
  const d = (iso) => new Date(`${iso}T00:00:00-03:00`), mais = (x, n) => new Date(x.getTime() + n * 864e5);
  const hoje = d(hojeISO()), dow = (hoje.getUTCDay() + 6) % 7; // segunda = 0 (meia-noite de Brasília = 03:00 UTC)
  const [y, m] = hojeISO().split("-").map(Number), mes = (yy, mm) => d(`${yy}-${String(mm).padStart(2, "0")}-01`);
  switch (sel) {
    case "hoje": return [hoje, mais(hoje, 1), "Hoje"];
    case "semana": return [mais(hoje, -dow), mais(hoje, 1), "Esta semana"];
    case "semana_ant": return [mais(hoje, -dow - 7), mais(hoje, -dow), "Semana passada"];
    case "mes": return [mes(y, m), mais(hoje, 1), "Este mês"];
    case "mes_ant": return [m === 1 ? mes(y - 1, 12) : mes(y, m - 1), mes(y, m), "Mês passado"];
    case "30": return [mais(hoje, -29), mais(hoje, 1), "Últimos 30 dias"];
    default: return [d(de), mais(d(ate), 1), "Período escolhido"];
  }
}
const dataBR = (x) => x.toLocaleDateString("pt-BR", { timeZone: TZ });

async function viewRelatorios() {
  const mnts = Object.values(S.usuarios).filter((u) => u.perfis.includes("manutentor")).sort((a, b) => a.nome.localeCompare(b.nome));
  $("#view").innerHTML = `<div class="content">
    <section class="card rel-filtros">
      <div class="rf-grid">
        <label class="field"><span>Período</span><select class="input" id="rPer">
          <option value="hoje">Hoje</option><option value="semana">Esta semana</option><option value="semana_ant">Semana passada</option>
          <option value="mes" selected>Este mês</option><option value="mes_ant">Mês passado</option><option value="30">Últimos 30 dias</option><option value="x">Escolher datas…</option></select></label>
        <label class="field" id="rDeL" hidden><span>De</span><input type="date" class="input" id="rDe" value="${hojeISO(-30)}"></label>
        <label class="field" id="rAteL" hidden><span>Até</span><input type="date" class="input" id="rAte" value="${hojeISO()}"></label>
        <label class="field"><span>Manutentor</span><select class="input" id="rMnt"><option value="">Todos</option>${mnts.map((u) => `<option value="${u.id}">${esc(u.nome)}</option>`).join("")}</select></label>
        <label class="field"><span>Granja</span><select class="input" id="rNuc"><option value="">Todas</option>${S.nucleos.map((n) => `<option value="${n.id}">${esc(n.nome)}</option>`).join("")}</select></label>
        <label class="field"><span>Tipo</span><select class="input" id="rTipo"><option value="">Corretivas e preventivas</option><option value="CORRETIVA">Só corretivas</option><option value="PREVENTIVA">Só preventivas</option></select></label>
        <label class="field"><span>Classificação</span><select class="input" id="rPrio"><option value="">Todas</option>${Object.entries(PRIO).map(([k, v]) => `<option value="${k}">${v.rot}</option>`).join("")}</select></label>
      </div>
      <div class="rel-acoes"><span class="muted" id="rInfo"></span><div class="grow"></div>
        <button class="btn" id="bXls">${ic("sheet")}Exportar Excel</button><button class="btn btn-primary" id="bPdf">${ic("download")}Exportar PDF</button></div>
    </section>
    <div id="relOut"><div class="stack"><div class="skel"></div><div class="skel"></div></div></div></div>`;
  $("#rPer").onchange = () => { const x = $("#rPer").value === "x"; $("#rDeL").hidden = $("#rAteL").hidden = !x; gerarRelatorio(); };
  ["rDe", "rAte", "rMnt", "rNuc", "rPrio", "rTipo"].forEach((i) => ($("#" + i).onchange = gerarRelatorio));
  $("#bPdf").onclick = (e) => busy(e.currentTarget, exportarPDF);
  $("#bXls").onclick = (e) => busy(e.currentTarget, exportarExcel);
  gerarRelatorio();
}

async function gerarRelatorio() {
  const tok = S.tok, [ini0, fim0, rotPer] = faixaPeriodo($("#rPer").value, $("#rDe").value, $("#rAte").value);
  if (!(fim0 > ini0)) return toast("Confira as datas do período.", true);
  const mnt = $("#rMnt").value, nuc = $("#rNuc").value ? +$("#rNuc").value : null, prio = $("#rPrio").value;
  const dentro = (ts) => ts && new Date(ts) >= ini0 && new Date(ts) < fim0;
  const antes = new Date(ini0.getTime() - 90 * 864e5).toISOString();
  let qL = sb.from("vw_os_lead").select("*").gte("aberta_em", ini0.toISOString()).lt("aberta_em", fim0.toISOString()).order("id");
  if (nuc) qL = qL.eq("nucleo_id", nuc); if (prio) qL = qL.eq("prioridade", prio);
  const [rL, rT, rP, rO] = await Promise.all([todas(qL),
    todas(sb.from("os_atendimentos").select("*, ordens_servico(nucleo_id,prioridade,equipamento,descricao,galpoes)").gte("direcionada_em", antes).order("id")),
    todas(sb.from("os_pausas").select("*").gte("inicio", antes).order("id")),
    todas(sb.from("ordens_servico").select("id,descricao,equipamento,galpoes,status,pausada_em,pausa_motivo").gte("aberta_em", ini0.toISOString()).lt("aberta_em", fim0.toISOString()).order("id"))]);
  if (tok !== S.tok) return;
  const err = rL.error || rT.error || rP.error; if (err) return toast(errMsg(err), true);
  const osInfo = Object.fromEntries(rO.data.map((o) => [o.id, o]));
  const tipo = $("#rTipo").value, prevIds = tipo ? await idsPreventivas() : new Set();
  let L = rL.data.filter((r) => filtroTipo(tipo, prevIds, r.id)), T = rT.data.filter((a) => (!nuc || a.ordens_servico?.nucleo_id === nuc) && (!prio || a.ordens_servico?.prioridade === prio) && filtroTipo(tipo, prevIds, a.os_id));
  if (mnt) { const osDoMnt = new Set(T.filter((a) => a.manutentor_id === mnt).map((a) => a.os_id)); L = L.filter((r) => r.manutentor_id === mnt || osDoMnt.has(r.id)); T = T.filter((a) => a.manutentor_id === mnt); }
  const pausaAt = (id) => rP.data.filter((p) => p.atendimento_id === id && p.fim).reduce((s2, p) => s2 + (new Date(p.fim) - new Date(p.inicio)) / 6e4, 0);
  const liq = (a) => minEntre(a.finalizada_em, a.iniciada_em) - pausaAt(a.id);
  const etapaAt = (id, m) => rP.data.filter((p) => p.atendimento_id === id && p.fim && (m ? p.motivo === m : ehEtapa(p.motivo))).reduce((s2, p) => s2 + (new Date(p.fim) - new Date(p.inicio)) / 6e4, 0);
  const finT = T.filter((a) => dentro(a.finalizada_em)), iniT = T.filter((a) => dentro(a.iniciada_em));
  const devol = T.filter((a) => dentro(a.avaliado_em) && ["RECUSADO", "NAO_RESOLVIDO", "DEVOLVIDO"].includes(a.resultado));
  const idsT = new Set(T.map((a) => a.id)), pz = rP.data.filter((p) => idsT.has(p.atendimento_id) && dentro(p.inicio));
  const parado = pz.filter((p) => !ehEtapa(p.motivo)).reduce((s2, p) => s2 + ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4, 0);
  const concl = L.filter((r) => r.status === "CONCLUÍDA"), pend = L.filter((r) => r.status !== "CONCLUÍDA");
  const semInicio = pend.filter((r) => ["ABERTA", "DIRECIONADA", "PENDENTE DE ATENDIMENTO"].includes(r.status));
  const R = {
    rotPer, ini0, fim0, filtros: [["Período", `${rotPer} (${dataBR(ini0)} a ${dataBR(new Date(fim0 - 1))})`], ["Manutentor", mnt ? nomeU(mnt) : "Todos"], ["Granja", nuc ? nomeN(nuc) : "Todas"], ["Tipo", tipo === "PREVENTIVA" ? "Só preventivas" : tipo === "CORRETIVA" ? "Só corretivas" : "Todas"], ["Classificação", prio ? PRIO[prio].rot : "Todas"]],
    k: { abertas: L.length, concl: concl.length, pct: pct(concl.length, L.length), pend: pend.length, semInicio: semInicio.length, andamento: pend.length - semInicio.length,
      devol: devol.length, recusas: devol.filter((a) => a.resultado === "RECUSADO").length, naoRes: devol.filter((a) => a.resultado === "NAO_RESOLVIDO").length, admin: devol.filter((a) => a.resultado === "DEVOLVIDO").length,
      horas: finT.reduce((s2, a) => s2 + liq(a) + etapaAt(a.id), 0), servico: finT.reduce((s2, a) => s2 + liq(a), 0), desloc: finT.reduce((s2, a) => s2 + etapaAt(a.id, "DESLOCAMENTO"), 0), material: finT.reduce((s2, a) => s2 + etapaAt(a.id, "MATERIAL"), 0), atendidas: finT.length, medio: media(finT.map(liq)), resposta: media(iniT.map((a) => minEntre(a.iniciada_em, a.direcionada_em))),
      lead: media(concl.map((r) => r.min_lead_total)), parado },
  };
  const mntsR = Object.values(S.usuarios).filter((u) => u.perfis.includes("manutentor") && (!mnt || u.id === mnt)).sort((a, b) => a.nome.localeCompare(b.nome));
  R.porMnt = mntsR.map((u) => { const f = finT.filter((a) => a.manutentor_id === u.id), dv = devol.filter((a) => a.manutentor_id === u.id), ii = iniT.filter((a) => a.manutentor_id === u.id);
    const pp = pz.filter((p) => p.manutentor_id === u.id && !ehEtapa(p.motivo)).reduce((s2, p) => s2 + ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4, 0);
    return [u.nome, f.length, f.reduce((s2, a) => s2 + liq(a) + etapaAt(a.id), 0), media(f.map(liq)), media(ii.map((a) => minEntre(a.iniciada_em, a.direcionada_em))), dv.filter((a) => a.resultado === "RECUSADO").length, dv.filter((a) => a.resultado === "NAO_RESOLVIDO").length, pp,
      f.reduce((s2, a) => s2 + etapaAt(a.id, "DESLOCAMENTO"), 0), f.reduce((s2, a) => s2 + etapaAt(a.id, "MATERIAL"), 0), f.reduce((s2, a) => s2 + liq(a), 0)]; });
  const gIds = [...new Set(L.map((r) => r.nucleo_id))].sort((a, b) => nomeN(a).localeCompare(nomeN(b)));
  R.porGranja = gIds.map((g) => { const l = L.filter((r) => r.nucleo_id === g), c = l.filter((r) => r.status === "CONCLUÍDA").length, f = finT.filter((a) => a.ordens_servico?.nucleo_id === g);
    return [nomeN(g), l.length, c, pct(c, l.length), l.length - c, media(f.map(liq))]; });
  R.porPrio = [...Object.keys(PRIO), null].map((k) => { const l = L.filter((r) => (r.prioridade ?? null) === k), c = l.filter((r) => r.status === "CONCLUÍDA");
    return [k ? PRIO[k].rot : "A classificar", l.length, c.length, pct(c.length, l.length), media(l.map((r) => r.min_ate_inicio)), media(c.map((r) => r.min_lead_total)), k]; }).filter((x) => x[1]);
  R.pendentes = pend.sort((a, b) => new Date(a.aberta_em) - new Date(b.aberta_em)).map((r) => { const o = osInfo[r.id] || {};
    return [osId(r.id), fmtDH(r.aberta_em), `${nomeN(r.nucleo_id)} · ${localCurto(r.galpoes)}`, o.equipamento || "—", o.descricao || "", r.prioridade ? PRIO[r.prioridade].rot : "A classificar",
      o.pausada_em ? "Pausada" : STATUS[r.status].rot, r.manutentor_id ? nomeU(r.manutentor_id) : "—", idade(r.aberta_em)]; });
  R.pendKeys = pend.map((r) => ({ id: r.id, prio: r.prioridade, status: r.status, pausa: osInfo[r.id]?.pausada_em }));
  R.devolucoes = devol.sort((a, b) => new Date(b.avaliado_em) - new Date(a.avaliado_em)).map((a) => [osId(a.os_id), fmtDH(a.avaliado_em), a.resultado === "RECUSADO" ? "Recusada pelo manutentor" : a.resultado === "DEVOLVIDO" ? "Devolvida pelo administrador" : "Técnico: não resolvido",
    nomeU(a.manutentor_id), a.ordens_servico?.descricao || "", a.motivo_recusa || "—"]);
  // Etapas de cada OS concluída: quem estava com a OS e por quanto tempo (a soma das etapas = tempo total)
  const m = (a, b) => (a && b ? Math.max(0, (new Date(a) - new Date(b)) / 6e4) : 0);
  R.etapas = L.filter((r) => r.status === "CONCLUÍDA").map((r) => {
    const cic = rT.data.filter((a) => a.os_id === r.id).sort((a, b) => a.ciclo - b.ciclo), pzs = rP.data.filter((p) => p.os_id === r.id && p.fim);
    let ant = r.aberta_em, ges = 0, fila = 0, bruto = 0, tec = 0;
    cic.forEach((a) => { ges += m(a.direcionada_em, ant); fila += a.iniciada_em ? m(a.iniciada_em, a.direcionada_em) : m(a.avaliado_em, a.direcionada_em);
      if (a.iniciada_em && a.finalizada_em) { bruto += m(a.finalizada_em, a.iniciada_em); tec += m(a.avaliado_em, a.finalizada_em); } ant = a.avaliado_em || ant; });
    const pz = (f) => pzs.filter(f).reduce((s2, p) => s2 + m(p.fim, p.inicio), 0), des = pz((p) => p.motivo === "DESLOCAMENTO"), mat = pz((p) => p.motivo === "MATERIAL"), par = pz((p) => !ehEtapa(p.motivo));
    return { id: r.id, nuc: r.nucleo_id, gal: r.galpoes, ges, fila, des, mat, serv: Math.max(0, bruto - des - mat - par), par, tec, total: r.min_lead_total ?? m(r.confirmada_em, r.aberta_em), ciclos: cic.length };
  }).sort((a, b) => b.id - a.id);
  const E = R.etapas, med = (k) => (E.length ? E.reduce((s2, x) => s2 + x[k], 0) / E.length : 0), mediana2 = (k) => mediana(E.map((x) => x[k]));
  const ET = [["ges", "Encaminhar (da abertura até o direcionamento)", "Gestor"], ["fila", "Aguardando início (na fila)", "Manutentor"], ["des", "Deslocamento até o local", "Manutentor"],
    ["mat", "Busca de material", "Manutentor"], ["serv", "Execução do serviço", "Manutentor"], ["par", "Pausas (almoço, peça, fim do expediente…)", "Manutentor"], ["tec", "Confirmação (da finalização até a confirmação)", "Técnico / gestor (preventiva)"]];
  const totMed = med("total") || 1;
  R.etapasResumo = ET.map(([k, rot, quem]) => ({ k, rot, quem, media: med(k), mediana: mediana2(k), pct: Math.round((med(k) / totMed) * 100) }));
  R.etapasTotal = { media: med("total"), mediana: mediana2("total"), n: E.length };
  R.mntEtapas = mntsR.map((u) => { const f = finT.filter((a) => a.manutentor_id === u.id); if (!f.length) return null;
    const media = (fn) => f.reduce((s2, a) => s2 + fn(a), 0) / f.length;
    const des = media((a) => etapaAt(a.id, "DESLOCAMENTO")), mat = media((a) => etapaAt(a.id, "MATERIAL")), par = media((a) => pausaAt(a.id) - etapaAt(a.id));
    return { nome: u.nome, n: f.length, serv: media((a) => liq(a)), des, mat, par: Math.max(0, par) }; }).filter(Boolean);
  S.rel = R;
  desenharRelatorio(R);
}

function desenharRelatorio(R) {
  const k = R.k;
  const met = (l, v, nota, hot = false) => `<div class="rm${hot ? " hot" : ""}"><small>${l}</small><b>${v}</b><span>${nota}</span></div>`;
  const pbar = (p) => `<span class="pct"><span class="pbar"><i style="width:${p}%"></i></span>${p}%</span>`;
  const tabela = (tit, sub, cols, linhas, total, vazio = "Nada no período.") => `<section class="rel-bloco">
      <div class="rel-bh"><h3>${tit}</h3>${sub ? `<span>${sub}</span>` : ""}</div>
      ${linhas.length ? `<div class="tscroll"><table class="rt"><thead><tr>${cols.map((c) => `<th class="${c[1] || ""}">${c[0]}</th>`).join("")}</tr></thead>
        <tbody>${linhas.map((l) => `<tr>${l.map((v, i) => `<td class="${cols[i][1] || ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody>
        ${total ? `<tfoot><tr>${total.map((v, i) => `<td class="${cols[i][1] || ""}">${v}</td>`).join("")}</tr></tfoot>` : ""}</table></div>` : `<div class="rel-vazio">${vazio}</div>`}
    </section>`;
  const soma = (arr, i) => arr.reduce((s2, l) => s2 + (+l[i] || 0), 0);
  const totG = [soma(R.porGranja, 1), soma(R.porGranja, 2), soma(R.porGranja, 4)];
  $("#rInfo").textContent = R.filtros[0][1];
  $("#relOut").innerHTML = `<div class="rel-doc">
    <header class="rel-cab">
      <div><small>Relatório de manutenção das granjas</small><h2>${esc(R.rotPer)}</h2><p>${dataBR(R.ini0)} a ${dataBR(new Date(R.fim0 - 1))}</p></div>
      <div class="rel-chips">${R.filtros.slice(1).map(([a, b]) => `<span><em>${a}</em>${esc(b)}</span>`).join("")}</div>
    </header>
    <div class="rel-paineis">
      <section class="rel-painel"><h4>${ic("list")}Volume de OS</h4><div class="rel-met">
        ${met("Abertas no período", k.abertas, "total de OS abertas")}
        ${met("Finalizadas", `${k.pct}%`, `${k.concl} de ${k.abertas} concluídas`)}
        ${met("Não atendidas", k.pend, `${k.semInicio} sem início · ${k.andamento} em andamento`, k.semInicio > 0)}
        ${met("Devolvidas", k.devol, `${k.recusas} recusadas · ${k.naoRes} não resolvidas${k.admin ? ` · ${k.admin} pelo admin` : ""}`, k.devol > 0)}</div></section>
      <section class="rel-painel"><h4>${ic("clock")}Tempo e horas</h4><div class="rel-met">
        ${met("Horas trabalhadas", fmtHoras(k.horas), `${k.atendidas} atendimentos finalizados`)}
        ${met("Horas de serviço (execução)", fmtHoras(k.servico), `só o serviço de fato · ${pct(Math.round(k.servico), Math.round(k.horas) || 1)}% das horas`)}
        ${met("Deslocamento · material", `${fmtHoras(k.desloc)} · ${fmtHoras(k.material)}`, "fora do tempo de serviço")}
        ${met("Execução média por atendimento", fmtMin(k.medio), "sem deslocamento, material e pausas")}
        ${met("Resposta média", fmtMin(k.resposta), "do direcionamento ao início")}
        ${met("Lead médio", fmtMin(k.lead), "da abertura à confirmação")}</div></section>
    </div>
    <div class="rel-graf">
      <section><h4>Situação das OS do período</h4>${donutBloco([{ l: "Concluídas", v: k.concl, c: "#1E8E4E" }, { l: "Em andamento", v: k.andamento, c: "#E8A317" }, { l: "Sem início", v: k.semInicio, c: "#DF2331" }], { centro: k.abertas, sub: "OS abertas", tam: 150, esp: 18 })}</section>
      <section><h4>Finalização</h4>${medidor(k.pct, { rot: `${k.concl} de ${k.abertas} OS`, cor: k.pct >= 80 ? "#1E8E4E" : k.pct >= 60 ? "#E8A317" : "#DF2331" })}</section>
      <section><h4>Horas trabalhadas por manutentor</h4>${R.porMnt.length ? barras(R.porMnt.map((l) => ({ l: esc(l[0]), v: l[2], txt: fmtHoras(l[2]), c: "#DF2331" })), Math.max(1, ...R.porMnt.map((l) => l[2]))) : `<div class="zero">Sem atendimentos.</div>`}</section>
    </div>
    ${!R.etapas.length ? `<section class="rel-bloco"><div class="rel-bh"><h3>Onde o tempo foi gasto</h3></div><div class="rel-vazio">Ainda não há OS <b>concluídas</b> no período. A divisão por etapa aparece quando a OS é confirmada pelo técnico (ou pelo gestor, na preventiva). O tempo de serviço dos atendimentos finalizados já aparece nos indicadores acima e na tabela por manutentor.</div></section>` : ""}
    ${R.etapas.length ? `<section class="rel-bloco"><div class="rel-bh"><h3>Onde o tempo foi gasto</h3><span>${R.etapasTotal.n} OS concluídas · média por OS · a soma das etapas é o tempo total</span></div>
      <div class="etapa-barra">${R.etapasResumo.filter((e) => e.media > 0).map((e, i) => `<i style="flex:${e.media};background:${ETAPA_COR[R.etapasResumo.indexOf(e)]}" title="${e.rot}: ${fmtMin(e.media)}"></i>`).join("")}</div>
      <div class="etapa-leg">${R.etapasResumo.map((e, i) => `<span><i style="background:${ETAPA_COR[i]}"></i>${ETAPA_CURTO[i]} <b>${e.pct}%</b></span>`).join("")}</div>
      ${R.mntEtapas.length ? (() => { const mx = Math.max(...R.mntEtapas.map((x) => x.serv + x.des + x.mat + x.par), 1);
        return `<h4 class="etapa-sub">Tempo do manutentor por atendimento (média)</h4><div class="mnt-barras">${R.mntEtapas.map((x) => `<div class="mb-l"><span>${esc(x.nome)}</span><div class="mb-t">${MNT_PARTES.map(([k2, rot, c]) => x[k2] > 0 ? `<i style="width:${(x[k2] / mx) * 100}%;background:${c}" title="${rot}: ${fmtMin(x[k2])}"></i>` : "").join("")}</div><b>${fmtMin(x.serv + x.des + x.mat + x.par)}</b></div>`).join("")}</div>
        <div class="etapa-leg">${MNT_PARTES.map(([k2, rot, c]) => `<span><i style="background:${c}"></i>${rot}</span>`).join("")}</div>`; })() : ""}
      <div class="tscroll"><table class="rt"><thead><tr><th>Etapa</th><th>Quem está com a OS</th><th class="n">Média por OS</th><th class="n">Mediana</th><th class="n">% do tempo total</th></tr></thead><tbody>
      ${R.etapasResumo.map((e, i) => `<tr><td><i class="etapa-cor" style="background:${ETAPA_COR[i]}"></i><b>${e.rot}</b></td><td>${e.quem}</td><td class="n">${fmtMin(e.media)}</td><td class="n">${fmtMin(e.mediana)}</td><td class="n">${e.pct}%</td></tr>`).join("")}</tbody>
      <tfoot><tr><td><b>Tempo total (da abertura até a confirmação)</b></td><td></td><td class="n"><b>${fmtMin(R.etapasTotal.media)}</b></td><td class="n"><b>${fmtMin(R.etapasTotal.mediana)}</b></td><td class="n">100%</td></tr></tfoot></table></div></section>
    ${tabela("Tempo por etapa em cada OS", `OS concluídas no período${R.etapas.length > 40 ? " · 40 mais recentes (todas no PDF e no Excel)" : ""}`, [["OS"], ["Onde"], ["Encaminhar", "n"], ["Fila", "n"], ["Deslocamento", "n"], ["Material", "n"], ["Serviço", "n"], ["Pausas", "n"], ["Confirmar", "n"], ["Total", "n"]],
      R.etapas.slice(0, 40).map((x) => [`<b>${osId(x.id)}</b>${x.ciclos > 1 ? ` <small class="muted">${x.ciclos} atend.</small>` : ""}`, `${esc(nomeN(x.nuc))} · ${localCurto(x.gal)}`, fmtMin(x.ges), fmtMin(x.fila), fmtMin(x.des), fmtMin(x.mat), `<b>${fmtMin(x.serv)}</b>`, fmtMin(x.par), fmtMin(x.tec), `<b>${fmtMin(x.total)}</b>`]))}` : ""}
    ${tabela("Por manutentor", "atendimentos finalizados no período", [["Manutentor"], ["OS atendidas", "n"], ["Horas trab.", "n"], ["Serviço", "n"], ["Deslocamento", "n"], ["Material", "n"], ["Serviço médio", "n"], ["Resposta média", "n"], ["Recusas", "n"], ["Não resolvidas", "n"], ["Tempo parado", "n"]],
      R.porMnt.map((l) => [`<b>${esc(l[0])}</b>`, l[1], fmtHoras(l[2]), `<b>${fmtHoras(l[10])}</b>`, fmtMin(l[8]), fmtMin(l[9]), fmtMin(l[3]), fmtMin(l[4]), l[5] || "—", l[6] || "—", fmtMin(l[7])]),
      R.porMnt.length > 1 ? ["Equipe", soma(R.porMnt, 1), fmtHoras(soma(R.porMnt, 2)), fmtHoras(soma(R.porMnt, 10)), fmtMin(soma(R.porMnt, 8)), fmtMin(soma(R.porMnt, 9)), fmtMin(k.medio), fmtMin(k.resposta), soma(R.porMnt, 5), soma(R.porMnt, 6), fmtMin(soma(R.porMnt, 7))] : null)}
    <div class="rel-2">
      ${tabela("Por granja", "OS abertas no período", [["Granja"], ["Abertas", "n"], ["Concluídas", "n"], ["Finalização", "n"], ["Não atend.", "n"], ["Tempo médio", "n"]],
        R.porGranja.map((l) => [`<b>${esc(l[0])}</b>`, l[1], l[2], pbar(l[3]), l[4] || "—", fmtMin(l[5])]),
        R.porGranja.length > 1 ? ["Total", totG[0], totG[1], pbar(pct(totG[1], totG[0])), totG[2], fmtMin(k.medio)] : null)}
      ${tabela("Por classificação", "tempos em média", [["Classificação"], ["Abertas", "n"], ["Concluídas", "n"], ["Finalização", "n"], ["Até começar", "n"], ["Lead médio", "n"]],
        R.porPrio.map((l) => [sev(l[6]), l[1], l[2], pbar(l[3]), fmtMin(l[4]), fmtMin(l[5])]))}
    </div>
    ${tabela("OS não atendidas", `${R.pendentes.length} OS · da mais antiga para a mais nova`, [["OS"], ["Aberta há", "n"], ["Onde"], ["Equipamento"], ["Serviço", "wide"], ["Classificação"], ["Situação"], ["Manutentor"]],
      R.pendentes.map((l, i) => { const p = R.pendKeys[i] || {}; return [`<span class="mono">${l[0]}</span>`, l[8], esc(l[2]), esc(l[3]), esc(l[4]), sev(p.prio),
        p.pausa ? `<span class="st pausa">${ic("pause")}Pausada</span>` : stTag(p.status), esc(l[7])]; }), null, "Todas as OS do período foram concluídas.")}
    ${tabela("Devoluções", `${R.devolucoes.length} no período`, [["OS"], ["Quando"], ["Tipo"], ["Manutentor"], ["Serviço", "wide"], ["Motivo", "wide"]],
      R.devolucoes.map((l) => [`<span class="mono">${l[0]}</span>`, l[1], `<span class="tag bad">${l[2]}</span>`, esc(l[3]), esc(l[4]), esc(l[5])]), null, "Nenhuma devolução no período.")}
    <p class="rel-nota">Horas trabalhadas = registradas no sistema (Iniciar → Finalizar, menos pausas). OS e percentuais consideram as OS abertas no período; horas e tempos, os atendimentos finalizados no período.</p>
  </div>`;
}

// Salvar arquivo: no iPhone/iPad (principalmente com o app instalado) abre o "Compartilhar" → Salvar em Arquivos;
// no Android e no computador, baixa direto.
async function salvarArquivo(blob, nome) {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  try {
    const f = new File([blob], nome, { type: blob.type });
    if (ios && navigator.canShare?.({ files: [f] })) { await navigator.share({ files: [f], title: nome }); return true; }
  } catch (e) { if (e?.name === "AbortError") return false; }
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast("Arquivo gerado: " + nome);
  return true;
}
async function logoDataURL() {
  if (C.LOGO.startsWith("data:")) return C.LOGO;
  const b = await (await fetch(C.LOGO)).blob();
  return new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); });
}
const nomeArq = (ext) => `relatorio-manutencao_${S.rel.ini0.toLocaleDateString("sv-SE", { timeZone: TZ })}_${new Date(S.rel.fim0 - 1).toLocaleDateString("sv-SE", { timeZone: TZ })}.${ext}`;

const ETAPA_COR = ["#5B6470", "#A1A4A9", "#2F6BD9", "#E39A12", "#1E8E4E", "#C9A227", "#7C3AED"];
const ETAPA_CURTO = ["Encaminhar (gestor)", "Fila", "Deslocamento", "Material", "Serviço", "Pausas", "Confirmação (técnico)"];
const MNT_PARTES = [["serv", "Serviço", "#1E8E4E"], ["des", "Deslocamento", "#2F6BD9"], ["mat", "Material", "#E39A12"], ["par", "Pausas", "#C9A227"]];
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
async function exportarPDF() {
  if (!S.rel) return;
  await carregarScript("jspdf.umd.min.js", () => window.jspdf);
  await carregarScript("jspdf.plugin.autotable.min.js", () => window.jspdf?.jsPDF?.API?.autoTable);
  const R = S.rel, k = R.k, { jsPDF } = window.jspdf, doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const W = 210, M = 14, VERM = [223, 35, 49], TINTA = [34, 27, 23], CINZA = [124, 113, 105], VINHO = [126, 12, 22], OURO = [242, 181, 27];
  const logo = await logoDataURL();
  // cabeçalho
  doc.setFillColor(...VINHO); doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(...OURO); doc.rect(0, 30, W, 1.2, "F");
  doc.addImage(logo, "PNG", M, 6.5, 34, 17);
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(15);
  doc.text("Relatório de Manutenção das Granjas", 54, 14);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(210, 212, 216);
  doc.text(`${C.NOME_EMPRESA} · ${R.filtros[0][1]}`, 54, 20.5);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR", { timeZone: TZ })} por ${S.eu.nome}`, 54, 25.5);
  // filtros
  let y = 39; doc.setTextColor(...CINZA); doc.setFontSize(8.5);
  doc.text(R.filtros.slice(1).map(([a, b]) => `${a}: ${b}`).join("     "), M, y);
  // indicadores (2 linhas x 4)
  const kp = [["OS abertas", String(k.abertas), "no período"], ["Finalizadas", `${k.pct}%`, `${k.concl} de ${k.abertas}`], ["Não atendidas", String(k.pend), `${k.semInicio} sem início`],
    ["Devolvidas", String(k.devol), `${k.recusas} rec. · ${k.naoRes} não res.`],
    ["Horas trabalhadas", fmtHoras(k.horas), `${k.atendidas} atendimentos`], ["Horas de serviço", fmtHoras(k.servico), `execução de fato · ${pct(Math.round(k.servico), Math.round(k.horas) || 1)}%`],
    ["Deslocamento", fmtHoras(k.desloc), "fora do tempo de serviço"], ["Busca de material", fmtHoras(k.material), "fora do tempo de serviço"],
    ["Execução média", fmtMin(k.medio), "por atendimento, só serviço"], ["Resposta média", fmtMin(k.resposta), "do direcionamento ao início"],
    ["Lead médio", fmtMin(k.lead), "da abertura à confirmação"], ["Tempo parado", fmtHoras(k.parado), "pausas (almoço, peça...)"]];
  y += 5; const bw = (W - 2 * M - 9) / 4, bh = 19;
  kp.forEach(([l, v, s2], i) => { const x = M + (i % 4) * (bw + 3), yy = y + Math.floor(i / 4) * (bh + 3);
    doc.setDrawColor(226, 226, 222); doc.setFillColor(250, 250, 249); doc.roundedRect(x, yy, bw, bh, 2, 2, "FD");
    doc.setFontSize(7.5); doc.setTextColor(...CINZA); doc.text(l, x + 3, yy + 5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...((l === "Não atendidas" && k.semInicio) || (l === "Devolvidas" && k.devol) ? VERM : TINTA)); doc.text(v, x + 3, yy + 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...CINZA); doc.text(s2, x + 3, yy + 16.5); });
  y += 3 * bh + 13;
  const secao = (tit, head, body, cols = {}) => {
    if (y > 260) { doc.addPage(); y = 18; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...TINTA); doc.text(tit, M, y);
    doc.autoTable({ startY: y + 2.5, head: [head], body: body.length ? body : [[{ content: "Nada no período.", colSpan: head.length, styles: { halign: "center", textColor: CINZA } }]], margin: { left: M, right: M },
      styles: { font: "helvetica", fontSize: 8, cellPadding: 1.8, textColor: TINTA, lineColor: [230, 230, 226], lineWidth: 0.1 },
      headStyles: { fillColor: VINHO, textColor: 255, fontStyle: "bold" }, alternateRowStyles: { fillColor: [251, 248, 244] }, columnStyles: cols });
    y = doc.lastAutoTable.finalY + 9;
  };
  const num = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { halign: "right" }]));
  if (!R.etapas.length) { doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...TINTA); doc.text("Onde o tempo foi gasto", M, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...CINZA); doc.text("Ainda não há OS concluídas no período. A divisão por etapa aparece quando a OS é confirmada.", M, y + 5); y += 13; }
  if (R.etapas.length) {
    // gráfico 1: barra empilhada das etapas
    if (y > 225) { doc.addPage(); y = 18; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...TINTA); doc.text(`Onde o tempo foi gasto · ${R.etapasTotal.n} OS concluídas`, M, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...CINZA); doc.text(`Média por OS: ${fmtMin(R.etapasTotal.media)} da abertura até a confirmação. A soma das etapas é o tempo total.`, M, y + 4.5);
    let x = M; const BW = W - 2 * M, tot = R.etapasResumo.reduce((s2, e) => s2 + e.media, 0) || 1; y += 7.5;
    R.etapasResumo.forEach((e, i) => { const w = (e.media / tot) * BW; if (w <= 0) return; doc.setFillColor(...rgb(ETAPA_COR[i])); doc.rect(x, y, w, 8, "F");
      if (w > 9) { doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.text(`${e.pct}%`, x + w / 2, y + 5.3, { align: "center" }); } x += w; });
    y += 12; doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
    R.etapasResumo.forEach((e, i) => { const cx = M + (i % 3) * (BW / 3), cy = y + Math.floor(i / 3) * 5; doc.setFillColor(...rgb(ETAPA_COR[i])); doc.rect(cx, cy - 2.6, 3, 3, "F");
      doc.setTextColor(...TINTA); doc.text(`${ETAPA_CURTO[i]} · ${fmtMin(e.media)} (${e.pct}%)`, cx + 4.5, cy); });
    y += 18;
    // gráfico 2: tempo do manutentor por atendimento
    if (R.mntEtapas.length) {
      if (y + 14 + R.mntEtapas.length * 7 > 280) { doc.addPage(); y = 18; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(9.5); doc.setTextColor(...TINTA); doc.text("Tempo do manutentor por atendimento (média)", M, y); y += 4;
      const mx = Math.max(...R.mntEtapas.map((v) => v.serv + v.des + v.mat + v.par), 1), LX = M + 42, LW = BW - 42 - 18;
      R.mntEtapas.forEach((v) => { doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...TINTA); doc.text(doc.splitTextToSize(v.nome, 40)[0], M, y + 3.6);
        let bx = LX; MNT_PARTES.forEach(([k2, , c]) => { const w = (v[k2] / mx) * LW; if (w > 0) { doc.setFillColor(...rgb(c)); doc.rect(bx, y, w, 5, "F"); bx += w; } });
        doc.setFont("helvetica", "bold"); doc.text(fmtMin(v.serv + v.des + v.mat + v.par), bx + 2, y + 3.6); y += 7; });
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      MNT_PARTES.forEach(([, rot, c], i) => { const cx = LX + i * 32; doc.setFillColor(...rgb(c)); doc.rect(cx, y - 0.6, 3, 3, "F"); doc.setTextColor(...TINTA); doc.text(rot, cx + 4.5, y + 2); });
      y += 10;
    }
    secao(`Etapas: média e mediana por OS (${R.etapasTotal.n} OS concluídas)`, ["Etapa", "Quem está com a OS", "Média por OS", "Mediana", "% do total"],
      [...R.etapasResumo.map((e) => [e.rot, e.quem, fmtMin(e.media), fmtMin(e.mediana), e.pct + "%"]), ["Tempo total (da abertura até a confirmação)", "", fmtMin(R.etapasTotal.media), fmtMin(R.etapasTotal.mediana), "100%"]], { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } });
    secao("Tempo por etapa em cada OS concluída", ["OS", "Onde", "Encaminhar", "Fila", "Desloc.", "Material", "Serviço", "Pausas", "Confirmar", "Total"],
      R.etapas.map((x) => [osId(x.id), `${nomeN(x.nuc)} · ${localCurto(x.gal)}`, fmtMin(x.ges), fmtMin(x.fila), fmtMin(x.des), fmtMin(x.mat), fmtMin(x.serv), fmtMin(x.par), fmtMin(x.tec), fmtMin(x.total)]), Object.fromEntries([2, 3, 4, 5, 6, 7, 8, 9].map((i) => [i, { halign: "right" }])));
  }
  secao("Por manutentor", ["Manutentor", "OS atendidas", "Horas trab.", "Serviço", "Desloc.", "Material", "Serviço médio", "Resposta média", "Recusas", "Não resolvidas", "Tempo parado"],
    R.porMnt.map((l) => [l[0], l[1], fmtHoras(l[2]), fmtHoras(l[10]), fmtMin(l[8]), fmtMin(l[9]), fmtMin(l[3]), fmtMin(l[4]), l[5], l[6], fmtMin(l[7])]), num(10));
  secao("Por granja", ["Granja", "Abertas", "Concluídas", "% finalização", "Não atendidas", "Tempo médio"], R.porGranja.map((l) => [l[0], l[1], l[2], l[3] + "%", l[4], fmtMin(l[5])]), num(5));
  secao("Por classificação", ["Classificação", "Abertas", "Concluídas", "% finalização", "Até começar", "Lead médio"], R.porPrio.map((l) => [l[0], l[1], l[2], l[3] + "%", fmtMin(l[4]), fmtMin(l[5])]), num(5));
  secao(`OS não atendidas (${R.pendentes.length})`, ["OS", "Aberta em", "Onde", "Serviço", "Classif.", "Situação", "Manutentor", "Há"],
    R.pendentes.map((l) => [l[0], l[1], l[2], l[4], l[5], l[6], l[7], l[8]]), { 3: { cellWidth: 44 } });
  secao(`Devoluções (${R.devolucoes.length})`, ["OS", "Quando", "Tipo", "Manutentor", "Serviço", "Motivo"], R.devolucoes, { 4: { cellWidth: 40 }, 5: { cellWidth: 44 } });
  doc.setFontSize(7.5); doc.setTextColor(...CINZA);
  doc.text("Horas trabalhadas = registradas no sistema (Iniciar a Finalizar, menos pausas). Percentuais sobre as OS abertas no período.", M, Math.min(y, 285));
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setDrawColor(230, 230, 226); doc.line(M, 288, W - M, 288); doc.setFontSize(7.5); doc.setTextColor(...CINZA);
    doc.text(`${C.NOME_EMPRESA} · ${C.NOME_SISTEMA}`, M, 292); doc.text(`Página ${i} de ${n}`, W - M, 292, { align: "right" }); }
  await salvarArquivo(doc.output("blob"), nomeArq("pdf"));
}

async function exportarExcel() {
  if (!S.rel) return;
  await carregarScript("xlsx.mini.min.js", () => window.XLSX);
  const R = S.rel, k = R.k, X = window.XLSX, wb = X.utils.book_new();
  const h = (m) => (m == null ? null : Math.round((m / 60) * 100) / 100), mi = (m) => (m == null ? null : Math.round(m));
  const aba = (nome, linhas, larguras) => { const ws = X.utils.aoa_to_sheet(linhas); ws["!cols"] = larguras.map((w) => ({ wch: w })); X.utils.book_append_sheet(wb, ws, nome); };
  aba("Resumo", [["Relatório de Manutenção das Granjas"], [C.NOME_EMPRESA], [`Gerado em ${new Date().toLocaleString("pt-BR", { timeZone: TZ })} por ${S.eu.nome}`], [],
    ...R.filtros, [], ["Indicador", "Valor", "Observação"],
    ["OS abertas", k.abertas, "no período"], ["Concluídas", k.concl, ""], ["% finalização", k.pct / 100, "concluídas ÷ abertas"],
    ["Não atendidas", k.pend, `${k.semInicio} sem início · ${k.andamento} em andamento`], ["Devolvidas", k.devol, `${k.recusas} recusadas · ${k.naoRes} não resolvidas`],
    ["Horas trabalhadas (h)", h(k.horas), "Iniciar → Finalizar, menos pausas"], ["Atendimentos finalizados", k.atendidas, ""],
    ["Tempo médio de atendimento (min)", mi(k.medio), "execução líquida"], ["Resposta média (min)", mi(k.resposta), "direcionamento → início"],
    ["Lead médio (min)", mi(k.lead), "abertura → confirmação"], ["Tempo parado (h)", h(k.parado), "pausas"]], [34, 22, 44]);
  wb.Sheets.Resumo["B" + (R.filtros.length + 9)].z = "0%";
  aba("Etapas (resumo)", [["Etapa", "Quem está com a OS", "Média por OS (min)", "Mediana (min)", "% do tempo total"], ...R.etapasResumo.map((e) => [e.rot, e.quem, Math.round(e.media), Math.round(e.mediana), e.pct / 100]),
    ["Tempo total (da abertura até a confirmação)", "", Math.round(R.etapasTotal.media), Math.round(R.etapasTotal.mediana), 1]], [40, 28, 18, 14, 16]);
  aba("Etapas por OS", [["OS", "Granja", "Local", "Atendimentos", "Encaminhar (min)", "Fila (min)", "Deslocamento (min)", "Material (min)", "Serviço (min)", "Pausas (min)", "Confirmar (min)", "Total (min)"],
    ...R.etapas.map((x) => [osId(x.id), nomeN(x.nuc), localCurto(x.gal), x.ciclos, ...["ges", "fila", "des", "mat", "serv", "par", "tec", "total"].map((k) => Math.round(x[k]))])], [10, 16, 18, 13, 16, 11, 18, 14, 13, 12, 15, 11]);
  aba("Por manutentor", [["Manutentor", "OS atendidas", "Horas trabalhadas (h)", "Horas de serviço (h)", "Deslocamento (h)", "Material (h)", "Serviço médio (min)", "Resposta média (min)", "Recusas", "Não resolvidas", "Tempo parado (h)"],
    ...R.porMnt.map((l) => [l[0], l[1], h(l[2]), h(l[10]), h(l[8]), h(l[9]), mi(l[3]), mi(l[4]), l[5], l[6], h(l[7])])], [26, 13, 20, 18, 16, 13, 18, 20, 10, 14, 17]);
  aba("Por granja", [["Granja", "Abertas", "Concluídas", "% finalização", "Não atendidas", "Tempo médio (min)"], ...R.porGranja.map((l) => [l[0], l[1], l[2], l[3] / 100, l[4], mi(l[5])])], [18, 10, 12, 14, 14, 18]);
  aba("Por classificação", [["Classificação", "Abertas", "Concluídas", "% finalização", "Até começar (min)", "Lead médio (min)"], ...R.porPrio.map((l) => [l[0], l[1], l[2], l[3] / 100, mi(l[4]), mi(l[5])])], [16, 10, 12, 14, 18, 17]);
  aba("OS não atendidas", [["OS", "Aberta em", "Onde", "Equipamento", "Serviço", "Classificação", "Situação", "Manutentor", "Há"], ...R.pendentes], [10, 16, 26, 24, 40, 14, 22, 22, 10]);
  aba("Devoluções", [["OS", "Quando", "Tipo", "Manutentor", "Serviço", "Motivo"], ...R.devolucoes], [10, 16, 24, 22, 40, 40]);
  ["Por granja", "Por classificação"].forEach((n) => { const ws = wb.Sheets[n]; for (let r = 2; r <= 40; r++) if (ws["D" + r]) ws["D" + r].z = "0%"; });
  await salvarArquivo(new Blob([X.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), nomeArq("xlsx"));
}

/* ---------------- Controles (ADMIN): materiais por carro e jornada ---------------- */
const dhCompleta = (ts) => (ts ? new Date(ts).toLocaleString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "") : "");
const localMat = (g) => ((g || []).length ? local(g) : "Núcleo todo");
const PERIODOS = `<option value="hoje">Hoje</option><option value="semana">Esta semana</option><option value="semana_ant">Semana passada</option>
  <option value="mes" selected>Este mês</option><option value="mes_ant">Mês passado</option><option value="30">Últimos 30 dias</option><option value="x">Escolher datas…</option>`;
function filtroPeriodoHTML(p) {
  return `<label class="field"><span>Período</span><select class="input" id="${p}Per">${PERIODOS}</select></label>
    <label class="field" id="${p}DeL" hidden><span>De</span><input type="date" class="input" id="${p}De" value="${hojeISO(-30)}"></label>
    <label class="field" id="${p}AteL" hidden><span>Até</span><input type="date" class="input" id="${p}Ate" value="${hojeISO()}"></label>`;
}
const lerPeriodo = (p) => faixaPeriodo($(`#${p}Per`).value, $(`#${p}De`).value, $(`#${p}Ate`).value);

function viewControles(aba = S.abaCtl || "mat") {
  S.abaCtl = aba;
  const mnts = Object.values(S.usuarios).filter((u) => u.perfis.includes("manutentor")).sort((a, b) => a.nome.localeCompare(b.nome));
  const optM = `<option value="">Todos</option>${mnts.map((u) => `<option value="${u.id}">${esc(u.nome)}${u.excluido_em ? " (excluído)" : !u.ativo ? " (bloqueado)" : ""}</option>`).join("")}`;
  $("#view").innerHTML = `<div class="content">
    <div class="seg" id="cAba">${[["mat", "Materiais dos carros", "box"], ["jor", "Jornada e pausas", "clock"], ["sis", "Sistema", "cog"]].map(([k, r, i]) => `<button data-a="${k}" aria-pressed="${k === aba}">${r}</button>`).join("")}</div>
    ${aba === "sis" ? `<div id="sisOut"><div class="skel"></div></div>` : aba === "mat" ? `
    <section class="card rel-filtros"><div class="rf-grid">
      ${filtroPeriodoHTML("m")}
      <label class="field"><span>Carro (almoxarifado)</span><select class="input" id="mCar"><option value="">Todos</option>${(S.carros || []).map((c) => `<option value="${c.codigo}">${c.codigo}</option>`).join("")}<option value="sem">Sem código (lançamentos antigos)</option></select></label>
      <label class="field"><span>Manutentor</span><select class="input" id="mMnt">${optM}</select></label>
      <label class="field"><span>Núcleo</span><select class="input" id="mNuc"><option value="">Todos</option>${S.nucleos.map((n) => `<option value="${n.id}">${esc(n.nome)}</option>`).join("")}</select></label>
      <label class="field"><span>Aviário</span><input class="input" id="mAv" inputmode="numeric" placeholder="Ex.: 72"></label>
      <label class="field"><span>OS</span><input class="input" id="mOs" inputmode="numeric" placeholder="Ex.: 51"></label>
      <label class="field"><span>Material</span><input class="input" id="mTxt" placeholder="Código ou nome"></label>
    </div><div class="rel-acoes"><div class="seg" id="mVis" style="margin:0"><button data-v="cons" aria-pressed="true">Consolidado</button><button data-v="det" aria-pressed="false">Detalhado</button></div>
      <div class="grow"></div><button class="btn" id="mCsv">${ic("download")}CSV</button><button class="btn btn-primary" id="mXls">${ic("sheet")}Excel</button></div></section>
    <div id="mOut"><div class="skel"></div></div>` : `
    <section class="card rel-filtros"><div class="rf-grid">
      ${filtroPeriodoHTML("j")}
      <label class="field"><span>Manutentor</span><select class="input" id="jMnt">${optM}</select></label>
      <label class="field"><span>Mostrar</span><select class="input" id="jQual"><option value="alerta">Só fora do padrão</option><option value="todas">Todas as pausas</option></select></label>
    </div><div class="rel-acoes"><span class="muted" id="jCfgTxt"></span><div class="grow"></div><button class="btn" id="jCfg">${ic("cog")}Horário padrão</button><button class="btn btn-primary" id="jXls">${ic("sheet")}Excel</button></div></section>
    <div id="jOut"><div class="skel"></div></div>`}
  </div>`;
  $("#cAba").onclick = (e) => { const b = e.target.closest("[data-a]"); if (b) viewControles(b.dataset.a); };
  const ligar = (p, fn) => { $(`#${p}Per`).onchange = () => { const x = $(`#${p}Per`).value === "x"; $(`#${p}DeL`).hidden = $(`#${p}AteL`).hidden = !x; fn(); }; };
  if (aba === "sis") return sistemaDesenhar();
  if (aba === "mat") {
    ligar("m", materiaisBuscar);
    ["mDe", "mAte", "mCar", "mMnt", "mNuc"].forEach((i) => ($("#" + i).onchange = materiaisBuscar));
    ["mAv", "mOs", "mTxt"].forEach((i) => ($("#" + i).oninput = () => { clearTimeout(viewControles.t); viewControles.t = setTimeout(materiaisBuscar, 400); }));
    $("#mVis").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; $$("#mVis button").forEach((x) => x.setAttribute("aria-pressed", x === b)); materiaisDesenhar(); };
    $("#mXls").onclick = (e) => busy(e.currentTarget, materiaisExcel);
    $("#mCsv").onclick = (e) => busy(e.currentTarget, materiaisCSV);
    materiaisBuscar();
  } else {
    ligar("j", jornadaBuscar);
    ["jDe", "jAte", "jMnt", "jQual"].forEach((i) => ($("#" + i).onchange = i === "jQual" ? jornadaDesenhar : jornadaBuscar));
    $("#jCfg").onclick = folhaJornadaConfig;
    $("#jXls").onclick = (e) => busy(e.currentTarget, jornadaExcel);
    jornadaBuscar();
  }
}

/* ---- materiais ---- */
async function materiaisBuscar() {
  const tok = S.tok, [ini0, fim0, rot] = lerPeriodo("m");
  let q = sb.from("os_materiais").select("*").gte("registrado_em", ini0.toISOString()).lt("registrado_em", fim0.toISOString());
  const car = $("#mCar").value, mnt = $("#mMnt").value, nuc = $("#mNuc").value, av2 = parseInt($("#mAv").value), os = parseInt(String($("#mOs").value).replace(/\D/g, "")), t = $("#mTxt").value.trim().replace(/[%*,()]/g, " ").trim();
  if (car === "sem") q = q.is("almoxarifado", null); else if (car) q = q.eq("almoxarifado", +car);
  if (mnt) q = q.eq("manutentor_id", mnt);
  if (nuc) q = q.eq("nucleo_id", +nuc);
  if (av2) q = q.contains("galpoes", [av2]);
  if (os) q = q.eq("os_id", os);
  if (t) q = q.or(`codigo.ilike.*${t}*,material.ilike.*${t}*`);
  const { data, error } = await todas(q.order("registrado_em", { ascending: false }).order("id", { ascending: false }));
  if (tok !== S.tok) return;
  if (error) return toast(errMsg(error), true);
  S.ctlMat = { linhas: data, rot, ini0, fim0, filtros: [["Período", `${rot} (${dataBR(ini0)} a ${dataBR(new Date(fim0 - 1))})`], ["Carro", car === "sem" ? "Sem código" : car || "Todos"],
    ["Manutentor", mnt ? nomeU(mnt) : "Todos"], ["Núcleo", nuc ? nomeN(+nuc) : "Todos"], ["Aviário", av2 || "Todos"], ["OS", os ? osId(os) : "Todas"], ["Material", t || "Todos"]] };
  materiaisDesenhar();
}
// "Aeroporto: Av. 12, 13 · Vinagre 01: núcleo todo"
const ondeTexto = (locais) => Object.entries(locais).sort((a, b) => nomeN(+a[0]).localeCompare(nomeN(+b[0])))
  .map(([n, l]) => `${nomeN(+n)}: ${[l.av.size ? `Av. ${[...l.av].sort((a, b) => a - b).join(", ")}` : "", l.todo ? "núcleo todo" : ""].filter(Boolean).join(" + ")}`).join(" · ");
function consolidarMat(linhas) {
  const g = {};
  linhas.forEach((m) => { const k = `${m.almoxarifado ?? "—"}|${String(m.codigo).toUpperCase()}|${m.unidade}`;
    (g[k] ??= { car: m.almoxarifado, codigo: m.codigo, material: m.material, unidade: m.unidade, qtd: 0, os: new Set(), n: 0, locais: {} }); g[k].qtd += Number(m.quantidade); g[k].os.add(m.os_id); g[k].n++;
    const lc = (g[k].locais[m.nucleo_id] ??= { todo: false, av: new Set() }); if (!(m.galpoes || []).length) lc.todo = true; (m.galpoes || []).forEach((x) => lc.av.add(x)); });
  Object.values(g).forEach((x) => (x.onde = ondeTexto(x.locais)));
  return Object.values(g).sort((a, b) => String(a.car).localeCompare(String(b.car)) || String(a.codigo).localeCompare(String(b.codigo)));
}
function materiaisDesenhar() {
  const D = S.ctlMat; if (!D) return;
  const det = $("#mVis [aria-pressed=true]").dataset.v === "det", L = D.linhas, porCarro = {};
  L.forEach((m) => (porCarro[m.almoxarifado ?? "—"] = (porCarro[m.almoxarifado ?? "—"] || 0) + 1));
  const qtdF = (v) => Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
  const resumo = `<div class="ctl-res">${[...(S.carros || []).map((c) => c.codigo), "—"].filter((c) => porCarro[c]).map((c) => `<div><small>${c === "—" ? "Sem código" : "Carro " + c}</small><b>${porCarro[c]}</b><span>lançamento(s)</span></div>`).join("")
    || `<div><small>Período</small><b>0</b><span>lançamentos</span></div>`}</div>`;
  const tabela = det
    ? `<div class="tscroll"><table class="rt"><thead><tr><th>Data</th><th>Carro</th><th>Código</th><th class="wide">Material</th><th>Controle</th><th class="n">Qtd</th><th>Un.</th><th>OS</th><th>Granja</th><th>Onde foi usado</th><th>Manutentor</th></tr></thead><tbody>
      ${L.map((m) => `<tr><td>${fmtDH(m.registrado_em)}</td><td><b>${m.almoxarifado ?? "—"}</b></td><td class="mono">${esc(m.codigo)}</td><td class="wide">${esc(m.material)}</td><td>${esc(m.controle || "—")}</td>
        <td class="n">${qtdF(m.quantidade)}</td><td>${esc(m.unidade)}</td><td><button class="linkish mono" data-os="${m.os_id}">${osId(m.os_id)}</button></td><td>${esc(nomeN(m.nucleo_id))}</td><td>${localMat(m.galpoes)}</td><td>${esc(nomeU(m.manutentor_id))}</td></tr>`).join("")}</tbody></table></div>`
    : `<div class="tscroll"><table class="rt"><thead><tr><th>Carro</th><th>Código</th><th class="wide">Material</th><th class="n">Quantidade</th><th>Un.</th><th class="wide">Onde foi usado (granja / aviário)</th><th class="n">OS</th></tr></thead><tbody>
      ${consolidarMat(L).map((x) => `<tr><td><b>${x.car ?? "—"}</b></td><td class="mono">${esc(x.codigo)}</td><td class="wide">${esc(x.material)}</td><td class="n"><b>${qtdF(x.qtd)}</b></td><td>${esc(x.unidade)}</td><td class="wide">${esc(x.onde)}</td><td class="n">${x.os.size}</td></tr>`).join("")}</tbody></table></div>`;
  $("#mOut").innerHTML = `<div class="rel-doc"><div class="rel-bloco"><div class="rel-bh"><h3>${det ? "Lançamentos" : "Consolidado por carro e material"}</h3><span>${L.length} lançamento(s) · ${D.filtros[0][1]}</span></div>
    ${resumo}${L.length ? tabela : `<div class="rel-vazio">Nenhum material encontrado com esses filtros.</div>`}</div>
    <p class="rel-nota">Só entram materiais que o manutentor informou como retirados do carro. “Núcleo todo” = OS aberta para a granja inteira. Lançamentos antigos (antes desta versão) aparecem sem código de carro.</p></div>`;
  $("#mOut").onclick = (e) => { const b = e.target.closest("[data-os]"); if (b) abrirOS(+b.dataset.os); };
}
const linhaMatExp = (m) => [dhCompleta(m.registrado_em), m.almoxarifado ?? "", m.codigo, m.material, m.controle || "", Number(m.quantidade), m.unidade, osId(m.os_id), nomeN(m.nucleo_id), localMat(m.galpoes), (m.galpoes || []).length ? "Aviário" : "Núcleo todo", nomeU(m.manutentor_id)];
const CAB_MAT = ["Data", "Carro (almoxarifado)", "Código", "Material", "Controle", "Quantidade", "Unidade", "OS", "Granja", "Onde foi usado", "Destino", "Manutentor"];
async function materiaisExcel() {
  const D = S.ctlMat; if (!D) return;
  await carregarScript("xlsx.mini.min.js", () => window.XLSX);
  const X = window.XLSX, wb = X.utils.book_new(), aba = (n, l, w) => { const ws = X.utils.aoa_to_sheet(l); ws["!cols"] = w.map((c) => ({ wch: c })); X.utils.book_append_sheet(wb, ws, n); };
  aba("Consolidado", [["Materiais dos carros — consolidado"], ...D.filtros, [], ["Carro (almoxarifado)", "Código", "Material", "Quantidade", "Unidade", "Onde foi usado (granja / aviário)", "Nº de OS", "Lançamentos"],
    ...consolidarMat(D.linhas).map((x) => [x.car ?? "", x.codigo, x.material, Math.round(x.qtd * 1000) / 1000, x.unidade, x.onde, x.os.size, x.n])], [20, 12, 36, 12, 9, 44, 9, 12]);
  aba("Detalhado", [CAB_MAT, ...D.linhas.map(linhaMatExp)], [16, 18, 12, 36, 14, 11, 9, 10, 14, 20, 13, 24]);
  await salvarArquivo(new Blob([X.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), nomeArqCtl("materiais-carros", D, "xlsx"));
}
async function materiaisCSV() {
  const D = S.ctlMat; if (!D) return;
  const cel = (v) => { const t = String(v ?? ""); return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const linhas = [CAB_MAT, ...D.linhas.map((m) => { const l = linhaMatExp(m); l[5] = String(l[5]).replace(".", ","); return l; })].map((l) => l.map(cel).join(";")).join("\r\n");
  await salvarArquivo(new Blob(["\ufeff" + linhas], { type: "text/csv;charset=utf-8" }), nomeArqCtl("materiais-carros", D, "csv"));
}
const nomeArqCtl = (base, D, ext) => `${base}_${D.ini0.toLocaleDateString("sv-SE", { timeZone: TZ })}_${new Date(D.fim0 - 1).toLocaleDateString("sv-SE", { timeZone: TZ })}.${ext}`;

/* ---- jornada ---- */
const hhmm = (t) => String(t || "17:00").slice(0, 5);
async function jornadaBuscar() {
  const tok = S.tok, [ini0, fim0, rot] = lerPeriodo("j"), mnt = $("#jMnt").value;
  let q = sb.from("vw_pausas").select("*").gte("inicio", ini0.toISOString()).lt("inicio", fim0.toISOString());
  if (mnt) q = q.eq("manutentor_id", mnt);
  const { data, error } = await todas(q.order("inicio", { ascending: false }).order("id", { ascending: false }));
  if (tok !== S.tok) return;
  if (error) return toast(errMsg(error), true);
  S.ctlJor = { linhas: data.filter((p) => !ehEtapa(p.motivo)), rot, ini0, fim0, filtros: [["Período", `${rot} (${dataBR(ini0)} a ${dataBR(new Date(fim0 - 1))})`], ["Manutentor", mnt ? nomeU(mnt) : "Todos"]] };
  jornadaDesenhar();
}
function resumoDias(L) {
  const lim = S.jornada?.almoco_max_min || 120, d = {};
  L.forEach((p) => { const k = `${p.dia}|${p.manutentor_id}`; const x = (d[k] ??= { dia: p.dia, mnt: p.manutentor_id, almoco: 0, pausas: 0, total: 0, apos: 0, pend: 0 });
    x.pausas++; x.total += p.duracao_min; if (p.motivo === "ALMOCO") x.almoco += p.duracao_min; if (p.apos_expediente) x.apos++; });
  return Object.values(d).map((x) => ({ ...x, excesso: Math.max(0, x.almoco - lim) })).sort((a, b) => b.dia.localeCompare(a.dia) || nomeU(a.mnt).localeCompare(nomeU(b.mnt)));
}
function jornadaDesenhar() {
  const D = S.ctlJor; if (!D) return;
  const cfg = S.jornada || { fim_expediente: "17:00", almoco_max_min: 120 };
  $("#jCfgTxt").innerHTML = `Padrão: expediente até <b>${hhmm(cfg.fim_expediente)}</b> · almoço de <b>${fmtMin(cfg.almoco_max_min)}</b>`;
  const so = $("#jQual").value === "alerta", L = D.linhas, fora = (p) => p.excesso_almoco_min > 0 || p.apos_expediente;
  const lista = so ? L.filter(fora) : L, dias = resumoDias(L), diaBR = (d) => d.split("-").reverse().join("/");
  const pend = L.filter((p) => fora(p) && !p.autorizada_em).length;
  $("#jOut").innerHTML = `<div class="rel-doc">
    <div class="rel-bloco"><div class="ctl-res">
      <div><small>Pausas no período</small><b>${L.length}</b><span>${fmtMin(L.reduce((a, p) => a + p.duracao_min, 0))} no total</span></div>
      <div><small>Almoços acima do padrão</small><b class="${dias.some((x) => x.excesso) ? "hot" : ""}">${dias.filter((x) => x.excesso).length}</b><span>dias com excesso</span></div>
      <div><small>Pausas após ${hhmm(cfg.fim_expediente)}</small><b>${L.filter((p) => p.apos_expediente).length}</b><span>começaram depois do expediente</span></div>
      <div><small>Sem autorização</small><b class="${pend ? "hot" : ""}">${pend}</b><span>fora do padrão, aguardando análise</span></div></div></div>
    <div class="rel-bloco"><div class="rel-bh"><h3>Resumo por dia</h3><span>almoço somado no dia · padrão ${fmtMin(cfg.almoco_max_min)}</span></div>
      ${dias.length ? `<div class="tscroll"><table class="rt"><thead><tr><th>Dia</th><th>Manutentor</th><th class="n">Almoço</th><th class="n">Excesso</th><th class="n">Pausas</th><th class="n">Tempo pausado</th><th class="n">Após ${hhmm(cfg.fim_expediente)}</th></tr></thead><tbody>
      ${dias.map((x) => `<tr><td>${diaBR(x.dia)}</td><td><b>${esc(nomeU(x.mnt))}</b></td><td class="n">${x.almoco ? fmtMin(x.almoco) : "—"}</td><td class="n">${x.excesso ? `<span class="tag bad">+${fmtMin(x.excesso)}</span>` : "—"}</td>
        <td class="n">${x.pausas}</td><td class="n">${fmtMin(x.total)}</td><td class="n">${x.apos ? `<span class="tag">${x.apos}</span>` : "—"}</td></tr>`).join("")}</tbody></table></div>` : `<div class="rel-vazio">Nenhuma pausa no período.</div>`}</div>
    <div class="rel-bloco"><div class="rel-bh"><h3>${so ? "Pausas fora do padrão" : "Todas as pausas"}</h3><span>${lista.length} pausa(s) · horários registrados automaticamente</span></div>
      ${lista.length ? `<div class="tscroll"><table class="rt"><thead><tr><th>Manutentor</th><th>OS</th><th>Motivo</th><th>Início</th><th>Retorno</th><th class="n">Duração</th><th>Situação</th><th></th></tr></thead><tbody>
      ${lista.map((p) => `<tr><td><b>${esc(nomeU(p.manutentor_id))}</b></td><td><button class="linkish mono" data-os="${p.os_id}">${osId(p.os_id)}</button></td><td>${MOTIVOS[p.motivo].rot}${p.detalhe ? `<small class="muted" style="display:block">${esc(p.detalhe)}</small>` : ""}</td>
        <td>${fmtDH(p.inicio)}</td><td>${p.fim ? fmtDH(p.fim) : `<span class="tag">em pausa</span>`}</td><td class="n">${fmtMin(p.duracao_min)}</td>
        <td>${[p.excesso_almoco_min ? `<span class="tag bad">almoço +${fmtMin(p.excesso_almoco_min)}</span>` : "", p.apos_expediente ? `<span class="tag">após ${hhmm(cfg.fim_expediente)}</span>` : ""].join(" ") || `<span class="tag ok">no padrão</span>`}
          ${p.autorizada_em ? `<small class="muted" style="display:block">Autorizada por ${esc(nomeU(p.autorizada_por))}: ${esc(p.obs_autorizacao)}</small>` : ""}</td>
        <td>${fora(p) && !p.autorizada_em ? `<button class="btn btn-sm" data-aut="${p.id}">Autorizar</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<div class="rel-vazio">${so ? "Nenhuma pausa fora do padrão no período." : "Nenhuma pausa no período."}</div>`}</div>
    <p class="rel-nota">O manutentor não digita horários: início e retorno são gravados no momento em que ele toca em Pausar e Retomar. Pausas fora do padrão ficam registradas e podem ser autorizadas pelo administrador ou gerente, com o motivo.</p></div>`;
  $("#jOut").onclick = (e) => {
    const o = e.target.closest("[data-os]"); if (o) return abrirOS(+o.dataset.os);
    const a = e.target.closest("[data-aut]"); if (!a) return;
    folhaTexto(null, { titulo: "Autorizar pausa", sub: "Fica registrado quem autorizou e por quê.", campo: "Motivo da autorização", ph: "Ex.: atendimento emergencial no fim do dia", min: 3, botao: "Autorizar",
      ok: async (t) => { await rpc("autorizar_pausa", { p_pausa: +a.dataset.aut, p_obs: t }); toast("Pausa autorizada."); jornadaBuscar(); } });
  };
}
function folhaJornadaConfig() {
  const cfg = S.jornada || { fim_expediente: "17:00", almoco_max_min: 120 };
  folha({ titulo: "Horário padrão da equipe", sub: "Vale para os alertas e relatórios a partir de agora",
    corpo: `<label class="field"><span>Fim do expediente</span><input class="input" type="time" id="cfFim" value="${hhmm(cfg.fim_expediente)}"></label>
      <label class="field"><span>Almoço padrão</span><select class="input" id="cfAlm">${[60, 90, 120, 150, 180].map((m) => `<option value="${m}" ${m === cfg.almoco_max_min ? "selected" : ""}>${fmtMin(m)}</option>`).join("")}</select></label><p class="err" id="cfE"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="cfOk">Salvar</button>`,
    aoAbrir: (el, fechar) => { $("#cfOk", el).onclick = (e) => busy(e.currentTarget, async () => {
      await rpc("salvar_jornada", { p_fim: $("#cfFim", el).value, p_almoco: +$("#cfAlm", el).value });
      const { data } = await sb.from("jornada_config").select("*").maybeSingle(); S.jornada = data; MOTIVOS.ALMOCO.lim = data.almoco_max_min; fechar(); toast("Horário padrão salvo."); jornadaBuscar(); }); } });
}
async function jornadaExcel() {
  const D = S.ctlJor; if (!D) return;
  await carregarScript("xlsx.mini.min.js", () => window.XLSX);
  const X = window.XLSX, wb = X.utils.book_new(), aba = (n, l, w) => { const ws = X.utils.aoa_to_sheet(l); ws["!cols"] = w.map((c) => ({ wch: c })); X.utils.book_append_sheet(wb, ws, n); };
  aba("Resumo por dia", [["Dia", "Manutentor", "Almoço (min)", "Excesso de almoço (min)", "Pausas", "Tempo pausado (min)", "Pausas após o expediente"],
    ...resumoDias(D.linhas).map((x) => [x.dia.split("-").reverse().join("/"), nomeU(x.mnt), x.almoco, x.excesso, x.pausas, x.total, x.apos])], [12, 26, 13, 22, 9, 19, 23]);
  aba("Pausas", [["Manutentor", "OS", "Motivo", "Detalhe", "Início", "Retorno", "Duração (min)", "Excesso almoço (min)", "Após o expediente", "Autorizada por", "Motivo da autorização"],
    ...D.linhas.map((p) => [nomeU(p.manutentor_id), osId(p.os_id), MOTIVOS[p.motivo].rot, p.detalhe || "", dhCompleta(p.inicio), p.fim ? dhCompleta(p.fim) : "em pausa", p.duracao_min, p.excesso_almoco_min, p.apos_expediente ? "Sim" : "Não",
      p.autorizada_por ? nomeU(p.autorizada_por) : "", p.obs_autorizacao || ""])], [24, 10, 24, 28, 16, 16, 13, 19, 16, 22, 30]);
  await salvarArquivo(new Blob([X.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), nomeArqCtl("jornada-pausas", D, "xlsx"));
}

/* ---- sistema: backup e modo manutenção ---- */
// Proteção do arquivo de backup por senha, feita no próprio navegador (nada sai daqui):
// formato .osgbackup = "OSGB1" + 1 byte (1 = comprimido) + sal(16) + iv(12) + AES-GCM-256 (chave via PBKDF2-SHA256, 250 mil voltas)
const OSGB_MAGIC = [0x4f, 0x53, 0x47, 0x42, 0x31];
async function chaveDaSenha(senha, sal) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(senha), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: sal, iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function comprimir(bytes) {
  if (!("CompressionStream" in window)) return null;
  try { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer()); } catch { return null; }
}
async function cifrarBackup(texto, senha) {
  const cru = new TextEncoder().encode(texto), zip = await comprimir(cru), dados = zip || cru;
  const sal = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await chaveDaSenha(senha, sal), dados));
  const out = new Uint8Array(34 + ct.length); out.set(OSGB_MAGIC, 0); out[5] = zip ? 1 : 0; out.set(sal, 6); out.set(iv, 22); out.set(ct, 34);
  return out;
}
const diasDesde = (ts) => Math.floor((Date.now() - new Date(ts)) / 864e5);
function statusBackup(lst) {
  if (!lst.length) return { cls: "ruim", ic: "alert", t: "Nenhum backup baixado ainda", d: "Baixe agora e guarde no drive da empresa." };
  const u = lst[0], d = diasDesde(u.feito_em);
  const quando = d === 0 ? "hoje" : d === 1 ? "ontem" : `há ${d} dias`;
  return { cls: d < 7 ? "ok" : d < 15 ? "atencao" : "ruim", ic: d < 7 ? "checkc" : "alert", t: `Último backup: ${quando}`, d: `${fmtDH(u.feito_em)} · por ${esc(nomeU(u.feito_por))} · ${Math.max(1, Math.round(u.tamanho_bytes / 1024))} KB${u.cifrado ? " · com senha" : ""}` };
}
async function sistemaDesenhar() {
  const st = await statusSistema(); if (st.erro) return toast(errMsg(st.erro), true);
  S.status = st; const on = !!st.em_manutencao;
  const { data: regs, error: eReg } = await sb.from("backup_registro").select("*").order("feito_em", { ascending: false }).limit(8);
  const bkOk = !eReg, lst = regs || [], sb2 = statusBackup(lst);
  const cardBackup = `<section class="card bkp" style="max-width:720px;margin-bottom:14px">
    <div class="bkp-h"><span class="kpi-ic" style="--kc:#1E8E4E">${ic("box")}</span><div><h3>Backup dos dados</h3>
      <p class="muted">Baixa uma cópia de <b>tudo</b>: OS, histórico, pausas, materiais, usuários e logins. Se um dia precisar, dá para importar de volta sem perder nada.</p></div></div>
    ${bkOk ? `<div class="bkp-st ${sb2.cls}">${ic(sb2.ic)}<div><b>${sb2.t}</b><small>${sb2.d}</small></div></div>
    <label class="bkp-cif"><input type="checkbox" id="bkCif" checked><span><b>Proteger o arquivo com senha</b> (recomendado)<small>O arquivo tem dados pessoais e as senhas criptografadas dos usuários.</small></span></label>
    <div id="bkSenhas" class="bkp-senhas">
      <label class="field"><span>Senha do backup <em>(mínimo 10 caracteres)</em></span><input class="input" type="password" id="bkS1" autocomplete="new-password"></label>
      <label class="field"><span>Repita a senha</span><input class="input" type="password" id="bkS2" autocomplete="new-password"></label>
      <div class="note"><b>Guarde esta senha.</b> Sem ela o backup não abre e <b>não existe como recuperar</b>. Anote em um lugar seguro (e com uma segunda pessoa de confiança).</div>
    </div>
    <div class="acoes"><button class="btn btn-primary" id="bkBaixar">${ic("download")}Baixar backup completo</button><button class="btn" id="bkComo">Como restaurar</button></div>
    ${lst.length ? `<details class="bkp-hist"><summary>Últimos backups (${lst.length})</summary><div class="tbl"><table class="t"><thead><tr><th>Quando</th><th>Quem</th><th class="n">Tamanho</th><th>Senha</th></tr></thead><tbody>
      ${lst.map((r) => `<tr><td>${fmtDH(r.feito_em)}</td><td>${esc(nomeU(r.feito_por))}</td><td class="n">${Math.max(1, Math.round(r.tamanho_bytes / 1024))} KB</td><td>${r.cifrado ? "sim" : "não"}</td></tr>`).join("")}</tbody></table></div></details>` : ""}`
    : `<div class="note"><b>Falta instalar a atualização do banco.</b> Rode o arquivo <b>07_backup.sql</b> no SQL Editor do Supabase (uma vez) para liberar o backup.</div>`}
  </section>`;
  const cardManut = `<section class="card" style="max-width:720px">
    <h3>Aviso de manutenção</h3>
    <p class="muted" style="font-size:13px;margin:4px 0 14px">Use antes de uma atualização (banco ou site). Enquanto estiver ligado, técnicos, manutentores, gestores e gerentes veem a tela
      “Sistema em manutenção” e o app volta sozinho quando você desligar. Administradores continuam entrando normalmente para testar.</p>
    <div class="zona ${on ? "perigo" : ""}"><div><b>${on ? "Manutenção LIGADA" : "Sistema funcionando normalmente"}</b>
      <small>${on ? `Ligada em ${fmtDH(st.atualizado_em)}${st.atualizado_por ? " por " + esc(nomeU(st.atualizado_por)) : ""}` : "Todos os usuários estão acessando."}</small></div>
      <button class="btn ${on ? "btn-primary" : "btn-danger"}" id="sisBtn">${on ? "Desligar manutenção" : "Ligar manutenção"}</button></div>
    <label class="field" style="margin-top:14px"><span>Mensagem para a equipe <em>(opcional)</em></span>
      <input class="input" id="sisMsg" maxlength="300" placeholder="Ex.: atualização do sistema, voltamos às 18h" value="${esc(st.mensagem || "")}"></label>
    <p class="muted" style="font-size:12px">Versão do app: ${VERSAO}</p></section>`;
  const { data: ns, error: eNs } = await sb.rpc("status_notificacoes");
  const cardNotif = eNs ? `<section class="card" style="max-width:720px;margin-bottom:14px"><h3>Notificações no celular</h3><div class="note"><b>Falta instalar a atualização do banco.</b> Rode o arquivo <b>10_notificacoes.sql</b> no SQL Editor do Supabase.</div></section>`
    : `<section class="card" style="max-width:720px;margin-bottom:14px"><div class="bkp-h"><span class="kpi-ic" style="--kc:#2F6BD9">${ic("bell")}</span><div><h3>Notificações no celular</h3>
      <p class="muted">Avisa a equipe no celular, mesmo com o app fechado (OS nova, direcionada, emergência, finalizada, devolvida).</p></div></div>
      <div class="bkp-st ${ns.ativo ? "ok" : "ruim"}">${ic(ns.ativo ? "check" : "alert")}<div><b>${ns.ativo ? "Envio ligado" : "Envio desligado"}</b><small>${ns.pessoas} pessoa(s) com notificação ativa · ${ns.aparelhos} aparelho(s) · ${ns.enviados_7d} aviso(s) nos últimos 7 dias</small></div></div>
      <div class="acoes"><button class="btn ${ns.ativo ? "" : "btn-primary"}" id="nLigar">${ns.ativo ? "Desligar envio" : `${ic("bell")}Ligar envio de notificações`}</button></div>
      ${ns.ativo ? "" : `<p class="muted" style="font-size:12.5px">Antes de ligar, publique a função <b>notificar</b> no Supabase (Edge Functions). Depois de ligado, cada pessoa ativa no próprio celular.</p>`}</section>`;
  $("#sisOut").innerHTML = cardNotif + cardBackup + cardManut;
  $("#nLigar")?.addEventListener("click", (e) => busy(e.currentTarget, async () => {
    if (ns.ativo) { await rpc("configurar_notificacoes", { p_url: ns.funcao_url, p_ativo: false }); toast("Envio de notificações desligado."); return sistemaDesenhar(); }
    await rpc("configurar_notificacoes", { p_url: `${C.SUPABASE_URL}/functions/v1/notificar`, p_ativo: true });
    const { data: r, error: eF } = await sb.functions.invoke("notificar", { body: { acao: "iniciar" } });
    if (eF || !r?.ok) { await rpc("configurar_notificacoes", { p_url: `${C.SUPABASE_URL}/functions/v1/notificar`, p_ativo: false }); throw new Error("A função “notificar” não respondeu. Confira se ela foi publicada no Supabase (Edge Functions) com Verify JWT desligado."); }
    toast("Envio de notificações ligado. Agora cada pessoa pode ativar no celular."); sistemaDesenhar();
  }));

  if (bkOk) {
    const cif = $("#bkCif"), caixa = $("#bkSenhas");
    cif.onchange = () => (caixa.hidden = !cif.checked);
    $("#bkComo").onclick = folhaComoRestaurar;
    $("#bkBaixar").onclick = (e) => busy(e.currentTarget, async () => {
      const protegido = cif.checked, senha = $("#bkS1").value;
      if (protegido) {
        if (senha.length < 10) return toast("A senha do backup precisa de pelo menos 10 caracteres.", true);
        if (senha !== $("#bkS2").value) return toast("As duas senhas não são iguais.", true);
        if (!crypto?.subtle) return toast("Este navegador não suporta proteger com senha. Use o Chrome ou o Safari atualizados.", true);
      }
      const sql = await rpc("gerar_backup");
      if (typeof sql !== "string" || sql.length < 300) throw new Error("O backup veio vazio. Tente de novo.");
      const carimbo = new Date().toLocaleString("sv-SE", { timeZone: TZ }).slice(0, 16).replace(" ", "_").replace(":", "");
      const blob = protegido ? new Blob([await cifrarBackup(sql, senha)], { type: "application/octet-stream" }) : new Blob([sql], { type: "text/plain;charset=utf-8" });
      const nome = `backup_os-granjas_${carimbo}.${protegido ? "osgbackup" : "sql"}`;
      if (await salvarArquivo(blob, nome)) {
        await rpc("registrar_backup", { p_tamanho: blob.size, p_cifrado: protegido });
        toast(`Backup salvo (${Math.max(1, Math.round(blob.size / 1024))} KB). Guarde no drive da empresa.`); atualizarBadges(true); sistemaDesenhar();
      }
    });
  }
  $("#sisBtn").onclick = (e) => confirmar({
    titulo: on ? "Desligar a manutenção?" : "Ligar a manutenção?", perigo: !on, botao: on ? "Desligar" : "Ligar manutenção",
    texto: on ? "Todos voltam a acessar em até 1 minuto (ou na hora, ao tocar em “Tentar agora”)." : "Quem estiver usando o app vê a tela de manutenção em até 1 minuto. Registros já feitos não se perdem.",
    ok: async () => { await rpc("definir_manutencao", { p_ativo: !on, p_mensagem: $("#sisMsg").value }); S.status = await statusSistema();
      const bm = $("#bannerManut"); if (bm) bm.hidden = !S.status.em_manutencao; toast(on ? "Manutenção desligada." : "Manutenção ligada."); sistemaDesenhar(); } });
}
function folhaComoRestaurar() {
  folha({
    titulo: "Como restaurar um backup", sub: "Sempre em um projeto NOVO e VAZIO do Supabase", tam: "lg",
    corpo: `<div class="note"><b>Antes:</b> tenha em mãos o arquivo do backup, o arquivo <b>00_instalacao_completa.sql</b> (na pasta do projeto) e, se o backup tem senha, a ferramenta <b>abrir-backup.html</b>.</div>
      <ol class="passos-bkp">
        <li><b>Backup com senha?</b> Abra o <b>abrir-backup.html</b> (duplo clique), escolha o arquivo <b>.osgbackup</b>, digite a senha e clique em <b>Abrir</b>. Ele baixa o arquivo <b>.sql</b>. Nada sai do seu computador.</li>
        <li>No Supabase, crie um <b>projeto novo</b> (região São Paulo).</li>
        <li><b>SQL Editor → nova consulta:</b> cole o conteúdo de <b>00_instalacao_completa.sql</b> e clique em <b>Run</b>. Isso instala a estrutura do sistema.</li>
        <li><b>SQL Editor → nova consulta:</b> cole o conteúdo do <b>.sql do backup</b> e clique em <b>Run</b>. Se o Supabase avisar de “operação destrutiva”, confirme.</li>
        <li>No fim aparece uma tabela: <b>todas as linhas devem mostrar OK</b>.</li>
        <li>Publique de novo a função <b>admin-usuarios</b>, desligue o cadastro aberto e troque o endereço e a chave no <b>config.js</b> do site.</li>
      </ol>
      <div class="note"><b>Segurança:</b> se o projeto de destino já tiver dados, o arquivo <b>se recusa a rodar</b> e não muda nada.</div>
      <div class="note"><b>Arquivo grande?</b> Se o backup passar de uns 5 MB, o SQL Editor pode travar ao colar. O Supabase recomenda o <b>psql</b> para restaurar arquivos grandes (sem limite de tamanho): o comando está no começo do próprio arquivo .sql. Se precisar, peça ajuda.</div>
      <div class="acoes"><button class="btn" id="bkFerr">${ic("download")}Baixar a ferramenta “Abrir backup”</button></div>`,
    rodape: `<button class="btn btn-primary" data-fechar>Entendi</button>`,
    aoAbrir: (el) => { $("#bkFerr", el).onclick = (e) => busy(e.currentTarget, async () => {
      const r = await fetch("abrir-backup.html", { cache: "no-cache" }); if (!r.ok) throw new Error("Não consegui baixar a ferramenta agora.");
      await salvarArquivo(new Blob([await r.text()], { type: "text/html;charset=utf-8" }), "abrir-backup.html"); }); },
  });
}

/* ---------------- Notificações no celular (push) ---------------- */
const NOTIF_EX = {
  manutentor: ["EMERGÊNCIA para atender", "OS-0050 · Aroeira · Av. 101 · Termômetro digital sem leitura"],
  gestor: ["Nova OS para direcionar", "OS-0053 · Aeroporto · Av. 12 · Cortina não sobe"],
  tecnico: ["Serviço finalizado: confirme", "OS-0045 · Vinagre 01 · Comedouro não desce ração"],
  gerente: ["Emergência aberta", "OS-0050 · Aroeira · Termômetro digital sem leitura"], admin: ["Emergência aberta", "OS-0050 · Aroeira · Termômetro digital sem leitura"] };
const QUANDO_NOTIF = {
  manutentor: ["Nova OS direcionada para você (Emergência em destaque)", "OS devolvida para você atender de novo"],
  gestor: ["Nova OS aberta para direcionar", "OS recusada, não resolvida ou devolvida", "Preventiva finalizada para você conferir"],
  tecnico: ["Serviço finalizado: hora de confirmar", "OS direcionada e iniciada (acompanhamento)"],
  gerente: ["Emergência aberta"], admin: ["Emergência aberta"] };
const ehIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const appInstalado = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
function estadoNotif() {
  if (S.usuarios[S.eu.id]?.push_em && (window.DEMO || !("Notification" in window) || Notification.permission !== "denied")) return "ativa";
  if (window.DEMO) return "desligada";
  if (ehIOS() && !appInstalado()) return "instalar";
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return "sem-suporte";
  if (Notification.permission === "denied") return "bloqueada";
  return "desligada";
}
const urlB64 = (s) => { const p = "=".repeat((4 - (s.length % 4)) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...b].map((c) => c.charCodeAt(0))); };
const swPronto = () => Promise.race([navigator.serviceWorker.ready, new Promise((_, rej) => setTimeout(() => rej(new Error("Não foi possível ativar neste navegador. Abra o app pelo ícone instalado e tente de novo.")), 10000))]);
async function ativarNotificacoes() {
  let inscr = null;
  if (!window.DEMO) {
    const chave = await rpc("chave_push");
    if (!chave) throw new Error("O envio de notificações ainda não foi ligado pelo administrador. Tente mais tarde.");
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error(perm === "denied" ? "As notificações foram bloqueadas. Libere nas configurações do celular (veja como no seu perfil)." : "Permissão não concedida.");
    const reg = await swPronto();
    const atual = await reg.pushManager.getSubscription();
    inscr = atual || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(chave) }));
  }
  await rpc("salvar_push", { p_inscricao: inscr ? inscr.toJSON() : null, p_aparelho: navigator.userAgent.slice(0, 160) });
  await carregarUsuarios();
}
const perfilNotif = () => S.eu.perfis.find((x) => NOTIF_EX[x]) || "gestor";
const exemploNotif = () => { const [t, d] = NOTIF_EX[perfilNotif()]; return `<div class="notif-ex"><img src="${C.LOGO}" alt=""><div><small>OS GRANJAS · agora</small><b>${t}</b><span>${d}</span></div></div>`; };
function folhaNotificacoes(origem = "login") {
  const st = estadoNotif();
  if (origem === "login") try { localStorage.setItem("osg_notif_perg", String(Date.now())); } catch {}
  const quando = [...new Set(S.eu.perfis.flatMap((p) => QUANDO_NOTIF[p] || []))];
  const corpo = st === "instalar"
    ? `<p>No iPhone, as notificações só funcionam com o app <b>instalado na Tela de Início</b>.</p>
       <ol class="passos-mini"><li>Abra este endereço no <b>Safari</b>.</li><li>Toque em <b>Compartilhar</b> (quadrado com seta).</li><li><b>Adicionar à Tela de Início</b> → Adicionar.</li><li>Abra o app pelo ícone e toque em <b>Ativar notificações</b>.</li></ol>`
    : st === "bloqueada"
      ? `<p>As notificações deste app estão <b>bloqueadas</b> no celular. Para liberar:</p>
       <ol class="passos-mini"><li><b>Android:</b> segure o ícone do app → Informações do app → Notificações → Permitir.</li><li><b>iPhone:</b> Ajustes → Notificações → OS Granjas → Permitir Notificações.</li><li>Depois, volte aqui e toque em <b>Ativar</b>.</li></ol>`
      : st === "ativa"
        ? `<p>As notificações estão <b>ativas</b> neste aparelho. Você recebe avisos como este, mesmo com o app fechado:</p>${exemploNotif()}
           <p class="muted" style="font-size:12.5px;margin-top:12px">Quer parar de receber? Toque em <b>Desativar neste aparelho</b>. Os avisos continuam no sino, dentro do app.</p>`
        : `<p>Receba um aviso no celular, <b>mesmo com o app fechado</b>, quando algo precisar de você. Tocando no aviso, o app abre direto na OS.</p>
       ${exemploNotif()}<div class="label" style="margin-top:14px">Você será avisado quando</div><ul class="lista-notif">${quando.map((q) => `<li>${ic("check")}${q}</li>`).join("")}</ul>`;
  folha({ titulo: st === "ativa" ? "Notificações ativas" : "Ativar notificações", sub: "Avisos no celular, como os de qualquer aplicativo", corpo,
    rodape: st === "desligada" || st === "bloqueada" ? `<button class="btn" data-fechar>Agora não</button><button class="btn btn-primary" id="nOk">${ic("bell")}Ativar notificações</button>`
      : st === "ativa" ? `<button class="btn" id="nDes">Desativar neste aparelho</button><button class="btn btn-primary" data-fechar>Fechar</button>` : `<button class="btn btn-primary" data-fechar>Entendi</button>`,
    aoAbrir: (el, fechar) => {
      $("#nOk", el)?.addEventListener("click", (e) => busy(e.currentTarget, async () => { await ativarNotificacoes(); fechar(); toast("Notificações ativadas. Você será avisado mesmo com o app fechado."); }));
      $("#nDes", el)?.addEventListener("click", (e) => busy(e.currentTarget, async () => { await desativarNotificacoes(); fechar(); toast("Notificações desativadas neste aparelho."); }));
    } });
}
async function desativarNotificacoes() {
  let endpoint = null;
  if (!window.DEMO) { const reg = await swPronto(); const s = await reg.pushManager.getSubscription(); if (s) { endpoint = s.endpoint; await s.unsubscribe().catch(() => {}); } }
  if (endpoint || window.DEMO) await rpc("remover_push", { p_endpoint: endpoint || "demo" });
  if (window.DEMO) S.usuarios[S.eu.id].push_em = null;
  await carregarUsuarios();
}
// convite automático só para quem precisa agir rápido (técnico, manutentor, gestor); gerente e admin ativam pelo perfil
function sugerirNotificacoes(tent = 0) {
  if (!S.eu || !S.eu.perfis.some((p) => ["tecnico", "manutentor", "gestor"].includes(p))) return;
  const st = estadoNotif(); if (st === "ativa" || st === "sem-suporte") return;
  let ult = 0; try { ult = +localStorage.getItem("osg_notif_perg") || 0; } catch {}
  if (Date.now() - ult < 3 * 864e5) return;
  if ($(".sheet-wrap") || $(".page") || $(".fora")) { if (tent < 40) setTimeout(() => sugerirNotificacoes(tent + 1), 3000); return; }
  folhaNotificacoes("login");
}
