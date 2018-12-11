const ctx = document.querySelector('#myChart');
const chartSelect = document.querySelector('#chartSelect');
let chart;

document
  .querySelector('#chart-tab')
  .addEventListener('click', function () {
    destroyChart();
    chartSelect.value = '1';
    const itemsArray = localStorage.getItem('items')
      ? JSON.parse(localStorage.getItem('items'))
      : [];
    const [utilityData,
      goodsData,
      groceryData,
      generalData] = getValues(itemsArray);
    barChart(utilityData, goodsData, groceryData, generalData);
  });

document
  .querySelector('#clearAll')
  .addEventListener('click', function () {
    swal({title: "Are you sure?", text: "Once removed, you will not be able to recover the expenses!", icon: "warning", buttons: true, dangerMode: true}).then((willDelete) => {
      if (willDelete) {
        const total = document.querySelector('.total span');
        const i = Array.from(document.getElementsByTagName('i'));
        const items = i.filter(item => item.id);
        items.map(item => deleteUserData(item.id));
        total.innerText = '0.00';
        swal("Ok! Your expenses were removed!", {icon: "success"});
      }
    });
  });

document
  .body
  .addEventListener('click', function (event) {
    if (event.target.nodeName === 'I' && event.target.className === 'fas fa-trash-alt') {
      swal({title: "Are you sure?", text: "Once removed, you will not be able to recover this expense!", icon: "warning", buttons: true, dangerMode: true}).then((willDelete) => {
        if (willDelete) {
          const item = event.srcElement.id;
          deleteUserData(item);
          swal("Ok! Your expense was removed!", {icon: "success"});
        }
      });
    }
  });

document
  .querySelector('#form')
  .addEventListener('submit', function (e) {
    e.preventDefault();
    const description = document.querySelector('#descriptionInput');
    const price = document.querySelector('#priceInput');
    const category = document.querySelector('#category');
    const item = {
      description: description.value,
      price: price.value,
      category: category.value
    };
    writeUserData(item);
    description.value = '';
    price.value = '';
  });

chartSelect.addEventListener('change', function (e) {
  const itemsArray = localStorage.getItem('items')
    ? JSON.parse(localStorage.getItem('items'))
    : [];
  const [utilityData,
    goodsData,
    groceryData,
    generalData] = getValues(itemsArray);

  if (e.target.value === '1') {
    barChart(utilityData, goodsData, groceryData, generalData);
  } else if (e.target.value === '2') {
    lineChart(utilityData, goodsData, groceryData, generalData);
  } else {
    destroyChart();
  }
});

function getValues(itemsArray) {
  const utilityData = itemsArray
    .filter(item => item.category === 'utility')
    .reduce((acc, item) => {
      return acc + + item.price;
    }, 0);
  const goodsData = itemsArray
    .filter(item => item.category === 'goods')
    .reduce((acc, item) => {
      return acc + + item.price;
    }, 0);
  const groceryData = itemsArray
    .filter(item => item.category === 'grocery')
    .reduce((acc, item) => {
      return acc + + item.price;
    }, 0);
  const generalData = itemsArray
    .filter(item => item.category === 'general')
    .reduce((acc, item) => {
      return acc + + item.price;
    }, 0);
  return [utilityData, goodsData, groceryData, generalData];
}

function barChart(utilityData, goodsData, groceryData, generalData) {
  destroyChart();
  ctx
    .classList
    .add('chart-active');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'Utility', 'Goods', 'Grocery', 'General'
      ],
      datasets: [
        {
          label: 'Costs',
          data: [
            utilityData.toFixed(2),
            goodsData.toFixed(2),
            groceryData.toFixed(2),
            generalData.toFixed(2)
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
}

function lineChart(utilityData, goodsData, groceryData, generalData) {
  destroyChart();
  ctx
    .classList
    .add('chart-active');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [
        'Utility', 'Goods', 'Grocery', 'General'
      ],
      datasets: [
        {
          label: 'Costs',
          data: [
            utilityData.toFixed(2),
            goodsData.toFixed(2),
            groceryData.toFixed(2),
            generalData.toFixed(2)
          ],
          borderColor: '#7f63f4',
          backgroundColor: 'rgba(127,99,244,0.2)'
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            stacked: true
          }
        ]
      }
    }
  });
}

function destroyChart() {
  if (chart) {
    chart.destroy();
    ctx
      .classList
      .remove('chart-active');
  }
}