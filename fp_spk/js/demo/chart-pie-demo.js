function renderPieChart(labels, dataValues, backgroundColors) {
  const ctx = document.getElementById("myPieChart").getContext("2d");
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors.map(color => adjustColor(color, -20)),
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: false,
      },
      cutoutPercentage: 80,
    },
  });
}

function getColor(index) {
  // Warna dinamis untuk setiap elemen
  const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];
  return colors[index % colors.length];
}

function adjustColor(color, amount) {
  // Fungsi untuk mencerahkan atau menggelapkan warna
  return '#' + color.slice(1).match(/.{2}/g)
    .map(hex => Math.min(255, Math.max(0, parseInt(hex, 16) + amount)).toString(16).padStart(2, '0'))
    .join('');
}