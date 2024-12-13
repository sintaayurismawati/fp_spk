// inisialisasi Supabase
const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

fetchAllKriteria();

async function fetchAllKriteria() {
  let { data, error } = await supabase.rpc("get_all_kriteria");
  if (error) console.error(error);
  else console.log(data);

  console.log("Semua data kriteria:", data);
  showAllKriteria(data);
}

function showAllKriteria(kriteriaList) {
  const kriteriaContainer = document.getElementById("kriteria-container");
  while (kriteriaContainer.firstChild) {
    kriteriaContainer.removeChild(kriteriaContainer.firstChild);
  }

  kriteriaList.forEach((kriteria) => {
    const kriteriaCard = document.createElement("div");
    kriteriaCard.className = "col-lg-3 col-md-6 mb-4";

    kriteriaCard.innerHTML = `
    <div class="card shadow h-100">
        <img
            src="${kriteria.url_gambar}"
            class="card-img-top img-custom"
            alt="Kriteria"
        />
        <div class="card-body">
            <h5 class="card-title">${kriteria.nama_kriteria}</h5>
            <p class="card-text">Bobot : ${kriteria.bobot}</p>
            <div class="d-flex justify-content-end">
                <a href="#" class="btn btn-primary" onclick="goToDetailPage(${kriteria.id})">Detail</a>
            </div>
        </div>
    </div>
    `;

    kriteriaContainer.appendChild(kriteriaCard);
  });
}

function goToDetailPage(kriteriaId) {
  // Redirect to the detail page with the kriteria id as a query parameter
  window.location.href = `../own_html/detail_kriteria.html?id=${kriteriaId}`;
}