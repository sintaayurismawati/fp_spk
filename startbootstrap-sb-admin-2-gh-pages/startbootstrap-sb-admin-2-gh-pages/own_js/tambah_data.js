// Inisialisasi Supabase
const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let skalaCounter = 3; // Mulai dari 3 karena 1 dan 2 sudah ada

function addSkalaKriteria() {
  // Ambil elemen container utama
  const container = document.getElementById("skala-kriteria-container");

  // Buat elemen wrapper untuk label, input, dan tombol hapus
  const newDiv = document.createElement("div");
  newDiv.className = "d-flex align-items-center mb-3";
  newDiv.setAttribute("data-skala", skalaCounter);

  // Buat elemen label baru
  const newLabel = document.createElement("label");
  newLabel.setAttribute("for", `skalaKriteria${skalaCounter}`);
  newLabel.className = "me-2 mb-0";
  newLabel.style.flexShrink = "0";
  newLabel.textContent = `${skalaCounter} :`;

  // Buat elemen input baru
  const newInput = document.createElement("input");
  newInput.id = `skalaKriteria${skalaCounter}`;
  newInput.type = "text";
  newInput.className = "form-control ms-2";
  newInput.style.marginLeft = "10px";

  // Buat tombol hapus berupa ikon
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn btn-light ms-2 p-0 border-0"; // Styling tombol
  deleteBtn.innerHTML = '<i class="fas fa-trash text-danger"></i>'; // Ikon trash
  deleteBtn.onclick = function () {
    removeSkala(newDiv);
  };

  // Tambahkan label, input, dan tombol hapus ke div wrapper
  newDiv.appendChild(newLabel);
  newDiv.appendChild(newInput);
  newDiv.appendChild(deleteBtn);

  // Tambahkan div wrapper ke dalam container, sebelum tombol add-btn
  container.insertBefore(newDiv, document.getElementById("add-btn"));

  // Increment counter
  skalaCounter++;
}

function removeSkala(divToRemove) {
  const container = document.getElementById("skala-kriteria-container");

  // Hapus elemen yang diminta
  container.removeChild(divToRemove);

  // Update skalaCounter dan elemen yang tersisa
  const allSkalaDivs = container.querySelectorAll("[data-skala]");
  skalaCounter = 3; // Reset ke 3 karena 1 dan 2 tetap ada

  allSkalaDivs.forEach((div, index) => {
    const newNumber = skalaCounter + index;
    const label = div.querySelector("label");
    const input = div.querySelector("input");

    // Update label dan input ID
    label.textContent = `${newNumber} :`;
    label.setAttribute("for", `skalaKriteria${newNumber}`);
    input.id = `skalaKriteria${newNumber}`;
  });
}

// Fungsi untuk meng-upload file dan menyimpan data kriteria
async function tambahDataKriteria() {
  const fileInput = document.getElementById("uploadGambar"); // Ambil elemen input file
  const file = fileInput.files[0]; // Ambil file pertama yang dipilih
  const namaKriteria = document.getElementById("namaKriteria").value; // Ambil nilai input nama_kriteria
  const jenisKriteria = document.getElementById("jenisKriteria").value; // Ambil nilai input jenis_kriteria
  const prioritas = document.getElementById("prioritasKriteria").value; // Ambil nilai input prioritas

  if (!file) {
    alert("Pilih gambar terlebih dahulu!");
    return;
  }

  // Upload file ke Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from("fp_spk")
    .upload(`kriteria/${file.name}`, file);

  if (storageError) {
    alert("Gagal meng-upload gambar: " + storageError.message);
    return;
  }

  // Ambil URL gambar dari storage
  const gambarUrl = storageData?.path
    ? `https://https://cqdqanjdrrsokpnjpjpj.supabase.co/storage/v1/object/public/fp_spk/kriteria/${file.name}`
    : null;

  if (gambarUrl) {
    // Memanggil function 'insert_data_kriteria' yang telah dibuat di Supabase
    const { data, error } = await supabase.rpc("insert_data_kriteria", {
      _nama_kriteria: namaKriteria,
      _jenis_kriteria: jenisKriteria,
      _prioritas: parseInt(prioritas), // Pastikan prioritas adalah integer
      _url_gambar: gambarUrl, // Pass URL gambar yang di-upload
    });

    if (error) {
      alert("Terjadi kesalahan saat menyimpan data kriteria: " + error.message);
    } else {
      alert("Data kriteria berhasil disimpan!");
    }
  } else {
    alert("Gagal mendapatkan URL gambar.");
  }
}

// Event listener untuk tombol submit
document
  .getElementById("simpanButton")
  .addEventListener("click", tambahDataKriteria);
