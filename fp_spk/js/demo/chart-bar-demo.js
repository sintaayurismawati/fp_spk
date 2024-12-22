async function renderBarChart(kriteria) {
  try {
    // Mengambil data dari tabel `kriteria` di Supabase
    
    // Data untuk bar chart
    const labels = kriteria.map(item => item.nama_kriteria); // Nama kriteria sebagai label
    const dataValues = kriteria.map(item => item.nilai_prioritas); // Nilai prioritas sebagai data

    // Membuat bar chart
    const ctx = document.getElementById("myBarChart").getContext("2d");
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: "Nilai Prioritas",
          backgroundColor: "#4e73df",
          hoverBackgroundColor: "#2e59d9",
          borderColor: "#4e73df",
          data: dataValues,
        }],
      },
      options: {
        maintainAspectRatio: false,
        layout: {
          padding: {
            left: 10,
            right: 25,
            top: 25,
            bottom: 0
          }
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
              drawBorder: false
            },
            ticks: {
              maxTicksLimit: kriteria.length
            },
            maxBarThickness: 25,
          }],
          yAxes: [{
            ticks: {
              min: 0,
              max: Math.max(...dataValues) + 10, // Menyesuaikan skala maksimal
              maxTicksLimit: 5,
              padding: 10,
              callback: function(value, index, values) {
                return number_format(value); // Format angka
              }
            },
            gridLines: {
              color: "rgb(234, 236, 244)",
              zeroLineColor: "rgb(234, 236, 244)",
              drawBorder: false,
              borderDash: [2],
              zeroLineBorderDash: [2]
            }
          }],
        },
        legend: {
          display: true // Menampilkan label dataset
        },
        tooltips: {
          titleMarginBottom: 10,
          titleFontColor: '#6e707e',
          titleFontSize: 14,
          backgroundColor: "rgb(255,255,255)",
          bodyFontColor: "#858796",
          borderColor: '#dddfeb',
          borderWidth: 1,
          xPadding: 15,
          yPadding: 15,
          displayColors: false,
          caretPadding: 10,
          callbacks: {
            label: function(tooltipItem, chart) {
              var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
              return datasetLabel + ': ' + number_format(tooltipItem.yLabel);
            }
          }
        },
      }
    });
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}
