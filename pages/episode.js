/* ========= Page: Episode (Streaming) ========= */
async function PageEpisode({params}){
  const app = document.getElementById("app");
  app.innerHTML = `<div class="state"><div class="emoji">⏳</div><h3>Memuat episode…</h3></div>`;
  try{
    const data = await LenzAPI.episode(params.slug);
    const e = data.data || data;
    const title = e.title || e.episode_title || params.slug;
    document.title = `${title} | LENZ ANIME NONTON`;

    // 1. Ambil list server mentah dari API
    const rawServers = LenzAPI.extractList({data:e},"server_list","stream_list","mirror","streams","servers");
    
    // 2. FILTER AMAN: Buang link yang mengarah ke website utama Otakudesu/Localhost (bukan video player)
    const servers = rawServers.filter(s => {
      const urlStr = String(s.url || s.src || s.iframe || s.embed || "").toLowerCase();
      return urlStr && !urlStr.includes("otakudesu") && !urlStr.includes("localhost");
    });

    // 3. JALANKAN ENGINE DEFAULTSTREAMING CRAWLER
    let defaultIdx = 0;
    if (servers.length > 0) {
      // Cari server yang secara spesifik bernama/beralamat 'default' atau 'desustream'
      const foundIdx = servers.findIndex(s => {
        const name = String(s.name || s.title || "").toLowerCase();
        const urlStr = String(s.url || s.src || s.iframe || s.embed || "").toLowerCase();
        return name.includes("default") || name.includes("desustream") || urlStr.includes("desustream");
      });
      // Jika ketemu, kunci indeks server tersebut sebagai player utama
      if (foundIdx !== -1) {
        defaultIdx = foundIdx;
      }
    }

    // 4. PENENTUAN URL UTAMA (Prioritaskan hasil saringan list server)
    let defaultUrl = (servers[defaultIdx] && (servers[defaultIdx].url||servers[defaultIdx].src||servers[defaultIdx].iframe||servers[defaultIdx].embed)) || "";
    
    // Fallback terakhir ke stream_url bawaan JIKA dan hanya JIKA bukan web wrapper
    if (!defaultUrl) {
      const fallback = e.stream_url || e.url || "";
      if (!fallback.includes("otakudesu") && !fallback.includes("localhost")) {
        defaultUrl = fallback;
      }
    }

    const prev = e.previous_episode?.slug || e.prev?.slug || e.previous_slug || "";
    const next = e.next_episode?.slug || e.next?.slug || e.next_slug || "";
    const animeSlug = e.anime?.slug || e.anime_slug || "";
    const episodeList = LenzAPI.extractList({data:e},"episode_list","episodes");

    app.innerHTML = `
      <section class="section">
        <div class="section-head"><h2>${LenzUI.escapeHTML(title)}</h2></div>
        <div class="player-wrap" id="player-wrap"></div>

        <div class="player-controls">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-ghost" id="btn-prev" ${prev?'':'disabled'}>⏮ Prev</button>
            <button class="btn btn-ghost" id="btn-next" ${next?'':'disabled'}>Next ⏭</button>
            <label class="chip" style="cursor:pointer"><input type="checkbox" id="auto-next" style="margin-right:6px">Auto Next</label>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-ghost" id="btn-theater">🎭 Theater</button>
            <button class="btn btn-ghost" id="btn-pip">📺 PiP</button>
            <button class="btn btn-ghost" id="btn-fs">⛶ Fullscreen</button>
          </div>
        </div>

        ${servers.length ? `
        <div class="section-head"><h2>Pilih Server</h2></div>
        <div class="server-list">
          ${servers.map((s,i)=>`<button class="chip ${i===defaultIdx?'active':''}" data-url="${LenzUI.escapeHTML(s.url||s.src||s.iframe||s.embed||'')}">${LenzUI.escapeHTML(s.name||s.title||('Server '+(i+1)))}</button>`).join("")}
        </div>` : ""}

        ${animeSlug ? `<div style="padding:14px 16px"><a class="btn btn-ghost" href="#/anime/${encodeURIComponent(animeSlug)}">📄 Detail Anime</a></div>` : ""}

        ${episodeList.length ? `
        <div class="section-head"><h2>Episode Lain</h2></div>
        <div class="episode-list">
          ${episodeList.map(ep=>{
            const s = ep.slug||ep.endpoint||"";
            const n = ep.episode||ep.title||ep.number||s;
            return `<a href="#/episode/${encodeURIComponent(s)}">Ep ${LenzUI.escapeHTML(String(n))}</a>`;
          }).join("")}
        </div>` : ""}
      </section>
    `;

    const wrap = document.getElementById("player-wrap");
    LenzPlayer.render(wrap, defaultUrl);

    document.querySelectorAll(".server-list .chip").forEach(c=>{
      c.onclick = () => {
        document.querySelectorAll(".server-list .chip").forEach(x=>x.classList.remove("active"));
        c.classList.add("active");
        LenzPlayer.render(wrap, c.dataset.url);
      };
    });

    const prevBtn = document.getElementById("btn-prev");
    const nextBtn = document.getElementById("btn-next");
    if(prev) prevBtn.onclick = () => location.hash = `#/episode/${encodeURIComponent(prev)}`;
    if(next) nextBtn.onclick = () => location.hash = `#/episode/${encodeURIComponent(next)}`;

    document.getElementById("btn-theater").onclick = ()=>LenzPlayer.toggleTheater(wrap);
    document.getElementById("btn-pip").onclick = ()=>LenzPlayer.pip(wrap);
    document.getElementById("btn-fs").onclick = ()=>LenzPlayer.fullscreen(wrap);

    // Auto next
    const autoNext = document.getElementById("auto-next");
    autoNext.checked = localStorage.getItem("lenz_autonext") === "1";
    autoNext.onchange = ()=> localStorage.setItem("lenz_autonext", autoNext.checked?"1":"0");
    const v = wrap.querySelector("video");
    if(v){
      v.addEventListener("ended",()=>{ if(autoNext.checked && next) location.hash = `#/episode/${encodeURIComponent(next)}`; });
    }
  }catch(err){ LenzError.show(err); }
}
