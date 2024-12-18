// Inisialisasi Supabase
const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let skalaCounter = 3; // Mulai dari 3 karena 1 dan 2 sudah ada

function addSkalaKriteria() {
  const container = document.getElementById("skala-kriteria-container");

  const newDiv = document.createElement("div");
  newDiv.className = "d-flex align-items-center mb-3";
  newDiv.setAttribute("data-skala", skalaCounter);

  const newLabel = document.createElement("label");
  newLabel.setAttribute("for", `skalaKriteria${skalaCounter}`);
  newLabel.className = "me-2 mb-0";
  newLabel.style.flexShrink = "0";
  newLabel.textContent = `${skalaCounter} : `;

  const newInput = document.createElement("input");
  newInput.id = `skalaKriteria${skalaCounter}`;
  newInput.type = "text";
  newInput.className = "form-control ms-2";
  newInput.style.marginLeft = "10px";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-light ms-2 p-0 border-0";
  deleteBtn.innerHTML = '<i class="fas fa-trash text-danger"></i>';
  deleteBtn.onclick = function () {
    removeSkala(newDiv);
  };

  newDiv.appendChild(newLabel);
  newDiv.appendChild(newInput);
  newDiv.appendChild(deleteBtn);

  container.insertBefore(newDiv, document.getElementById("add-btn"));

  // Menambahkan data baru ke Map
  dataSkala.set(skalaCounter.toString(), newInput.value.trim());

  // Log untuk debugging
  console.log("Data Skala setelah add:", dataSkala);

  skalaCounter++;
}

function removeSkala(divToRemove) {
  const container = document.getElementById("skala-kriteria-container");

  const urutanSkala = divToRemove
    .querySelector("label:first-child")
    .textContent.trim()
    .replace(":", "");

  // Hapus elemen dari container
  container.removeChild(divToRemove);

  // Hapus data dari Map
  if (dataSkala.has(urutanSkala)) {
    dataSkala.delete(urutanSkala);
  }

  // Ambil semua elemen yang tersisa dengan atribut data-skala
  const allSkalaDivs = container.querySelectorAll("[data-skala]");

  let newCounter = 1;
  const updatedDataSkala = new Map();

  allSkalaDivs.forEach((div) => {
    const label = div.querySelector("label:first-child");
    const input = div.querySelector("input");

    label.textContent = `${newCounter} :`;
    label.setAttribute("for", `skalaKriteria${newCounter}`);
    input.id = `skalaKriteria${newCounter}`;
    div.setAttribute("data-skala", newCounter);

    updatedDataSkala.set(newCounter.toString(), input.value.trim());

    newCounter++;
  });

  // Ganti Map `dataSkala` dengan Map yang diperbarui
  dataSkala = updatedDataSkala;

  // Update skalaCounter sesuai dengan jumlah elemen terakhir + 1
  skalaCounter = newCounter;

  // Log untuk debugging
  console.log("Data Skala setelah remove:", dataSkala);
}

let dataSkala = new Map();

function simpanDataSkala() {
  dataSkala.clear();
  // Ambil semua elemen div yang berisi skala (termasuk label dan input)
  const allSkalaDivs = document.querySelectorAll("[data-skala]");

  // Loop melalui setiap elemen div skala
  allSkalaDivs.forEach((div) => {
    // Ambil label dan input di dalam div
    const label = div.querySelector("label");
    const input = div.querySelector("input");

    // Debug log untuk memeriksa nilai label dan input
    console.log("Label:", label ? label.textContent : "Label tidak ditemukan");
    console.log("Input value:", input ? input.value : "Input tidak ditemukan");

    // Ambil urutan skala dan keterangan dari label dan input
    const urutanSkala = label ? label.textContent.trim().replace(":", "") : ""; // Pastikan label ada
    const keterangan = input ? input.value.trim() : ""; // Ambil nilai input dan bersihkan spasi

    // Pastikan urutanSkala dan keterangan tidak kosong sebelum memasukkan ke Map
    if (urutanSkala && keterangan) {
      dataSkala.set(urutanSkala, keterangan);
    }

    console.log(dataSkala);
  });

  // Mengonversi data dari Map ke array of objects dengan format yang diinginkan
  const skalaData = Array.from(dataSkala, ([urutan_skala, keterangan]) => ({
    urutan_skala: parseInt(urutan_skala), // pastikan urutan_skala adalah angka
    keterangan: keterangan,
  }));

  // Log data untuk memastikan semuanya sudah tersimpan dengan benar
  console.log("Data Skala yang akan dikirim:", skalaData); // Menampilkan data secara lebih jelas
  return skalaData;
}

async function insertDataSkala() {
  const daftarSkala = simpanDataSkala();
  console.log("Daftar Skala yang dikirim:", daftarSkala); // Debug log untuk memeriksa data

  const { data, error } = await supabase.rpc("insert_skala_kriteria", {
    data: daftarSkala,
  });

  if (error) {
    console.error("Error inserting data:", error.message);
  } else {
    console.log("Data successfully inserted:", data);
  }
}

async function tambahDataKriteria() {
  const fileInput = document.getElementById("uploadGambar");
  const file = fileInput.files[0];
  const namaKriteria = document.getElementById("namaKriteria").value;
  const jenisKriteria = document.getElementById("jenisKriteria").value;
  const prioritas = document.getElementById("prioritasKriteria").value;

  if (!file || !namaKriteria || !jenisKriteria || !prioritas) {
    alert("Semua field harus diisi!");
    return;
  }

  // Upload file ke Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from("fp_spk")
    .upload(`kriteria/${file.name}`, file);

  if (storageError) {
    console.error("Storage Error:", storageError);
    alert("Gagal meng-upload gambar: " + storageError.message);
    return;
  }

  const gambarUrl = `https://cqdqanjdrrsokpnjpjpj.supabase.co/storage/v1/object/public/${storageData.path}`;

  // Simpan data kriteria ke database
  const { data, error } = await supabase.rpc("insert_data_kriteria", {
    _nama_kriteria: namaKriteria,
    _jenis_kriteria: jenisKriteria,
    _prioritas: parseInt(prioritas),
    _url_gambar: gambarUrl,
  });

  if (error) {
    console.error("RPC Error:", error);
    alert("Terjadi kesalahan saat menyimpan data kriteria: " + error.message);
    return;
  }

  alert("Data berhasil disimpan!");
  window.location.href = "kriteria.html";
}

// Event listener untuk tombol submit
document
  .getElementById("simpanButton")
  .addEventListener("click", async function () {
    // Panggil fungsi insertDataSkala
    await insertDataSkala();

    // Panggil fungsi tambahDataKriteria
    await tambahDataKriteria();
  });
