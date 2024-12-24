// Inisialisasi Supabase
const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Mendapatkan parameter ID dari URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const kriteriaId = urlParams.get("id");
console.log("Kriteria ID:", kriteriaId);

// Memanggil data detail kriteria
fetchDetailKriteria(kriteriaId);

async function fetchDetailKriteria(kriteriaId) {
  try {
    // Memanggil fungsi RPC dari Supabase
    let { data, error } = await supabase.rpc("get_detail_kriteria", {
      k_id: kriteriaId,
    });

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    console.log("Data fetched:", data);

    // Proses hanya baris pertama dari data
    if (data && data.length > 0) {
      showDetailKriteria(data[0]); // Hanya baris pertama
      showSkalaKriteria(data);
    } else {
      console.warn("No data found for the given ID.");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

function showDetailKriteria(detailKriteria) {
  // Memperbarui elemen DOM dengan data baris pertama
  document.getElementById("imgKriteria").src = detailKriteria.url_gambar;
  document.getElementById(
    "kodeKriteria"
  ).textContent = `Kode Kriteria : ${detailKriteria.kode_kriteria}`;
  document.getElementById(
    "bobotKriteria"
  ).textContent = `Bobot : ${detailKriteria.bobot}`;
  document.getElementById("namaKriteria").value = detailKriteria.nama_kriteria;
  document.getElementById("prioritasKriteria").value = detailKriteria.prioritas;
  document.getElementById("jenisKriteria").value =
    detailKriteria.jenis_kriteria;
}

function showSkalaKriteria(listSkala) {
  const skalaKriteriaContainer = document.getElementById(
    "skala-kriteria-container"
  );
  while (skalaKriteriaContainer.firstChild) {
    skalaKriteriaContainer.removeChild(skalaKriteriaContainer.firstChild);
  }

  listSkala.forEach((skala) => {
    const skalaData = document.createElement("div");
    skalaData.className = "d-flex align-items-center mb-3";

    skalaData.innerHTML = `
    <label for="skalaKriteria" class="me-2 mb-0" style="flex-shrink: 0">
        ${skala.urutan_skala} :
    </label>
    <input
      type="text"
      class="form-control ms-2"
      value= "${skala.keterangan}"
      disabled
      style="margin-left: 10px"
    />
    `;

    skalaKriteriaContainer.appendChild(skalaData);
  });
}
