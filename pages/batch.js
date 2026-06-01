/* ========= Page: Batch Download ========= */
async function PageBatch({params}){
  const app = document.getElementById("app");
  document.title = "Batch Download | LENZ ANIME NONTON";
  app.innerHTML = `<div class="state"><div class="emoji">⬇</div><h3>Memuat data batch…</h3></div>`;
  try{
    const data = await LenzAPI.batch(params.slug);
    const b = data.data || data;
    const title = b.title || params.slug;
    const downloads = LenzAPI.extractList({data:b}, "download_list","downloads","batch","links");

    if(!downloads.length){ app.innerHTML = LenzUI.emptyHTML("Belum ada link batch untuk anime ini."); return; }

    app.innerHTML = `
      <section class="section">
        <div class="section-head"><h2>⬇ Batch ${LenzUI.escapeHTML(title)}</h2></div>
        <div class="batch-grid">
          ${downloads.map(group => {
            const name = group.resolution || group.quality || group.name || "Link";
            const links = LenzAPI.extractList({data:group}, "urls","links","mirror");
            return `<div class="batch-card">
              <h4>${LenzUI.escapeHTML(name)}</h4>
              <div class="links">
                ${links.map(l=>`<a href="${l.url||l.href||l}" target="_blank" rel="noopener">${LenzUI.escapeHTML(l.host||l.name||l.provider||'Download')} →</a>`).join("")}
              </div>
            </div>`;
          }).join("")}
        </div>
      </section>`;
  }catch(err){ LenzError.show(err); }
}
