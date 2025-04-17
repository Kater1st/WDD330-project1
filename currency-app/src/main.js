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

// Fetch from API
async function fetchFromAPI(endpoint) {
  try {
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching from API (${endpoint}):`, error);
    throw error;
  }
}

// Fetch Historical Data
async function fetchHistoricalData(baseCurrency, targetCurrency) {
  const cacheKey = `historical-${baseCurrency}-${targetCurrency}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const response = await fetchFromAPI(`${HISTORICAL_API_URL}?base=${baseCurrency}&symbols=${targetCurrency}`);
  localStorage.setItem(cacheKey, JSON.stringify(response));
  return response;
}

// Show and Hide Loading Spinner
function showLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'block';
}

function hideLoadingSpinner() {
  document.getElementById('loading-spinner').style.display = 'none';
}

// Fetch Currency List
async function fetchCurrencies() {
  try {
    const cachedCurrencies = localStorage.getItem('currencies');
    if (cachedCurrencies) {
      populateDropdowns(JSON.parse(cachedCurrencies));
      return;
    }

    const response = await fetchFromAPI(`${API_URL}USD`);
    const currencies = Object.keys(response.rates);
    localStorage.setItem('currencies', JSON.stringify(currencies));
    populateDropdowns(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    resultDisplay.textContent = 'Failed to fetch currencies. Please try again later.';
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
    const response = await fetchFromAPI(`${API_URL}${from}`);
    const rate = response.rates[to];
    const convertedAmount = (amount * rate).toFixed(2);

    // Display the conversion result
    resultDisplay.textContent = `${amount} ${from} = ${convertedAmount} ${to}`;

    // Display the timestamp of the last update
    const timestamp = new Date(response.time_last_updated * 1000).toLocaleString();
    document.getElementById('last-updated').textContent = `Last updated: ${timestamp}`;

    saveUserPreferences();
  } catch (error) {
    console.error('Error converting currency:', error);
    resultDisplay.textContent = 'Error fetching conversion rate.';
  }
}

// Populate Dropdowns for Chart
async function populateChartDropdowns() {
  try {
    const response = await fetchFromAPI(`${API_URL}USD`);
    const currencies = Object.keys(response.rates);

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
    resultDisplay.textContent = 'Failed to load chart currencies. Please try again later.';
  }
}

// Render Chart
async function renderChart(baseCurrency = 'USD', targetCurrency = 'EUR') {
  try {
    showLoadingSpinner();

    // Static data for testing
    const labels = ['2023-01-01', '2023-02-01', '2023-03-01', '2023-04-01'];
    const data = [1.1, 1.2, 1.15, 1.18];

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

    saveUserPreferences();
  } catch (error) {
    console.error('Error rendering chart:', error);
    resultDisplay.textContent = 'Failed to load historical data. Please try again later.';
  } finally {
    hideLoadingSpinner();
  }
}

// Update Chart on Button Click
updateChartButton.addEventListener('click', () => {
  const baseCurrency = chartBaseCurrency.value;
  const targetCurrency = chartTargetCurrency.value;
  renderChart(baseCurrency, targetCurrency);
});

// Save User Preferences
function saveUserPreferences() {
  const preferences = {
    fromCurrency: fromCurrency.value,
    toCurrency: toCurrency.value,
    chartBaseCurrency: chartBaseCurrency.value,
    chartTargetCurrency: chartTargetCurrency.value,
    theme: document.body.classList.contains('dark-mode') ? 'dark' : 'light',
  };
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Restore User Preferences
function restoreUserPreferences() {
  const preferences = JSON.parse(localStorage.getItem('userPreferences'));
  if (preferences) {
    fromCurrency.value = preferences.fromCurrency || 'USD';
    toCurrency.value = preferences.toCurrency || 'EUR';
    chartBaseCurrency.value = preferences.chartBaseCurrency || 'USD';
    chartTargetCurrency.value = preferences.chartTargetCurrency || 'EUR';
    if (preferences.theme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }
}

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
  resetButton.addEventListener('click', () => {
    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
    amountInput.value = '';
    resultDisplay.textContent = '';
    chartBaseCurrency.value = 'USD';
    chartTargetCurrency.value = 'EUR';
    renderChart('USD', 'EUR');
    saveUserPreferences();
  });
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

// Display Popular Currency Pairs
async function displayPopularPairs() {
  try {
    const response = await fetchFromAPI(`${API_URL}USD`);
    const popularPairs = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD']; // Example popular currencies
    const popularRates = popularPairs.map(pair => ({
      currency: pair,
      rate: response.rates[pair],
    }));

    const popularPairsContainer = document.getElementById('popular-pairs');
    popularPairsContainer.innerHTML = ''; // Clear existing content

    popularRates.forEach(pair => {
      const pairElement = document.createElement('p');
      pairElement.textContent = `1 USD = ${pair.rate} ${pair.currency}`;
      popularPairsContainer.appendChild(pairElement);
    });
  } catch (error) {
    console.error('Error fetching popular pairs:', error);
  }
}

// Display Exchange Rates
async function displayExchangeRates(baseCurrency = 'USD') {
  try {
    showLoadingSpinner();

    // Fetch exchange rates from the API
    const response = await fetchFromAPI(`${API_URL}${baseCurrency}`);
    const rates = response.rates;

    // Get the container for the table
    const exchangeRatesContainer = document.getElementById('exchange-rates');
    exchangeRatesContainer.innerHTML = ''; // Clear existing content

    // Create a table
    const table = document.createElement('table');
    table.classList.add('exchange-rates-table');

    // Add table headers
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Currency</th>
        <th>Exchange Rate</th>
      </tr>
    `;
    table.appendChild(thead);

    // Add table rows dynamically
    const tbody = document.createElement('tbody');
    Object.entries(rates).forEach(([currency, rate]) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${currency}</td>
        <td>${rate.toFixed(4)}</td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Append the table to the container
    exchangeRatesContainer.appendChild(table);
  } catch (error) {
    console.error('Error displaying exchange rates:', error);
    resultDisplay.textContent = 'Failed to load exchange rates. Please try again later.';
  } finally {
    hideLoadingSpinner();
  }
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', () => {
  fetchCurrencies();
  populateChartDropdowns();
  restoreUserPreferences();
  renderChart();
  displayPopularPairs();
  displayExchangeRates(); // Fetch and display exchange rates
  document.getElementById('convert').addEventListener('click', convertCurrency);

  loadHeader();
  loadFooter();
});

// Add event listeners to save user preferences on dropdown change
fromCurrency.addEventListener('change', saveUserPreferences);
toCurrency.addEventListener('change', saveUserPreferences);
chartBaseCurrency.addEventListener('change', saveUserPreferences);
chartTargetCurrency.addEventListener('change', saveUserPreferences);

// Add tooltip functionality to buttons
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
  button.addEventListener('mouseenter', () => {
    button.title = `Click to ${button.textContent.trim()}`;
  });
});

// Add validation for amount input
amountInput.addEventListener('input', () => {
  const value = parseFloat(amountInput.value);
  if (isNaN(value) || value <= 0) {
    amountInput.style.borderColor = 'red';
    convertButton.disabled = true;
  } else {
    amountInput.style.borderColor = '';
    convertButton.disabled = false;
  }
});

// Resize chart on window resize
window.addEventListener('resize', () => {
  if (window.myChart) {
    window.myChart.resize();
  }
});


