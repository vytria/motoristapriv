/* João Motorista Particular - GitHub-only
   - Geocoding: Nominatim (OpenStreetMap)
   - Routing: OSRM demo (router.project-osrm.org)
   - Fallback: KM manual
*/

let CONFIG = null;

const el = (id) => document.getElementById(id);

function moneyBRL(value) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function toNumber(v) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function setMonthlyMode(isMonthly) {
  document.body.classList.toggle("monthly", isMonthly);
}

function buildWhatsAppUrl(message) {
  const phone = CONFIG?.business?.whatsapp_e164 || "";
  const base = `https://wa.me/${phone}`;
  const text = encodeURIComponent(message);
  return `${base}?text=${text}`;
}

function normalizePlaceQuery(q) {
  const suffix = CONFIG?.routing?.force_city_suffix || ", Lages, SC, Brasil";
  const trimmed = (q || "").trim();
  if (!trimmed) return "";
  // Se o usuário já escreveu "Lages" ou "SC", não força duplicado demais
  const lower = trimmed.toLowerCase();
  if (lower.includes("lages") || lower.includes("sc")) return trimmed;
  return trimmed + suffix;
}

async function loadConfig() {
  const res = await fetch("config.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Não foi possível carregar config.json");
  CONFIG = await res.json();

  // Atualiza dados do WhatsApp
  el("displayPhone").textContent = CONFIG.business.whatsapp_display || "WhatsApp";
  const mainUrl = buildWhatsAppUrl(
    `Olá, João! Quero informações sobre corridas particulares em ${CONFIG.business.city}/${CONFIG.business.state}.`
  );
  el("btnWhatsMain").href = mainUrl;

  // Botões do topo e planos
  el("btnHeroWhats").href = mainUrl;
  el("btnPlanWhats").href = mainUrl;

  // Nota do config
  const ppk = CONFIG?.pricing?.price_per_km;
  const baseFee = CONFIG?.pricing?.base_fee;
  const minFare = CONFIG?.pricing?.minimum_fare;
  if (typeof ppk !== "number" || typeof baseFee !== "number" || typeof minFare !== "number") {
    el("configNote").textContent = "Atenção: configure os preços no config.json para o cálculo ficar correto.";
  } else {
    el("configNote").textContent =
      `Config atual: ${moneyBRL(ppk)}/km • taxa base ${moneyBRL(baseFee)} • mínimo ${moneyBRL(minFare)}.`;
  }
}

async function geocodeNominatim(place) {
  // Nominatim exige User-Agent em apps, mas no browser não dá para setar header UA.
  // Ainda assim costuma funcionar para baixo volume.
  const url =
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha no geocode");
  const data = await res.json();
  if (!data || !data[0]) throw new Error("Endereço não encontrado");
  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    display: data[0].display_name || place
  };
}

async function routeOSRM(from, to) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha no cálculo de rota");
  const data = await res.json();
  if (!data || !data.routes || !data.routes[0]) throw new Error("Rota não encontrada");
  const meters = data.routes[0].distance;
  return meters / 1000;
}

function calcFare(km) {
  const ppk = CONFIG.pricing.price_per_km;
  const baseFee = CONFIG.pricing.base_fee;
  const minFare = CONFIG.pricing.minimum_fare;

  const raw = (km * ppk) + baseFee;
  const fare = Math.max(minFare, raw);
  return { raw, fare };
}

function monthlyTotal(farePerRide, ridesPerDay, daysPerMonth) {
  const discount = CONFIG?.pricing?.monthly_discount_percent || 0;
  const totalRides = ridesPerDay * daysPerMonth;
  const raw = farePerRide * totalRides;
  const final = raw * (1 - (discount / 100));
  return { totalRides, raw, final, discount };
}

function setResultState(state, text) {
  const badge = el("resultBadge");
  badge.textContent = text || "Pronto";
  if (state === "loading") {
    badge.style.borderColor = "rgba(251,191,36,.35)";
    badge.style.background = "rgba(251,191,36,.08)";
    badge.style.color = "rgba(233,238,252,.85)";
  } else if (state === "error") {
    badge.style.borderColor = "rgba(239,68,68,.35)";
    badge.style.background = "rgba(239,68,68,.08)";
    badge.style.color = "rgba(233,238,252,.90)";
  } else {
    badge.style.borderColor = "rgba(255,255,255,.12)";
    badge.style.background = "rgba(255,255,255,.05)";
    badge.style.color = "rgba(233,238,252,.72)";
  }
}

function buildTerms(isMonthly, ridesPerDay, daysPerMonth) {
  const monthlyText = CONFIG?.rules?.monthly_payment_terms || "Plano mensal: 50% antecipado + 50% no fechamento do mês.";
  const singleText = CONFIG?.rules?.single_payment_terms || "Avulso: pagamento ao final da corrida ou antes.";
  const guarantee = CONFIG?.rules?.support_guarantee || "";

  if (isMonthly) {
    return `
      <ul>
        <li><strong>${monthlyText}</strong></li>
        <li><strong>Rotina:</strong> ${ridesPerDay} corrida(s) por dia • ${daysPerMonth} dia(s) no mês.</li>
        ${guarantee ? `<li><strong>Garantia:</strong> ${guarantee}</li>` : ""}
      </ul>
    `;
  }
  return `
    <ul>
      <li><strong>${singleText}</strong></li>
      ${guarantee ? `<li><strong>Garantia:</strong> ${guarantee}</li>` : ""}
    </ul>
  `;
}

function buildWhatsMessage(params) {
  const city = `${CONFIG.business.city}/${CONFIG.business.state}`;

  if (params.isMonthly) {
    return [
      `Olá, João! Quero fechar um PLANO MENSAL em ${city}.`,
      ``,
      `Origem: ${params.origin}`,
      `Destino: ${params.destination}`,
      `Distância estimada: ${params.km.toFixed(1)} km`,
      `Valor por corrida (estimado): ${moneyBRL(params.farePerRide)}`,
      `Corridas por dia: ${params.ridesPerDay}`,
      `Dias no mês: ${params.daysPerMonth}`,
      `Total de corridas: ${params.totalRides}`,
      `Total mensal (estimado): ${moneyBRL(params.monthlyFinal)}`,
      ``,
      `Forma de pagamento (mensal): 50% antecipado + 50% no fechamento do mês.`,
      ``,
      `Pode confirmar disponibilidade e horário?`
    ].join("\n");
  }

  return [
    `Olá, João! Quero uma corrida AVULSA em ${city}.`,
    ``,
    `Origem: ${params.origin}`,
    `Destino: ${params.destination}`,
    `Distância estimada: ${params.km.toFixed(1)} km`,
    `Valor estimado: ${moneyBRL(params.farePerRide)}`,
    ``,
    `Pagamento: ao final da corrida ou antes, a meu critério.`,
    ``,
    `Pode confirmar disponibilidade e horário?`
  ].join("\n");
}

async function handleCalc() {
  const serviceType = el("serviceType").value;
  const isMonthly = serviceType === "mensal";
  setMonthlyMode(isMonthly);

  const originRaw = el("origin").value.trim();
  const destRaw = el("destination").value.trim();
  const manualKmRaw = el("manualKm").value;

  const ridesPerDay = clamp(parseInt(el("ridesPerDay").value || "2", 10), 1, 20);
  const daysPerMonth = clamp(parseInt(el("daysPerMonth").value || "22", 10), 1, 31);

  el("termsBody").innerHTML = buildTerms(isMonthly, ridesPerDay, daysPerMonth);

  if (!originRaw || !destRaw) {
    setResultState("error", "Faltam dados");
    el("resultSubtitle").textContent = "Informe origem e destino para calcular o orçamento.";
    return;
  }

  // Validação preço
  const ppk = CONFIG?.pricing?.price_per_km;
  const baseFee = CONFIG?.pricing?.base_fee;
  const minFare = CONFIG?.pricing?.minimum_fare;
  if (![ppk, baseFee, minFare].every((x) => typeof x === "number" && Number.isFinite(x) && x >= 0)) {
    setResultState("error", "Config");
    el("resultSubtitle").textContent = "Configure os preços no config.json (price_per_km, base_fee, minimum_fare).";
    return;
  }

  setResultState("loading", "Calculando...");
  el("resultSubtitle").textContent = "Calculando distância e valor estimado...";

  let km = NaN;
  let kmSource = "";

  // 1) Tenta KM manual se informado
  const manualKm = toNumber(manualKmRaw);
  if (Number.isFinite(manualKm) && manualKm > 0) {
    km = manualKm;
    kmSource = "KM informado manualmente.";
  } else {
    // 2) Tenta cálculo automático via OSM+OSRM
    try {
      const originQ = normalizePlaceQuery(originRaw);
      const destQ = normalizePlaceQuery(destRaw);

      const from = await geocodeNominatim(originQ);
      const to = await geocodeNominatim(destQ);

      const kmAuto = await routeOSRM(from, to);
      if (!Number.isFinite(kmAuto) || kmAuto <= 0) throw new Error("KM inválido");
      km = kmAuto;
      kmSource = "Distância calculada automaticamente.";
    } catch (err) {
      km = NaN;
      kmSource = "";
    }
  }

  if (!Number.isFinite(km) || km <= 0) {
    setResultState("error", "Falhou");
    el("resultSubtitle").textContent =
      "Não consegui calcular automaticamente. Informe o KM manual (campo “KM manual”) e tente novamente.";
    el("kmValue").textContent = "—";
    el("kmFoot").textContent = "Use KM manual.";
    el("fareLabel").textContent = isMonthly ? "Valor por corrida" : "Valor estimado";
    el("fareValue").textContent = "—";
    el("fareFoot").textContent = "—";
    el("monthlyValue").textContent = "—";
    el("monthlyFoot").textContent = "—";
    return;
  }

  // Cálculo de valores
  const { raw, fare } = calcFare(km);
  el("kmValue").textContent = `${km.toFixed(1)} km`;
  el("kmFoot").textContent = kmSource || "—";

  el("fareLabel").textContent = isMonthly ? "Valor por corrida" : "Valor estimado";
  el("fareValue").textContent = moneyBRL(fare);

  const breakdown = `(${km.toFixed(1)} km × ${moneyBRL(CONFIG.pricing.price_per_km)}) + taxa ${moneyBRL(CONFIG.pricing.base_fee)} = ${moneyBRL(raw)} • mínimo ${moneyBRL(CONFIG.pricing.minimum_fare)}`;
  el("fareFoot").textContent = breakdown;

  // Mensal
  let monthlyInfo = null;
  if (isMonthly) {
    monthlyInfo = monthlyTotal(fare, ridesPerDay, daysPerMonth);
    el("monthlyValue").textContent = moneyBRL(monthlyInfo.final);

    const parts = [];
    parts.push(`${monthlyInfo.totalRides} corrida(s) no mês`);
    if (monthlyInfo.discount > 0) {
      parts.push(`desconto ${monthlyInfo.discount}% aplicado`);
    } else {
      parts.push(`sem desconto configurado`);
    }
    parts.push(`pagamento: 50% antecipado + 50% no fechamento do mês`);
    el("monthlyFoot").textContent = parts.join(" • ");
  }

  // Atualiza regras
  el("termsBody").innerHTML = buildTerms(isMonthly, ridesPerDay, daysPerMonth);

  // WhatsApp orçamento
  const msg = buildWhatsMessage({
    isMonthly,
    origin: originRaw,
    destination: destRaw,
    km,
    farePerRide: fare,
    ridesPerDay,
    daysPerMonth,
    totalRides: monthlyInfo?.totalRides || 1,
    monthlyFinal: monthlyInfo?.final || fare
  });

  const url = buildWhatsAppUrl(msg);
  el("btnWhatsQuote").href = url;
  el("btnWhatsQuote").setAttribute("target", "_blank");
  el("btnWhatsQuote").setAttribute("rel", "noopener");

  // Subtítulo
  setResultState("ok", "Calculado");
  if (isMonthly) {
    el("resultSubtitle").textContent =
      "Orçamento mensal estimado pronto. Clique em “Enviar orçamento no WhatsApp” para fechar.";
  } else {
    el("resultSubtitle").textContent =
      "Orçamento avulso estimado pronto. Clique em “Enviar orçamento no WhatsApp” para confirmar.";
  }
}

function setLiveStatusText() {
  // Texto simples de status sem depender de hora do usuário (pode estar diferente).
  // Mantém “ativo” visualmente.
  el("statusText").textContent = "Horários definidos • Demais dias sob consulta";
}

function bindUi() {
  // Tipo
  el("serviceType").addEventListener("change", () => {
    const isMonthly = el("serviceType").value === "mensal";
    setMonthlyMode(isMonthly);
    el("termsBody").innerHTML = buildTerms(isMonthly, Number(el("ridesPerDay").value), Number(el("daysPerMonth").value));
  });

  // Calcular
  el("calcBtn").addEventListener("click", handleCalc);

  // Inicializa termos
  el("termsBody").innerHTML = buildTerms(false, 2, 22);
}

(async function init() {
  try {
    await loadConfig();
    setLiveStatusText();
    bindUi();
    setMonthlyMode(false);
  } catch (e) {
    console.error(e);
    // Mostra fallback básico
    el("displayPhone").textContent = "(WhatsApp indisponível)";
    el("statusText").textContent = "Config não carregada";
    el("configNote").textContent = "Erro ao carregar config.json. Verifique se o arquivo existe na raiz do site.";
  }
})();
