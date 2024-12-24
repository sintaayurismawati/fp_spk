const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);



document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Initialize Supabase client
    

    // Call the required RPC functions on page load
    const rpcFunctions = [
      "fn_update_hasil_perkalian_matriks_new_2",
      "fn_update_jumlah_perkalian_matriks_fix",
      "update_ahp_uji_konsistensi_fix"
    ];

    for (const fn of rpcFunctions) {
      const { data, error } = await supabase.rpc(fn);
      if (error) {
        console.log(error)
        console.error(`Error executing ${fn}:`, error);
      } else {
    
        console.log(`${fn} executed successfully`, data);
      }
    }
  } catch (err) {
    console.error("Error during initialization: ", err);
  }
});


let rataNormalisasi  =[]
let jumlpMatrix = []
async function loadTable() {
  const { data, error } = await supabase.rpc(
    "get_ahp_perbandingan_kriteria"
  );

  console.log(data)

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  // Memproses data untuk menampilkan dalam bentuk tabel
  const criteria = [
    "Biaya Berlangganan",
    "Fasilitas",
    "Promo",
    "Bayaran Cicilan",
  ];
  const tableBody = document.querySelector("#comparisonTable tbody");
  const totals = { C1: 0, C2: 0, C3: 0, C4: 0 };
  let kodeKriteria = ''
  let kodeKriteriaPembanding = ''
  criteria.forEach((rowName, rowIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `<th>${rowName}</th>`;

    criteria.forEach((colName, colIndex) => {
      const cell = document.createElement("td");
      kodeKriteria = `C${rowIndex + 1}`;

      kodeKriteriaPembanding = `C${colIndex + 1}`;

      const nilai =
        data.find(
          (item) =>
            item.kode_kriteria === kodeKriteria &&
            item.kode_kriteria_pembanding === kodeKriteriaPembanding
        )?.nilai || 0;

      cell.textContent = nilai;
      row.appendChild(cell);



      if (rowIndex === colIndex) {
        console.log('hai')
        totals[kodeKriteria] =
          data.find((item) => item.kode_kriteria === kodeKriteria)
            ?.jumlah || 0;
      }
    });

    tableBody.appendChild(row);
  });

  console.log(totals)
  // Menambahkan nilai jumlah di baris footer
  document.getElementById("jumlahC1").textContent = totals.C1;
  document.getElementById("jumlahC2").textContent = totals.C2;
  document.getElementById("jumlahC3").textContent = totals.C3;
  document.getElementById("jumlahC4").textContent = totals.C4;
}

async function loadTable2() {
  const { data, error } = await supabase.rpc("get_ahp_perbandingan_kriteria");

  console.log(data);

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  // Memproses data untuk menampilkan dalam bentuk tabel
  const criteria = ["Biaya Berlangganan", "Fasilitas", "Promo", "Bayaran Cicilan"];
  const tableBody = document.querySelector("#normalisasi-table tbody");

  const totals = { C1: 0, C2: 0, C3: 0, C4: 0 };  // Untuk jumlah kolom
  const rowAverages = [];  // Untuk menyimpan rata-rata setiap baris
  let kodeKriteria = '';
  let kodeKriteriaPembanding = '';

  // Iterasi melalui setiap baris
  criteria.forEach((rowName, rowIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `<th>${rowName}</th>`;

    let rowSum = 0;  // Untuk jumlah nilai normalisasi per baris
    let validCellCount = 0;  // Untuk menghitung jumlah sel yang valid (bukan 0 atau NaN)

    // Iterasi melalui setiap kolom
    criteria.forEach((colName, colIndex) => {
      const cell = document.createElement("td");
      kodeKriteria = `C${rowIndex + 1}`;
      kodeKriteriaPembanding = `C${colIndex + 1}`;

      const nilai = data.find(
        (item) =>
          item.kode_kriteria === kodeKriteria &&
          item.kode_kriteria_pembanding === kodeKriteriaPembanding
      )?.nilai || 0;

      const jumlah = data.find(
        (item) =>
          item.kode_kriteria === kodeKriteria &&
          item.kode_kriteria_pembanding === kodeKriteriaPembanding
      )?.jumlah || 0;

      // Periksa untuk menghindari pembagian dengan 0
      let nilaiNormalisasi = 0;
      if (jumlah !== 0) {
        nilaiNormalisasi = nilai / jumlah;
      }

      // Menambahkan nilai ke jumlah baris dan menghitung rata-rata
      if (nilaiNormalisasi !== 0) {
        rowSum += nilaiNormalisasi;
        validCellCount++;
      }

      // Tampilkan nilai normalisasi dengan 4 angka desimal
      cell.textContent = nilaiNormalisasi.toFixed(4);
      row.appendChild(cell);

      // Menyimpan total kolom dengan menjumlahkan nilai normalisasi untuk setiap kolom
      totals[`C${colIndex + 1}`] += nilaiNormalisasi;
    });

    // Hitung rata-rata per baris
    const rowAverage = validCellCount > 0 ? rowSum / validCellCount : 0;
    const averageCell = document.createElement("td");
    averageCell.textContent = rowAverage.toFixed(4);
    row.appendChild(averageCell);

    tableBody.appendChild(row);

    // Menyimpan rata-rata per baris
    rowAverages.push(rowAverage);
  });

  // Menambahkan baris jumlah untuk setiap kolom
  const totalRow = document.createElement("tr");
  totalRow.classList.add('table-primary');
  totalRow.innerHTML = "<th>Total</th>";

  // Menambahkan nilai jumlah untuk setiap kolom
  criteria.forEach((_, colIndex) => {
    const totalCell = document.createElement("td");
    totalCell.textContent = totals[`C${colIndex + 1}`]  // Menampilkan jumlah untuk kolom
    totalRow.appendChild(totalCell);
  });

  // Menambahkan nilai rata-rata total
  const averageTotalCell = document.createElement("td");
  const totalAverage = rowAverages.reduce((sum, avg) => sum + avg, 0)
  averageTotalCell.textContent = totalAverage.toFixed(1);  // Menampilkan rata-rata per kolom
  totalRow.appendChild(averageTotalCell);

  console.log(rowAverages)

  tableBody.appendChild(totalRow);

  console.log(totals);  // Menampilkan total yang telah dihitung untuk setiap kolom
}

async function loadTable3() {
  const { data, error } = await supabase.from("AHP_matriks").select('*');

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  console.log('hbabi')
  console.log(data)

  const criteria = ["Biaya Terendah", "Kelengkapan Fasilitas Course", "Promo", "Bayaran Cicilan"];
  const tableBody = document.querySelector("#perkalian tbody");

  // Loop through the criteria and data to create the rows
  criteria.forEach((rowName, rowIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `<th>${rowName}</th>`;

    let rowSum = 0; // To store the sum of 'jumlah_normalisasi' for each row

    // Loop through each column (criteria) for the current row
    criteria.forEach((colName, colIndex) => {
      const kodeKriteria = `C${rowIndex + 1}`;
      const kodeKriteriaPembanding = `C${colIndex + 1}`;

      // Find the corresponding data for 'nilai_normalisasi' and 'jumlah_normalisasi'
      const item = data.find(
        (item) =>
          item.kode_kriteria === kodeKriteria &&
          item.kode_kriteria_pembanding === kodeKriteriaPembanding
      );

      const nilaiNormalisasi = item?.nilai_normalisasi || 0;
      const jumlahNormalisasi = item?.jumlah_perkalian_matriks || 0;

      rataNormalisasi.push(jumlahNormalisasi)
      console.log(rataNormalisasi)

      // Add 'nilai_normalisasi' to the row (only showing this value)
      const cellNormalized = document.createElement("td");
      cellNormalized.textContent = nilaiNormalisasi.toFixed(4);
      row.appendChild(cellNormalized);

      // Add to the row sum for 'jumlah_normalisasi'
      if (colIndex === criteria.length - 1) {
        rowSum += jumlahNormalisasi;
      }
    });

    // Add the 'jumlah_normalisasi' as the last column for the current row
    const totalCell = document.createElement("td");
    totalCell.textContent = rowSum.toFixed(4);
    row.appendChild(totalCell);

    // Append the row to the table body
    tableBody.appendChild(row);
    
  });
  loadTable4()
}




async function loadTable4() {
  const { data, error } = await supabase.from("AHP_uji_konsistensi").select('*');
  const criteria = ["Biaya Berlangganan", "Fasilitas", "Promo", "Bayaran Cicilan"];
  const tableBody = document.querySelector("#ukk tbody");

  // Array rata-rata normalisasi
  
  let totalJumlah = 0; // Untuk menghitung total dari kolom "Jumlah"

  // Iterasi untuk membuat satu baris
  const row = document.createElement("tr");

  // Tambahkan nilai rata-rata normalisasi dikalikan dengan jumlah matrix
  data.forEach((rata, index) => {
    const cell = document.createElement("td");
    const value = rata.nilai;
    cell.textContent = value.toFixed(4);
    row.appendChild(cell);

    // Tambahkan ke total "Jumlah"
    totalJumlah += value;
  });

  // Kolom "Jumlah"
  const jumlahCell = document.createElement("td");
  jumlahCell.textContent = data[0].jumlah.toFixed(4);
  row.appendChild(jumlahCell);

  // Kolom "t" (rata-rata dari total "Jumlah")
  const tValue = data[0].t;
  const tCell = document.createElement("td");
  tCell.textContent = tValue.toFixed(4);
  row.appendChild(tCell);

  // Kolom "C1" ((t - 4) / 3)
  const c1Value = data[0].CI;
  const c1Cell = document.createElement("td");
  c1Cell.textContent = c1Value.toFixed(4);
  row.appendChild(c1Cell);

  // Kolom "CR" (C1 / 1.45)
  const crValue = data[0].CR;
  const crCell = document.createElement("td");
  crCell.textContent = crValue.toFixed(4);
  row.appendChild(crCell);

  // Tambahkan baris ke tabel
  tableBody.appendChild(row);
}





loadTable();
loadTable2();
loadTable3();

