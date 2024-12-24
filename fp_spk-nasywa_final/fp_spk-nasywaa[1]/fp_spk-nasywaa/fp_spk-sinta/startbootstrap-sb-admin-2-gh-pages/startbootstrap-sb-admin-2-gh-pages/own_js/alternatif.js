// Inisialisasi Supabase
const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Fungsi untuk mengambil semua data alternatif
fetchAllAlternatif();

async function fetchAllAlternatif() {
  try {
    // Memanggil fungsi RPC get_all_alternatif
    const { data, error } = await supabase.rpc("get_all_alternatif");

    // Jika terjadi error, tampilkan di console
    if (error) {
      console.error("Error fetching alternatif data:", error);
      return;
    }

    // Debug: Log hasil data
    console.log("Hasil RPC get_all_alternatif:", data);

    // Tampilkan data alternatif
    showAllAlternatif(data);
  } catch (err) {
    console.error("Error saat fetching data:", err);
  }
}

// Fungsi untuk menampilkan data alternatif ke dalam HTML
function showAllAlternatif(alternatifList) {
  const alternatifContainer = document.getElementById("alternatif-container");

  // Membersihkan kontainer sebelum menambahkan data
  while (alternatifContainer.firstChild) {
    alternatifContainer.removeChild(alternatifContainer.firstChild);
  }

  // Iterasi untuk setiap alternatif
  alternatifList.forEach((alternatif) => {
    const alternatifCard = document.createElement("div");
    alternatifCard.className = "col-lg-3 col-md-6 mb-4";

    // Placeholder jika url_gambar kosong
    const imageUrl = alternatif.url_gambar || "../img/placeholder.jpg";

    // HTML untuk card
    alternatifCard.innerHTML = `
      <div class="card shadow h-100">
        <img
          src="${imageUrl}"
          class="card-img-top img-custom"
          alt="${alternatif.nama_alternatif || "Gambar Alternatif"}"
        />
        <div class="card-body">
          <h5 class="card-title">${alternatif.nama_alternatif || "Nama Alternatif"}</h5>
          <div class="d-flex justify-content-end">
            <a href="#" class="btn btn-primary" onclick="goToDetailPage(${alternatif.id})">Detail</a>
          </div>
        </div>
      </div>
    `;

    // Menambahkan card ke kontainer
    alternatifContainer.appendChild(alternatifCard);
  });
}

// Fungsi untuk navigasi ke halaman detail
function goToDetailPage(alternatifId) {
  // Redirect ke halaman detail dengan query parameter
  window.location.href = `../own_html/detail_alternatif.html?id=${alternatifId}`;
}




