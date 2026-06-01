/* ========= Page: Search (Pencarian Anime) ========= */
async function PageSearch(props) {
  // Ambil data params dari router bawaanmu (bisa berupa props langsung atau properti di dalamnya)
  const params = props?.params || props || {};
  
  // Deteksi kata kunci dari berbagai kemungkinan rute bawaan (slug atau keyword)
  const currentQuery = params.slug || params.keyword || params.q || "";

  const app = document.getElementById("app");
  document.title = "Cari Anime | LENZ ANIME NONTON";

  // 1. RENDER TAMPILAN UTAMA (TETAP MOBILE FRIENDLY, ANTI MODE DESKTOP)
  app.innerHTML = `
    <section class="section">
      <div class="section-head">
        <h2>🔍 Pencarian</h2>
      </div>
      
      <div class="search-box-wrap" style="padding: 0 16px 20px 16px;">
        <form id="search-form" style="display: flex; gap: 8px; width: 100%;">
          <input 
            type="text" 
            id="search-input" 
            class="input-control" 
            placeholder="Ketik judul anime di sini..." 
            value="${LenzUI.escapeHTML(currentQuery)}"
            style="flex: 1; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg-2); color: #fff; font-size: 14px; outline: none;"
          />
          <button 
            type="submit" 
            class="btn" 
            style="background: linear-gradient(135deg, var(--primary), var(--accent)); color: #fff; border: none; border-radius: 8px; padding: 0 20px; font-weight: bold; cursor: pointer;"
          >
            Cari
          </button>
        </form>
      </div>

      <div id="search-results">
        <div class="state">
          <div class="emoji">🔍</div>
          <h3>Mulai mencari anime</h3>
          <p>Ketik judul anime di kolom pencarian di atas.</p>
        </div>
      </div>
    </section>
  `;

  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const resultsWrap = document.getElementById("search-results");

  // Fokuskan otomatis ke kolom input biar keyboard HP langsung naik
  searchInput.focus();

  // 2. ENGINE FETCH & RENDER DATA (LANGSUNG DARI API)
  async function executeSearch(keyword) {
    if (!keyword || keyword.trim() === "") return;
    
    resultsWrap.innerHTML = `
      <div class="state">
        <div class="emoji">⏳</div>
        <h3>Mencari "${LenzUI.escapeHTML(keyword)}"...</h3>
      </div>`;
      
    try {
      const res = await LenzAPI.search(keyword); 
      const list = res.data || res;
      
      if (!Array.isArray(list) || list.length === 0) {
        resultsWrap.innerHTML = `
          <div class="state">
            <div class="emoji">😥</div>
            <h3>Anime tidak ditemukan</h3>
            <p>Coba gunakan kata kunci atau judul lainnya.</p>
          </div>`;
        return;
      }

      // Tampilkan hasil pencarian ke dalam grid anime
      resultsWrap.innerHTML = `
        <div class="anime-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; padding: 0 16px 80px 16px;">
          ${list.map(anime => {
            const slug = anime.slug || anime.endpoint || anime.id || "";
            const title = anime.title || anime.name || "Untitled";
            const img = anime.image || anime.thumb || anime.thumbnail || "";
            const type = anime.type || anime.status || "";
            
            return `
              <a href="#/anime/${encodeURIComponent(slug)}" class="anime-card" style="text-decoration: none; color: inherit; display: block;">
                <div style="position: relative; padding-top: 140%; border-radius: 8px; overflow: hidden; background: var(--bg-2); border: 1px solid var(--border);">
                  <img src="${img}" alt="${LenzUI.escapeHTML(title)}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                  ${type ? `<span style="position: absolute; top: 6px; left: 6px; background: rgba(0,0,0,0.75); padding: 3px 6px; font-size: 10px; border-radius: 4px; font-weight: bold; color: var(--accent);">${type}</span>` : ""}
                </div>
                <h4 style="margin: 8px 0 0 0; font-size: 13px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 500;">
                  ${LenzUI.escapeHTML(title)}
                </h4>
              </a>
            `;
          }).join("")}
        </div>
      `;
    } catch (err) {
      resultsWrap.innerHTML = `
        <div class="state">
          <div class="emoji">💥</div>
          <h3>Gagal memuat pencarian</h3>
          <p>${LenzUI.escapeHTML(err.message || String(err))}</p>
        </div>`;
    }
  }

  // Jika dari halaman lain user membawa query pencarian, langsung eksekusi
  if (currentQuery && currentQuery.trim() !== "") {
    await executeSearch(currentQuery.trim());
  }

  // FIX: DI-TEMBAK LANGSUNG SAAT DI-KLIK TANPA HARUS RELOAD ROUTER SPA
  searchForm.onsubmit = async (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (q === "") return;
    
    // Eksekusi fungsi pencarian secara direct ke DOM
    await executeSearch(q);
  };
}
