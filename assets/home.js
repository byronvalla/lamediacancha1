
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

function renderHero(main){
  const hero = $("#heroMain");
  hero.style.setProperty("--hero-img", `url('https://source.unsplash.com/WssrChikeeU/1920x1080')`);
  $("#heroTitle").textContent = safe(main.title,"Titular");
  $("#heroDesc").textContent = safe(main.excerpt,"");
  $("#heroMeta").textContent = `${safe(main.league,"")} • ${formatDate(main.date)} • ${safe(main.readingTime,"")}`;
  $("#heroBtn").setAttribute("href", newsHref(main));
}

function renderTopStory(main){
  $("#topStory").innerHTML = `
    <a class="topstory__link" href="${newsHref(main)}" ${safe(main.url,"") ? 'target="_blank" rel="noopener"' : ""}>
      <h3 class="topstory__title">${safe(main.title,"Noticia")}</h3>
      <div class="topstory__meta">${safe(main.league,"")} • ${formatDate(main.date)} • ${safe(main.readingTime,"")}</div>
    </a>
  `;
}

function renderTrending(news){
  const list = $("#trendingList");
  list.innerHTML = "";
  news.slice(0, 5).forEach((n,i)=>{
    const a = document.createElement("a");
    a.className = "trend";
    a.href = newsHref(n);
    if (safe(n.url,"")) { a.target="_blank"; a.rel="noopener"; }
    a.dataset.title = safe(n.title,"").toLowerCase();
    a.innerHTML = `
      <div class="trend__n">${i+1}</div>
      <div>
        <p class="trend__title">${safe(n.title,"Noticia")}</p>
        <div class="trend__meta">${safe(n.league,"")} • ${safe(n.readingTime,"2 min")}</div>
      </div>
    `;
    list.appendChild(a);
  });
}

function renderSection(news, league, mountId, max=6){
  const grid = document.querySelector(mountId);
  grid.innerHTML = "";
  news.filter(n=>safe(n.league,"")===league).slice(0,max).forEach(n=> grid.appendChild(renderNewsCard(n)));
}

async function loadLive(){
  const raw = await loadJSON("content/matches.json");
  const matches = Array.isArray(raw) ? raw : (raw.items || []);
  const list = $("#homeMatchList");
  list.innerHTML = "";
  matches.slice(0,6).forEach(m=>{
    const time = safe(m.time,"--:--");
    const league = safe(m.league,"Liga");
    const venue = safe(m.venue,"");
    const home = safe(m.home,"Local");
    const away = safe(m.away,"Visita");
    const hs = (m.homeScore ?? "");
    const as = (m.awayScore ?? "");
    const status = safe(m.status,"Programado");
    const score = (hs!=="" || as!=="") ? `${home} ${hs} - ${as} ${away}` : `${home} vs ${away}`;
    const meta = `${league}${venue? " • "+venue:""}`;
    const el = document.createElement("div");
    el.className="match";
    el.innerHTML = `
      <div class="match__left">
        <span class="chip">${time}</span>
        <div>
          <p class="match__title">${score}</p>
          <div class="match__meta">${meta}</div>
        </div>
      </div>
      <span class="status">${status}</span>
    `;
    list.appendChild(el);
  });
}

async function init(){
  mountHeader("index.html"); mountFooter(); hookSearch();
  const news = await loadAllNews();
  const main = news[0];
  if(main){ renderHero(main); renderTopStory(main); renderTrending(news); }
  renderSection(news, "Fútbol Chileno", "#gridChile", 6);
  renderSection(news, "Premier League", "#gridPremier", 6);
  renderSection(news, "LaLiga", "#gridLaLiga", 6);
  renderSection(news, "Champions", "#gridUCL", 6);
  renderSection(news, "Serie A", "#gridSerieA", 6);
  await loadLive();
}
init();
