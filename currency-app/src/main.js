import './style.css'
import axios from 'axios';
import Chart from 'chart.js/auto';

// API Configuration
const API_URL = 'https://api.exchangerate-api.com/v4/latest/';
const HISTORICAL_API_URL = 'https://api.exchangerate-api.com/v4/history/';

// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const convertButton = document.getElementById('convert');
const resultDisplay = document.getElementById('result');
const chartCanvas = document.getElementById('chart');
const chartBaseCurrency = document.getElementById('chartBaseCurrency');
const chartTargetCurrency = document.getElementById('chartTargetCurrency');
const updateChartButton = document.getElementById('updateChart');

// Fetch Currency List
async function fetchCurrencies() {
  try {
    const response = await axios.get(`${API_URL}USD`);
    const currencies = Object.keys(response.data.rates);
    populateDropdowns(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
  }
}

// Populate Dropdowns
function populateDropdowns(currencies) {
  currencies.forEach(currency => {
    const option1 = document.createElement('option');
    const option2 = document.createElement('option');
    option1.value = option2.value = currency;
    option1.textContent = option2.textContent = currency;
    fromCurrency.appendChild(option1);
    toCurrency.appendChild(option2);
  });
}

// Convert Currency
async function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount) || !from || !to) {
    resultDisplay.textContent = 'Please enter valid inputs.';
    return;
  }

  try {
    const response = await axios.get(`${API_URL}${from}`);
    const rate = response.data.rates[to];
    const convertedAmount = (amount * rate).toFixed(2);
    resultDisplay.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;
  } catch (error) {
    console.error('Error converting currency:', error);
    resultDisplay.textContent = 'Error fetching conversion rate.';
  }
}

// Populate Dropdowns for Chart
async function populateChartDropdowns() {
  try {
    const response = await axios.get(`${API_URL}USD`);
    const currencies = Object.keys(response.data.rates);

    currencies.forEach((currency) => {
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');
      option1.value = option2.value = currency;
      option1.textContent = option2.textContent = currency;
      chartBaseCurrency.appendChild(option1);
      chartTargetCurrency.appendChild(option2);
    });

    // Set default values
    chartBaseCurrency.value = 'USD';
    chartTargetCurrency.value = 'EUR';
  } catch (error) {
    console.error('Error populating chart dropdowns:', error);
  }
}

// Render Chart
async function renderChart(baseCurrency = 'USD', targetCurrency = 'EUR') {
  try {
    // Simulated historical data (replace with actual API call if available)
    const labels = ['2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01'];
    const data = [1.1, 1.2, 1.15, 1.18]; // Example exchange rates

    // Destroy existing chart if it exists
    if (window.myChart) {
      window.myChart.destroy();
    }

    // Create the chart
    window.myChart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Exchange Rate (${baseCurrency} to ${targetCurrency})`,
            data,
            borderColor: '#2F80ED',
            backgroundColor: 'rgba(47, 128, 237, 0.2)',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    });
  } catch (error) {
    console.error('Error rendering chart:', error);
  }
}

// Update Chart on Button Click
updateChartButton.addEventListener('click', () => {
  const baseCurrency = chartBaseCurrency.value;
  const targetCurrency = chartTargetCurrency.value;
  renderChart(baseCurrency, targetCurrency);
});

// Load the header dynamically
async function loadHeader() {
  try {
    const response = await fetch('/src/partials/header.html');
    const headerHTML = await response.text();
    document.getElementById('header-placeholder').innerHTML = headerHTML;

    // Add functionality for buttons after loading the header
    setupHeaderButtons();
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

// Setup functionality for reset and theme toggle buttons
function setupHeaderButtons() {
  // Reset Button: Refresh the page
  const resetButton = document.getElementById('reset-button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      location.reload();
    });
  }

  // Theme Toggle Button: Switch between dark and light themes
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });
  }
}

// Load the footer dynamically
async function loadFooter() {
  try {
    const response = await fetch('/src/partials/footer.html');
    const footerHTML = await response.text();
    document.getElementById('footer-placeholder').innerHTML = footerHTML;

    // Set the last modified date
    const lastModified = document.lastModified;
    document.getElementById('last-modified').textContent = lastModified;
  } catch (error) {
    console.error('Error loading footer:', error);
  }
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
  fetchCurrencies();
  populateChartDropdowns();
  renderChart();
  document.getElementById('convert').addEventListener('click', convertCurrency);

  // Call the function to load the header
  loadHeader();

  // Call the function to load the footer
  loadFooter();
});


