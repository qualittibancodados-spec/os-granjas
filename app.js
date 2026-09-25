/* Sistema de OS de Manutenção de Granjas — aplicação web */
"use strict";

const C = window.CONFIG;
const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
const POR_PAGINA = 30;

const STATUS = {
  "ABERTA":                  { rot: "Aberta",                 cor: "var(--s-aberta)" },
  "DIRECIONADA":             { rot: "Direcionada",            cor: "var(--s-direcionada)" },
  "EM ATENDIMENTO":          { rot: "Em atendimento",         cor: "var(--s-atendimento)" },
  "AGUARDANDO CONFIRMAÇÃO":  { rot: "Aguardando confirmação", cor: "var(--s-aguardando)" },
  "PENDENTE DE ATENDIMENTO": { rot: "Pendente de atendimento", cor: "var(--s-pendente)" },
  "CONCLUÍDA":               { rot: "Concluída",              cor: "var(--s-concluida)" },
};
const PERFIS = {
  tecnico:    { nome: "Técnico Agropecuário",               faz: "abre e confirma OS" },
  gestor:     { nome: "Gestor de Manutenção",               faz: "direciona OS" },
  manutentor: { nome: "Manutentor",                         faz: "executa OS" },
  gerente:    { nome: "Gerente das Granjas / Administrativo", faz: "visão gerencial" },
  admin:      { nome: "Administrador do sistema",           faz: "gerencia acessos" },
};
// Classificação da OS (definições propostas — validar com o gestor de manutenção)
const PRIO = {
  EMERGENCIA: { rot: "Emergência", n: 4, desc: "Risco imediato às aves ou às pessoas: galpão alojado sem água, ventilação ou energia; risco elétrico." },
  ALTA:       { rot: "Alta",       n: 3, desc: "Afeta o lote, mas há contorno provisório. Ex.: um exaustor parado, vazamento em linha de bebedouro." },
  MEDIA:      { rot: "Média",      n: 2, desc: "Atrapalha a rotina, sem efeito direto no lote nos próximos dias." },
  BAIXA:      { rot: "Baixa",      n: 1, desc: "Pode ser programada. Ex.: cerca, pintura, roçada, galpão vazio." },
};
const PCOR = { EMERGENCIA: "#C8102E", ALTA: "#D2560F", MEDIA: "#C9A227", BAIXA: "#A0A4AB" };
const prioTag = (p, sugerida = false) => p ? `<span class="prio p-${p}${sugerida ? " sug" : ""}" title="${sugerida ? "Sugerida pelo técnico" : "Classificação"}">
  <span class="sinal">${[1, 2, 3, 4].map((i) => `<i class="${i <= PRIO[p].n ? "on" : ""}"></i>`).join("")}</span>${PRIO[p].rot}${sugerida ? " (sugerida)" : ""}</span>` : "";
const escolhaPrio = (id, sel = "") => `<div class="escolha-prio" id="${id}" role="radiogroup">${Object.entries(PRIO).map(([k, v]) =>
  `<button type="button" role="radio" data-p="${k}" aria-checked="${k === sel}" class="p-${k}"><span class="sinal">${[1, 2, 3, 4].map((i) => `<i class="${i <= v.n ? "on" : ""}"></i>`).join("")}</span>
   <b>${v.rot}</b><small>${v.desc}</small></button>`).join("")}</div>`;
function ligarEscolha(el, aoMudar) {
  el.onclick = (e) => { const b = e.target.closest("[data-p]"); if (!b) return;
    for (const x of el.children) x.setAttribute("aria-checked", x === b); aoMudar?.(b.dataset.p); };
  return () => el.querySelector("[aria-checked=true]")?.dataset.p ?? null;
}

const ABAS = [
  { id: "nova",      rot: "Nova OS",      ic: "mais",     perfil: "tecnico" },
  { id: "minhas",    rot: "Minhas OS",    ic: "lista",    perfil: "tecnico" },
  { id: "gestao",    rot: "Ordens",       ic: "prancheta", perfil: ["gestor", "admin"] },
  { id: "atend",     rot: "Atendimentos", ic: "chave",    perfil: "manutentor" },
  { id: "gerencial", rot: "Painel",       ic: "grafico",  perfil: ["gerente", "gestor", "admin"] },
  { id: "usuarios",  rot: "Usuários",     ic: "pessoas",  perfil: "admin" },
];

const IC = {
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>',
  relogio: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  pessoa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  chave: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  mais: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>',
  lista: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h.01M3 18h.01M3 6h.01M8 12h13M8 18h13M8 6h13"/></svg>',
  prancheta: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/></svg>',
  grafico: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3"/></svg>',
  pessoas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  alerta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01"/></svg>',
  caixa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zM12 22V12"/><path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7M7.5 4.27l9 5.15"/></svg>',
  ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  certo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  lupa: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  atualizar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/></svg>',
  vazio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  etiqueta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></svg>',
  predio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"/></svg>',
  enviar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.94l7.93 3.18a2 2 0 0 1 1.11 1.11zM21.85 2.15 10.91 13.09"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  sair: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
};
function saudacao() {
  const agora = new Date(), tz = "America/Sao_Paulo";
  const h = Number(new Intl.DateTimeFormat("pt-BR", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(agora));
  const dia = new Intl.DateTimeFormat("pt-BR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(agora);
  return `${h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"}, ${esc((S.eu?.nome || "").split(" ")[0])} · ${dia}`;
}
const topo = (titulo, sub, extra = "") => `<div class="pagina-topo"><div><p class="saudacao">${saudacao()}</p><h1>${titulo}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${extra}</div>`;
const iniciais = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

const S = { tok: 0, eu: null, nucleos: [], nucleoPorId: {}, usuarios: {}, aba: null, recarregar: null };

/* ---------- utilidades ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tem = (p) => S.eu?.perfis.includes(p);
const fmtDH = (ts) => ts ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(ts)) : "—";
function fmtMin(m) {
  if (m === null || m === undefined || isNaN(m)) return "—";
  m = Math.max(0, Math.round(Number(m)));
  if (m < 60) return `${m} min`;
  if (m < 1440) return `${Math.floor(m / 60)} h ${m % 60} min`;
  return `${Math.floor(m / 1440)} d ${Math.floor((m % 1440) / 60)} h`;
}
const desde = (ts) => fmtMin((Date.now() - new Date(ts)) / 60000);
const nomeUsuario = (id) => id ? esc(S.usuarios[id]?.nome ?? "—") : "—";
const nomeNucleo = (id) => esc(S.nucleoPorId[id]?.nome ?? "—");
// Local: lista de aviários (vazia = toda a granja)
const local = (lst) => { const v = Array.isArray(lst) ? [...lst].sort((a, b) => a - b) : lst == null ? [] : [lst];
  return !v.length ? "Toda a granja" : v.length === 1 ? `Aviário ${v[0]}` : `Aviários ${v.join(", ")}`; };
const hojeISO = (dias = 0) => { const d = new Date(Date.now() + dias * 864e5); return d.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" }); };

function aviso(msg, ruim = false) {
  const a = $("#aviso"); a.innerHTML = `${ruim ? IC.alerta : IC.ok}<span>${esc(msg)}</span>`; a.className = "on" + (ruim ? " ruim" : "");
  clearTimeout(aviso.t); aviso.t = setTimeout(() => (a.className = ""), ruim ? 5000 : 3000);
}
function msgErro(e) {
  const m = e?.message || String(e);
  if (/Failed to fetch|NetworkError/i.test(m)) return "Sem conexão com o servidor. Verifique a internet e tente de novo.";
  if (/JWT|expired/i.test(m)) return "Sua sessão expirou. Entre novamente.";
  return m;
}
async function comBotao(btn, fn) {
  btn.disabled = true;
  try { await fn(); } catch (e) { aviso(msgErro(e), true); } finally { btn.disabled = false; }
}
async function rpc(nome, args) { const { data, error } = await sb.rpc(nome, args); if (error) throw error; return data; }

/* ---------- confirmação de sucesso ---------- */
function sucesso({ titulo, texto = "", linhas = [], acoes }) {
  const m = $("#modal"), c = $("#modalCorpo");
  m.classList.add("dlg-sucesso");
  c.innerHTML = `<div class="sucesso" role="status">
    <button class="sucesso-x fechar" aria-label="Fechar">${IC.x}</button>
    <div class="sucesso-ic">${IC.certo}</div>
    <h2>${titulo}</h2>${texto ? `<p>${texto}</p>` : ""}
    ${linhas.length ? `<dl class="sucesso-dl">${linhas.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>` : ""}
    <div class="sucesso-acoes">${acoes.map((a, i) => `<button class="btn${a.primario ? " primario" : ""}" data-i="${i}">${a.rot}</button>`).join("")}</div></div>`;
  c.querySelectorAll("[data-i]").forEach((b) => (b.onclick = () => acoes[+b.dataset.i].fn()));
  c.querySelector(".sucesso-x").onclick = fecharModal;
  if (!m.open) m.showModal();
  c.querySelector(".btn.primario")?.focus();
}
const fecharModal = () => $("#modal").close();

/* ---------- login / sessão ---------- */
function aplicarMarca() {
  document.documentElement.style.setProperty("--marca", C.COR_MARCA);
  document.title = C.NOME_SISTEMA;
  $("#nomeSistema").textContent = C.NOME_SISTEMA;
  $("#nomeEmpresa").textContent = C.NOME_EMPRESA;
  $("#tituloLogin").textContent = C.NOME_SISTEMA;
  for (const img of [$("#logo"), $("#logoLogin")]) {
    if (C.LOGO) { img.src = C.LOGO; img.alt = C.NOME_EMPRESA; img.hidden = false; }
  }
}
function mostrarLogin(msg = "") {
  S.eu = null; S.tok++; S.recarregar = null;
  $("#topo").hidden = $("#abas").hidden = true;
  $("#tela").innerHTML = "";
  $("#telaLogin").hidden = false;
  $("#erroLogin").textContent = msg;
}
$("#formLogin").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const f = ev.target, btn = $("button[type=submit]", f);
  const login = f.login.value.trim().toLowerCase();
  $("#erroLogin").textContent = "";
  btn.disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email: `${login}@${C.DOMINIO_LOGIN}`, password: f.senha.value });
  btn.disabled = false;
  if (error) {
    $("#erroLogin").textContent = /banned/i.test(error.message) ? "Seu acesso foi retirado. Procure o administrador."
      : /Invalid login/i.test(error.message) ? "Usuário ou senha incorretos." : msgErro(error);
    return;
  }
  f.senha.value = "";
  await iniciar();
});
$("#verSenha").addEventListener("click", (e) => {
  const i = $("#formLogin").senha, mostrar = i.type === "password";
  i.type = mostrar ? "text" : "password"; e.currentTarget.textContent = mostrar ? "Ocultar" : "Mostrar";
});
$("#btnSair").addEventListener("click", async () => { await sb.auth.signOut(); mostrarLogin(); });

async function iniciar() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return mostrarLogin();
  const { data: eu, error } = await sb.from("usuarios").select("*").eq("id", session.user.id).maybeSingle();
  if (error) return mostrarLogin(msgErro(error));
  if (!eu || !eu.ativo || eu.perfis.length === 0) {
    await sb.auth.signOut();
    return mostrarLogin("Seu usuário não tem acesso liberado. Procure o administrador.");
  }
  S.eu = eu;
  const [nuc, gal, usu] = await Promise.all([
    sb.from("nucleos").select("id,nome").order("nome"),
    sb.from("galpoes").select("numero,nucleo_id").order("numero"),
    sb.from("usuarios").select("id,nome,login,perfis,ativo").order("nome"),
  ]);
  const erro = nuc.error || gal.error || usu.error;
  if (erro) return mostrarLogin(msgErro(erro));
  S.nucleos = nuc.data.map((n) => ({ ...n, galpoes: gal.data.filter((g) => g.nucleo_id === n.id).map((g) => g.numero) }));
  S.nucleoPorId = Object.fromEntries(S.nucleos.map((n) => [n.id, n]));
  S.usuarios = Object.fromEntries(usu.data.map((u) => [u.id, u]));

  $("#telaLogin").hidden = true;
  $("#topo").hidden = $("#abas").hidden = false;
  $("#quemNome").textContent = eu.nome;
  $("#quemPerfil").textContent = eu.perfis.map((p) => PERFIS[p].nome.split(" /")[0]).join(" · ");
  $("#avatar").textContent = iniciais(eu.nome);
  const abas = ABAS.filter((a) => [].concat(a.perfil).some(tem));
  $("#abas").innerHTML = abas.map((a) => `<button data-aba="${a.id}">${IC[a.ic]}<span>${a.rot}</span></button>`).join("");
  $("#abas").hidden = abas.length < 2; // um perfil só: a própria tela já diz onde a pessoa está
  $("#abas").onclick = (e) => { const b = e.target.closest("button"); if (b) { abrirAba(b.dataset.aba); window.scrollTo(0, 0); } };
  abrirAba(abas.find((a) => a.id === S.aba)?.id ?? abas[0].id);
}
function abrirAba(id) {
  S.aba = id; S.tok++;
  for (const b of $("#abas").children) b.setAttribute("aria-current", b.dataset.aba === id);
  ({ nova: telaNovaOS, minhas: telaMinhas, gestao: telaGestao, atend: telaAtendimentos,
     gerencial: telaGerencial, usuarios: telaUsuarios })[id]();
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && S.eu && S.recarregar && !$("#modal").open) S.recarregar(); });

/* ---------- lista de OS (compartilhada) ---------- */
function linhaOS(o, mostrarSolicitante = true) {
  const st = STATUS[o.status];
  const idadeH = (Date.now() - new Date(o.aberta_em)) / 36e5, atrasada = o.status !== "CONCLUÍDA" && idadeH > 72;
  const temMnt = o.manutentor_id && o.status !== "ABERTA";
  const resp = temMnt ? `${IC.chave}${nomeUsuario(o.manutentor_id)}` : mostrarSolicitante ? `${IC.pessoa}${nomeUsuario(o.solicitante_id)}` : `<span class="nada">—</span>`;
  return `<button class="os${o.prioridade === "EMERGENCIA" && o.status !== "CONCLUÍDA" ? " urgente" : ""}" style="--cor:${st.cor};--pcor:${PCOR[o.prioridade] || "transparent"}" data-os="${o.id}">
    <span class="c-num num">${o.id}</span>
    <span class="c-serv"><span class="desc">${esc(o.descricao)}</span><span class="sub-os">${o.equipamento ? `<b>${esc(o.equipamento)}</b> · ` : ""}${nomeNucleo(o.nucleo_id)} · ${local(o.galpoes)}</span></span>
    <span class="c-prio">${prioTag(o.prioridade) || `<span class="nada">—</span>`}</span>
    <span class="c-st"><span class="status pill">${st.rot}</span></span>
    <span class="c-idade${atrasada ? " atraso" : ""}" title="Aberta em ${fmtDH(o.aberta_em)}">${desde(o.aberta_em)}</span>
    <span class="c-resp">${resp}</span>
  </button>`;
}
const CAB_LISTA = `<div class="lista-cab" aria-hidden="true"><span>Nº</span><span>Serviço</span><span>Classificação</span><span>Status</span><span>Aberta há</span><span>Responsável</span></div>`;
// Cartões de resumo no topo das telas (servem também de atalho de filtro)
const resumoTiles = (itens) => `<div class="metricas">${itens.map((t) => `<button type="button" class="metrica${t.alerta ? " alerta" : ""}${t.ativo ? " ativo" : ""}"
  ${t.k !== undefined ? `data-k="${t.k}"` : ""} style="--tc:${t.cor}"><small><i></i>${t.rot}</small><b>${t.n}</b></button>`).join("")}</div>`;
const ABERTOS = ["ABERTA", "DIRECIONADA", "EM ATENDIMENTO", "AGUARDANDO CONFIRMAÇÃO", "PENDENTE DE ATENDIMENTO"];
const CAMPOS_LISTA = "id,status,nucleo_id,galpoes,equipamento,descricao,aberta_em,solicitante_id,manutentor_id,prioridade";

/** Monta uma lista paginada. montarConsulta(q) recebe a query base e aplica filtros. */
function listaPaginada(el, montarConsulta, { mostrarSolicitante = true, vazio = "Nenhuma OS encontrada." } = {}) {
  let pagina = 0; const tok = S.tok;
  el.innerHTML = `<div class="quadro">${CAB_LISTA}<div class="lista"></div></div><button class="btn mais" hidden>Carregar mais</button>`;
  const lista = $(".lista", el), mais = $(".mais", el);
  lista.innerHTML = `<div class="esqueleto"></div>`.repeat(4);
  async function carregar() {
    const de = pagina * POR_PAGINA;
    const q = montarConsulta(sb.from("ordens_servico").select(CAMPOS_LISTA)).order("id", { ascending: false }).range(de, de + POR_PAGINA - 1);
    const { data, error } = await q;
    if (tok !== S.tok) return; // o usuário já mudou de tela
    if (error) { aviso(msgErro(error), true); return; }
    if (pagina === 0) lista.innerHTML = "";
    if (pagina === 0 && !data.length) lista.innerHTML = `<div class="vazio">${IC.vazio}<span>${vazio}</span></div>`;
    else lista.insertAdjacentHTML("beforeend", data.map((o) => linhaOS(o, mostrarSolicitante)).join(""));
    mais.hidden = data.length < POR_PAGINA;
  }
  mais.onclick = () => comBotao(mais, () => { pagina++; return carregar(); });
  lista.onclick = (e) => { const b = e.target.closest("[data-os]"); if (b) abrirDetalhe(+b.dataset.os); };
  return carregar();
}

/* ---------- ETAPA 4: Técnico — Nova OS ---------- */
// Sugestões rápidas de local/equipamento (lista proposta — ajustar com a manutenção)
const EQUIPAMENTOS = ["Linha de ração", "Linha de água / bebedouros", "Comedouros", "Exaustores / ventilação", "Cortinas",
  "Nebulização / resfriamento", "Aquecimento / fornalha", "Elétrica / iluminação", "Silo", "Estrutura / telhado", "Portão / cerca", "Gerador"];

function telaNovaOS() {
  S.recarregar = null;
  $("#tela").innerHTML = `
    ${topo("Nova ordem de serviço", "Informe a granja, os aviários, o equipamento e o que precisa ser feito.")}
    <form class="form-os" id="fNova" novalidate>
      <section class="bloco">
        <h2 class="bloco-tit"><span class="etapa">1</span>Granja</h2>
        <label class="campo-sel">${IC.predio}<select name="nucleo" aria-label="Granja">
          <option value="">Selecione a granja</option>${S.nucleos.map((n) => `<option value="${n.id}">${esc(n.nome)}</option>`).join("")}</select></label>
      </section>
      <section class="bloco" id="blocoLocal" hidden>
        <h2 class="bloco-tit"><span class="etapa">2</span>Aviários<span class="dica" id="dicaAv">toque em um ou mais</span></h2>
        <div class="escolha-local" id="locais"></div>
      </section>
      <section class="bloco">
        <h2 class="bloco-tit"><span class="etapa">3</span>Local ou equipamento</h2>
        <input name="equipamento" maxlength="80" autocomplete="off" placeholder="Ex.: Linha de ração" aria-label="Local ou equipamento">
        <div class="sugestoes" id="sugestoes">${EQUIPAMENTOS.map((e) => `<button type="button">${e}</button>`).join("")}</div>
      </section>
      <section class="bloco">
        <h2 class="bloco-tit"><span class="etapa">4</span>O que precisa ser feito</h2>
        <textarea name="descricao" maxlength="2000" aria-label="O que precisa ser feito"
          placeholder="Ex.: comedouro da linha 2 não desce ração no fundo do aviário. Se for urgente, explique o motivo."></textarea>
        <div class="contador"><span id="cont">0</span>/2000</div>
      </section>
      <div class="barra-envio">
        <div class="resumo-envio"><small>Resumo da OS</small><span id="resumoEnvio">Selecione a granja</span></div>
        <button class="btn primario" type="submit">${IC.enviar}Abrir OS</button>
      </div>
      <p class="erro" id="erroNova" role="alert"></p>
    </form>`;
  const f = $("#fNova");
  let nucleo = null, toda = false, aviarios = new Set();
  const escolhidos = () => (toda ? [] : [...aviarios]);
  const resumo = () => {
    const n = S.nucleoPorId[nucleo];
    const partes = !n ? ["Selecione a granja"] : [n.nome, toda || aviarios.size ? local(escolhidos()) : "escolha os aviários"];
    if (f.equipamento.value.trim()) partes.push(f.equipamento.value.trim());
    $("#resumoEnvio").textContent = partes.join(" · ");
    $("#dicaAv").textContent = toda ? "toda a granja" : aviarios.size ? `${aviarios.size} selecionado${aviarios.size > 1 ? "s" : ""}` : "toque em um ou mais";
    $("#erroNova").textContent = "";
  };
  f.nucleo.onchange = () => {
    nucleo = f.nucleo.value ? +f.nucleo.value : null; toda = false; aviarios = new Set();
    const n = S.nucleoPorId[nucleo];
    $("#blocoLocal").hidden = !n;
    if (n) $("#locais").innerHTML = `<button type="button" class="toda" data-g="" aria-pressed="false">Toda a granja</button>` +
      n.galpoes.map((g) => `<button type="button" data-g="${g}" aria-pressed="false">${g}</button>`).join("");
    resumo();
  };
  $("#locais").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.g === "") { toda = !toda; if (toda) aviarios.clear(); }
    else { toda = false; const g = +b.dataset.g; aviarios.has(g) ? aviarios.delete(g) : aviarios.add(g); }
    for (const x of $("#locais").children) x.setAttribute("aria-pressed", x.dataset.g === "" ? toda : aviarios.has(+x.dataset.g));
    resumo();
  };
  $("#sugestoes").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    f.equipamento.value = b.textContent;
    for (const x of $("#sugestoes").children) x.setAttribute("aria-pressed", x === b);
    resumo(); f.descricao.focus();
  };
  f.equipamento.oninput = () => { for (const x of $("#sugestoes").children) x.setAttribute("aria-pressed", x.textContent === f.equipamento.value); resumo(); };
  f.descricao.oninput = () => { $("#cont").textContent = f.descricao.value.length; $("#erroNova").textContent = ""; };
  f.onsubmit = (ev) => {
    ev.preventDefault();
    const erro = (t) => ($("#erroNova").textContent = t);
    if (!nucleo) return erro("Selecione a granja.");
    if (!toda && !aviarios.size) return erro("Escolha um ou mais aviários, ou \"Toda a granja\".");
    if (f.equipamento.value.trim().length < 3) return erro("Informe o local ou equipamento do serviço.");
    if (f.descricao.value.trim().length < 3) return erro("Descreva o que precisa ser feito.");
    comBotao($("button[type=submit]", f), async () => {
      const dados = { granja: S.nucleoPorId[nucleo].nome, local: local(escolhidos()), eq: f.equipamento.value.trim() };
      const id = await rpc("abrir_os", { p_nucleo_id: nucleo, p_galpoes: escolhidos(), p_equipamento: dados.eq, p_descricao: f.descricao.value });
      telaNovaOS(); window.scrollTo(0, 0);
      sucesso({
        titulo: `OS ${id} aberta com sucesso`,
        texto: "O gestor de manutenção vai classificar e direcionar para um manutentor. Você acompanha tudo em Minhas OS.",
        linhas: [["Granja", esc(dados.granja)], ["Local", dados.local], ["Local / equipamento", esc(dados.eq)]],
        acoes: [{ rot: "Ver minhas OS", fn: () => { fecharModal(); abrirAba("minhas"); } }, { rot: "Abrir outra OS", primario: true, fn: fecharModal }],
      });
    });
  };
}

/* ---------- ETAPA 4 e 7: Técnico — Minhas OS ---------- */
async function telaMinhas() {
  $("#tela").innerHTML = `${topo("Minhas OS", "Acompanhe suas solicitações e confirme os atendimentos.")}
    <div id="resumoT"></div>
    <div id="aConfirmar"></div>
    <div class="chips" id="chips"></div><div id="lista"></div>`;
  const filtros = [
    ["todas", "Todas", null],
    ["andamento", "Em andamento", ["ABERTA", "DIRECIONADA", "EM ATENDIMENTO", "PENDENTE DE ATENDIMENTO"]],
    ["concluidas", "Concluídas", ["CONCLUÍDA"]],
  ];
  let atual = "todas";
  const desenhaChips = () => $("#chips").innerHTML = filtros.map(([k, r]) => `<button class="chip" data-k="${k}" aria-pressed="${k === atual}">${r}</button>`).join("");
  const tok = S.tok;
  const carregar = async () => {
    // OS aguardando a confirmação do técnico ficam sempre no topo
    const { data, error } = await sb.from("ordens_servico").select(CAMPOS_LISTA)
      .eq("solicitante_id", S.eu.id).eq("status", "AGUARDANDO CONFIRMAÇÃO").order("id");
    if (tok !== S.tok) return;
    if (error) return aviso(msgErro(error), true);
    const { data: todas } = await sb.from("ordens_servico").select("status").eq("solicitante_id", S.eu.id).range(0, 4999);
    if (tok !== S.tok) return;
    const nSt = (lst) => (todas || []).filter((o) => lst.includes(o.status)).length;
    $("#resumoT").innerHTML = resumoTiles([
      { k: "andamento", n: nSt(filtros[1][2]), rot: "Em andamento", ic: IC.chave, cor: "var(--s-atendimento)", ativo: atual === "andamento" },
      { n: data.length, rot: "Esperando você confirmar", ic: IC.alerta, cor: "var(--s-aguardando)", alerta: data.length > 0 },
      { k: "concluidas", n: nSt(["CONCLUÍDA"]), rot: "Concluídas", ic: IC.ok, cor: "var(--s-concluida)", ativo: atual === "concluidas" },
    ]);
    const el = $("#aConfirmar");
    el.innerHTML = data.length ? `<div class="destaque"><h2>${IC.alerta}Aguardando sua confirmação <span class="contagem">${data.length}</span></h2>
      <p class="nota">O manutentor finalizou. Confira e confirme se o serviço foi feito.</p>
      <div class="quadro"><div class="lista">${data.map((o) => linhaOS(o, false)).join("")}</div></div></div><h2 class="sec">Todas as minhas OS</h2>` : "";
    el.onclick = (e) => { const b = e.target.closest("[data-os]"); if (b) abrirDetalhe(+b.dataset.os); };
    desenhaChips();
    const st = filtros.find((x) => x[0] === atual)[2];
    await listaPaginada($("#lista"), (q) => { q = q.eq("solicitante_id", S.eu.id); return st ? q.in("status", st) : q; },
      { mostrarSolicitante: false, vazio: "Você ainda não abriu OS. Use a aba Nova OS." });
  };
  $("#chips").onclick = (e) => { const b = e.target.closest(".chip"); if (b) { atual = b.dataset.k; carregar(); } };
  $("#resumoT").onclick = (e) => { const b = e.target.closest(".metrica"); if (!b) return;
    if (b.dataset.k) { atual = atual === b.dataset.k ? "todas" : b.dataset.k; carregar(); } else $("#aConfirmar").scrollIntoView({ behavior: "smooth" }); };
  S.recarregar = carregar;
  await carregar();
}

/* ---------- ETAPA 5: Gestor de Manutenção ---------- */
async function telaGestao() {
  $("#tela").innerHTML = `${topo("Ordens de serviço", "Direcione as OS abertas e acompanhe o andamento.")}
    <div class="barra-filtros">
      <label class="busca">${IC.lupa}<input id="gNum" type="number" min="1" inputmode="numeric" placeholder="Nº da OS" aria-label="Buscar pelo número da OS"></label>
      <select id="gNuc" aria-label="Núcleo"><option value="">Todos os núcleos</option>${S.nucleos.map((n) => `<option value="${n.id}">${esc(n.nome)}</option>`).join("")}</select>
      <button class="btn icone" id="gAtualizar" aria-label="Atualizar" title="Atualizar">${IC.atualizar}</button>
    </div>
    <div id="resumoG"></div>
    <div class="chips" id="chips"></div><div id="lista"></div>`;
  let atual = "DIRECIONAR"; const tok = S.tok;
  const carregar = async () => {
    const nuc = $("#gNuc").value ? +$("#gNuc").value : null;
    const num = +$("#gNum").value || null;
    const cont = await rpc("contagem_status", { p_nucleo: nuc }).catch((e) => (aviso(msgErro(e), true), []));
    if (tok !== S.tok) return;
    const q = Object.fromEntries(cont.map((c) => [c.status, c.qtd]));
    const total = cont.reduce((s, c) => s + Number(c.qtd), 0);
    const limite = new Date(Date.now() - 72 * 36e5).toISOString();
    let qp = sb.from("ordens_servico").select("id").in("status", ABERTOS).lt("aberta_em", limite).range(0, 4999);
    if (nuc) qp = qp.eq("nucleo_id", nuc);
    const { data: paradas } = await qp;
    if (tok !== S.tok) return;
    const n = (k) => Number(q[k] ?? 0);
    $("#resumoG").innerHTML = resumoTiles([
      { k: "DIRECIONAR", n: n("ABERTA") + n("PENDENTE DE ATENDIMENTO"), rot: "A direcionar", ic: IC.prancheta, cor: "var(--s-aberta)", ativo: atual === "DIRECIONAR" },
      { k: "COM_MANUT", n: n("DIRECIONADA") + n("EM ATENDIMENTO"), rot: "Com os manutentores", ic: IC.chave, cor: "var(--s-atendimento)", ativo: atual === "COM_MANUT" },
      { k: "AGUARDANDO CONFIRMAÇÃO", n: n("AGUARDANDO CONFIRMAÇÃO"), rot: "Esperando o técnico", ic: IC.ok, cor: "var(--s-aguardando)", ativo: atual === "AGUARDANDO CONFIRMAÇÃO" },
      { k: "PARADAS", n: (paradas || []).length, rot: "Abertas há +3 dias", ic: IC.relogio, cor: "var(--s-pendente)", alerta: (paradas || []).length > 0, ativo: atual === "PARADAS" },
    ]);
    $("#chips").innerHTML = [["DIRECIONAR", "A direcionar", Number(q["ABERTA"] ?? 0) + Number(q["PENDENTE DE ATENDIMENTO"] ?? 0)],
                             ...Object.keys(STATUS).map((k) => [k, STATUS[k].rot, q[k] ?? 0]), ["", "Todas", total]]
      .map(([k, r, n]) => `<button class="chip" data-k="${k}" aria-pressed="${k === atual}">${r}<b>${n}</b></button>`).join("");
    await listaPaginada($("#lista"), (qq) => {
      if (num) return qq.eq("id", num);
      if (nuc) qq = qq.eq("nucleo_id", nuc);
      if (atual === "DIRECIONAR") return qq.in("status", ["ABERTA", "PENDENTE DE ATENDIMENTO"]);
      if (atual === "COM_MANUT") return qq.in("status", ["DIRECIONADA", "EM ATENDIMENTO"]);
      if (atual === "PARADAS") return qq.in("status", ABERTOS).lt("aberta_em", new Date(Date.now() - 72 * 36e5).toISOString());
      return atual ? qq.eq("status", atual) : qq;
    }, { vazio: atual === "DIRECIONAR" ? "Nenhuma OS esperando direcionamento." : "Nenhuma OS encontrada." });
  };
  $("#chips").onclick = (e) => { const b = e.target.closest(".chip"); if (b) { atual = b.dataset.k; carregar(); } };
  $("#resumoG").onclick = (e) => { const b = e.target.closest(".metrica"); if (b) { atual = b.dataset.k; carregar(); } };
  $("#gNuc").onchange = carregar;
  $("#gNum").oninput = () => { clearTimeout(telaGestao.t); telaGestao.t = setTimeout(carregar, 450); };
  $("#gAtualizar").onclick = (e) => comBotao(e.target, carregar);
  S.recarregar = carregar;
  await carregar();
}

/* ---------- ETAPA 6: Manutentor ---------- */
async function telaAtendimentos() {
  $("#tela").innerHTML = `${topo("Meus atendimentos", "OS direcionadas para você, das mais urgentes para as menos urgentes.")}
    <div id="resumoM"></div><div id="proxima"></div><div class="chips" id="chips"></div><div id="lista"></div>`;
  const tok = S.tok;
  const filtros = [["fazer", "A fazer", ["DIRECIONADA", "EM ATENDIMENTO"]],
                   ["feitos", "Histórico", ["AGUARDANDO CONFIRMAÇÃO", "PENDENTE DE ATENDIMENTO", "CONCLUÍDA"]]];
  let atual = "fazer";
  const carregar = async () => {
    const { data: fila } = await sb.from("ordens_servico").select(CAMPOS_LISTA).eq("manutentor_id", S.eu.id)
      .in("status", ["DIRECIONADA", "EM ATENDIMENTO"]).order("prioridade_ordem", { ascending: false }).order("id").range(0, 999);
    if (tok !== S.tok) return;
    const f = fila || [], andamento = f.filter((o) => o.status === "EM ATENDIMENTO");
    $("#resumoM").innerHTML = resumoTiles([
      { n: f.filter((o) => o.status === "DIRECIONADA").length, rot: "Na fila", ic: IC.lista, cor: "var(--s-direcionada)" },
      { n: andamento.length, rot: "Em atendimento", ic: IC.chave, cor: "var(--s-atendimento)" },
      { n: f.filter((o) => o.prioridade === "EMERGENCIA").length, rot: "Emergências", ic: IC.alerta, cor: "#C8102E", alerta: f.some((o) => o.prioridade === "EMERGENCIA") },
    ]);
    const prox = andamento[0] || f[0];
    $("#proxima").innerHTML = prox && atual === "fazer" ? `<div class="proxima" style="--cor:${STATUS[prox.status].cor}">
      <div class="proxima-rot"><i></i>${prox.status === "EM ATENDIMENTO" ? "Em atendimento — continue de onde parou" : "Próxima da fila"}</div>
      <div class="proxima-topo"><span class="num">OS ${prox.id}</span>${prioTag(prox.prioridade)}</div>
      <div class="proxima-desc">${esc(prox.descricao)}</div>${prox.equipamento ? `<div class="proxima-eq">${IC.etiqueta}${esc(prox.equipamento)}</div>` : ""}
      <div class="proxima-local">${IC.pin}${nomeNucleo(prox.nucleo_id)} · ${local(prox.galpoes)} <span>· aberta há ${desde(prox.aberta_em)}</span></div>
      <button class="btn primario" data-os="${prox.id}">${prox.status === "EM ATENDIMENTO" ? "Abrir para finalizar" : "Abrir e iniciar"}</button></div>` : "";
    $("#proxima").onclick = (e) => { const b = e.target.closest("[data-os]"); if (b) abrirDetalhe(+b.dataset.os); };
    $("#chips").innerHTML = filtros.map(([k, r]) => `<button class="chip" data-k="${k}" aria-pressed="${k === atual}">${r}</button>`).join("");
    const st = filtros.find((x) => x[0] === atual)[2];
    await listaPaginada($("#lista"), (q) => { q = q.eq("manutentor_id", S.eu.id).in("status", st); return atual === "fazer" ? q.order("prioridade_ordem", { ascending: false }) : q; },
      { vazio: atual === "fazer" ? "Nenhuma OS direcionada para você no momento." : "Nenhum atendimento no histórico ainda." });
  };
  $("#chips").onclick = (e) => { const b = e.target.closest(".chip"); if (b) { atual = b.dataset.k; carregar(); } };
  S.recarregar = carregar;
  await carregar();
}

/* ---------- Detalhe da OS + ações do fluxo (Etapas 5, 6 e 7) ---------- */
const TRILHA = ["ABERTA", "DIRECIONADA", "EM ATENDIMENTO", "AGUARDANDO CONFIRMAÇÃO", "CONCLUÍDA"];
const TRILHA_ROT = ["Aberta", "Direcionada", "Atendimento", "Confirmação", "Concluída"];
const RESULTADO = { CONFIRMADO: "Confirmado pelo técnico", NAO_RESOLVIDO: "Técnico: não resolvido", RECUSADO: "Recusada pelo manutentor" };
const UNIDADES = ["un", "m", "kg", "L", "pç", "cx", "rolo", "par"];
const fmtCurto = (ts) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(ts)).replace(",", "");
const fmtQtd = (q) => Number(q).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

function listaMateriais(lista) {
  if (!Array.isArray(lista)) return "";
  if (!lista.length) return `<p class="nota">Nenhum material do estoque do carro.</p>`;
  return `<ul class="materiais">${lista.map((m) => `<li><span><small>Cód. ${esc(m.codigo)}${m.controle ? ` · Controle ${esc(m.controle)}` : ""}</small>${esc(m.material)}</span>
    <b>${fmtQtd(m.quantidade)} ${esc(m.unidade)}</b></li>`).join("")}</ul>`;
}
function cartaoAtendimento(a) {
  return `<div class="atend">
    <div class="atend-topo"><strong>Atendimento ${a.ciclo} · ${nomeUsuario(a.manutentor_id)}</strong>
      ${a.resultado ? `<span class="res res-${a.resultado}">${RESULTADO[a.resultado]}</span>` : ""}</div>
    <div class="atend-tempos">Direcionada ${fmtDH(a.direcionada_em)}${a.iniciada_em ? ` · início ${fmtDH(a.iniciada_em)}` : ""}${a.finalizada_em ? ` · término ${fmtDH(a.finalizada_em)}` : ""}</div>
    ${a.motivo_recusa ? `<p class="bloco-texto recusa"><b>Motivo da recusa</b>${esc(a.motivo_recusa)}</p>` : ""}
    ${a.servico_realizado ? `<p class="bloco-texto"><b>O que foi feito</b>${esc(a.servico_realizado)}</p>` : ""}
    ${a.finalizada_em ? `<div class="bloco-texto"><b>${IC.caixa} Materiais do estoque do carro</b>${listaMateriais(a.materiais_carro)}</div>` : ""}
  </div>`;
}

async function abrirDetalhe(id) {
  const m = $("#modal"), corpo = $("#modalCorpo");
  corpo.innerHTML = `<p class="carregando">Carregando OS ${id}…</p>`;
  m.classList.remove("dlg-sucesso");
  if (!m.open) m.showModal();
  const [os, hist, at, lead] = await Promise.all([
    sb.from("ordens_servico").select("*").eq("id", id).single(),
    sb.from("os_historico").select("*").eq("os_id", id).order("id"),
    sb.from("os_atendimentos").select("*").eq("os_id", id).order("ciclo"),
    (tem("gerente") || tem("gestor") || tem("admin")) ? sb.from("vw_os_lead").select("*").eq("id", id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const erro = os.error || hist.error || at.error;
  if (erro) { corpo.innerHTML = `<p class="erro">${esc(msgErro(erro))}</p><button class="btn" onclick="modal.close()">Fechar</button>`; return; }
  const o = os.data, st = STATUS[o.status], pos = TRILHA.indexOf(o.status);
  const pend = o.status === "PENDENTE DE ATENDIMENTO";
  const trilha = TRILHA.map((s, i) => {
    const cls = pend ? (i === 0 ? "feito" : i === 1 ? "pend" : "") : (i <= pos ? "feito" : "");
    const quando = [o.aberta_em, o.direcionada_em, o.iniciada_em, o.finalizada_em, o.confirmada_em][i];
    return `<li class="${cls}" title="${STATUS[s].rot}">${TRILHA_ROT[i]}${cls === "feito" && quando ? `<small>${fmtCurto(quando).replace(" ", "<br>")}</small>` : ""}</li>`;
  }).join("");
  const campo = (r, v) => `<div><dt>${r}</dt><dd>${v}</dd></div>`;
  const ultPend = [...hist.data].reverse().find((h) => h.status === "PENDENTE DE ATENDIMENTO");

  corpo.innerHTML = `
    <div class="det-topo" style="--cor:${st.cor}"><div><h2>OS ${o.id}</h2><div class="det-pills"><span class="status pill" style="--cor:${st.cor}">${st.rot}</span>${prioTag(o.prioridade)}</div></div>
      <button class="fechar" aria-label="Fechar">${IC.x}</button></div>
    <ol class="trilha">${trilha}</ol>
    ${pend && ultPend ? `<div class="alerta-pend">${IC.alerta}<div><strong>${esc(ultPend.evento)}</strong>
      ${ultPend.detalhe ? `<p>“${esc(ultPend.detalhe)}”</p>` : ""}<small>Aguardando novo direcionamento do gestor.</small></div></div>` : ""}
    <h3>${IC.pin}Solicitação</h3>
    <dl class="campos">
      ${campo("Granja", nomeNucleo(o.nucleo_id))}${campo("Local", local(o.galpoes))}
      ${campo("Local / equipamento", esc(o.equipamento || "—"))}
      ${campo("Solicitante", nomeUsuario(o.solicitante_id))}${campo("Aberta em", fmtDH(o.aberta_em))}
      ${campo("Classificação (gestor)", o.prioridade ? prioTag(o.prioridade) : "Ainda não classificada")}
    </dl>
    <div id="acaoClass"></div>
    <div class="descricao">${esc(o.descricao)}</div>
    <div id="acao"></div>
    <h3>${IC.chave}Atendimento atual</h3>
    <dl class="campos">
      ${campo("Gestor (direcionamento)", nomeUsuario(o.gestor_id))}${campo("Direcionada em", fmtDH(o.direcionada_em))}
      ${campo("Manutentor", nomeUsuario(o.manutentor_id))}${campo("Início do atendimento", fmtDH(o.iniciada_em))}
      ${campo("Término do atendimento", fmtDH(o.finalizada_em))}${campo("Confirmada em", fmtDH(o.confirmada_em))}
    </dl>
    ${at.data.length ? `<h3>${IC.lista}Atendimentos (${at.data.length})</h3>${[...at.data].reverse().map(cartaoAtendimento).join("")}` : ""}
    ${lead.data ? `<h3>${IC.grafico}Lead de atendimento</h3><div class="leads mini">
      <div><b>${fmtMin(lead.data.min_abertura_direcionamento)}</b><small>Abertura → direcionamento</small></div>
      <div><b>${fmtMin(lead.data.min_espera_inicio)}</b><small>Espera até início</small></div>
      <div><b>${fmtMin(lead.data.min_execucao)}</b><small>Execução</small></div>
      <div><b>${fmtMin(lead.data.min_lead_total)}</b><small>Lead total</small></div></div>` : ""}
    <h3>${IC.relogio}Histórico</h3>
    <ul class="hist">${hist.data.map((h) => `<li style="--cor:${STATUS[h.status].cor}"><strong>${esc(h.evento)}</strong>
      ${h.detalhe ? ` — ${esc(h.detalhe)}` : ""}<small>${fmtDH(h.em)} · ${nomeUsuario(h.usuario_id)}</small></li>`).join("")}</ul>`;
  $(".fechar", corpo).onclick = () => m.close();
  montarAcao(o);
  montarClassificacao(o);
}

// Gerente e administrador podem alterar a classificação (fica registrado no histórico)
function montarClassificacao(o) {
  if (!(tem("gerente") || tem("admin")) || o.status === "CONCLUÍDA" || !o.prioridade) return;
  const el = $("#acaoClass");
  el.innerHTML = `<button class="btn fino" id="btnAltPrio">Alterar classificação</button>
    <div id="boxAltPrio" class="painel-acao" hidden><strong>Nova classificação</strong>${escolhaPrio("prioAlt", o.prioridade)}
      <div class="acoes"><button class="btn primario largo" id="btnSalvaPrio">Salvar classificação</button><button class="btn largo" id="btnCancPrio">Cancelar</button></div></div>`;
  const pega = ligarEscolha($("#prioAlt"));
  $("#btnAltPrio").onclick = () => { $("#boxAltPrio").hidden = false; $("#btnAltPrio").hidden = true; };
  $("#btnCancPrio").onclick = () => { $("#boxAltPrio").hidden = true; $("#btnAltPrio").hidden = false; };
  $("#btnSalvaPrio").onclick = (e) => {
    const p = pega(); if (p === o.prioridade) return aviso("Escolha uma classificação diferente da atual.", true);
    comBotao(e.target, async () => { await rpc("alterar_prioridade", { p_os: o.id, p_prioridade: p }); aviso("Classificação alterada."); await abrirDetalhe(o.id); });
  };
}
$("#modal").addEventListener("close", () => S.recarregar?.());

function linhaMaterial() {
  return `<div class="mat-linha">
    <label class="m-campo a-cod">Código<input class="m-cod" maxlength="30" placeholder="Ex.: 10452"></label>
    <label class="m-campo a-ctrl">Controle <i>(se houver)</i><input class="m-ctrl" maxlength="40" placeholder="Opcional"></label>
    <button type="button" class="m-rem" aria-label="Remover produto">×</button>
    <label class="m-campo a-nome">Nome do produto<input class="m-nome" maxlength="80" placeholder="Ex.: Abraçadeira de nylon 20cm"></label>
    <label class="m-campo a-qtd">Quantidade<input class="m-qtd" type="number" inputmode="decimal" min="0" step="any" placeholder="0"></label>
    <label class="m-campo a-un">Unidade<select class="m-un">${UNIDADES.map((u) => `<option>${u}</option>`).join("")}</select></label></div>`;
}

function montarAcao(o) {
  const el = $("#acao");
  const depois = async (msg) => { aviso(msg); await abrirDetalhe(o.id); };
  // Confirmação grande depois das ações principais
  const ok = (titulo, texto, linhas = []) => sucesso({ titulo, texto, linhas,
    acoes: [{ rot: "Ver a OS", fn: () => abrirDetalhe(o.id) }, { rot: "Voltar à lista", primario: true, fn: fecharModal }] });
  const resumoOS = [["Serviço", esc(o.descricao)], ["Onde", `${nomeNucleo(o.nucleo_id)} · ${local(o.galpoes)}`]];

  // Gestor: direcionar (OS aberta ou pendente)
  if (tem("gestor") && ["ABERTA", "PENDENTE DE ATENDIMENTO"].includes(o.status)) {
    const mnts = Object.values(S.usuarios).filter((u) => u.ativo && u.perfis.includes("manutentor"));
    el.innerHTML = `<div class="painel-acao"><strong>Classificação da OS</strong>
      <p class="nota">Define a ordem na fila do manutentor: as mais urgentes aparecem primeiro.</p>
      ${escolhaPrio("prioDir", o.prioridade ?? "")}
      <label style="margin-top:14px">Direcionar para o manutentor
      <select id="selMnt"><option value="">Selecione</option>${mnts.map((u) => `<option value="${u.id}">${esc(u.nome)}</option>`).join("")}</select></label>
      <button class="btn primario largo" id="btnDirecionar">Direcionar</button></div>`;
    const prio = ligarEscolha($("#prioDir"));
    $("#btnDirecionar").onclick = (e) => {
      const mnt = $("#selMnt").value;
      if (!prio()) return aviso("Escolha a classificação da OS.", true);
      if (!mnt) return aviso("Selecione o manutentor.", true);
      comBotao(e.target, async () => { await rpc("direcionar_os", { p_os: o.id, p_manutentor: mnt, p_prioridade: prio() });
        ok(`OS ${o.id} direcionada com sucesso`, "O manutentor já vê esta OS na fila dele.",
          [["Manutentor", nomeUsuario(mnt)], ["Classificação", prioTag(prio())], ...resumoOS]); });
    };
    return;
  }
  // Manutentor: iniciar ou recusar
  if (tem("manutentor") && o.manutentor_id === S.eu.id && o.status === "DIRECIONADA") {
    el.innerHTML = `<div class="painel-acao"><strong>Esta OS foi direcionada para você</strong>
      <p class="nota">Toque em Iniciar quando começar o serviço. Se não puder atender, recuse e explique ao gestor.</p>
      <div class="acoes"><button class="btn primario largo" id="btnIni">Iniciar atendimento</button>
      <button class="btn perigo largo" id="btnRecusar">Recusar OS</button></div>
      <div id="boxRecusa" hidden>
        <label style="margin-top:14px">Motivo da recusa (obrigatório)
          <textarea id="motivo" maxlength="1000" placeholder="Ex.: precisa de eletricista terceirizado; falta a peça no estoque"></textarea></label>
        <p class="erro" id="erroRecusa"></p>
        <button class="btn perigo cheio largo" id="btnConfRecusa">Enviar recusa ao gestor</button>
      </div></div>`;
    $("#btnIni").onclick = (e) => comBotao(e.target, async () => { await rpc("iniciar_atendimento", { p_os: o.id }); await depois("Atendimento iniciado."); });
    $("#btnRecusar").onclick = () => { $("#boxRecusa").hidden = false; $("#motivo").focus(); };
    $("#btnConfRecusa").onclick = (e) => {
      const motivo = $("#motivo").value.trim();
      if (motivo.length < 10) { $("#erroRecusa").textContent = "Explique o motivo da recusa (mínimo 10 caracteres)."; return; }
      comBotao(e.target, async () => { await rpc("recusar_os", { p_os: o.id, p_motivo: motivo });
        ok(`Recusa da OS ${o.id} enviada`, "A OS voltou para o gestor de manutenção com o seu motivo.", [["Motivo", esc(motivo)], ...resumoOS]); });
    };
    return;
  }
  // Manutentor: finalizar com descrição do serviço e materiais do carro
  if (tem("manutentor") && o.manutentor_id === S.eu.id && o.status === "EM ATENDIMENTO") {
    el.innerHTML = `<div class="painel-acao"><strong>Finalizar atendimento</strong>
      <label style="margin-top:12px">O que foi feito (obrigatório)
        <textarea id="servico" maxlength="2000" placeholder="Ex.: troquei a vedação do registro da linha 3 e testei a pressão"></textarea></label>
      <fieldset class="mat"><legend>${IC.caixa} Materiais do estoque do carro</legend>
        <div class="alerta-mat">Registre <b>somente</b> o que saiu do estoque do seu carro.
          Material retirado do almoxarifado já tem o custo lançado automaticamente e <b>não</b> deve ser registrado aqui.</div>
        <div class="escolha-mat">
          <label><input type="radio" name="usou" value="nao"> Não usei material do carro</label>
          <label><input type="radio" name="usou" value="sim"> Usei material do carro</label></div>
        <div id="linhasMat" hidden></div>
        <button type="button" class="btn fino" id="addMat" hidden>+ Adicionar produto</button>
      </fieldset>
      <p class="erro" id="erroFim"></p>
      <button class="btn primario largo" id="btnFim">Finalizar atendimento</button></div>`;
    const linhas = $("#linhasMat"), add = $("#addMat");
    el.querySelectorAll("[name=usou]").forEach((r) => (r.onchange = () => {
      const sim = r.value === "sim" && r.checked;
      linhas.hidden = add.hidden = !sim;
      if (sim && !linhas.children.length) linhas.insertAdjacentHTML("beforeend", linhaMaterial());
      $("#erroFim").textContent = "";
    }));
    add.onclick = () => { linhas.insertAdjacentHTML("beforeend", linhaMaterial()); linhas.lastElementChild.querySelector("input").focus(); };
    linhas.onclick = (e) => { if (e.target.closest(".m-rem")) e.target.closest(".mat-linha").remove(); };
    el.oninput = () => ($("#erroFim").textContent = "");
    $("#btnFim").onclick = (e) => {
      const erroFim = (t) => ($("#erroFim").textContent = t);
      const servico = $("#servico").value.trim();
      const usou = el.querySelector("[name=usou]:checked")?.value;
      if (servico.length < 10) return erroFim("Descreva o que foi feito (mínimo 10 caracteres).");
      if (!usou) return erroFim("Informe se usou material do estoque do carro.");
      let materiais = [];
      if (usou === "sim") {
        const rows = [...linhas.querySelectorAll(".mat-linha")].map((l) => ({
          codigo: l.querySelector(".m-cod").value.trim(), material: l.querySelector(".m-nome").value.trim(),
          controle: l.querySelector(".m-ctrl").value.trim() || null, quantidade: Number(l.querySelector(".m-qtd").value), unidade: l.querySelector(".m-un").value }));
        materiais = rows.filter((r) => r.codigo || r.material || r.controle || r.quantidade);
        if (!materiais.length) return erroFim("Adicione pelo menos um material ou marque \"Não usei material do carro\".");
        if (materiais.some((r) => !r.codigo || !r.material || !(r.quantidade > 0))) return erroFim("Preencha código, nome e quantidade de cada produto. O controle só se houver.");
      }
      if (!confirm(`Finalizar o atendimento da OS ${o.id}? Ela volta para o técnico confirmar.`)) return;
      comBotao(e.target, async () => {
        await rpc("finalizar_atendimento", { p_os: o.id, p_servico: servico, p_materiais: materiais });
        ok(`Atendimento da OS ${o.id} finalizado`, "A OS foi enviada para o técnico confirmar se o serviço foi resolvido.",
          [["O que foi feito", esc(servico)], ["Material do carro", materiais.length ? `${materiais.length} produto${materiais.length > 1 ? "s" : ""}` : "Não usou"]]);
      });
    };
    return;
  }
  // Técnico solicitante: confirmar ou devolver
  if (tem("tecnico") && o.solicitante_id === S.eu.id && o.status === "AGUARDANDO CONFIRMAÇÃO") {
    el.innerHTML = `<div class="painel-acao"><strong>O manutentor finalizou o atendimento. O serviço foi realizado?</strong>
      <p class="nota">Veja abaixo, em Atendimentos, o que foi feito.</p>
      <label style="margin-top:10px">Observação (opcional)<textarea id="obs" maxlength="1000" placeholder="Se não foi resolvido, explique o que ainda falta"></textarea></label>
      <div class="acoes"><button class="btn primario largo" id="btnSim">Confirmar: serviço realizado</button>
      <button class="btn perigo largo" id="btnNao">Não foi resolvido</button></div></div>`;
    const enviar = (resolvido) => (e) => {
      if (!resolvido && !confirm("A OS vai voltar para pendência de atendimento. Confirma?")) return;
      comBotao(e.target, async () => {
        await rpc("confirmar_os", { p_os: o.id, p_resolvido: resolvido, p_observacao: $("#obs").value });
        if (resolvido) ok(`OS ${o.id} concluída`, "Obrigado pela confirmação. O atendimento foi encerrado.", resumoOS);
        else ok(`OS ${o.id} devolvida`, "A OS voltou para o gestor de manutenção direcionar um novo atendimento.", resumoOS);
      });
    };
    $("#btnSim").onclick = enviar(true);
    $("#btnNao").onclick = enviar(false);
  }
}

/* ---------- ETAPA 8: Painel (gerente, gestor e administrador) ---------- */
const ETAPAS = [
  { k: "min_abertura_direcionamento", rot: "Abertura até direcionar", cor: "#2563A8" },
  { k: "min_espera_inicio",           rot: "Espera até iniciar",      cor: "#B7700A" },
  { k: "min_execucao",                rot: "Execução do serviço",     cor: "#5B4FB8" },
  { k: "min_confirmacao",             rot: "Aguardando o técnico confirmar", cor: "#0D7F80" },
];
const valid = (arr) => arr.filter((x) => x !== null && x !== undefined && !isNaN(x)).map(Number);
const media = (arr) => { const v = valid(arr); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const mediana = (arr) => { const v = valid(arr).sort((a, b) => a - b); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const minEntre = (fim, ini) => (fim && ini ? (new Date(fim) - new Date(ini)) / 60000 : null);
const fmtHoras = (min) => (min == null ? "—" : `${(min / 60).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} h`);
const LIMITE_EXEC = 12 * 60; // execução acima disso provavelmente é esquecimento de finalizar

async function telaGerencial() {
  $("#tela").innerHTML = `${topo("Painel", "Situação das OS, tempos de atendimento e equipe.")}
    <div class="filtros painel-filtros">
      <label>Período<select id="vPer">
        <option value="7">Últimos 7 dias</option><option value="30" selected>Últimos 30 dias</option>
        <option value="90">Últimos 90 dias</option><option value="x">Escolher datas</option></select></label>
      <label id="lDe" hidden>De<input type="date" id="vDe" value="${hojeISO(-30)}"></label>
      <label id="lAte" hidden>Até<input type="date" id="vAte" value="${hojeISO()}"></label>
      <label>Núcleo<select id="vNuc"><option value="">Todos</option>${S.nucleos.map((n) => `<option value="${n.id}">${esc(n.nome)}</option>`).join("")}</select></label>
    </div>
    <div class="segmento" id="vSeg" role="tablist">
      <button data-v="geral" aria-selected="true">Geral</button><button data-v="prio">Classificação</button>
      <button data-v="equipe">Equipe</button><button data-v="locais">Granjas e equipamentos</button>
      <button data-v="materiais">Materiais</button><button data-v="lista">Lista de OS</button></div>
    <div id="vGeral">
      <section class="kpis" id="kpis"></section>
      <div class="grade">
        <section class="cartao"><h2>Em aberto agora</h2><p class="nota">Todas as OS não concluídas, de qualquer data.</p><div id="gSituacao"></div></section>
        <section class="cartao"><h2>Há quanto tempo estão em aberto</h2><p class="nota">Quanto mais à direita, mais antiga a pendência.</p><div id="gIdade"></div></section>
        <section class="cartao"><h2>Onde o tempo é gasto</h2><p class="nota">Média por etapa das OS concluídas no período.</p><div id="gEtapas"></div></section>
        <section class="cartao"><h2>Retornos ao gestor</h2><p class="nota">OS que precisaram de novo direcionamento.</p><div id="gRetornos"></div></section>
        <section class="cartao largo"><h2>Abertas × concluídas</h2><p class="nota" id="notaSerie"></p><div id="gSerie"></div></section>
      </div>
    </div>
    <div id="vPrio" hidden>
      <div class="grade">
        <section class="cartao"><h2>Fila agora por classificação</h2><p class="nota">OS não concluídas, de qualquer data.</p><div id="gFilaPrio"></div></section>
        <section class="cartao"><h2>OS do período por classificação</h2><p class="nota">Como o gestor classificou as OS abertas no período.</p><div id="gMixPrio"></div></section>
        <section class="cartao"><h2>Tempo para começar o serviço</h2><p class="nota">Mediana da abertura até o manutentor iniciar, por classificação.</p><div id="gPrio"></div></section>
        <section class="cartao"><h2>Lead típico por classificação</h2><p class="nota">Mediana da abertura até a confirmação do técnico (concluídas).</p><div id="gLeadPrio"></div></section>
      </div>
    </div>
    <div id="vLocais" hidden>
      <div class="grade">
        <section class="cartao"><h2>OS por granja</h2><p class="nota">Abertas no período e lead típico das concluídas.</p><div id="gNucleos"></div></section>
        <section class="cartao"><h2>Aviários com mais OS</h2><p class="nota">Os 10 aviários com mais OS no período. Ajuda a achar problema que se repete.</p><div id="gAviarios"></div></section>
        <section class="cartao largo"><h2>OS por local ou equipamento</h2><p class="nota">Quantidade no período e lead típico das concluídas.</p><div id="gEquip"></div></section>
      </div>
    </div>
    <div id="vEquipe" hidden>
      <p class="nota aviso-dados">Considera os atendimentos <b>direcionados no período</b>. “Horas em atendimento” é o tempo entre Iniciar e Finalizar registrado no sistema: não inclui deslocamento entre núcleos nem serviços feitos fora de OS.</p>
      <div class="grade">
        <section class="cartao largo"><h2>OS atendidas por manutentor</h2><p class="nota">Atendimentos finalizados no período, divididos pela classificação da OS.</p><div id="gAtendidas"></div></section>
        <section class="cartao largo"><h2>Horas em atendimento e OS finalizadas</h2><p class="nota">Carga de trabalho registrada por manutentor.</p><div id="gCarga"></div></section>
        <section class="cartao largo"><h2>Tempos típicos por manutentor</h2><p class="nota">Medianas: resposta = direcionamento até iniciar; execução = iniciar até finalizar.</p><div id="gTempos"></div></section>
      </div>
      <h2 class="sec">Resumo por manutentor</h2><div class="equipe" id="gEquipe"></div>
    </div>
    <div id="vMateriais" hidden>
      <section class="cartao"><h2>${IC.caixa} Materiais do estoque dos carros</h2>
        <p class="nota">Somente o que os manutentores registraram como retirado do carro, somado pelo código. Material do almoxarifado não entra aqui.</p><div id="gMateriais"></div></section>
    </div>
    <div id="vLista" hidden>
      <section class="cartao"><div class="chips" id="fStatus"></div>
        <div class="tabela-rolagem"><table class="tabela-os">
          <thead><tr><th>OS</th><th>Núcleo</th><th>Local</th><th>Status</th><th>Classif.</th><th>Abertura</th><th>Abert. → direc.</th><th>Espera</th><th>Execução</th><th>Lead total</th><th>Atend.</th></tr></thead>
          <tbody id="tbLead"></tbody></table></div>
        <button class="btn mais" id="vMais" hidden>Mostrar mais</button></section>
    </div>`;

  let linhas = [], filtroStatus = "", mostrados = 0; const tok = S.tok;
  const nuc = () => ($("#vNuc").value ? +$("#vNuc").value : null);
  function periodo() {
    const v = $("#vPer").value;
    const de = v === "x" ? $("#vDe").value : hojeISO(-Number(v) + 1), ate = v === "x" ? $("#vAte").value : hojeISO();
    const ini = new Date(`${de}T00:00:00-03:00`), fim = new Date(new Date(`${ate}T00:00:00-03:00`).getTime() + 864e5);
    return { ini, fim, dias: Math.round((fim - ini) / 864e5) };
  }
  const barras = (itens, max, cor) => `<div class="barras">${itens.map((i) => `<div class="barra-linha">
      <span class="rot">${i.rot}</span><span class="trilho"><i ${i.cls ? `class="${i.cls}"` : ""} style="width:${(i.v / Math.max(1, max)) * 100}%;${i.cor || cor ? `background:${i.cor || cor}` : ""}"></i></span>
      <b>${i.txt ?? i.v}</b>${i.extra !== undefined ? `<em>${i.extra}</em>` : ""}</div>`).join("")}</div>`;

  function desenharTabela(reset) {
    if (reset) { mostrados = 0; $("#tbLead").innerHTML = ""; }
    const base = filtroStatus ? linhas.filter((r) => r.status === filtroStatus) : linhas;
    const fatia = base.slice(mostrados, mostrados + (matchMedia("(max-width: 720px)").matches ? 12 : 30)); mostrados += fatia.length;
    if (reset && !base.length) $("#tbLead").innerHTML = `<tr class="sem"><td colspan="11">Nenhuma OS no período com esses filtros.</td></tr>`;
    $("#tbLead").insertAdjacentHTML("beforeend", fatia.map((r) => `<tr data-os="${r.id}">
      <td data-l="OS"><b>${r.id}</b></td><td data-l="Núcleo">${nomeNucleo(r.nucleo_id)}</td><td data-l="Local">${local(r.galpoes)}</td>
      <td data-l="Status"><span class="pill" style="--cor:${STATUS[r.status].cor}">${STATUS[r.status].rot}</span></td><td data-l="Classificação">${prioTag(r.prioridade) || "—"}</td>
      <td data-l="Abertura">${fmtDH(r.aberta_em)}</td>
      <td class="n" data-l="Abert. → direc.">${fmtMin(r.min_abertura_direcionamento)}</td><td class="n" data-l="Espera">${fmtMin(r.min_espera_inicio)}</td>
      <td class="n" data-l="Execução">${fmtMin(r.min_execucao)}</td><td class="n" data-l="Lead total">${fmtMin(r.min_lead_total)}</td><td class="n" data-l="Atendimentos">${r.ciclos}</td></tr>`).join(""));
    $("#vMais").hidden = mostrados >= base.length;
    const cont = {}; linhas.forEach((r) => (cont[r.status] = (cont[r.status] || 0) + 1));
    $("#fStatus").innerHTML = [["", "Todas", linhas.length], ...Object.keys(STATUS).filter((k) => cont[k]).map((k) => [k, STATUS[k].rot, cont[k]])]
      .map(([k, r, n]) => `<button class="chip" data-k="${k}" aria-pressed="${k === filtroStatus}">${r}<b>${n}</b></button>`).join("");
  }

  async function carregar() {
    const { ini, fim, dias } = periodo();
    if (!(dias > 0)) return aviso("Confira as datas do período.", true);
    const abertosSt = Object.keys(STATUS).filter((k) => k !== "CONCLUÍDA");
    let qL = sb.from("vw_os_lead").select("*").gte("aberta_em", ini.toISOString()).lt("aberta_em", fim.toISOString()).order("id", { ascending: false }).range(0, 4999);
    let qA = sb.from("ordens_servico").select("id,status,aberta_em,nucleo_id,manutentor_id,prioridade").in("status", abertosSt).range(0, 4999);
    const qT = sb.from("os_atendimentos").select("*, ordens_servico(nucleo_id,prioridade)").gte("direcionada_em", ini.toISOString()).lt("direcionada_em", fim.toISOString()).range(0, 9999);
    if (nuc()) { qL = qL.eq("nucleo_id", nuc()); qA = qA.eq("nucleo_id", nuc()); }
    const [rL, rA, rT] = await Promise.all([qL, qA, qT]);
    if (tok !== S.tok) return;
    const erro = rL.error || rA.error || rT.error; if (erro) return aviso(msgErro(erro), true);
    linhas = rL.data;
    const abertos = rA.data;
    const atend = rT.data.filter((a) => !nuc() || a.ordens_servico?.nucleo_id === nuc());
    const concl = linhas.filter((r) => r.status === "CONCLUÍDA");
    const voltaram = linhas.filter((r) => r.recusas > 0 || r.nao_resolvidos > 0);
    const idadeH = (o) => (Date.now() - new Date(o.aberta_em)) / 36e5;
    const velhas = abertos.filter((o) => idadeH(o) > 7 * 24).length;

    // ---- Indicadores
    const kpi = (valor, rot, sub = "", alerta = false) => `<div class="kpi${alerta ? " alerta" : ""}"><small>${rot}</small><b>${valor}</b>${sub ? `<span>${sub}</span>` : ""}</div>`;
    $("#kpis").innerHTML =
      kpi(linhas.length, "OS abertas", "no período") +
      kpi(concl.length, "Concluídas", `${pct(concl.length, linhas.length)}% das abertas no período`) +
      kpi(fmtMin(mediana(concl.map((r) => r.min_lead_total))), "Lead típico", `mediana · média ${fmtMin(media(concl.map((r) => r.min_lead_total)))}`) +
      kpi(fmtMin(mediana(linhas.map((r) => r.min_ate_inicio))), "Até começar o serviço", "mediana, da abertura ao início") +
      kpi(`${pct(voltaram.length, linhas.length)}%`, "Voltaram ao gestor", `${voltaram.length} OS recusadas ou não resolvidas`) +
      kpi(abertos.length, "Em aberto agora", [abertos.filter((o) => o.prioridade === "EMERGENCIA").length ? `${abertos.filter((o) => o.prioridade === "EMERGENCIA").length} emergência(s)` : "",
        velhas ? `${velhas} há +7 dias` : ""].filter(Boolean).join(" · ") || "nenhuma emergência ou atraso", velhas > 0 || abertos.some((o) => o.prioridade === "EMERGENCIA"));

    // ---- Em aberto agora (por status)
    const porSt = Object.fromEntries(abertosSt.map((k) => [k, abertos.filter((o) => o.status === k).length]));
    $("#gSituacao").innerHTML = barras(abertosSt.map((k) => ({ rot: STATUS[k].rot, v: porSt[k], cor: STATUS[k].cor })), Math.max(...Object.values(porSt)));

    // ---- Idade das pendências
    const faixas = [["Até 1 dia", 0, 24], ["1 a 3 dias", 24, 72], ["3 a 7 dias", 72, 168], ["Mais de 7 dias", 168, Infinity]];
    const nF = faixas.map(([, a, b]) => abertos.filter((o) => idadeH(o) >= a && idadeH(o) < b).length);
    $("#gIdade").innerHTML = !abertos.length ? `<div class="vazio">Nenhuma OS em aberto.</div>` : `<div class="colunas">${faixas.map(([r], i) => `
      <div class="coluna${i === 3 && nF[i] ? " quente" : ""}"><b>${nF[i]}</b><div class="haste"><i style="height:${(nF[i] / Math.max(1, ...nF)) * 100}%"></i></div><span>${r}</span></div>`).join("")}</div>`;

    // ---- Onde o tempo é gasto (média, porque as partes precisam somar)
    const med = ETAPAS.map((e) => ({ ...e, v: media(concl.map((r) => r[e.k])) ?? 0 }));
    const tot = med.reduce((a, e) => a + e.v, 0);
    $("#gEtapas").innerHTML = !concl.length ? `<div class="vazio">Nenhuma OS concluída no período.</div>` : `
      <div class="empilhada">${med.map((e) => `<i style="flex:${Math.max(e.v, tot * 0.01)};background:${e.cor}" title="${e.rot}: ${fmtMin(e.v)}"></i>`).join("")}</div>
      <ul class="legenda-etapas">${med.map((e) => `<li><i style="background:${e.cor}"></i><span>${e.rot}</span><b>${fmtMin(e.v)}</b><em>${pct(e.v, tot)}%</em></li>`).join("")}</ul>
      <p class="nota rodape">A última etapa depende do técnico, não da manutenção. Aqui é usada a média para que as etapas somem o total.</p>`;

    // ---- Classificação × tempo para começar
    const ordP = Object.keys(PRIO);
    const porP = ordP.map((k) => { const g = linhas.filter((r) => r.prioridade === k); return { k, n: g.length, t: mediana(g.map((r) => r.min_ate_inicio)) }; });
    const maxT = Math.max(1, ...porP.map((p) => p.t ?? 0));
    $("#gPrio").innerHTML = !porP.some((p) => p.n) ? `<div class="vazio">Nenhuma OS classificada no período.</div>` :
      barras(porP.map((p) => ({ rot: prioTag(p.k), v: p.t ?? 0, txt: fmtMin(p.t), cls: `t-${p.k}`, extra: `${p.n} OS` })), maxT) +
      `<p class="nota rodape">O esperado é a barra diminuir de Baixa para Emergência. Se não diminuir, a classificação não está mudando a ordem de atendimento.</p>`;

    // ---- Fila e mistura por classificação
    const rotP = (k) => (k ? prioTag(k) : `<span class="prio"><span class="sinal"><i></i><i></i><i></i><i></i></span>Sem classificação</span>`);
    const chavesP = [...ordP, null];
    const fila = chavesP.map((k) => ({ k, n: abertos.filter((o) => (o.prioridade ?? null) === k).length }));
    $("#gFilaPrio").innerHTML = barras(fila.map((f) => ({ rot: rotP(f.k), v: f.n, cor: PCOR[f.k] || "#D5D6DB" })), Math.max(1, ...fila.map((f) => f.n))) +
      `<p class="nota rodape">"Sem classificação" = abertas ainda não direcionadas pelo gestor.</p>`;
    const mix = chavesP.map((k) => ({ k, n: linhas.filter((r) => (r.prioridade ?? null) === k).length })).filter((m) => m.n);
    $("#gMixPrio").innerHTML = !linhas.length ? `<div class="vazio">Sem OS no período.</div>` : `
      <div class="empilhada">${mix.map((m) => `<i style="flex:${m.n};background:${PCOR[m.k] || "#D5D6DB"}" title="${m.k ? PRIO[m.k].rot : "Sem classificação"}: ${m.n}"></i>`).join("")}</div>
      <ul class="legenda-etapas">${mix.map((m) => `<li><i style="background:${PCOR[m.k] || "#D5D6DB"}"></i><span>${m.k ? PRIO[m.k].rot : "Sem classificação"}</span><b>${m.n} OS</b><em>${pct(m.n, linhas.length)}%</em></li>`).join("")}</ul>`;
    const leadP = ordP.map((k) => { const g = concl.filter((r) => r.prioridade === k); return { k, n: g.length, t: mediana(g.map((r) => r.min_lead_total)) }; });
    $("#gLeadPrio").innerHTML = !leadP.some((p) => p.n) ? `<div class="vazio">Nenhuma OS concluída no período.</div>` :
      barras(leadP.map((p) => ({ rot: prioTag(p.k), v: p.t ?? 0, txt: fmtMin(p.t), cls: `t-${p.k}`, extra: `${p.n} OS` })), Math.max(1, ...leadP.map((p) => p.t ?? 0)));

    // ---- Aviários com mais OS e por equipamento
    const porAv = {};
    let todaGranja = 0;
    linhas.forEach((r) => { const g = r.galpoes || []; if (!g.length) todaGranja++; g.forEach((n) => { const k = `${r.nucleo_id}|${n}`; porAv[k] = (porAv[k] || 0) + 1; }); });
    const topAv = Object.entries(porAv).sort((a, b) => b[1] - a[1]).slice(0, 10);
    $("#gAviarios").innerHTML = !topAv.length ? `<div class="vazio">Sem OS com aviário informado no período.</div>` :
      barras(topAv.map(([k, n]) => { const [nu, g] = k.split("|"); return { rot: `${nomeNucleo(+nu)} · Aviário ${g}`, v: n, cor: n > 1 ? "#D2560F" : "#A0A4AB" }; }), topAv[0][1]) +
      `<p class="nota rodape">Em laranja: aviário com 2 ou mais OS no período (problema que pode estar se repetindo). ${todaGranja} OS foram para a granja toda e não entram nesta lista.</p>`;
    const porEq = {};
    linhas.forEach((r) => { const k = (r.equipamento || "Não informado").trim(); (porEq[k] ??= { n: 0, leads: [] }).n++; if (r.min_lead_total != null) porEq[k].leads.push(r.min_lead_total); });
    const ordE = Object.entries(porEq).sort((a, b) => b[1].n - a[1].n).slice(0, 12);
    $("#gEquip").innerHTML = !ordE.length ? `<div class="vazio">Sem OS no período.</div>` :
      barras(ordE.map(([k, v]) => ({ rot: esc(k), v: v.n, extra: v.leads.length ? fmtMin(mediana(v.leads)) : "—" })), ordE[0][1].n, "#4B5058") +
      `<p class="nota rodape">Número = OS no período · tempo = lead típico das concluídas. Os atalhos de equipamento na abertura deixam esta visão mais precisa.</p>`;

    // ---- Série (por semana quando o período é longo, para não virar ruído)
    const passo = dias <= 14 ? 1 : 7, n = Math.ceil(dias / passo);
    const bAb = Array(n).fill(0), bCo = Array(n).fill(0);
    const idx = (ts) => Math.floor((new Date(ts) - ini) / (864e5 * passo));
    linhas.forEach((r) => { bAb[idx(r.aberta_em)]++; if (r.confirmada_em) { const i = idx(r.confirmada_em); if (i >= 0 && i < n) bCo[i]++; } });
    const maxB = Math.max(1, ...bAb, ...bCo), cada = Math.ceil(n / 8);
    const rotulo = (i) => new Date(ini.getTime() + i * passo * 864e5).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" });
    $("#notaSerie").textContent = `${passo === 1 ? "Por dia" : "Por semana (início em)"}. Concluídas = confirmadas pelo técnico. Barras de abertas acima das concluídas por várias semanas = fila crescendo.`;
    $("#gSerie").innerHTML = `<div class="serie">${bAb.map((a, i) => `<div class="col" title="${rotulo(i)}: ${a} abertas, ${bCo[i]} concluídas">
        <div class="par"><i class="ab" style="height:${(a / maxB) * 100}%"><em>${a || ""}</em></i><i class="co" style="height:${(bCo[i] / maxB) * 100}%"><em>${bCo[i] || ""}</em></i></div>
        <span>${i % cada === 0 ? rotulo(i) : ""}</span></div>`).join("")}</div>
      <div class="leg-serie"><span><i class="ab"></i>Abertas</span><span><i class="co"></i>Concluídas</span></div>`;

    // ---- Por núcleo
    const porN = {};
    linhas.forEach((r) => { (porN[r.nucleo_id] ??= { n: 0, leads: [] }).n++; if (r.min_lead_total != null) porN[r.nucleo_id].leads.push(r.min_lead_total); });
    const ordN = Object.entries(porN).sort((a, b) => b[1].n - a[1].n);
    $("#gNucleos").innerHTML = !ordN.length ? `<div class="vazio">Sem OS no período.</div>` :
      barras(ordN.map(([id, v]) => ({ rot: nomeNucleo(+id), v: v.n, extra: v.leads.length ? fmtMin(mediana(v.leads)) : "—" })), Math.max(...ordN.map(([, v]) => v.n)), "var(--tinta)") +
      `<p class="nota rodape">Número = OS abertas · tempo = lead típico das concluídas</p>`;

    // ---- Retornos
    const recusadas = linhas.filter((r) => r.recusas > 0).length, naoRes = linhas.filter((r) => r.nao_resolvidos > 0).length;
    $("#gRetornos").innerHTML = `<div class="retornos">
      <div><b>${voltaram.length}</b><span>OS voltaram ao gestor</span><em>${pct(voltaram.length, linhas.length)}% das abertas</em></div>
      <div><b>${recusadas}</b><span>Recusadas pelo manutentor</span><em>antes de iniciar</em></div>
      <div><b>${naoRes}</b><span>Técnico informou não resolvido</span><em>retrabalho</em></div></div>
      <p class="nota rodape">Os motivos ficam no histórico de cada OS.</p>`;

    // ---- Equipe
    const mnts = Object.values(S.usuarios).filter((u) => u.perfis.includes("manutentor") && (u.ativo || atend.some((a) => a.manutentor_id === u.id)))
      .sort((a, b) => a.nome.localeCompare(b.nome));
    const eq = mnts.map((u) => {
      const at = atend.filter((a) => a.manutentor_id === u.id);
      const fin = at.filter((a) => a.finalizada_em), exec = fin.map((a) => minEntre(a.finalizada_em, a.iniciada_em));
      const aval = fin.filter((a) => a.resultado === "CONFIRMADO" || a.resultado === "NAO_RESOLVIDO");
      const mix = Object.fromEntries(Object.keys(PRIO).map((k) => [k, at.filter((a) => a.ordens_servico?.prioridade === k).length]));
      return { u, rec: at.length, fin: fin.length, recusas: at.filter((a) => a.resultado === "RECUSADO").length,
        horas: exec.reduce((s, x) => s + (x || 0), 0), exec: mediana(exec), resp: mediana(at.map((a) => minEntre(a.iniciada_em, a.direcionada_em))),
        retr: aval.filter((a) => a.resultado === "NAO_RESOLVIDO").length, aval: aval.length, mix, longos: exec.filter((x) => x > LIMITE_EXEC).length,
        emMaos: abertos.filter((o) => o.manutentor_id === u.id && ["DIRECIONADA", "EM ATENDIMENTO"].includes(o.status)).length };
    });
    const maxH = Math.max(1, ...eq.map((e) => e.horas)), maxF = Math.max(1, ...eq.map((e) => e.fin));
    const atendP = eq.map((e) => ({ nome: e.u.nome, total: e.fin, partes: ordP.map((k) => ({ k, n: atend.filter((a) => a.manutentor_id === e.u.id && a.finalizada_em && a.ordens_servico?.prioridade === k).length })) }));
    $("#gAtendidas").innerHTML = !eq.length ? `<div class="vazio">Nenhum manutentor cadastrado.</div>` : `<div class="pilhas">${atendP.map((a) => `
      <div class="pilha-linha"><span class="rot">${esc(a.nome)}</span>
        <span class="pilha" style="width:${Math.max(2, (a.total / maxF) * 100)}%">${a.partes.filter((p) => p.n).map((p) => `<i style="flex:${p.n};background:${PCOR[p.k]}" title="${PRIO[p.k].rot}: ${p.n}"></i>`).join("")}</span>
        <b>${a.total}</b></div>`).join("")}</div>
      <div class="leg-serie">${ordP.map((k) => `<span><i style="background:${PCOR[k]}"></i>${PRIO[k].rot}</span>`).join("")}</div>`;
    $("#gCarga").innerHTML = !eq.length ? `<div class="vazio">Nenhum manutentor cadastrado.</div>` : `<div class="carga">${eq.map((e) => `
      <div class="carga-linha"><span class="rot">${esc(e.u.nome)}</span>
        <span class="duas"><span class="trilho"><i style="width:${(e.horas / maxH) * 100}%;background:#5B4FB8"></i></span><b>${fmtHoras(e.horas)}</b>
        <span class="trilho"><i style="width:${(e.fin / maxF) * 100}%;background:var(--s-concluida)"></i></span><b>${e.fin} OS</b></span></div>`).join("")}</div>
      <div class="leg-serie"><span><i style="background:#5B4FB8"></i>Horas em atendimento</span><span><i class="co"></i>OS finalizadas</span></div>`;
    const maxR = Math.max(1, ...eq.map((e) => e.resp ?? 0)), maxE = Math.max(1, ...eq.map((e) => e.exec ?? 0));
    $("#gTempos").innerHTML = !eq.length ? "" : `<div class="carga">${eq.map((e) => `
      <div class="carga-linha"><span class="rot">${esc(e.u.nome)}</span>
        <span class="duas"><span class="trilho"><i style="width:${((e.resp ?? 0) / maxR) * 100}%;background:#B7700A"></i></span><b>${fmtMin(e.resp)}</b>
        <span class="trilho"><i style="width:${((e.exec ?? 0) / maxE) * 100}%;background:#5B4FB8"></i></span><b>${fmtMin(e.exec)}</b></span></div>`).join("")}</div>
      <div class="leg-serie"><span><i style="background:#B7700A"></i>Resposta (até iniciar)</span><span><i style="background:#5B4FB8"></i>Execução</span></div>`;
    $("#gEquipe").innerHTML = !eq.length ? `<div class="vazio">Nenhum manutentor cadastrado.</div>` : eq.map((e) => {
      const totMix = Object.values(e.mix).reduce((a, b) => a + b, 0);
      return `<div class="membro">
        <div class="membro-topo"><span class="avatar">${iniciais(e.u.nome)}</span><div><strong>${esc(e.u.nome)}</strong>
          <small>${e.rec} OS recebidas · ${e.emMaos ? `${e.emMaos} em mãos agora` : "nenhuma em mãos agora"}</small></div></div>
        <dl class="numeros">
          <div><dt>Finalizadas</dt><dd>${e.fin}</dd></div>
          <div><dt>Horas em atend.</dt><dd>${fmtHoras(e.horas)}</dd></div><div><dt>Execução típica</dt><dd>${fmtMin(e.exec)}</dd></div>
          <div><dt>Resposta típica</dt><dd>${fmtMin(e.resp)}</dd></div><div><dt>Retrabalho</dt><dd>${e.aval ? `${pct(e.retr, e.aval)}%` : "—"}</dd></div>
          <div><dt>Recusas</dt><dd>${e.recusas}</dd></div></dl>
        ${totMix ? `<div class="mix" title="Classificação das OS recebidas">${Object.keys(PRIO).map((k) => e.mix[k] ? `<i class="t-${k}" style="flex:${e.mix[k]}"></i>` : "").join("")}</div>
          <p class="mix-leg">${Object.keys(PRIO).filter((k) => e.mix[k]).map((k) => `${PRIO[k].rot} ${e.mix[k]}`).join(" · ")}</p>` : ""}
        ${e.longos ? `<p class="qualidade">${IC.alerta} ${e.longos} atendimento(s) com mais de 12 h entre iniciar e finalizar. Confira se não houve esquecimento de finalizar — isso distorce as horas.</p>` : ""}
      </div>`; }).join("");

    // ---- Materiais do carro
    const mats = {};
    linhas.forEach((r) => (r.materiais_carro || []).forEach((m) => {
      const k = String(m.codigo).trim().toUpperCase() + "|" + m.unidade;
      (mats[k] ??= { codigo: String(m.codigo).trim(), material: m.material.trim(), unidade: m.unidade, qtd: 0, os: new Set() }).qtd += Number(m.quantidade);
      mats[k].os.add(r.id);
    }));
    const lm = Object.values(mats).sort((a, b) => b.os.size - a.os.size || b.qtd - a.qtd);
    const osComMat = new Set(lm.flatMap((m) => [...m.os])).size;
    $("#gMateriais").innerHTML = !lm.length ? `<div class="vazio">Nenhum material do carro registrado no período.</div>` : `
      <p class="resumo-mat"><b>${osComMat}</b> de ${concl.length + linhas.filter((r) => r.status === "AGUARDANDO CONFIRMAÇÃO").length} OS finalizadas usaram material do carro · <b>${lm.length}</b> produtos diferentes</p>
      <div class="tabela-rolagem"><table><thead><tr><th>Código</th><th>Produto</th><th class="n">Quantidade</th><th class="n">OS</th></tr></thead>
      <tbody>${lm.map((m) => `<tr class="fixa"><td>${esc(m.codigo)}</td><td>${esc(m.material)}</td><td class="n">${fmtQtd(m.qtd)} ${esc(m.unidade)}</td><td class="n">${m.os.size}</td></tr>`).join("")}</tbody></table></div>`;

    desenharTabela(true);
  }

  $("#vSeg").onclick = (e) => {
    const b = e.target.closest("[data-v]"); if (!b) return;
    for (const x of $("#vSeg").children) x.setAttribute("aria-selected", x === b);
    for (const v of ["geral", "prio", "equipe", "locais", "materiais", "lista"]) $("#v" + v[0].toUpperCase() + v.slice(1)).hidden = v !== b.dataset.v;
  };
  $("#vPer").onchange = () => { const x = $("#vPer").value === "x"; $("#lDe").hidden = $("#lAte").hidden = !x; carregar(); };
  $("#vDe").onchange = $("#vAte").onchange = $("#vNuc").onchange = carregar;
  $("#fStatus").onclick = (e) => { const b = e.target.closest(".chip"); if (b) { filtroStatus = b.dataset.k; desenharTabela(true); } };
  $("#tbLead").onclick = (e) => { const tr = e.target.closest("tr[data-os]"); if (tr) abrirDetalhe(+tr.dataset.os); };
  $("#vMais").onclick = () => desenharTabela(false);
  S.recarregar = carregar;
  await carregar();
}

/* ---------- ETAPA 2: Administrador — usuários ---------- */
async function adminUsuarios(body) {
  const { data, error } = await sb.functions.invoke("admin-usuarios", { body });
  if (error) {
    let msg = error.message;
    try { msg = (await error.context.json()).erro || msg; } catch { /* resposta sem JSON */ }
    throw new Error(msg);
  }
  return data;
}
async function recarregarUsuarios() {
  const { data, error } = await sb.from("usuarios").select("id,nome,login,perfis,ativo").order("nome");
  if (error) throw error;
  S.usuarios = Object.fromEntries(data.map((u) => [u.id, u]));
}
async function telaUsuarios() {
  S.recarregar = null;
  const u = Object.values(S.usuarios).sort((a, b) => (b.ativo - a.ativo) || a.nome.localeCompare(b.nome));
  $("#tela").innerHTML = `${topo("Usuários", "Cadastre pessoas e defina o que cada uma pode fazer.")}
    <div class="acoes" style="margin-bottom:12px"><button class="btn primario" id="btnNovoUsu">Cadastrar usuário</button></div>
    <div class="tabela-rolagem"><table><thead><tr><th>Nome</th><th>Login</th><th>Perfis</th><th>Acesso</th></tr></thead>
    <tbody id="tbUsu">${u.map((x) => `<tr data-id="${x.id}" class="${x.ativo ? "" : "inativo"}"><td class="pessoa" data-ini="${iniciais(x.nome)}">${esc(x.nome)}</td><td>${esc(x.login)}</td>
      <td>${x.perfis.map((p) => `<span class="tag">${PERFIS[p].nome.split(" /")[0]}</span>`).join("")}</td>
      <td><span class="acesso ${x.ativo ? "sim" : "nao"}">${x.ativo ? "Liberado" : "Retirado"}</span></td></tr>`).join("")}</tbody></table></div>
    <p class="nota">Toque em um usuário para alterar perfis, retirar/conceder acesso ou redefinir a senha.</p>`;
  $("#btnNovoUsu").onclick = () => formUsuario(null);
  $("#tbUsu").onclick = (e) => { const tr = e.target.closest("tr[data-id]"); if (tr) formUsuario(S.usuarios[tr.dataset.id]); };
}
function formUsuario(u) {
  const m = $("#modal"), novo = !u;
  const checks = Object.entries(PERFIS).map(([k, p]) => `<label><input type="checkbox" name="perfil" value="${k}" ${u?.perfis.includes(k) ? "checked" : ""}>
    ${p.nome} <span class="nota">(${p.faz})</span></label>`).join("");
  $("#modalCorpo").innerHTML = `
    <div class="det-topo"><h2>${novo ? "Cadastrar usuário" : esc(u.nome)}</h2><button class="fechar" aria-label="Fechar">×</button></div>
    <form id="fUsu" style="margin-top:14px">
      <label>Nome completo<input name="nome" required value="${esc(u?.nome ?? "")}"></label>
      <label>Login (usado para entrar)<input name="login" required autocapitalize="none" pattern="[a-zA-Z0-9._\\-]{2,40}" title="2 a 40 caracteres, sem espaço: letras, números, ponto, hífen ou _"
        value="${esc(u?.login ?? "")}" ${novo ? "" : "disabled"}></label>
      ${novo ? `<label>Senha inicial (mín. 8 caracteres)<input name="senha" type="text" minlength="8" required></label>` : ""}
      <strong>Perfis</strong><div class="perfis">${checks}</div>
      ${novo ? "" : `<label style="display:flex;gap:8px;align-items:center;font-weight:600"><input type="checkbox" name="ativo" style="width:20px;height:20px;min-height:0;margin:0" ${u.ativo ? "checked" : ""}> Acesso liberado</label>`}
      <p class="erro" id="erroUsu"></p>
      <button class="btn primario" type="submit">${novo ? "Cadastrar" : "Salvar alterações"}</button>
    </form>
    ${novo ? "" : `<div class="painel-acao"><label>Nova senha (mín. 8 caracteres)<input id="novaSenha" type="text" minlength="8"></label>
      <button class="btn" id="btnSenha">Redefinir senha</button></div>`}`;
  $(".fechar").onclick = () => m.close();
  const f = $("#fUsu");
  f.onsubmit = (ev) => {
    ev.preventDefault();
    const perfis = [...f.querySelectorAll("[name=perfil]:checked")].map((c) => c.value);
    if (!perfis.length && (novo || f.ativo.checked)) { $("#erroUsu").textContent = "Marque pelo menos um perfil."; return; }
    comBotao($("button[type=submit]", f), async () => {
      if (novo) await adminUsuarios({ acao: "criar", nome: f.nome.value, login: f.login.value, senha: f.senha.value, perfis });
      else await adminUsuarios({ acao: "atualizar", id: u.id, nome: f.nome.value, perfis, ativo: f.ativo.checked });
      await recarregarUsuarios();
      m.close(); aviso(novo ? "Usuário cadastrado." : "Alterações salvas."); telaUsuarios();
    });
  };
  if (!novo) $("#btnSenha").onclick = (e) => {
    const s = $("#novaSenha").value;
    if (s.length < 8) return aviso("A senha precisa ter pelo menos 8 caracteres.", true);
    comBotao(e.target, async () => { await adminUsuarios({ acao: "senha", id: u.id, senha: s }); $("#novaSenha").value = ""; aviso("Senha redefinida."); });
  };
  if (!m.open) m.showModal();
}

/* ---------- início ---------- */
aplicarMarca();
sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") mostrarLogin(); });
iniciar().catch((e) => mostrarLogin(msgErro(e)));
