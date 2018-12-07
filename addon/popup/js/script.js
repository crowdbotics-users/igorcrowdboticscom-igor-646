const description = document.querySelector('#descriptionInput');
const tbody = document.querySelector('tbody');
const amount = document.querySelector('#amountInput');
const category = document.querySelector('#category');
const form = document.querySelector('#form');
const total = document.querySelector('.total span');
const clearAll = document.querySelector('#clearAll');
const ctx = document.querySelector('#myChart');
const chartSelect = document.querySelector('#chartSelect');
const chartTab = document.querySelector('#chart-tab');

let chart;
let totalCalc = 0;
let itemsArray = localStorage.getItem('items')
  ? JSON.parse(localStorage.getItem('items'))
  : [];

localStorage.setItem('items', JSON.stringify(itemsArray));
const data = JSON.parse(localStorage.getItem('items'));
generateList(data);

form.addEventListener('submit', function (e) {
  e.preventDefault();
  let item = {
    description: description.value,
    amount: amount.value,
    category: category.value
  };
  itemsArray.push(item);
  localStorage.setItem('items', JSON.stringify(itemsArray));
  generateList(itemsArray);

  description.value = '';
  amount.value = '';
});

chartTab.addEventListener('click', function () {
  chartSelect.value = '0';
  destroyChart();
});

clearAll.addEventListener('click', function () {
  localStorage.clear();
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
    total.innerText = '0.00';
  }
});

chartSelect.addEventListener('change', function (e) {
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

document
  .body
  .addEventListener('click', function (event) {
    if (event.target.nodeName === 'I') {
      const item = event
        .srcElement
        .id
        .split('_')[1];
      itemsArray.splice(item, 1);
      localStorage.setItem('items', JSON.stringify(itemsArray));
      generateList(itemsArray);
    }
  });

function generateList(itemsArray) {
  tbody.innerHTML = '';
  totalCalc = 0;
  itemsArray.forEach((item, index) => {
    const amount = +item.amount;
    totalCalc += + item.amount;

    const listItem2 = `
    <tr>
      <th>${item
      .description}</th>
      <td>$${amount
      .toFixed(2)}</td>
      <td>${item
      .category}</td>
      <td><i class="fas fa-trash-alt" id="item_'${index}'" ></td>
    </tr>
    `;
    const tr = document.createElement('tr');
    tr.innerHTML = listItem2;
    tbody.appendChild(tr);
  });

  total.innerText = totalCalc.toFixed(2);
}

function getValues(itemsArray) {
  const utilityData = itemsArray
    .filter(item => item.category === 'utility')
    .reduce((acc, item) => {
      return acc + + item.amount;
    }, 0);
  const goodsData = itemsArray
    .filter(item => item.category === 'goods')
    .reduce((acc, item) => {
      return acc + + item.amount;
    }, 0);
  const groceryData = itemsArray
    .filter(item => item.category === 'grocery')
    .reduce((acc, item) => {
      return acc + + item.amount;
    }, 0);
  const generalData = itemsArray
    .filter(item => item.category === 'general')
    .reduce((acc, item) => {
      return acc + + item.amount;
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