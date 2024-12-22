const supabaseUrl = "https://cqdqanjdrrsokpnjpjpj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxZHFhbmpkcnJzb2twbmpwanBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyMjIxNzIsImV4cCI6MjA0ODc5ODE3Mn0.mldA8vWRcbH-vikkKDBz836-l8p_2lhKkP9STZ1l2b4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let rataNormalisasi 
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
  const { data, error } = await supabase.rpc("get_ahp_perbandingan_kriteria");

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  const criteria = ["Biaya Berlangganan", "Fasilitas", "Promo", "Bayaran Cicilan"];
  const tableBody = document.querySelector("#perkalian tbody");

  const rowAverages = []; // Untuk menyimpan rata-rata setiap baris
  const columnSums = Array(criteria.length).fill(0); // Untuk menyimpan jumlah setiap kolom hasil perkalian

  // Iterasi melalui setiap baris
  criteria.forEach((rowName, rowIndex) => {
    const row = document.createElement("tr");
    row.innerHTML = `<th>${rowName}</th>`;

    let rowSum = 0; // Untuk jumlah nilai normalisasi per baris
    let validCellCount = 0; // Untuk menghitung jumlah sel yang valid
    const rowMatrix = []; // Untuk menyimpan hasil matriks perkalian per baris

    // Iterasi melalui setiap kolom
    criteria.forEach((colName, colIndex) => {
      const cellOriginal = document.createElement("td");
      const cellNormalized = document.createElement("td");

      const kodeKriteria = `C${rowIndex + 1}`;
      const kodeKriteriaPembanding = `C${colIndex + 1}`;

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

      let nilaiNormalisasi = 0;
      if (jumlah !== 0) {
        nilaiNormalisasi = nilai / jumlah;
      }

      // Tambahkan nilai asli ke kolom
      cellOriginal.textContent = nilai.toFixed(4);
      row.appendChild(cellOriginal);

      // Tambahkan nilai normalisasi ke total baris
      if (nilaiNormalisasi !== 0) {
        rowSum += nilaiNormalisasi;
        validCellCount++;
      }

      // Simpan nilai normalisasi untuk hasil perkalian matriks
      rowMatrix.push(nilaiNormalisasi);
    });

    // Hitung rata-rata per baris (Bobot)
    const rowAverage = validCellCount > 0 ? rowSum / validCellCount : 0;
    rowAverages.push(rowAverage);

    // Tambahkan kolom "x Bobot"
    const bobotCell = document.createElement("td");
    bobotCell.textContent = rowAverage.toFixed(4);
    row.appendChild(bobotCell);

    // Hasil perkalian matriks (nilai normalisasi * bobot)
    let rowMultiplicationSum = 0;
    rowMatrix.forEach((nilaiNormalisasi, colIndex) => {
      const result = nilaiNormalisasi * rowAverage;

      const resultCell = document.createElement("td");
      resultCell.textContent = result.toFixed(4);
      row.appendChild(resultCell);

      // Tambahkan hasil ke jumlah kolom
      columnSums[colIndex] += result;

      // Tambahkan ke total hasil perkalian matriks per baris
      rowMultiplicationSum += result;
    });

    // Tambahkan kolom "Jumlah" untuk hasil perkalian matriks per baris
    const totalCell = document.createElement("td");
    totalCell.textContent = rowMultiplicationSum.toFixed(4);
    row.appendChild(totalCell);

    jumlpMatrix.push(rowMultiplicationSum.toFixed(4));

    tableBody.appendChild(row);
  });



  columnSums.forEach((colSum) => {
    const totalCell = document.createElement("td");
    totalCell.textContent = colSum.toFixed(4);
    
  });

  // Kolom kosong untuk "x Bobot" dan "Jumlah"
  const emptyCell = document.createElement("td");
  emptyCell.textContent = "-";
  
  const emptyCell2 = document.createElement("td");
  emptyCell2.textContent = "-";


 rataNormalisasi = rowAverages
 
 console.log('yayuk')
 console.log(rataNormalisasi)
 console.log('yayuk2')
 console.log(jumlpMatrix)
 loadTable4();
}


async function loadTable4() {
  const criteria = ["Biaya Berlangganan", "Fasilitas", "Promo", "Bayaran Cicilan"];
  const tableBody = document.querySelector("#ukk tbody");

  // Array rata-rata normalisasi
  
  let totalJumlah = 0; // Untuk menghitung total dari kolom "Jumlah"

  // Iterasi untuk membuat satu baris
  const row = document.createElement("tr");

  // Tambahkan nilai rata-rata normalisasi dikalikan dengan jumlah matrix
  rataNormalisasi.forEach((rata, index) => {
    const cell = document.createElement("td");
    const value = rata / jumlpMatrix[index];
    cell.textContent = value.toFixed(4);
    row.appendChild(cell);

    // Tambahkan ke total "Jumlah"
    totalJumlah += value;
  });

  // Kolom "Jumlah"
  const jumlahCell = document.createElement("td");
  jumlahCell.textContent = totalJumlah.toFixed(4);
  row.appendChild(jumlahCell);

  // Kolom "t" (rata-rata dari total "Jumlah")
  const tValue = totalJumlah / criteria.length;
  const tCell = document.createElement("td");
  tCell.textContent = tValue.toFixed(4);
  row.appendChild(tCell);

  // Kolom "C1" ((t - 4) / 3)
  const c1Value = (tValue - 4) / 3;
  const c1Cell = document.createElement("td");
  c1Cell.textContent = c1Value.toFixed(4);
  row.appendChild(c1Cell);

  // Kolom "CR" (C1 / 1.45)
  const crValue = c1Value / 1.45;
  const crCell = document.createElement("td");
  crCell.textContent = crValue.toFixed(4);
  row.appendChild(crCell);

  // Tambahkan baris ke tabel
  tableBody.appendChild(row);
}





loadTable();
loadTable2();
loadTable3();

