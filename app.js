/* =====================================================================
   OS Granjas — protótipo de interface (do zero)
   Usa a mesma API do sistema real (sb.from / sb.rpc / sb.functions),
   aqui ligada a um simulador com dados de exemplo.
   ===================================================================== */
"use strict";
const C = window.CONFIG;
const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
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
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  coffee: '<path d="M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  dots: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
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
};
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
const stTag = (s, o) => o?.pausada_em && s === "EM ATENDIMENTO"
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
const errMsg = (e) => { const m = e?.message || String(e); return /fetch|network/i.test(m) ? "Sem conexão. Verifique a internet e tente de novo." : m; };
async function rpc(n, a) { const { data, error } = await sb.rpc(n, a); if (error) throw error; return data; }
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

async function iniciar() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return telaLogin();
  const { data: eu } = await sb.from("usuarios").select("*").eq("id", session.user.id).maybeSingle();
  if (!eu?.ativo || !eu.perfis.length) { await sb.auth.signOut(); return telaLogin("Seu usuário não tem acesso liberado."); }
  S.eu = eu;
  const [n, g, u] = await Promise.all([sb.from("nucleos").select("*").order("nome"), sb.from("galpoes").select("*").order("numero"), sb.from("usuarios").select("*").order("nome")]);
  S.nucleos = n.data.map((x) => ({ ...x, galpoes: g.data.filter((y) => y.nucleo_id === x.id).map((y) => y.numero) }));
  S.nucleoPorId = Object.fromEntries(S.nucleos.map((x) => [x.id, x]));
  S.usuarios = Object.fromEntries(u.data.map((x) => [x.id, x]));
  const r = rotas();
  ir(r.find((x) => x.id === S.rota) ? S.rota : r[0].id);
}

/* ---------------- navegação ---------------- */
function rotas() {
  const r = [];
  if (tem("tecnico") || tem("gestor") || tem("manutentor")) r.push({ id: "inicio", rot: "Início", i: "home" });
  r.push({ id: "ordens", rot: tem("tecnico") && !podeVerTudo() ? "Minhas OS" : tem("manutentor") && !podeVerTudo() ? "Histórico" : "Ordens", i: "list" });
  if (podeVerTudo()) r.push({ id: "painel", rot: "Painel", i: "chart" });
  if (tem("admin")) r.push({ id: "usuarios", rot: "Usuários", i: "users" });
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
        <button class="bell" id="btnAvisos" aria-label="Avisos">${ic("bell")}<span class="bell-n" id="bellN" hidden></span></button>
        <div class="who"><div class="txt"><b>${esc(S.eu.nome)}</b><small>${S.eu.perfis.map((p) => PERFIS[p].nome).join(" · ")}</small></div>
          <button class="av-btn mob-only" id="btnPerfilM">${av(S.eu.id)}</button></div>
      </header>
      <div id="view"></div>
    </div>
  </div>`;
  $(".rail").onclick = (e) => { const a = e.target.closest("[data-r]"); if (a) { e.preventDefault(); ir(a.dataset.r); window.scrollTo(0, 0); } };
  $("#btnPerfil").onclick = $("#btnPerfilM").onclick = folhaPerfil;
  $("#btnNovaTop")?.addEventListener("click", novaOS);
  $("#btnAvisos").onclick = () => folhaAvisos();
  ({ inicio: viewInicio, ordens: viewOrdens, painel: viewPainel, usuarios: viewUsuarios, relatorios: viewRelatorios })[id]();
  atualizarBadges();
}
/* ---------------- avisos (pendências de cada perfil) ---------------- */
async function pendencias() {
  const itens = [], q = () => sb.from("ordens_servico").select(CAMPOS);
  const add = (o, tipo, titulo, texto, urg = false) => itens.push({ os: o?.id, tipo, titulo, texto, urg: urg || o?.prioridade === "EMERGENCIA", quando: o?.aberta_em, o });
  if (tem("tecnico")) {
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
      else add(o, "devolvida", `${ult?.resultado === "RECUSADO" ? "Recusada pelo manutentor" : "Não resolvida"} · ${osId(o.id)}`, ult?.motivo_recusa ? `Motivo: ${ult.motivo_recusa}` : `${o.descricao} — direcione novamente.`);
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
  return itens.sort((a, b) => (b.urg - a.urg) || (new Date(a.quando || 0) - new Date(b.quando || 0)));
}
// Tarefas (precisam de ação) somem sozinhas quando feitas; informativos somem depois de vistos.
const ACAO = ["confirmar", "direcionar", "devolvida", "atender"];
const chaveAv = (x) => `${x.tipo}:${x.os ?? x.grupo}:${x.tipo === "paradas" ? x.titulo : x.o?.status || ""}`;
const vistosKey = () => `osg_avisos_vistos_${S.eu?.id}`;
const lerVistos = () => { try { return new Set(JSON.parse(localStorage.getItem(vistosKey()) || "[]")); } catch { return new Set(); } };
const gravarVistos = (set) => { try { localStorage.setItem(vistosKey(), JSON.stringify([...set].slice(-400))); } catch {} };
function marcarVistos(itens) { const v = lerVistos(); itens.forEach((x) => v.add(chaveAv(x))); gravarVistos(v); }
async function atualizarBadges() {
  const lst = await pendencias(), v = lerVistos();
  lst.forEach((x) => { x.acao = ACAO.includes(x.tipo); x.visto = !x.acao && v.has(chaveAv(x)); });
  S.avisos = lst;
  const vis = lst.filter((x) => !x.visto), n = vis.length, urg = vis.some((x) => x.urg);
  const bn = $("#bellN"); if (bn) { bn.hidden = !n; bn.textContent = n > 99 ? "99+" : n; bn.classList.toggle("urg", urg); }
  const b = $('[data-badge="inicio"]'); if (b) { const t = lst.filter((x) => x.acao).length; b.hidden = !t; b.textContent = t; }
  if (n && !S.avisou) { S.avisou = true; folhaAvisos(true); }
}
const TIPO_AV = { confirmar: ["checkc", "var(--s-aguardando)", "Confirmar"], direcionar: ["send", "var(--s-aberta)", "Direcionar"], devolvida: ["undo", "var(--s-pendente)", "Direcionar de novo"],
  atender: ["tool", "var(--s-direcionada)", "Abrir"], pausa: ["pause", "#6A6E75"], paradas: ["clock", "var(--s-pendente)"], emergencia: ["alert", "var(--p-EMERGENCIA)"] };
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
          if (it.os) abrirOS(it.os); else if (it.grupo) { S.lista.grupo = it.grupo; ir("ordens"); }
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
      <div class="label">O que você pode fazer</div><div class="checks">${S.eu.perfis.map((p) => `<label>${esc(PERFIS[p].nome)}<small>${PERFIS[p].faz}</small></label>`).join("")}</div>`,
    rodape: `<button class="btn" data-fechar>Fechar</button><button class="btn btn-primary" id="btnSair">${ic("logout")}Sair</button>`,
    aoAbrir: (el, fechar) => {
      $("#btnSair", el).onclick = async () => { fechar(); await sb.auth.signOut(); telaLogin(); };
      const salvar = async (foto) => { await rpc("definir_foto", { p_foto: foto }); S.usuarios[S.eu.id].foto = foto; fechar(); toast(foto ? "Foto atualizada." : "Foto removida."); recarregar(); };
      $("#rmFoto", el)?.addEventListener("click", () => salvar(null).catch((e) => toast(errMsg(e), true)));
      $("#fFoto", el).onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { salvar(await reduzirFoto(f)); } catch (err) { toast("Não foi possível usar essa imagem.", true); }
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
function recarregar() { const sel = S.sel; const y = window.scrollY; ir(S.rota); if (sel && !isMob()) abrirOS(sel); window.scrollTo(0, y); atualizarBadges(); }
/* ---------------- cartão de OS ---------------- */
function acoesRapidas(o) {
  const b = (a, rot, cls = "", i = "") => `<button class="btn btn-sm ${cls}" data-acao="${a}" data-id="${o.id}">${i ? ic(i) : ""}${rot}</button>`;
  if (tem("manutentor") && o.manutentor_id === S.eu.id) {
    if (o.status === "DIRECIONADA") return `<div class="os-actions">${b("recusar", "Recusar", "btn-danger")}${b("iniciar", "Iniciar", "btn-primary", "play")}</div>`;
    if (o.status === "EM ATENDIMENTO" && o.pausada_em) return `<div class="os-actions">${b("retomar", "Retomar atendimento", "btn-primary", "play")}</div>`;
    if (o.status === "EM ATENDIMENTO") return `<div class="os-actions">${b("pausar", "Pausar", "", "pause")}${b("finalizar", "Finalizar", "btn-primary", "flag")}</div>`;
  }
  if (tem("tecnico") && o.solicitante_id === S.eu.id && o.status === "AGUARDANDO CONFIRMAÇÃO")
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
    <div class="os-top"><span class="os-id">${osId(o.id)}</span>${sev(o.prioridade)}<span class="os-age${late ? " late" : ""}" title="Aberta em ${fmtDH(o.aberta_em)}">${idade(o.aberta_em)}</span></div>
    <div class="os-title">${esc(o.descricao)}</div>
    <div class="os-meta"><span>${ic("pin")}${esc(nomeN(o.nucleo_id))} · ${localCurto(o.galpoes)}</span>${o.equipamento ? `<span>${ic(eqIcon(o.equipamento))}${esc(o.equipamento)}</span>` : ""}</div>
    <div class="os-foot">${stTag(o.status, o)}<span class="who">${av(resp)}${esc(nomeU(resp).split(" ")[0])}</span></div>
    ${acoes ? acoesRapidas(o) : ""}
  </article>`;
}
const CAMPOS = "id,status,nucleo_id,galpoes,equipamento,descricao,aberta_em,solicitante_id,manutentor_id,prioridade,pausada_em,pausa_motivo";
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
    html += secao("Para direcionar", dir, { acoes: true, vazio: "Tudo direcionado. Nenhuma OS esperando." });
    if (emerg.length) html += secao("Emergências em andamento", emerg);
    if (velhas.length) html += secao("Paradas há mais de 3 dias", velhas.filter((o) => !dir.includes(o)).slice(0, 10));
  }
  if (tem("manutentor")) {
    const { data } = await q().eq("manutentor_id", S.eu.id).in("status", ["DIRECIONADA", "EM ATENDIMENTO"]).order("prioridade_ordem", { ascending: false }).order("id").range(0, 199);
    html += secao("Em atendimento agora", data.filter((o) => o.status === "EM ATENDIMENTO"), { acoes: true, vazio: "Nenhum atendimento em andamento." });
    html += secao("Sua fila", data.filter((o) => o.status === "DIRECIONADA"), { acoes: true, vazio: "Sua fila está vazia. Bom trabalho!" });
  }
  if (tok !== S.tok) return;
  if (!S.avisos) await atualizarBadges();
  const pend = (S.avisos || []).filter((x) => x.urg && x.os && !x.visto);
  if (pend.length) html = html.replace('</h2></div>', `</h2></div><button class="alerta-emerg" id="verAvisos">${ic("alert")}<span><b>${pend.length} ${pend.length > 1 ? "avisos urgentes" : "aviso urgente"}</b><small>${esc(pend[0].titulo)}</small></span>${ic("right")}</button>`);
  $("#pl").innerHTML = html;
  $("#verAvisos")?.addEventListener("click", () => folhaAvisos());
  $("#ctaNova")?.addEventListener("click", novaOS);
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
  let limite = 30, dados = [];
  const tok = S.tok;
  const escopo = (q) => { if (!podeVerTudo()) q = tem("tecnico") ? q.eq("solicitante_id", S.eu.id) : q.eq("manutentor_id", S.eu.id); return L.nuc ? q.eq("nucleo_id", +L.nuc) : q; };
  const pintarRot = () => { const g = rotG(); $("#mostrarRot").innerHTML = `${ic(g[2])}${g[1]}${cont[g[0]] != null ? `<b>${cont[g[0]]}</b>` : ""}`; };
  async function contar() {
    const { data } = await escopo(sb.from("ordens_servico").select("id,status,prioridade")).range(0, 19999);
    if (tok !== S.tok || !data) return;
    cont = Object.fromEntries(GRUPOS().map((g) => [g[0], data.filter(g[4]).length]));
    $$("#folders [data-c]").forEach((b) => (b.textContent = cont[b.dataset.c]));
    pintarRot();
  }
  async function buscar() {
    const { data, error } = await rotG()[3](escopo(sb.from("ordens_servico").select(CAMPOS))).order("id", { ascending: false }).range(0, 999);
    if (tok !== S.tok) return;
    if (error) return toast(errMsg(error), true);
    dados = data; desenhar();
  }
  function desenhar() {
    const t = L.q.trim().toLowerCase().replace(/^os-?0*/, "");
    const f = !t ? dados : dados.filter((o) => String(o.id) === t || `${o.descricao} ${o.equipamento || ""} ${nomeN(o.nucleo_id)}`.toLowerCase().includes(t));
    $("#res").innerHTML = f.length ? f.slice(0, limite).map((o) => card(o)).join("") : `<div class="zero">Nenhuma OS encontrada com esses filtros.</div>`;
    $("#mais").hidden = f.length <= limite;
  }
  const escolher = (k) => { L.grupo = k; $$("#folders button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.g === k)); pintarRot(); limite = 30; buscar(); };
  $("#folders").onclick = (e) => { const b = e.target.closest("[data-g]"); if (b) escolher(b.dataset.g); };
  // celular e telas menores: lista vertical em folha
  $("#btnMostrar").onclick = () => folha({ titulo: "Mostrar", corpo: `<div class="folders-v">${GRUPOS().map(([k, r, i]) =>
      `<button data-g="${k}" aria-pressed="${k === L.grupo}">${ic(i)}<span>${r}</span><b>${cont[k] ?? ""}</b>${k === L.grupo ? ic("check") : ""}</button>`).join("")}</div>`,
    aoAbrir: (el, fechar) => { $(".folders-v", el).onclick = (e) => { const b = e.target.closest("[data-g]"); if (b) { fechar(); escolher(b.dataset.g); } }; } });
  $("#busca").oninput = (e) => { L.q = e.target.value; limite = 30; desenhar(); };
  $("#fNuc")?.addEventListener("change", (e) => { L.nuc = e.target.value; contar(); buscar(); });
  $("#mais").onclick = () => { limite += 30; desenhar(); };
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
    return box("var(--s-direcionada)", "tool", "Direcionada para você", "Inicie quando começar o serviço. Se não puder atender, recuse explicando o motivo.",
      b("recusar", "Recusar", "btn-danger") + b("iniciar", "Iniciar atendimento", "btn-primary", "play"));
  if (tem("manutentor") && o.manutentor_id === S.eu.id && o.status === "EM ATENDIMENTO" && o.pausada_em)
    return box("#6A6E75", "pause", `Pausado · ${MOTIVOS[o.pausa_motivo].rot} · há ${fmtMin(pausaMin(o))}`, "O tempo da pausa não conta como execução. Retome quando voltar ao serviço.",
      b("retomar", "Retomar atendimento", "btn-primary", "play"));
  if (tem("manutentor") && o.manutentor_id === S.eu.id && o.status === "EM ATENDIMENTO")
    return box("var(--s-atendimento)", "flag", `Em atendimento há ${idade(o.iniciada_em)}`, "Vai almoçar ou esperar peça? Pause. Ao terminar, finalize descrevendo o que foi feito.",
      b("pausar", "Pausar", "", "pause") + b("finalizar", "Finalizar atendimento", "btn-primary", "flag"));
  if (tem("tecnico") && o.solicitante_id === S.eu.id && o.status === "AGUARDANDO CONFIRMAÇÃO")
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
  const RES = { CONFIRMADO: ["ok", "Resolvido"], NAO_RESOLVIDO: ["bad", "Não resolvido"], RECUSADO: ["bad", "Recusada"] };
  const ciclos = [...at].reverse().map((a) => `<div class="cycle">
    <div class="cycle-h">${av(a.manutentor_id, "sm")}<b>${esc(nomeU(a.manutentor_id))}</b><small>Atendimento ${a.ciclo}</small>${a.resultado ? `<span class="tag ${RES[a.resultado][0]}">${RES[a.resultado][1]}</span>` : a.finalizada_em ? `<span class="tag">Aguardando técnico</span>` : `<span class="tag">Em curso</span>`}</div>
    <small>Direcionada ${fmtDH(a.direcionada_em)}${a.iniciada_em ? ` · início ${fmtDH(a.iniciada_em)}` : ""}${a.finalizada_em ? ` · término ${fmtDH(a.finalizada_em)}` : ""}</small>
    ${(() => { const pz = pausas.filter((p) => p.atendimento_id === a.id); if (!pz.length) return "";
      const tot = pz.reduce((s2, p) => s2 + ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4, 0);
      const bruto = a.finalizada_em ? (new Date(a.finalizada_em) - new Date(a.iniciada_em)) / 6e4 : null;
      return `<div class="kv"><b>Pausas (${pz.length}) · ${fmtMin(tot)} parado${bruto != null ? ` · execução líquida ${fmtMin(bruto - tot)}` : ""}</b>
        <ul class="mats">${pz.map((p) => `<li><span>${ic(MOTIVOS[p.motivo].i)} ${MOTIVOS[p.motivo].rot}${p.detalhe ? `<small class="muted">${esc(p.detalhe)}</small>` : ""}</span><b>${p.fim ? fmtMin((new Date(p.fim) - new Date(p.inicio)) / 6e4) : "em pausa"}</b></li>`).join("")}</ul></div>`; })()}
    ${a.motivo_recusa ? `<div class="kv"><b>Motivo da recusa</b><p>${esc(a.motivo_recusa)}</p></div>` : ""}
    ${a.servico_realizado ? `<div class="kv"><b>O que foi feito</b><p>${esc(a.servico_realizado)}</p></div>` : ""}
    ${a.finalizada_em ? `<div class="kv"><b>Material do estoque do carro</b>${a.materiais_carro?.length ? `<ul class="mats">${a.materiais_carro.map((m) => `<li><span>${esc(m.material)}<small class="muted mono">${esc(m.codigo)}${m.controle ? ` · ${esc(m.controle)}` : ""}</small></span><b>${m.quantidade} ${esc(m.unidade)}</b></li>`).join("")}</ul>` : `<p class="muted">Não usou</p>`}</div>` : ""}
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
      <div><b>${fmtMin(lead.min_execucao)}</b><small>Execução líquida${lead.min_pausas ? ` · ${fmtMin(lead.min_pausas)} em pausa` : ""}</small></div><div><b>${fmtMin(lead.min_lead_total)}</b><small>Lead total</small></div></div></div>` : ""}
  </div>`;
}

/* ---------------- ações ---------------- */
async function executar(acao, id, btn) {
  const { data: o, error } = await sb.from("ordens_servico").select("*").eq("id", id).single();
  if (error) return toast(errMsg(error), true);
  const resumo = [["OS", `<span class="mono">${osId(o.id)}</span>`], ["Serviço", esc(o.descricao)], ["Onde", `${esc(nomeN(o.nucleo_id))} · ${local(o.galpoes)}`]];
  const fim = (titulo, texto, linhas) => { fecharPagina(); recarregar(); sucesso({ titulo, texto, linhas,
    primario: { rot: "Concluir", fn: () => {} }, secundario: { rot: "Ver a OS", fn: () => abrirOS(o.id) } }); };
  if (acao === "iniciar") return busy(btn, async () => { const r = await rpc("iniciar_atendimento", { p_os: id });
    toast(r?.pausou ? `Atendimento iniciado. ${osId(r.pausou)} foi pausada automaticamente.` : "Atendimento iniciado. Bom trabalho!"); recarregar(); if (isMob()) abrirOS(id); });
  if (acao === "retomar") return busy(btn, async () => { const r = await rpc("retomar_atendimento", { p_os: id });
    toast(`Atendimento retomado após ${fmtMin(r.minutos)} de pausa.${r.pausou ? ` ${osId(r.pausou)} foi pausada.` : ""}`); recarregar(); if (isMob()) abrirOS(id); });
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
      <div id="mats" hidden></div><button type="button" class="btn btn-sm" id="addM" hidden>${ic("plus")}Adicionar produto</button>
      <p class="err" id="erroF"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okF">${ic("flag")}Finalizar</button>`,
    aoAbrir: (el, fechar) => {
      let usou = null;
      $("#usou", el).onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; usou = b.dataset.v;
        $$("#usou button", el).forEach((x) => x.setAttribute("aria-pressed", x === b));
        $("#mats", el).hidden = $("#addM", el).hidden = usou !== "sim";
        if (usou === "sim" && !$("#mats", el).children.length) $("#mats", el).insertAdjacentHTML("beforeend", linha()); };
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
        busy(e.currentTarget, async () => { await rpc("finalizar_atendimento", { p_os: o.id, p_servico: serv, p_materiais: mats }); fechar();
          fim(`Atendimento de ${osId(o.id)} finalizado`, "Enviada para o técnico confirmar se foi resolvido.", [["O que foi feito", esc(serv)], ["Material do carro", mats.length ? `${mats.length} produto(s)` : "Não usou"]]); });
      };
    },
  });
}
function folhaPausa(o) {
  folha({
    titulo: "Pausar atendimento", sub: `${osId(o.id)} · o tempo da pausa não conta como execução`,
    corpo: `<div class="people" id="motivos">${Object.entries(MOTIVOS).filter(([k]) => k !== "OUTRA_OS").map(([k, m]) =>
        `<button type="button" class="person" data-m="${k}" aria-checked="false"><span class="avatar" style="background:var(--surface-2);color:var(--ink-2)">${ic(m.i)}</span><span><b>${m.rot}</b>${m.lim ? `<small>alerta se passar de ${fmtMin(m.lim)}</small>` : ""}</span></button>`).join("")}</div>
      <label class="field" style="margin-top:12px"><span>Detalhe <em id="detOpc">(opcional)</em></span><input class="input" id="pDet" maxlength="120" placeholder="Ex.: disjuntor 3x40A pedido ao almoxarifado"></label>
      <p class="muted" style="font-size:12.5px">Para atender outra OS, não precisa pausar: ao iniciar a outra, esta é pausada automaticamente.</p><p class="err" id="erroP"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okP">${ic("pause")}Pausar</button>`,
    aoAbrir: (el, fechar) => {
      marcar($("#motivos", el), ".person");
      $("#motivos", el).addEventListener("click", () => { const m = $(".person[aria-checked=true]", el)?.dataset.m; $("#detOpc", el).textContent = m === "OUTRO" ? "(obrigatório)" : "(opcional)"; });
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
function novaOS() {
  const D = { nuc: null, toda: false, av: new Set(), eq: "", desc: "" };
  let passo = 1;
  const f = folha({ titulo: "Nova ordem de serviço", sub: "Leva menos de um minuto", tam: "lg full", corpo: "", rodape: `<button class="btn" id="wVolta">Cancelar</button><button class="btn btn-primary" id="wSegue">Continuar</button>` });
  const el = f.el, corpo = $(".sheet-b", el);
  $(".sheet-h", el).insertAdjacentHTML("afterend", `<div class="wiz-prog" id="prog"></div>`);
  function render() {
    $("#prog", el).innerHTML = ["Onde", "O quê", "Revisar"].map((r, i) => `<div class="${i < passo ? "on" : ""}"><i></i>${i + 1}. ${r}</div>`).join("");
    $("#wVolta", el).textContent = passo === 1 ? "Cancelar" : "Voltar";
    $("#wSegue", el).innerHTML = passo === 3 ? `${ic("send")}Abrir OS` : "Continuar";
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
        <label class="field"><span>O que precisa ser feito</span><textarea class="input" id="desc" maxlength="2000" placeholder="Ex.: comedouro da linha 2 não desce ração no fundo do aviário. Se for urgente, explique o motivo.">${esc(D.desc)}</textarea></label>
        <p class="err" id="erroW"></p>`;
      $("#eqs", el).onclick = (e) => { const b = e.target.closest("[data-e]"); if (!b) return; D.eq = b.dataset.e; $("#eqOutro", el).value = "";
        $$("#eqs .equip", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); $("#desc", el).focus(); };
      $("#eqOutro", el).oninput = (e) => { D.eq = e.target.value; $$("#eqs .equip", el).forEach((x) => x.setAttribute("aria-pressed", "false")); };
      $("#desc", el).oninput = (e) => (D.desc = e.target.value);
    } else {
      corpo.innerHTML = `<p class="muted" style="margin-bottom:12px">Confira antes de enviar. O gestor de manutenção vai classificar e direcionar.</p>
        <dl class="review"><div><dt>Granja</dt><dd>${esc(nomeN(D.nuc))}</dd></div><div><dt>Local</dt><dd>${D.toda ? "Toda a granja" : local([...D.av])}</dd></div>
        <div><dt>Equipamento</dt><dd>${esc(D.eq)}</dd></div><div><dt>O que precisa</dt><dd>${esc(D.desc)}</dd></div></dl>
        <p style="margin-top:10px"><button class="linkish" id="editar">Corrigir alguma coisa</button></p><p class="err" id="erroW"></p>`;
      $("#editar", el).onclick = () => { passo = 1; render(); };
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
      const id = await rpc("abrir_os", { p_nucleo_id: D.nuc, p_galpoes: D.toda ? [] : [...D.av], p_equipamento: D.eq.trim(), p_descricao: D.desc.trim() });
      f.fechar(); recarregar();
      sucesso({ titulo: `${osId(id)} aberta com sucesso`, texto: "O gestor de manutenção vai classificar e direcionar. Você acompanha tudo em Minhas OS.",
        linhas: [["Granja", esc(nomeN(D.nuc))], ["Local", D.toda ? "Toda a granja" : local([...D.av])], ["Equipamento", esc(D.eq)]],
        primario: { rot: "Abrir outra OS", fn: novaOS }, secundario: { rot: "Ver a OS", fn: () => abrirOS(id) } });
    });
  };
  render();
}
/* ---------------- Painel ---------------- */
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
  $("#pPer").onchange = $("#pNuc").onchange = carregarPainel;
  carregarPainel();
}
async function carregarPainel() {
  const tok = S.tok, dias = +$("#pPer").value, nuc = $("#pNuc").value ? +$("#pNuc").value : null;
  const ini0 = new Date(`${hojeISO(-dias + 1)}T00:00:00-03:00`), fim0 = new Date(Date.now() + 864e5);
  let qL = sb.from("vw_os_lead").select("*").gte("aberta_em", ini0.toISOString()).lt("aberta_em", fim0.toISOString()).range(0, 4999);
  let qA = sb.from("ordens_servico").select("id,status,aberta_em,nucleo_id,manutentor_id,prioridade,pausada_em,pausa_motivo").in("status", ABERTOS).range(0, 4999);
  const qP = sb.from("os_pausas").select("*").gte("inicio", ini0.toISOString()).range(0, 9999);
  const qT = sb.from("os_atendimentos").select("*, ordens_servico(nucleo_id,prioridade)").gte("direcionada_em", ini0.toISOString()).range(0, 9999);
  if (nuc) { qL = qL.eq("nucleo_id", nuc); qA = qA.eq("nucleo_id", nuc); }
  const [rL, rA, rT, rP] = await Promise.all([qL, qA, qT, qP]);
  if (tok !== S.tok) return;
  const L = rL.data, A = rA.data, T = rT.data.filter((a) => !nuc || a.ordens_servico?.nucleo_id === nuc);
  const idsT = new Set(T.map((a) => a.id)), PZ = rP.data.filter((p) => idsT.has(p.atendimento_id));
  const durP = (p) => ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4;
  const pausaAt = (atId) => PZ.filter((p) => p.atendimento_id === atId && p.fim).reduce((s2, p) => s2 + durP(p), 0);
  const concl = L.filter((r) => r.status === "CONCLUÍDA"), volt = L.filter((r) => r.recusas > 0 || r.nao_resolvidos > 0);
  const h = (o) => (Date.now() - new Date(o.aberta_em)) / 36e5, emerg = A.filter((o) => o.prioridade === "EMERGENCIA").length, velhas = A.filter((o) => h(o) > 168).length;
  const kpi = (v, l, s, hot) => `<div class="kpi${hot ? " hot" : ""}"><small>${l}</small><b>${v}</b><span>${s}</span></div>`;
  $("#kpis").innerHTML = kpi(L.length, "OS abertas", "no período") + kpi(concl.length, "Concluídas", `${pct(concl.length, L.length)}% das abertas`)
    + kpi(fmtMin(mediana(concl.map((r) => r.min_lead_total))), "Lead típico", "mediana, abertura → confirmação")
    + kpi(fmtMin(mediana(L.map((r) => r.min_ate_inicio))), "Até começar", "mediana, abertura → início")
    + kpi(`${pct(volt.length, L.length)}%`, "Voltaram ao gestor", `${volt.length} recusadas ou não resolvidas`)
    + kpi(A.length, "Em aberto agora", [emerg ? `${emerg} emergência(s)` : "", velhas ? `${velhas} há +7 dias` : ""].filter(Boolean).join(" · ") || "sem emergência", emerg > 0 || velhas > 0);

  // geral
  const st = ABERTOS.map((k) => ({ l: STATUS[k].rot, v: A.filter((o) => o.status === k).length, c: STATUS[k].c }));
  st.splice(3, 0, { l: "↳ pausadas agora", v: A.filter((o) => o.pausada_em).length, c: "#9EA2A8" });
  $("#gSit").innerHTML = barras(st, Math.max(1, ...st.map((x) => x.v)));
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
  $("#gSerie").innerHTML = `<div class="series">${ab.map((a, i) => `<div><div class="pair"><i style="height:${(a / mb) * 100}%;background:#C4C7CC"><em>${a || ""}</em></i><i style="height:${(co[i] / mb) * 100}%;background:var(--s-concluida)"><em>${co[i] || ""}</em></i></div><span>${i % Math.ceil(n / 8) === 0 ? rot(i) : ""}</span></div>`).join("")}</div>
    <div class="legend" style="grid-template-columns:repeat(2,max-content);gap:18px"><div style="grid-template-columns:10px auto"><i style="background:#C4C7CC"></i><span>Abertas</span></div><div style="grid-template-columns:10px auto"><i style="background:var(--s-concluida)"></i><span>Concluídas</span></div></div>`;

  // classificação
  const KP = [...Object.keys(PRIO), null], rotP = (k) => (k ? PRIO[k].rot : "A classificar");
  const fila = KP.map((k) => ({ l: rotP(k), v: A.filter((o) => (o.prioridade ?? null) === k).length, c: PCOR[k] || "#D6D6D1" }));
  $("#gFila").innerHTML = barras(fila, Math.max(1, ...fila.map((x) => x.v)));
  const mix = KP.map((k) => ({ k, v: L.filter((r) => (r.prioridade ?? null) === k).length })).filter((x) => x.v);
  $("#gMix").innerHTML = L.length ? `<div class="stacked">${mix.map((x) => `<i style="flex:${x.v};background:${PCOR[x.k] || "#D6D6D1"}"></i>`).join("")}</div>
    <div class="legend">${mix.map((x) => `<div><i style="background:${PCOR[x.k] || "#D6D6D1"}"></i><span>${rotP(x.k)}</span><b>${x.v} OS</b><em>${pct(x.v, L.length)}%</em></div>`).join("")}</div>` : `<div class="zero">Sem OS no período.</div>`;
  const porP = (campo, base) => Object.keys(PRIO).map((k) => { const g = base.filter((r) => r.prioridade === k); return { l: PRIO[k].rot, c: PCOR[k], m: mediana(g.map((r) => r[campo])), n: g.length }; });
  const cm = porP("min_ate_inicio", L), lp = porP("min_lead_total", concl);
  $("#gComeca").innerHTML = barras(cm.map((x) => ({ l: x.l, v: x.m || 0, txt: fmtMin(x.m), c: x.c, e: `${x.n} OS` })), Math.max(1, ...cm.map((x) => x.m || 0)));
  $("#gLeadP").innerHTML = barras(lp.map((x) => ({ l: x.l, v: x.m || 0, txt: fmtMin(x.m), c: x.c, e: `${x.n} OS` })), Math.max(1, ...lp.map((x) => x.m || 0)));

  // equipe
  const mnts = Object.values(S.usuarios).filter((u) => u.perfis.includes("manutentor")).sort((a, b) => a.nome.localeCompare(b.nome));
  const eq = mnts.map((u) => { const at = T.filter((a) => a.manutentor_id === u.id), fin = at.filter((a) => a.finalizada_em), ex = fin.map((a) => minEntre(a.finalizada_em, a.iniciada_em) - pausaAt(a.id));
    const av = fin.filter((a) => ["CONFIRMADO", "NAO_RESOLVIDO"].includes(a.resultado));
    return { u, rec: at.length, fin: fin.length, horas: ex.reduce((s, x) => s + (x || 0), 0), exec: mediana(ex), resp: mediana(at.map((a) => minEntre(a.iniciada_em, a.direcionada_em))),
      retr: av.length ? pct(av.filter((a) => a.resultado === "NAO_RESOLVIDO").length, av.length) : null, recusas: at.filter((a) => a.resultado === "RECUSADO").length,
      maos: A.filter((o) => o.manutentor_id === u.id && ["DIRECIONADA", "EM ATENDIMENTO"].includes(o.status)).length, longos: ex.filter((x) => x > 720).length,
      mix: Object.keys(PRIO).map((k) => [k, fin.filter((a) => a.ordens_servico?.prioridade === k).length]),
      parado: PZ.filter((p) => p.manutentor_id === u.id).reduce((s2, p) => s2 + durP(p), 0),
      media: media(ex), respMed: media(at.map((a) => minEntre(a.iniciada_em, a.direcionada_em))),
      porMot: Object.keys(MOTIVOS).map((k) => [k, PZ.filter((p) => p.manutentor_id === u.id && p.motivo === k).reduce((s2, p) => s2 + durP(p), 0)]) }; });
  const COR_M = { ALMOCO: "#A1A4A9", PECA: "#D9590B", EXPEDIENTE: "#5B6470", OUTRA_OS: "#7C3AED", OUTRO: "#C9A227" };
  const pm = Object.keys(MOTIVOS).map((k) => { const g = PZ.filter((p) => p.motivo === k); return { k, n: g.length, m: g.reduce((s2, p) => s2 + durP(p), 0) }; });
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
    <td class="n" data-l="OS atendidas">${e.fin}</td><td class="n" data-l="Horas trabalhadas">${fmtHoras(e.horas)}</td><td class="n" data-l="Tempo médio">${fmtMin(e.media)}</td><td class="n" data-l="Resposta média">${fmtMin(e.respMed)}</td>
    <td class="n" data-l="Retrabalho">${e.retr == null ? "—" : e.retr + "%"}</td><td class="n" data-l="Recusas">${e.recusas}</td><td class="n" data-l="Tempo parado">${fmtMin(e.parado)}</td><td class="n" data-l="Em mãos">${e.maos}${e.longos ? ` <span title="Atendimento com mais de 12 h">${ic("alert")}</span>` : ""}</td></tr>`;
  $("#gTeam").innerHTML = `<div class="tbl"><table class="t team-t"><thead><tr><th>Manutentor</th><th class="n">OS atendidas</th><th class="n">Horas trabalhadas</th><th class="n">Tempo médio por OS</th>
    <th class="n">Resposta média</th><th class="n">Retrabalho</th><th class="n">Recusas</th><th class="n">Tempo parado</th><th class="n">Em mãos</th></tr></thead>
    <tbody>${eq.map(linhaT).join("")}</tbody>
    <tfoot><tr><td data-l="">Média da equipe</td><td class="n">${Math.round(eqMed((e) => e.fin) || 0)}</td><td class="n">${fmtHoras(eqMed((e) => e.horas))}</td><td class="n">${fmtMin(eqMed((e) => e.media))}</td>
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
    (mt[k] ??= { c: m.codigo, n: m.material, u: m.unidade, q: 0, os: new Set() }).q += +m.quantidade; mt[k].os.add(r.id); }));
  const lm = Object.values(mt).sort((a, b) => b.os.size - a.os.size);
  $("#gMat").innerHTML = lm.length ? `<div class="tbl"><table class="t"><thead><tr><th>Código</th><th>Produto</th><th class="n">Quantidade</th><th class="n">OS</th></tr></thead>
    <tbody>${lm.map((m) => `<tr><td class="mono">${esc(m.c)}</td><td>${esc(m.n)}</td><td class="n">${m.q.toLocaleString("pt-BR")} ${esc(m.u)}</td><td class="n">${m.os.size}</td></tr>`).join("")}</tbody></table></div>` : `<div class="zero">Nenhum material de carro no período.</div>`;
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
  const pz = Object.keys(MOTIVOS).map((k) => ({ k, m: P.PZ.filter((p) => p.manutentor_id === uid && p.motivo === k).reduce((s2, p) => s2 + P.durP(p), 0) })).filter((x) => x.m > 0);
  const RES = { CONFIRMADO: ["ok", "Resolvido"], NAO_RESOLVIDO: ["bad", "Não resolvido"] };
  folha({
    titulo: `Desempenho · ${esc(u.nome)}`, sub: `Últimos ${P.dias} dias · atendimentos direcionados no período`, tam: "xl full",
    corpo: `<div class="kpis kpis-4">
        ${kpi("OS atendidas", e.fin, `${e.rec} recebidas · ${e.recusas} recusada(s) · ${cmp(e.fin, eqMed((x) => x.fin), false, (v) => Math.round(v))}`)}
        ${kpi("Horas trabalhadas", fmtHoras(e.horas), `líquidas, sem pausas · ${cmp(e.horas, eqMed((x) => x.horas), false, fmtHoras)}`)}
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
function viewUsuarios() {
  const u = Object.values(S.usuarios).sort((a, b) => b.ativo - a.ativo || a.nome.localeCompare(b.nome));
  $("#view").innerHTML = `<div class="content">
    <div class="dash-bar"><span class="muted">${u.filter((x) => x.ativo).length} com acesso · ${u.filter((x) => !x.ativo).length} sem acesso</span><div style="flex:1"></div>
      <button class="btn btn-primary" id="novoU">${ic("plus")}Cadastrar usuário</button></div>
    <div class="tbl" style="background:var(--surface)"><table class="t users"><thead><tr><th>Nome</th><th>Login</th><th>Perfis</th><th>Acesso</th></tr></thead>
    <tbody>${u.map((x) => `<tr data-u="${x.id}" style="${x.ativo ? "" : "opacity:.55"}"><td><span class="who-cell">${av(x.id)}${esc(x.nome)}</span></td><td class="mono">${esc(x.login)}</td>
      <td>${x.perfis.map((p) => `<span class="chip">${PERFIS[p].nome}</span>`).join("")}</td><td><span class="onoff${x.ativo ? "" : " off"}">${x.ativo ? "Liberado" : "Retirado"}</span></td></tr>`).join("")}</tbody></table></div></div>`;
  $("#novoU").onclick = () => folhaUsuario(null);
  $(".users tbody").onclick = (e) => { const tr = e.target.closest("[data-u]"); if (tr) folhaUsuario(S.usuarios[tr.dataset.u]); };
}
function folhaUsuario(u) {
  const novo = !u;
  folha({
    titulo: novo ? "Cadastrar usuário" : esc(u.nome), sub: novo ? "O login é usado para entrar; não precisa de e-mail." : `Login: ${esc(u.login)}`,
    corpo: `<label class="field"><span>Nome completo</span><input class="input" id="uNome" value="${esc(u?.nome ?? "")}"></label>
      ${novo ? `<label class="field"><span>Login</span><input class="input" id="uLogin" autocapitalize="none" placeholder="ex.: joao.silva"></label>
      <label class="field"><span>Senha inicial <em>(mín. 8)</em></span><input class="input" id="uSenha"></label>` : ""}
      <div class="label">Perfis</div><div class="checks">${Object.entries(PERFIS).map(([k, p]) => `<label><input type="checkbox" value="${k}" ${u?.perfis.includes(k) ? "checked" : ""}>${p.nome}<small>${p.faz}</small></label>`).join("")}</div>
      ${novo ? "" : `<div class="label">Acesso</div><div class="checks"><label><input type="checkbox" id="uAtivo" ${u.ativo ? "checked" : ""}>Acesso liberado<small>desmarque para bloquear o login</small></label></div>
      <div class="label">Redefinir senha</div><div style="display:flex;gap:8px"><input class="input" id="uNova" placeholder="Nova senha (mín. 8)"><button class="btn" id="uSenhaBtn">Redefinir</button></div>`}
      <p class="err" id="erroU"></p>`,
    rodape: `<button class="btn" data-fechar>Cancelar</button><button class="btn btn-primary" id="okU">${novo ? "Cadastrar" : "Salvar"}</button>`,
    aoAbrir: (el, fechar) => {
      const inv = async (body) => { const { data, error } = await sb.functions.invoke("admin-usuarios", { body }); if (error) { let m = error.message; try { m = (await error.context.json()).erro || m; } catch {} throw new Error(m); } return data; };
      const recarregaU = async () => { const { data } = await sb.from("usuarios").select("*").order("nome"); S.usuarios = Object.fromEntries(data.map((x) => [x.id, x])); };
      $("#uSenhaBtn", el)?.addEventListener("click", (e) => { const s = $("#uNova", el).value; if (s.length < 8) return ($("#erroU", el).textContent = "A senha precisa de 8 caracteres.");
        busy(e.currentTarget, async () => { await inv({ acao: "senha", id: u.id, senha: s }); $("#uNova", el).value = ""; toast("Senha redefinida."); }); });
      $("#okU", el).onclick = (e) => {
        const perfis = $$(".checks input[value]:checked", el).map((c) => c.value), nome = $("#uNome", el).value.trim();
        if (!nome) return ($("#erroU", el).textContent = "Informe o nome.");
        if (!perfis.length) return ($("#erroU", el).textContent = "Marque pelo menos um perfil.");
        busy(e.currentTarget, async () => {
          if (novo) await inv({ acao: "criar", nome, login: $("#uLogin", el).value, senha: $("#uSenha", el).value, perfis });
          else await inv({ acao: "atualizar", id: u.id, nome, perfis, ativo: $("#uAtivo", el).checked });
          await recarregaU(); fechar(); toast(novo ? "Usuário cadastrado." : "Alterações salvas."); viewUsuarios();
        });
      };
    },
  });
}

/* ---------------- início ---------------- */
sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") telaLogin(); });
iniciar().catch((e) => telaLogin(errMsg(e)));
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
        <label class="field"><span>Classificação</span><select class="input" id="rPrio"><option value="">Todas</option>${Object.entries(PRIO).map(([k, v]) => `<option value="${k}">${v.rot}</option>`).join("")}</select></label>
      </div>
      <div class="rel-acoes"><span class="muted" id="rInfo"></span><div class="grow"></div>
        <button class="btn" id="bXls">${ic("sheet")}Exportar Excel</button><button class="btn btn-primary" id="bPdf">${ic("download")}Exportar PDF</button></div>
    </section>
    <div id="relOut"><div class="stack"><div class="skel"></div><div class="skel"></div></div></div></div>`;
  $("#rPer").onchange = () => { const x = $("#rPer").value === "x"; $("#rDeL").hidden = $("#rAteL").hidden = !x; gerarRelatorio(); };
  ["rDe", "rAte", "rMnt", "rNuc", "rPrio"].forEach((i) => ($("#" + i).onchange = gerarRelatorio));
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
  let qL = sb.from("vw_os_lead").select("*").gte("aberta_em", ini0.toISOString()).lt("aberta_em", fim0.toISOString()).range(0, 9999);
  if (nuc) qL = qL.eq("nucleo_id", nuc); if (prio) qL = qL.eq("prioridade", prio);
  const [rL, rT, rP, rO] = await Promise.all([qL,
    sb.from("os_atendimentos").select("*, ordens_servico(nucleo_id,prioridade,equipamento,descricao,galpoes)").gte("direcionada_em", antes).range(0, 19999),
    sb.from("os_pausas").select("*").gte("inicio", antes).range(0, 19999),
    sb.from("ordens_servico").select("id,descricao,equipamento,galpoes,status,pausada_em,pausa_motivo").gte("aberta_em", ini0.toISOString()).lt("aberta_em", fim0.toISOString()).range(0, 9999)]);
  if (tok !== S.tok) return;
  const err = rL.error || rT.error || rP.error; if (err) return toast(errMsg(err), true);
  const osInfo = Object.fromEntries(rO.data.map((o) => [o.id, o]));
  let L = rL.data, T = rT.data.filter((a) => (!nuc || a.ordens_servico?.nucleo_id === nuc) && (!prio || a.ordens_servico?.prioridade === prio));
  if (mnt) { const osDoMnt = new Set(T.filter((a) => a.manutentor_id === mnt).map((a) => a.os_id)); L = L.filter((r) => r.manutentor_id === mnt || osDoMnt.has(r.id)); T = T.filter((a) => a.manutentor_id === mnt); }
  const pausaAt = (id) => rP.data.filter((p) => p.atendimento_id === id && p.fim).reduce((s2, p) => s2 + (new Date(p.fim) - new Date(p.inicio)) / 6e4, 0);
  const liq = (a) => minEntre(a.finalizada_em, a.iniciada_em) - pausaAt(a.id);
  const finT = T.filter((a) => dentro(a.finalizada_em)), iniT = T.filter((a) => dentro(a.iniciada_em));
  const devol = T.filter((a) => dentro(a.avaliado_em) && ["RECUSADO", "NAO_RESOLVIDO"].includes(a.resultado));
  const idsT = new Set(T.map((a) => a.id)), pz = rP.data.filter((p) => idsT.has(p.atendimento_id) && dentro(p.inicio));
  const parado = pz.reduce((s2, p) => s2 + ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4, 0);
  const concl = L.filter((r) => r.status === "CONCLUÍDA"), pend = L.filter((r) => r.status !== "CONCLUÍDA");
  const semInicio = pend.filter((r) => ["ABERTA", "DIRECIONADA", "PENDENTE DE ATENDIMENTO"].includes(r.status));
  const R = {
    rotPer, ini0, fim0, filtros: [["Período", `${rotPer} (${dataBR(ini0)} a ${dataBR(new Date(fim0 - 1))})`], ["Manutentor", mnt ? nomeU(mnt) : "Todos"], ["Granja", nuc ? nomeN(nuc) : "Todas"], ["Classificação", prio ? PRIO[prio].rot : "Todas"]],
    k: { abertas: L.length, concl: concl.length, pct: pct(concl.length, L.length), pend: pend.length, semInicio: semInicio.length, andamento: pend.length - semInicio.length,
      devol: devol.length, recusas: devol.filter((a) => a.resultado === "RECUSADO").length, naoRes: devol.filter((a) => a.resultado === "NAO_RESOLVIDO").length,
      horas: finT.reduce((s2, a) => s2 + liq(a), 0), atendidas: finT.length, medio: media(finT.map(liq)), resposta: media(iniT.map((a) => minEntre(a.iniciada_em, a.direcionada_em))),
      lead: media(concl.map((r) => r.min_lead_total)), parado },
  };
  const mntsR = Object.values(S.usuarios).filter((u) => u.perfis.includes("manutentor") && (!mnt || u.id === mnt)).sort((a, b) => a.nome.localeCompare(b.nome));
  R.porMnt = mntsR.map((u) => { const f = finT.filter((a) => a.manutentor_id === u.id), dv = devol.filter((a) => a.manutentor_id === u.id), ii = iniT.filter((a) => a.manutentor_id === u.id);
    const pp = pz.filter((p) => p.manutentor_id === u.id).reduce((s2, p) => s2 + ((p.fim ? new Date(p.fim) : new Date()) - new Date(p.inicio)) / 6e4, 0);
    return [u.nome, f.length, f.reduce((s2, a) => s2 + liq(a), 0), media(f.map(liq)), media(ii.map((a) => minEntre(a.iniciada_em, a.direcionada_em))), dv.filter((a) => a.resultado === "RECUSADO").length, dv.filter((a) => a.resultado === "NAO_RESOLVIDO").length, pp]; });
  const gIds = [...new Set(L.map((r) => r.nucleo_id))].sort((a, b) => nomeN(a).localeCompare(nomeN(b)));
  R.porGranja = gIds.map((g) => { const l = L.filter((r) => r.nucleo_id === g), c = l.filter((r) => r.status === "CONCLUÍDA").length, f = finT.filter((a) => a.ordens_servico?.nucleo_id === g);
    return [nomeN(g), l.length, c, pct(c, l.length), l.length - c, media(f.map(liq))]; });
  R.porPrio = [...Object.keys(PRIO), null].map((k) => { const l = L.filter((r) => (r.prioridade ?? null) === k), c = l.filter((r) => r.status === "CONCLUÍDA");
    return [k ? PRIO[k].rot : "A classificar", l.length, c.length, pct(c.length, l.length), media(l.map((r) => r.min_ate_inicio)), media(c.map((r) => r.min_lead_total)), k]; }).filter((x) => x[1]);
  R.pendentes = pend.sort((a, b) => new Date(a.aberta_em) - new Date(b.aberta_em)).map((r) => { const o = osInfo[r.id] || {};
    return [osId(r.id), fmtDH(r.aberta_em), `${nomeN(r.nucleo_id)} · ${localCurto(r.galpoes)}`, o.equipamento || "—", o.descricao || "", r.prioridade ? PRIO[r.prioridade].rot : "A classificar",
      o.pausada_em ? "Pausada" : STATUS[r.status].rot, r.manutentor_id ? nomeU(r.manutentor_id) : "—", idade(r.aberta_em)]; });
  R.pendKeys = pend.map((r) => ({ id: r.id, prio: r.prioridade, status: r.status, pausa: osInfo[r.id]?.pausada_em }));
  R.devolucoes = devol.sort((a, b) => new Date(b.avaliado_em) - new Date(a.avaliado_em)).map((a) => [osId(a.os_id), fmtDH(a.avaliado_em), a.resultado === "RECUSADO" ? "Recusada pelo manutentor" : "Técnico: não resolvido",
    nomeU(a.manutentor_id), a.ordens_servico?.descricao || "", a.motivo_recusa || "—"]);
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
        ${met("Devolvidas", k.devol, `${k.recusas} recusadas · ${k.naoRes} não resolvidas`, k.devol > 0)}</div></section>
      <section class="rel-painel"><h4>${ic("clock")}Tempo e horas</h4><div class="rel-met">
        ${met("Horas trabalhadas", fmtHoras(k.horas), `${k.atendidas} atendimentos finalizados`)}
        ${met("Tempo médio de atendimento", fmtMin(k.medio), "execução líquida por OS")}
        ${met("Resposta média", fmtMin(k.resposta), "do direcionamento ao início")}
        ${met("Lead médio", fmtMin(k.lead), "da abertura à confirmação")}</div></section>
    </div>
    ${tabela("Por manutentor", "atendimentos finalizados no período", [["Manutentor"], ["OS atendidas", "n"], ["Horas", "n"], ["Tempo médio", "n"], ["Resposta média", "n"], ["Recusas", "n"], ["Não resolvidas", "n"], ["Tempo parado", "n"]],
      R.porMnt.map((l) => [`<b>${esc(l[0])}</b>`, l[1], fmtHoras(l[2]), fmtMin(l[3]), fmtMin(l[4]), l[5] || "—", l[6] || "—", fmtMin(l[7])]),
      R.porMnt.length > 1 ? ["Equipe", soma(R.porMnt, 1), fmtHoras(soma(R.porMnt, 2)), fmtMin(k.medio), fmtMin(k.resposta), soma(R.porMnt, 5), soma(R.porMnt, 6), fmtMin(soma(R.porMnt, 7))] : null)}
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

async function logoDataURL() {
  if (C.LOGO.startsWith("data:")) return C.LOGO;
  const b = await (await fetch(C.LOGO)).blob();
  return new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); });
}
const nomeArq = (ext) => `relatorio-manutencao_${S.rel.ini0.toLocaleDateString("sv-SE", { timeZone: TZ })}_${new Date(S.rel.fim0 - 1).toLocaleDateString("sv-SE", { timeZone: TZ })}.${ext}`;

async function exportarPDF() {
  if (!S.rel) return;
  await carregarScript("jspdf.umd.min.js", () => window.jspdf);
  await carregarScript("jspdf.plugin.autotable.min.js", () => window.jspdf?.jsPDF?.API?.autoTable);
  const R = S.rel, k = R.k, { jsPDF } = window.jspdf, doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const W = 210, M = 14, VERM = [215, 31, 43], TINTA = [18, 20, 23], CINZA = [106, 110, 117];
  const logo = await logoDataURL();
  // cabeçalho
  doc.setFillColor(...TINTA); doc.rect(0, 0, W, 30, "F");
  doc.setFillColor(...VERM); doc.rect(0, 30, W, 1.2, "F");
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
    ["Devolvidas", String(k.devol), `${k.recusas} rec. · ${k.naoRes} não res.`], ["Horas trabalhadas", fmtHoras(k.horas), `${k.atendidas} atendimentos`], ["Tempo médio", fmtMin(k.medio), "por atendimento"],
    ["Resposta média", fmtMin(k.resposta), "do direcionamento ao início"], ["Lead médio", fmtMin(k.lead), "da abertura à confirmação"]];
  y += 5; const bw = (W - 2 * M - 9) / 4, bh = 19;
  kp.forEach(([l, v, s2], i) => { const x = M + (i % 4) * (bw + 3), yy = y + Math.floor(i / 4) * (bh + 3);
    doc.setDrawColor(226, 226, 222); doc.setFillColor(250, 250, 249); doc.roundedRect(x, yy, bw, bh, 2, 2, "FD");
    doc.setFontSize(7.5); doc.setTextColor(...CINZA); doc.text(l, x + 3, yy + 5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...((l === "Não atendidas" && k.semInicio) || (l === "Devolvidas" && k.devol) ? VERM : TINTA)); doc.text(v, x + 3, yy + 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(...CINZA); doc.text(s2, x + 3, yy + 16.5); });
  y += 2 * bh + 10;
  const secao = (tit, head, body, cols = {}) => {
    if (y > 260) { doc.addPage(); y = 18; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...TINTA); doc.text(tit, M, y);
    doc.autoTable({ startY: y + 2.5, head: [head], body: body.length ? body : [[{ content: "Nada no período.", colSpan: head.length, styles: { halign: "center", textColor: CINZA } }]], margin: { left: M, right: M },
      styles: { font: "helvetica", fontSize: 8, cellPadding: 1.8, textColor: TINTA, lineColor: [230, 230, 226], lineWidth: 0.1 },
      headStyles: { fillColor: TINTA, textColor: 255, fontStyle: "bold" }, alternateRowStyles: { fillColor: [247, 247, 245] }, columnStyles: cols });
    y = doc.lastAutoTable.finalY + 9;
  };
  const num = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, { halign: "right" }]));
  secao("Por manutentor", ["Manutentor", "OS atendidas", "Horas", "Tempo médio", "Resposta média", "Recusas", "Não resolvidas", "Tempo parado"],
    R.porMnt.map((l) => [l[0], l[1], fmtHoras(l[2]), fmtMin(l[3]), fmtMin(l[4]), l[5], l[6], fmtMin(l[7])]), num(7));
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
  doc.save(nomeArq("pdf"));
  toast("PDF gerado.");
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
  aba("Por manutentor", [["Manutentor", "OS atendidas", "Horas trabalhadas (h)", "Tempo médio (min)", "Resposta média (min)", "Recusas", "Não resolvidas", "Tempo parado (h)"],
    ...R.porMnt.map((l) => [l[0], l[1], h(l[2]), mi(l[3]), mi(l[4]), l[5], l[6], h(l[7])])], [26, 13, 20, 17, 20, 10, 14, 17]);
  aba("Por granja", [["Granja", "Abertas", "Concluídas", "% finalização", "Não atendidas", "Tempo médio (min)"], ...R.porGranja.map((l) => [l[0], l[1], l[2], l[3] / 100, l[4], mi(l[5])])], [18, 10, 12, 14, 14, 18]);
  aba("Por classificação", [["Classificação", "Abertas", "Concluídas", "% finalização", "Até começar (min)", "Lead médio (min)"], ...R.porPrio.map((l) => [l[0], l[1], l[2], l[3] / 100, mi(l[4]), mi(l[5])])], [16, 10, 12, 14, 18, 17]);
  aba("OS não atendidas", [["OS", "Aberta em", "Onde", "Equipamento", "Serviço", "Classificação", "Situação", "Manutentor", "Há"], ...R.pendentes], [10, 16, 26, 24, 40, 14, 22, 22, 10]);
  aba("Devoluções", [["OS", "Quando", "Tipo", "Manutentor", "Serviço", "Motivo"], ...R.devolucoes], [10, 16, 24, 22, 40, 40]);
  ["Por granja", "Por classificação"].forEach((n) => { const ws = wb.Sheets[n]; for (let r = 2; r <= 40; r++) if (ws["D" + r]) ws["D" + r].z = "0%"; });
  X.writeFile(wb, nomeArq("xlsx"));
  toast("Excel gerado.");
}
