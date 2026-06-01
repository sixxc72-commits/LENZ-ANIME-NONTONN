/* ========= Page: Search ========= */
async function PageSearch({query}){
  // Pastikan query tidak undefined agar tidak menyebabkan error
  const currentQuery = query?.q || '';
  
  document.title = `Cari "${currentQuery}" | LENZ ANIME NONTON`;
  const app = document.getElementById("app");
  
  // 1. SISIPKAN INPUT BOX DI ATAS GRID (DESAIN SELEGA MODE DESKTOP, TAPI RAMAH HP)
  app.innerHTML = `
    <section class="section">
      <div class="section-head"><h2>🔍 Pencarian: "${LenzUI.escapeHTML(currentQuery)}"</h2></div>
      
      <div class="search-box-wrap" style="padding: 0 16px 20px 16px;">
        <form id="mobile-search-form" style="display: flex; gap: 8px; width: 100%;">
          <input 
            type="text" 
            id="mobile-search-input" 
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

      <div id="search-grid">${currentQuery ? LenzUI.skeletonGrid(8) : ''}</div>
    </section>`;

  // 2. LOGIKA TOMBOL CARI (RE-TRIGGER DENGAN STRUKTUR DATA ASLI)
  const form = document.getElementById("mobile-search-form");
  const input = document.getElementById("mobile-search-input");
  
  // Auto focus biar user tinggal ketik saat masuk halaman
  input.focus();

  form.onsubmit = (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    
    // Sinkronisasi alamat URL hash browser
    location.hash = `#/search?q=${encodeURIComponent(val)}`;
    
    // Panggil ulang fungsi ini secara mandiri dengan payload query asli milikmu
    PageSearch({ query: { q: val } });
  };

  // 3. JALUR FUNGSI FETCH & RENDER (100% ORIGINAL KODE KAMU)
  if(!currentQuery){
    document.getElementById("search-grid").innerHTML = `<div class="state"><div class="emoji">🔎</div><h3>Mulai mencari anime</h3><p>Ketik judul anime di kolom pencarian.</p></div>`;
    return;
  }
  try{
    const data = await LenzAPI.search(currentQuery);
    const items = LenzAPI.extractList(data,"animeList","results","data","anime");
    const grid = document.getElementById("search-grid");
    if(!items.length){ grid.innerHTML = LenzUI.emptyHTML(); return; }
    grid.innerHTML = LenzUI.gridHTML(items);
    LenzImg.scan(grid); LenzUI.upgradePosters(grid);
  }catch(err){ LenzError.show(err); }
}
