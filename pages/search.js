/* ========= Page: Search ========= */
async function PageSearch({query}){
  const currentQuery = query?.q || "";
  document.title = `Cari "${currentQuery}" | LENZ ANIME NONTON`;
  const app = document.getElementById("app");
  
  // 1. RENDER STRUKTUR HALAMAN + KOLOM INPUT KHUSUS MOBILE
  app.innerHTML = `
    <section class="section">
      <div class="section-head">
        <h2 id="search-title">🔍 Pencarian: "${LenzUI.escapeHTML(currentQuery)}"</h2>
      </div>
      
      <!-- Kolom Pencarian Baru (Lega di HP, Anti-Amblas) -->
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

      <!-- Grid Tempat Menampilkan Hasil Menggunakan Mesin Bawaan Lenz -->
      <div id="search-grid">${currentQuery ? LenzUI.skeletonGrid(8) : ''}</div>
    </section>`;

  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const grid = document.getElementById("search-grid");
  const searchTitle = document.getElementById("search-title");

  // Otomatis fokus ke kolom input saat menu search dibuka di HP
  searchInput.focus();

  // 2. FUNGSI EKSEKUSI PENCARIAN (100% ENGINE ASLI MILIKMU)
  async function executeSearch(q) {
    if (!q) {
      grid.innerHTML = `<div class="state"><div class="emoji">🔎</div><h3>Mulai mencari anime</h3><p>Ketik judul anime di kolom pencarian.</p></div>`;
      return;
    }
    
    // Update judul & skeleton secara realtime saat user mengetik judul baru
    document.title = `Cari "${q}" | LENZ ANIME NONTON`;
    searchTitle.innerHTML = `🔍 Pencarian: "${LenzUI.escapeHTML(q)}"`;
    grid.innerHTML = LenzUI.skeletonGrid(8);
    
    try {
      const data = await LenzAPI.search(q);
      const items = LenzAPI.extractList(data, "animeList", "results", "data", "anime");
      
      if (!items.length) { 
        grid.innerHTML = LenzUI.emptyHTML(); 
        return; 
      }
      
      // Render data memakai engine asli aplikasimu agar gambar dan style poster muncul sempurna
      grid.innerHTML = LenzUI.gridHTML(items);
      LenzImg.scan(grid); 
      LenzUI.upgradePosters(grid);
    } catch (err) { 
      LenzError.show(err); 
    }
  }

  // Jalankan pencarian otomatis jika link membawa query dari luar (misal: klik genre/rekomendasi)
  if (currentQuery) {
    await executeSearch(currentQuery);
  } else {
    grid.innerHTML = `<div class="state"><div class="emoji">🔎</div><h3>Mulai mencari anime</h3><p>Ketik judul anime di kolom pencarian.</p></div>`;
  }

  // INTERAKSI TOMBOL CARI (DITEMBAK LANGSUNG TANPA MENUNGGU SPA REFRESH)
  searchForm.onsubmit = async (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    
    // Tetap update link URL hash biar history tombol 'back' browser tidak rusak
    location.hash = `#/search?q=${encodeURIComponent(q)}`;
    
    // Tembak pencarian langsung ke DOM agar instan keluar hasilnya
    await executeSearch(q);
  };
}
