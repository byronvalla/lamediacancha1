
function mountHeader(active){
  const header = document.querySelector("#siteHeader");
  if(!header) return;

  const links = [
    ["index.html","Portada"],
    ["futbol-chileno.html","Fútbol Chileno"],
    ["premier-league.html","Premier"],
    ["la-liga.html","LaLiga"],
    ["champions.html","Champions"],
    ["serie-a.html","Serie A"],
    ["en-vivo.html","En Vivo"]
  ];

  header.innerHTML = `
    <header class="topbar">
      <div class="container topbar__inner">
        <a class="brand" href="index.html">
          <div class="brand__mark" aria-hidden="true"></div>
          <div>
            <div class="brand__name">LaMediaCancha</div>
            <div class="brand__tag">Fútbol chileno e internacional</div>
          </div>
        </a>

        <nav class="nav" aria-label="Secciones">
          ${links.map(([href,label]) => `
            <a class="nav__link ${active===href?'is-active':''}" href="${href}">${label}</a>
          `).join("")}
        </nav>

        <div class="topbar__actions">
          <div class="search" role="search">
            <span class="search__icon" aria-hidden="true">🔎</span>
            <input id="searchInput" class="search__input" placeholder="Buscar noticia o equipo..." />
          </div>
          <button class="btn hamburger" id="btnMenu" aria-label="Abrir menú">☰</button>
          <a class="btn btn--live" href="en-vivo.html"><span class="blink" aria-hidden="true"></span> EN VIVO</a>
          <a class="btn btn--white" href="/admin/">Publicar</a>
        </div>
      </div>

      <div class="container mobile" id="mobileMenu">
        ${links.map(([href,label]) => `<a href="${href}">${label}</a>`).join("")}
        <a href="/admin/">Publicar</a>
      </div>
    </header>
  `;

  const btnMenu = header.querySelector("#btnMenu");
  const mobileMenu = header.querySelector("#mobileMenu");
  btnMenu?.addEventListener("click", ()=> mobileMenu.classList.toggle("is-show"));
}

function mountFooter(){
  const footer = document.querySelector("#siteFooter");
  if(!footer) return;
  footer.innerHTML = `
    <footer class="footer">
      <div class="container footer__inner">
        <div class="brand" style="min-width:auto">
          <div class="brand__mark" style="width:34px;height:34px;border-radius:12px" aria-hidden="true"></div>
          <div>
            <div style="font-weight:950;text-transform:uppercase">LaMediaCancha</div>
            <div style="font-size:12px;color:var(--muted)">© <span id="year"></span> • Noticias y resultados</div>
          </div>
        </div>
        <div class="footer__links">
          <a href="futbol-chileno.html">Chile</a>
          <a href="premier-league.html">Premier</a>
          <a href="la-liga.html">LaLiga</a>
          <a href="champions.html">Champions</a>
          <a href="serie-a.html">Serie A</a>
          <a href="en-vivo.html">En Vivo</a>
        </div>
      </div>
      <div class="container footer__fine">Imágenes: Unsplash (licencia libre). Puedes reemplazarlas cuando quieras.</div>
    </footer>
  `;
  document.querySelector("#year").textContent = new Date().getFullYear();
}
