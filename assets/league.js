
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

function safe(v, fb=""){ return (typeof v==="string" && v.trim().length) ? v.trim() : fb; }

async function loadJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  return res.json();
}

function newsHref(n){
  const u = safe(n.url,"");
  return u ? u : `noticia.html?file=${encodeURIComponent(n.__file||"")}`;
}

function renderNewsCard(n){
  const label = safe(n.league, "Deportes");
  const title = safe(n.title, "Noticia");
  const excerpt = safe(n.excerpt, "");
  const date = formatDate(n.date);
  const reading = safe(n.readingTime, "2 min");
  const cover = safe(n.coverImage, "");

  const card = document.createElement("article");
  card.className = "card news";
  card.dataset.title = title.toLowerCase();

  card.innerHTML = `
    <div class="news__cover" style="background-image: linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,.35)), url('${cover || ""}')">
      <span class="news__label">${label}</span>
    </div>
    <div class="news__body">
      <h3 class="news__title">${title}</h3>
      <p class="news__excerpt">${excerpt}</p>
    </div>
    <div class="news__foot">
      <span>${date}</span>
      <span>${reading} • Leer →</span>
    </div>
  `;

  const href = newsHref(n);
  card.addEventListener("click", () => {
    if (safe(n.url,"")) window.open(href, "_blank", "noopener");
    else window.location.href = href;
  });

  return card;
}

async function loadAllNews(){
  const index = await loadJSON("content/news-index.json");
  const files = Array.isArray(index) ? index : (index.items || []).map(x=>x.file);
  const items = await Promise.all(files.map(async (f)=>{
    const obj = await loadJSON(`content/news/${f}`);
    obj.__file = f;
    return obj;
  }));
  return items.filter(Boolean).sort((a,b)=> new Date(b.date) - new Date(a.date));
}

function hookSearch(){
  const input = $("#searchInput");
  input?.addEventListener("input", (e)=>{
    const q = (e.target.value || "").toLowerCase().trim();
    $$("[data-title]").forEach(el=>{
      const title = (el.dataset.title || "").toLowerCase();
      el.style.display = title.includes(q) ? "" : "none";
    });
  });
}

async function init(){
  const league = document.body.dataset.league || "";
  const page = document.body.dataset.page || "";
  mountHeader(page); mountFooter(); hookSearch();

  const news = await loadAllNews();
  $("#pageTitle").textContent = league;
  const grid = $("#leagueGrid");
  grid.innerHTML = "";
  news.filter(n=>safe(n.league,"")===league).forEach(n=> grid.appendChild(renderNewsCard(n)));
}
init();
