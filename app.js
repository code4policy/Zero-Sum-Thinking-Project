// ---------------------------
// Simple router (Learn/Explore/Test/Visualization/About)
// ---------------------------
const pages = {
  learn: document.getElementById("page-learn"),
  explore: document.getElementById("page-explore"),
  test: document.getElementById("page-test"),
  visualization: document.getElementById("page-visualization"),
  about: document.getElementById("page-about"),
};

const navButtons = document.querySelectorAll(".nav__btn");

function setRoute(route) {
  Object.entries(pages).forEach(([k, el]) => {
    el.classList.toggle("page--active", k === route);
  });
  navButtons.forEach((b) => {
    b.setAttribute("aria-current", b.dataset.route === route ? "page" : "false");
  });
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => setRoute(btn.dataset.route));
});

// ---------------------------
// Story 1.2 mini-game placeholder
// ---------------------------
const modeZero = document.getElementById("mode-zero");
const modePositive = document.getElementById("mode-positive");
const gameResult = document.getElementById("game-result");

function renderGame(mode) {
  if (mode === "zero") {
    modeZero.classList.remove("btn--ghost");
    modePositive.classList.add("btn--ghost");
    gameResult.innerHTML = `
      <div class="result__title">Outcome: fixed pie</div>
      <div class="result__body">Total resources are fixed. One player’s gain implies another player’s loss.</div>
      <div class="result__summary"><strong>Summary:</strong> Net total stays constant.</div>
    `;
  } else {
    modePositive.classList.remove("btn--ghost");
    modeZero.classList.add("btn--ghost");
    gameResult.innerHTML = `
      <div class="result__title">Outcome: growing pie</div>
      <div class="result__body">Total resources can expand. Gains may occur without requiring others to lose.</div>
      <div class="result__summary"><strong>Summary:</strong> Net total can increase.</div>
    `;
  }
}

modeZero.addEventListener("click", () => renderGame("zero"));
modePositive.addEventListener("click", () => renderGame("positive"));

// ---------------------------
// Story 2: survey (4 questions) + scoring + benchmark stats
// ---------------------------
const benchmarkScores = [
  0.12, 0.18, 0.22, 0.25, 0.27, 0.31, 0.33, 0.35, 0.36, 0.39,
  0.41, 0.44, 0.46, 0.49, 0.52, 0.55, 0.58, 0.61, 0.66, 0.72,
];

const choicesContainers = document.querySelectorAll(".choices");
const state = { q1: null, q2: null, q3: null, q4: null };

function likertToUnit(x) {
  // 1 -> 0, 5 -> 1
  return (x - 1) / 4;
}

function computeScorePlaceholder() {
  const xs = [state.q1, state.q2, state.q3, state.q4].map(likertToUnit);
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.max(0, Math.min(1, mean));
}

function stats(xs) {
  const sorted = [...xs].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  return { n, mean, median, min: sorted[0], max: sorted[n - 1] };
}

function interpret(score01) {
  if (score01 < 0.33) return "relatively low";
  if (score01 < 0.67) return "moderate";
  return "relatively high";
}

function renderChoices(container, qKey) {
  for (let v = 1; v <= 5; v++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.textContent = String(v);
    btn.setAttribute("aria-pressed", "false");

    btn.addEventListener("click", () => {
      state[qKey] = v;
      // update pressed state
      [...container.children].forEach((c) => c.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
    });

    container.appendChild(btn);
  }
}

choicesContainers.forEach((c) => renderChoices(c, c.dataset.q));

const computeBtn = document.getElementById("compute-btn");
const resetBtn = document.getElementById("reset-btn");
const warning = document.getElementById("test-warning");
const output = document.getElementById("test-output");

const benchN = document.getElementById("bench-n");
const benchMean = document.getElementById("bench-mean");
const benchMedian = document.getElementById("bench-median");
const benchMin = document.getElementById("bench-min");
const benchMax = document.getElementById("bench-max");

const userScoreEl = document.getElementById("user-score");
const oneLineReport = document.getElementById("one-line-report");

const benchStats = stats(benchmarkScores);
benchN.textContent = benchStats.n;
benchMean.textContent = benchStats.mean.toFixed(2);
benchMedian.textContent = benchStats.median.toFixed(2);
benchMin.textContent = benchStats.min.toFixed(2);
benchMax.textContent = benchStats.max.toFixed(2);

function isComplete() {
  return state.q1 && state.q2 && state.q3 && state.q4;
}

computeBtn.addEventListener("click", () => {
  if (!isComplete()) {
    warning.classList.remove("hidden");
    output.classList.add("hidden");
    warning.textContent = "Please answer all four questions before computing your score.";
    return;
  }

  const s = computeScorePlaceholder();
  const level = interpret(s);

  warning.classList.add("hidden");
  output.classList.remove("hidden");

  userScoreEl.textContent = s.toFixed(2);
  oneLineReport.textContent =
    `In this research survey benchmark, your zero-sum thinking score is ${s.toFixed(2)} (0–1), which is ${level}.`;
});

resetBtn.addEventListener("click", () => {
  state.q1 = state.q2 = state.q3 = state.q4 = null;

  // reset pressed UI
  choicesContainers.forEach((c) => {
    [...c.children].forEach((btn) => btn.setAttribute("aria-pressed", "false"));
  });

  output.classList.add("hidden");
  warning.classList.remove("hidden");
  warning.textContent = "Answer all four questions, then click “Compute score”.";
});

// ---------------------------
// Story 3: Visualization (Demographic patterns)
// ---------------------------
let chartInstance = null;

const demoSelect = document.getElementById("demo-select");
const chartContainer = document.getElementById("chart-container");
const chartInfo = document.getElementById("chart-info");
const filtersPanel = document.getElementById("filters-panel");
const resetFiltersBtn = document.getElementById("reset-filters-btn");

// Define display order for each demographic variable
const variableOrder = {
  age: ["18-25", "26-40", "41-55", "56-70", "70+"],
  gender: ["Male", "Female"],
  education: ["High School", "Bachelor", "Master+"],
  income: ["< $30k", "$30-60k", "$60-100k", "$100k+"],
  party: ["Democrat", "Republican", "Independent"],
  urbanicity: ["Urban", "Suburban", "Rural"]
};

// Current state
let currentXAxis = "age";
let currentFilters = {}; // { variable: [selected values] }

// Get unique values for a variable
function getUniqueValues(data, variable) {
  const values = new Set(data.map(d => d[variable]));
  const order = variableOrder[variable] || Array.from(values).sort();
  return order.filter(v => values.has(v));
}

// Render filter panel based on current X-axis
function renderFiltersPanel() {
  filtersPanel.innerHTML = "";
  
  const allVariables = ["age", "gender", "education", "income", "party", "urbanicity"];
  const availableVariables = allVariables.filter(v => v !== currentXAxis);
  
  availableVariables.forEach(variable => {
    const values = getUniqueValues(mockDataViz, variable);
    
    // Create filter group
    const filterGroup = document.createElement("div");
    filterGroup.style.marginBottom = "12px";
    filterGroup.style.paddingBottom = "12px";
    filterGroup.style.borderBottom = "1px solid var(--border)";
    
    const label = document.createElement("label");
    label.style.display = "block";
    label.style.fontSize = "12px";
    label.style.fontWeight = "600";
    label.style.marginBottom = "6px";
    label.style.color = "var(--text)";
    label.textContent = variable.charAt(0).toUpperCase() + variable.slice(1);
    
    filterGroup.appendChild(label);
    
    // Create checkboxes for each value
    values.forEach(value => {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.style.display = "flex";
      checkboxContainer.style.alignItems = "center";
      checkboxContainer.style.marginBottom = "6px";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `filter-${variable}-${value}`;
      checkbox.value = value;
      checkbox.style.marginRight = "6px";
      checkbox.style.cursor = "pointer";
      
      // Check if currently selected
      if (currentFilters[variable] && currentFilters[variable].includes(value)) {
        checkbox.checked = true;
      }
      
      checkbox.addEventListener("change", () => {
        updateFilter(variable, value, checkbox.checked);
      });
      
      const checkboxLabel = document.createElement("label");
      checkboxLabel.htmlFor = `filter-${variable}-${value}`;
      checkboxLabel.style.fontSize = "12px";
      checkboxLabel.style.cursor = "pointer";
      checkboxLabel.textContent = value;
      
      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(checkboxLabel);
      filterGroup.appendChild(checkboxContainer);
    });
    
    filtersPanel.appendChild(filterGroup);
  });
}

// Update filter state and re-render chart
function updateFilter(variable, value, isChecked) {
  if (!currentFilters[variable]) {
    currentFilters[variable] = [];
  }
  
  if (isChecked) {
    if (!currentFilters[variable].includes(value)) {
      currentFilters[variable].push(value);
    }
  } else {
    currentFilters[variable] = currentFilters[variable].filter(v => v !== value);
    if (currentFilters[variable].length === 0) {
      delete currentFilters[variable];
    }
  }
  
  renderVisualization(currentXAxis);
}

// Reset all filters
function resetAllFilters() {
  currentFilters = {};
  renderFiltersPanel();
  renderVisualization(currentXAxis);
}

// Apply filters to data
function applyFilters(data) {
  return data.filter(record => {
    for (const [variable, selectedValues] of Object.entries(currentFilters)) {
      if (!selectedValues.includes(record[variable])) {
        return false;
      }
    }
    return true;
  });
}

function renderVisualization(variable) {
  // Apply filters first
  const filteredData = applyFilters(mockDataViz);
  
  // Aggregate data by the selected demographic variable
  const aggregated = aggregateByDemographic(filteredData, variable);
  
  // Sort by the defined order
  const order = variableOrder[variable] || [];
  const sorted = aggregated.sort((a, b) => {
    const indexA = order.indexOf(a.label);
    const indexB = order.indexOf(b.label);
    return indexA - indexB;
  });

  // Prepare chart data
  const labels = sorted.map(d => d.label);
  const scores = sorted.map(d => d.mean);
  const sampleSizes = sorted.map(d => d.n);

  // Destroy previous chart if exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create new bar chart
  chartInstance = new Chart(chartContainer, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Average Zero-Sum Index (0–1)",
          data: scores,
          backgroundColor: "rgba(100, 150, 255, 0.7)",
          borderColor: "rgba(100, 150, 255, 1)",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: "x",
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          title: {
            display: true,
            text: "Zero-Sum Index (normalized)"
          }
        }
      },
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              return "N = " + sampleSizes[context.dataIndex];
            }
          }
        }
      }
    }
  });

  // Display summary info
  const minScore = Math.min(...scores).toFixed(2);
  const maxScore = Math.max(...scores).toFixed(2);
  const meanScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  const totalN = sampleSizes.reduce((a, b) => a + b, 0);
  const filterSummary = Object.entries(currentFilters).length > 0 
    ? ` | Filters applied: ${Object.keys(currentFilters).join(", ")}`
    : "";

  chartInfo.innerHTML = `
    <strong>Summary for ${variable}:</strong>
    Mean: ${meanScore} | Min: ${minScore} | Max: ${maxScore} | Total N: ${totalN}${filterSummary}
  `;
}

// Event listener for demographic variable selector
demoSelect.addEventListener("change", (e) => {
  currentXAxis = e.target.value;
  renderFiltersPanel();
  renderVisualization(currentXAxis);
});

// Reset filters button
resetFiltersBtn.addEventListener("change", () => {
  resetAllFilters();
});

resetFiltersBtn.addEventListener("click", () => {
  resetAllFilters();
});

// Initialize visualization with default selection
window.addEventListener("load", () => {
  currentXAxis = "age";
  renderFiltersPanel();
  renderVisualization("age");
  initializePolicyIndices();
});

// ---------------------------
// Story 3.2: Policy Indices
// ---------------------------
let policyChartInstance = null;

const policySelect = document.getElementById("policy-select");
const policyChartContainer = document.getElementById("policy-chart-container");
const policyTitle = document.getElementById("policy-title");
const policyDescription = document.getElementById("policy-description");

const policyMean = document.getElementById("policy-mean");
const policyMedian = document.getElementById("policy-median");
const policyStddev = document.getElementById("policy-stddev");
const policyRange = document.getElementById("policy-range");

const policyDescriptions = {
  epi: {
    title: "Economic Policy Index (EPI)",
    description: "Reflects beliefs about resource redistribution and market-based gains. Higher scores indicate preference for zero-sum economic beliefs."
  },
  swi: {
    title: "Social Welfare Index (SWI)",
    description: "Reflects attitudes toward public benefit programs and social equity. Higher scores indicate belief that welfare expansion diminishes opportunities for others."
  },
  ipi: {
    title: "Immigration Policy Index (IPI)",
    description: "Reflects perceptions of immigration's impact on native-born citizens. Higher scores indicate belief that immigrant gains harm native employment/resources."
  },
  eoi: {
    title: "Education Opportunity Index (EOI)",
    description: "Reflects beliefs about educational advancement as competitive or collaborative. Higher scores indicate zero-sum views (higher ed for some means less for others)."
  }
};

function calculateStats(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stddev = Math.sqrt(variance);
  const min = sorted[0];
  const max = sorted[n - 1];
  
  return { mean, median, stddev, min, max };
}

function renderPolicyIndices(indexKey) {
  // Extract policy values from all records
  const policyValues = mockDataViz.map(record => record[indexKey]);
  
  // Calculate statistics
  const stats = calculateStats(policyValues);
  
  // Update title and description
  const policyInfo = policyDescriptions[indexKey];
  policyTitle.textContent = policyInfo.title;
  policyDescription.textContent = policyInfo.description;
  
  // Create histogram (distribution)
  const bins = 10;
  const binSize = 1 / bins;
  const histogram = Array(bins).fill(0);
  
  policyValues.forEach(value => {
    const binIndex = Math.min(Math.floor(value / binSize), bins - 1);
    histogram[binIndex]++;
  });
  
  const binLabels = Array.from({ length: bins }, (_, i) => {
    const start = (i * binSize).toFixed(2);
    const end = ((i + 1) * binSize).toFixed(2);
    return `${start}-${end}`;
  });
  
  // Destroy previous chart if exists
  if (policyChartInstance) {
    policyChartInstance.destroy();
  }
  
  // Create histogram chart
  policyChartInstance = new Chart(policyChartContainer, {
    type: "bar",
    data: {
      labels: binLabels,
      datasets: [
        {
          label: "Frequency",
          data: histogram,
          backgroundColor: "rgba(100, 200, 100, 0.7)",
          borderColor: "rgba(100, 200, 100, 1)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Count"
          }
        },
        x: {
          title: {
            display: true,
            text: "Index Value"
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
  
  // Update statistics display
  policyMean.textContent = stats.mean.toFixed(3);
  policyMedian.textContent = stats.median.toFixed(3);
  policyStddev.textContent = stats.stddev.toFixed(3);
  policyRange.textContent = `${stats.min.toFixed(3)} – ${stats.max.toFixed(3)}`;
}

function initializePolicyIndices() {
  renderPolicyIndices("epi");
  renderScatterFiltersPanel();
  renderScatterPlot("epi");
  
  policySelect.addEventListener("change", (e) => {
    renderPolicyIndices(e.target.value);
  });
  
  policySelectScatter.addEventListener("change", (e) => {
    renderScatterPlot(e.target.value);
  });
  
  resetScatterFiltersBtn.addEventListener("click", () => {
    resetScatterFiltersAll();
  });
  
  // Add event listener for map filters reset button (Story 3.3.2–3.3.3)
  if (resetMapFiltersBtn) {
    resetMapFiltersBtn.addEventListener("click", () => {
      resetMapFilters();
    });
  }
  
  // Add event listener for clear demographics button (Story 3.3.3)
  if (clearMapDemographicsBtn) {
    clearMapDemographicsBtn.addEventListener("click", () => {
      clearMapDemographicFilters();
    });
  }
}

// ---------------------------
// Story 3.2.2: Scatter Plot (Zero-Sum vs Policy Index)
// ---------------------------
let scatterChartInstance = null;

const policySelectScatter = document.getElementById("policy-select-scatter");
const scatterChartContainer = document.getElementById("scatter-chart-container");
const scatterTitle = document.getElementById("scatter-title");
const scatterDescription = document.getElementById("scatter-description");
const correlationR = document.getElementById("correlation-r");
const correlationR2 = document.getElementById("correlation-r2");
const scatterN = document.getElementById("scatter-n");
const scatterFiltersPanel = document.getElementById("scatter-filters-panel");
const resetScatterFiltersBtn = document.getElementById("reset-scatter-filters-btn");
const scatterFilterSummary = document.getElementById("scatter-filter-summary");
const resetMapFiltersBtn = document.getElementById("reset-map-filters-btn");
const clearMapDemographicsBtn = document.getElementById("clear-map-demographics-btn");
const toggleDemographicFiltersBtn = document.getElementById("toggle-demographic-filters-btn");
const closeDemographicFiltersBtn = document.getElementById("close-demographic-filters-btn");
const mapDemographicFiltersPanel = document.getElementById("map-demographic-filters-panel");

// Scatter plot filter state
let scatterFilters = {};

// Handle floating panel toggle
if (toggleDemographicFiltersBtn) {
  toggleDemographicFiltersBtn.addEventListener("click", () => {
    const isHidden = mapDemographicFiltersPanel.style.display === "none";
    mapDemographicFiltersPanel.style.display = isHidden ? "block" : "none";
    toggleDemographicFiltersBtn.textContent = isHidden ? "✕ Additional Filters" : "⚙ Additional Filters";
  });
}

// Handle closing the floating panel
if (closeDemographicFiltersBtn) {
  closeDemographicFiltersBtn.addEventListener("click", () => {
    mapDemographicFiltersPanel.style.display = "none";
    if (toggleDemographicFiltersBtn) {
      toggleDemographicFiltersBtn.textContent = "⚙ Additional Filters";
    }
  });
}

function renderScatterFiltersPanel() {
  scatterFiltersPanel.innerHTML = "";
  
  const allVariables = ["age", "gender", "education", "income", "party", "urbanicity"];
  
  allVariables.forEach(variable => {
    const values = getUniqueValues(mockDataViz, variable);
    
    // Create filter column
    const column = document.createElement("div");
    column.className = "filter-column";
    
    // Create header
    const header = document.createElement("div");
    header.className = "filter-column__header";
    header.textContent = variable.toUpperCase();
    column.appendChild(header);
    
    // Create options container
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "filter-column__options";
    
    // Create checkboxes for each value
    values.forEach(value => {
      const optionDiv = document.createElement("div");
      optionDiv.className = "filter-option-item";
      
      // Add active class if selected
      if (scatterFilters[variable] && scatterFilters[variable].includes(value)) {
        optionDiv.classList.add("active");
      }
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `scatter-filter-${variable}-${value}`;
      checkbox.value = value;
      
      // Check if currently selected
      if (scatterFilters[variable] && scatterFilters[variable].includes(value)) {
        checkbox.checked = true;
      }
      
      checkbox.addEventListener("change", () => {
        updateScatterFilter(variable, value, checkbox.checked);
      });
      
      const checkboxLabel = document.createElement("span");
      checkboxLabel.className = "filter-option-label";
      checkboxLabel.htmlFor = `scatter-filter-${variable}-${value}`;
      checkboxLabel.textContent = value;
      
      optionDiv.appendChild(checkbox);
      optionDiv.appendChild(checkboxLabel);
      optionsContainer.appendChild(optionDiv);
    });
    
    column.appendChild(optionsContainer);
    scatterFiltersPanel.appendChild(column);
  });
}

function updateScatterFilter(variable, value, isChecked) {
  if (!scatterFilters[variable]) {
    scatterFilters[variable] = [];
  }
  
  if (isChecked) {
    if (!scatterFilters[variable].includes(value)) {
      scatterFilters[variable].push(value);
    }
  } else {
    scatterFilters[variable] = scatterFilters[variable].filter(v => v !== value);
    if (scatterFilters[variable].length === 0) {
      delete scatterFilters[variable];
    }
  }
  
  // Update active state
  const checkbox = document.querySelector(`input#scatter-filter-${variable}-${value}`);
  if (checkbox) {
    const optionItem = checkbox.closest(".filter-option-item");
    if (optionItem) {
      if (checkbox.checked) {
        optionItem.classList.add("active");
      } else {
        optionItem.classList.remove("active");
      }
    }
  }
  
  renderScatterPlot(policySelectScatter.value);
  updateScatterFilterSummary();
}

function resetScatterFiltersAll() {
  scatterFilters = {};
  renderScatterFiltersPanel();
  renderScatterPlot(policySelectScatter.value);
  updateScatterFilterSummary();
}

function applyScatterFilters(data) {
  return data.filter(record => {
    for (const [variable, selectedValues] of Object.entries(scatterFilters)) {
      if (!selectedValues.includes(record[variable])) {
        return false;
      }
    }
    return true;
  });
}

function updateScatterFilterSummary() {
  if (Object.keys(scatterFilters).length === 0) {
    scatterFilterSummary.style.display = "none";
  } else {
    const filterTexts = Object.entries(scatterFilters).map(([key, values]) => {
      return `<strong>${key}:</strong> ${values.join(", ")}`;
    });
    scatterFilterSummary.innerHTML = `<strong>Active filters:</strong> ${filterTexts.join(" | ")}`;
    scatterFilterSummary.style.display = "block";
  }
}

function calculateCorrelation(xValues, yValues) {
  const n = xValues.length;
  const meanX = xValues.reduce((a, b) => a + b, 0) / n;
  const meanY = yValues.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = xValues[i] - meanX;
    const dy = yValues[i] - meanY;
    numerator += dx * dy;
    sumSqX += dx * dx;
    sumSqY += dy * dy;
  }
  
  const denominator = Math.sqrt(sumSqX * sumSqY);
  const r = denominator === 0 ? 0 : numerator / denominator;
  const r2 = r * r;
  
  return { r, r2 };
}

function renderScatterPlot(indexKey) {
  // Apply filters first
  const filteredData = applyScatterFilters(mockDataViz);
  
  // Extract data points from filtered data
  const xValues = filteredData.map(record => record.zeroSumScore);
  const yValues = filteredData.map(record => record[indexKey]);
  
  // Handle empty filtered data
  if (xValues.length === 0) {
    correlationR.textContent = "—";
    correlationR2.textContent = "—";
    scatterN.textContent = "0";
    
    if (scatterChartInstance) {
      scatterChartInstance.destroy();
    }
    
    scatterChartInstance = new Chart(scatterChartContainer, {
      type: "scatter",
      data: {
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          annotation: {
            annotations: {
              box1: {
                type: "label",
                content: ["No data available"]
              }
            }
          }
        }
      }
    });
    
    return;
  }
  
  // Prepare scatter data
  const scatterData = xValues.map((x, i) => ({
    x: x,
    y: yValues[i]
  }));
  
  // Calculate correlation
  const correlation = calculateCorrelation(xValues, yValues);
  
  // Update title and description
  const policyInfo = policyDescriptions[indexKey];
  scatterTitle.textContent = `Zero-Sum Index vs ${policyInfo.title}`;
  scatterDescription.textContent = `Each point represents one individual respondent. The X-axis shows their overall Zero-Sum Thinking score, while the Y-axis shows their score on the ${policyInfo.title}.`;
  
  // Destroy previous chart if exists
  if (scatterChartInstance) {
    scatterChartInstance.destroy();
  }
  
  // Create scatter plot
  scatterChartInstance = new Chart(scatterChartContainer, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Respondents",
          data: scatterData,
          backgroundColor: "rgba(100, 150, 255, 0.6)",
          borderColor: "rgba(100, 150, 255, 0.8)",
          borderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          min: 0,
          max: 1,
          title: {
            display: true,
            text: "Zero-Sum Index (0–1)"
          }
        },
        y: {
          min: 0,
          max: 1,
          title: {
            display: true,
            text: `${policyInfo.title} (0–1)`
          }
        }
      },
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Zero-Sum: ${context.parsed.x.toFixed(2)}, ${policyInfo.title}: ${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      }
    }
  });
  
  // Update correlation stats
  correlationR.textContent = correlation.r.toFixed(3);
  correlationR2.textContent = correlation.r2.toFixed(3);
  scatterN.textContent = xValues.length;
}

// Sub-tab switching for Policy Indices
const subTabBtns = document.querySelectorAll(".sub-tab-btn");
const subTabContents = document.querySelectorAll(".sub-tab-content");

subTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const subTabName = btn.dataset.subTab;
    
    // Remove active class
    subTabBtns.forEach(b => b.classList.remove("sub-tab-btn--active"));
    subTabContents.forEach(stc => stc.classList.remove("sub-tab-content--active"));
    
    // Add active class
    btn.classList.add("sub-tab-btn--active");
    document.getElementById(`sub-tab-${subTabName}`).classList.add("sub-tab-content--active");
    
    // Refresh scatter chart if switching to correlation
    if (subTabName === "correlation") {
      setTimeout(() => {
        renderScatterPlot(policySelectScatter.value);
      }, 100);
    }
  });
});

// Tab switching
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;
    
    // Remove active class from all tabs and buttons
    tabBtns.forEach(b => b.classList.remove("tab-btn--active"));
    tabContents.forEach(tc => tc.classList.remove("tab-content--active"));
    
    // Add active class to selected tab and button
    btn.classList.add("tab-btn--active");
    document.getElementById(`tab-${tabName}`).classList.add("tab-content--active");
    
    // Refresh charts if switching to policy indices
    if (tabName === "policy-indices") {
      setTimeout(() => {
        renderPolicyIndices(policySelect.value);
      }, 100);
    }
    
    // Initialize map if switching to geographic-map
    if (tabName === "geographic-map") {
      setTimeout(() => {
        if (!window.countyMap) {
          initializeCountyMap();
          initializeMapFilters();
          initializeMapDemographicFilters();
        } else {
          window.countyMap.invalidateSize();
        }
        renderCountyMapColors();
      }, 100);
    }
  });
});

// ---------------------------
// Story 3.3: Geographic Map (County-Level)
// ---------------------------
function getColorForScore(score) {
  // Blue (0.0) to Yellow (0.5) to Orange (1.0) gradient - colorblind friendly
  // Uses a perceptually uniform scale
  if (score < 0.5) {
    // Blue to Yellow (0.0 to 0.5)
    const t = score * 2; // normalize to 0-1
    const r = Math.round(30 + t * 225); // #1e to #ff
    const g = Math.round(100 + t * 155); // #64 to #ff
    const b = Math.round(255 - t * 100); // #ff to #9b
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Orange (0.5 to 1.0)
    const t = (score - 0.5) * 2; // normalize to 0-1
    const r = 255; // stays at #ff
    const g = Math.round(255 - t * 100); // #ff to #9b
    const b = Math.round(155 - t * 155); // #9b to #00
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// State for map immigration filters (Story 3.3.2)
const mapFilters = {
  immigrationStatus: null
};

// State for combined map filters (Story 3.3.3)
const mapDemographicFilters = {
  age: [],
  gender: [],
  education: [],
  income: [],
  party: [],
  urbanicity: []
};

// Initialize immigration status filter panel (Story 3.3.2)
function initializeMapFilters() {
  const immigrationOptions = [
    "Both parents native",
    "One parent immigrant",
    "Both parents immigrant",
    "One or more grandparents immigrant"
  ];

  const filterPanel = document.getElementById("map-immigration-filters");
  filterPanel.innerHTML = "";

  // Add "All" option first
  const allLabel = document.createElement("div");
  allLabel.className = "filter-option-item";
  if (mapFilters.immigrationStatus === null) allLabel.classList.add("active");
  
  const allCheckbox = document.createElement("input");
  allCheckbox.type = "radio";
  allCheckbox.name = "map-immigration-status";
  allCheckbox.value = "";
  allCheckbox.checked = mapFilters.immigrationStatus === null;
  allCheckbox.addEventListener("change", () => updateMapFilter(null));
  
  const allLabelText = document.createElement("span");
  allLabelText.className = "filter-option-label";
  allLabelText.textContent = "All";
  
  allLabel.appendChild(allCheckbox);
  allLabel.appendChild(allLabelText);
  filterPanel.appendChild(allLabel);

  immigrationOptions.forEach(option => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "filter-option-item";
    if (mapFilters.immigrationStatus === option) optionDiv.classList.add("active");
    
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "map-immigration-status";
    radio.value = option;
    radio.checked = mapFilters.immigrationStatus === option;
    radio.addEventListener("change", () => updateMapFilter(option));
    
    const labelText = document.createElement("span");
    labelText.className = "filter-option-label";
    labelText.textContent = option;
    
    optionDiv.appendChild(radio);
    optionDiv.appendChild(labelText);
    filterPanel.appendChild(optionDiv);
  });
}

// Initialize demographic filters for map (Story 3.3.3)
function initializeMapDemographicFilters() {
  const demographicPanel = document.getElementById("map-demographic-filters");
  demographicPanel.innerHTML = "";
  
  const variables = [
    { key: "age", label: "Age", options: ["18-25", "26-40", "41-55", "56-70", "70+"] },
    { key: "gender", label: "Gender", options: ["Male", "Female"] },
    { key: "education", label: "Education", options: ["High School", "Bachelor", "Master+"] },
    { key: "income", label: "Income", options: ["< $30k", "$30-60k", "$60-100k", "$100k+"] },
    { key: "party", label: "Party", options: ["Democrat", "Republican", "Independent"] },
    { key: "urbanicity", label: "Urbanicity", options: ["Urban", "Suburban", "Rural"] }
  ];
  
  variables.forEach(variable => {
    const column = document.createElement("div");
    column.className = "filter-column";
    
    const header = document.createElement("div");
    header.className = "filter-column__header";
    header.textContent = variable.label.toUpperCase();
    column.appendChild(header);
    
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "filter-column__options";
    
    variable.options.forEach(option => {
      const optionDiv = document.createElement("div");
      optionDiv.className = "filter-option-item";
      if (mapDemographicFilters[variable.key].includes(option)) optionDiv.classList.add("active");
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = `map-${variable.key}`;
      checkbox.value = option;
      checkbox.checked = mapDemographicFilters[variable.key].includes(option);
      checkbox.addEventListener("change", () => updateMapDemographicFilter(variable.key, option));
      
      const labelText = document.createElement("span");
      labelText.className = "filter-option-label";
      labelText.textContent = option;
      
      optionDiv.appendChild(checkbox);
      optionDiv.appendChild(labelText);
      optionsContainer.appendChild(optionDiv);
    });
    
    column.appendChild(optionsContainer);
    demographicPanel.appendChild(column);
  });
}

// Update demographic filter selection (Story 3.3.3)
function updateMapDemographicFilter(variable, option) {
  const filters = mapDemographicFilters[variable];
  const index = filters.indexOf(option);
  
  if (index > -1) {
    filters.splice(index, 1);
  } else {
    filters.push(option);
  }
  
  // Update active states for checkboxes
  const checkbox = document.querySelector(`input[name="map-${variable}"][value="${option}"]`);
  if (checkbox) {
    const optionItem = checkbox.closest(".filter-option-item");
    if (optionItem) {
      if (checkbox.checked) {
        optionItem.classList.add("active");
      } else {
        optionItem.classList.remove("active");
      }
    }
  }
  
  updateMapFilterSummary();
  renderCountyMapColors();
}

// Update map filter selection (Story 3.3.2)
function updateMapFilter(immigrationStatus) {
  mapFilters.immigrationStatus = immigrationStatus;
  
  // Update active states for radio buttons
  const allRadios = document.querySelectorAll("input[name='map-immigration-status']");
  allRadios.forEach(radio => {
    const optionItem = radio.closest(".filter-option-item");
    if (optionItem) {
      if (radio.checked) {
        optionItem.classList.add("active");
      } else {
        optionItem.classList.remove("active");
      }
    }
  });
  
  updateMapFilterSummary();
  renderCountyMapColors();
}

// Update the filter summary display (Story 3.3.2–3.3.3)
function updateMapFilterSummary() {
  const summaryDiv = document.getElementById("map-filter-summary");
  const filters = [];
  
  if (mapFilters.immigrationStatus) {
    filters.push(`Immigration: ${mapFilters.immigrationStatus}`);
  }
  
  // Add demographic filters
  for (const [key, values] of Object.entries(mapDemographicFilters)) {
    if (values.length > 0) {
      filters.push(`${key}: ${values.join(", ")}`);
    }
  }
  
  if (filters.length > 0) {
    summaryDiv.innerHTML = `<strong>Active Filters:</strong> ${filters.join(" | ")}`;
    summaryDiv.style.display = "block";
  } else {
    summaryDiv.style.display = "none";
  }
}

// Reset all map filters (Story 3.3.3)
function resetMapFilters() {
  mapFilters.immigrationStatus = null;
  mapDemographicFilters.age = [];
  mapDemographicFilters.gender = [];
  mapDemographicFilters.education = [];
  mapDemographicFilters.income = [];
  mapDemographicFilters.party = [];
  mapDemographicFilters.urbanicity = [];
  initializeMapFilters();
  initializeMapDemographicFilters();
  updateMapFilterSummary();
  renderCountyMapColors();
}

// Clear only demographic filters, keep immigration filter (Story 3.3.3)
function clearMapDemographicFilters() {
  mapDemographicFilters.age = [];
  mapDemographicFilters.gender = [];
  mapDemographicFilters.education = [];
  mapDemographicFilters.income = [];
  mapDemographicFilters.party = [];
  mapDemographicFilters.urbanicity = [];
  initializeMapDemographicFilters();
  updateMapFilterSummary();
  renderCountyMapColors();
}

function initializeCountyMap() {
  // Create a simple map centered on USA
  const mapContainer = document.getElementById("map-container");
  
  window.countyMap = L.map(mapContainer).setView([39.8, -98.6], 4);
  
  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    opacity: 0.3
  }).addTo(window.countyMap);
  
  // Create a feature group for county markers
  window.countyMarkers = L.featureGroup().addTo(window.countyMap);
}

function renderCountyMapColors() {
  if (!window.countyMap) return;
  
  // Clear existing markers
  if (window.countyMarkers) {
    window.countyMarkers.clearLayers();
  }
  
  // Get filtered individual-level data based on combined filters (Story 3.3.3)
  let filteredData = mockDataViz;
  
  // Apply demographic filters first
  for (const [key, values] of Object.entries(mapDemographicFilters)) {
    if (values.length > 0) {
      filteredData = filteredData.filter(record => values.includes(record[key]));
    }
  }
  
  // Apply immigration status filter
  if (mapFilters.immigrationStatus) {
    filteredData = filteredData.filter(record => record.immigrationStatus === mapFilters.immigrationStatus);
  }
  
  // Aggregate filtered data by county (Story 3.3.3)
  const countyStats = {};
  filteredData.forEach(record => {
    if (!countyStats[record.fips]) {
      countyStats[record.fips] = {
        county: record.county,
        scores: [],
        count: 0
      };
    }
    countyStats[record.fips].scores.push(record.zeroSumScore);
    countyStats[record.fips].count++;
  });
  
  // Calculate county averages from filtered data
  const filteredCountyData = Object.entries(countyStats).map(([fips, stats]) => ({
    fips: parseInt(fips),
    county: stats.county,
    zeroSumAvg: stats.scores.length > 0 ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length : 0,
    n: stats.count
  }));
  
  // County approximate center coordinates (for demonstration)
  const countyCoords = {
    6037: [34.05, -118.24],   // Los Angeles
    17031: [41.88, -87.62],   // Cook (Chicago)
    48201: [29.76, -95.37],   // Harris
    4013: [33.37, -112.07],   // Maricopa (Phoenix)
    6073: [32.71, -117.16],   // San Diego
    12011: [26.22, -80.24],   // Broward
    53033: [47.61, -122.33],  // King (Seattle)
    36061: [40.71, -74.01],   // New York
    48113: [32.78, -96.80],   // Dallas
    48439: [32.31, -97.23],   // Tarrant
    6059: [33.65, -117.92],   // Orange County
    13121: [33.75, -84.39],   // Fulton (Atlanta)
    27053: [44.97, -93.27],   // Hennepin (Minneapolis)
    26163: [42.33, -83.27],   // Wayne (Detroit)
    12031: [30.33, -81.66],   // Duval
    12057: [27.94, -82.46],   // Hillsborough
    8005: [39.74, -104.87],   // Arapahoe
    47157: [35.15, -89.97],   // Shelby (Memphis)
    32003: [36.17, -115.14],  // Clark (Las Vegas)
    41051: [45.52, -122.68],  // Multnomah (Portland)
    53053: [47.14, -122.21],  // Pierce
    6001: [37.81, -122.27],   // Alameda
    39035: [41.45, -81.69],   // Cuyahoga (Cleveland)
    24003: [39.50, -76.64],   // Baltimore
    37183: [35.78, -78.63],   // Wake
    34023: [40.58, -74.27],   // Middlesex
    6029: [35.37, -119.02],   // Kern
    6085: [37.33, -121.89],   // Santa Clara
    51059: [38.85, -77.31],   // Fairfax
    36119: [41.28, -73.75],   // Westchester
    12086: [25.76, -80.19],   // Dade (Miami)
    12099: [26.71, -80.05],   // Palm Beach
    47037: [36.16, -86.78],   // Davidson (Nashville)
    39049: [39.96, -82.99],   // Franklin (Columbus)
    48029: [29.42, -98.49],   // Bexar (San Antonio)
    48453: [30.27, -97.74],   // Travis (Austin)
    8059: [39.74, -105.23],   // Jefferson
    8001: [39.99, -104.97],   // Adams
    6067: [38.58, -121.49],   // Sacramento
    6019: [36.74, -119.77],   // Fresno
    6031: [35.75, -119.98],   // Kings
    40143: [36.15, -95.89],   // Tulsa
    35001: [35.09, -106.64],  // Bernalillo
    19153: [41.59, -93.62],   // Polk
    4019: [32.22, -110.93],   // Pima (Tucson)
    36029: [42.88, -78.88],   // Erie (Buffalo)
    41047: [44.97, -123.07],  // Marion
    8069: [40.55, -105.07]    // Larimer
  };
  
  // Calculate statistics
  const scores = filteredCountyData.map(d => d.zeroSumAvg);
  const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const medianScore = scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  
  // Update statistics
  document.getElementById("map-county-count").textContent = filteredCountyData.length;
  document.getElementById("map-mean").textContent = meanScore.toFixed(3);
  document.getElementById("map-median").textContent = medianScore.toFixed(3);
  document.getElementById("map-range").textContent = `${minScore.toFixed(3)} – ${maxScore.toFixed(3)}`;
  
  // Check for small sample size warning (Story 3.3.3)
  const warningDiv = document.getElementById("map-sample-size-warning");
  const warningText = document.getElementById("map-warning-text");
  const smallSamples = filteredCountyData.filter(d => d.n < 5);
  const verySmallSamples = filteredCountyData.filter(d => d.n < 2);
  
  if (verySmallSamples.length > 0 || smallSamples.length > filteredCountyData.length * 0.3) {
    const warning = verySmallSamples.length > 0 
      ? `${verySmallSamples.length} counties have very small sample sizes (n < 2). Results may be unstable.`
      : `${smallSamples.length} counties have small sample sizes (n < 5). Interpret with caution.`;
    warningText.textContent = warning;
    warningDiv.style.display = "block";
  } else {
    warningDiv.style.display = "none";
  }
  
  // Add county circles to map
  filteredCountyData.forEach(county => {
    const coords = countyCoords[county.fips];
    if (coords) {
      const color = getColorForScore(county.zeroSumAvg);
      
      L.circleMarker(coords, {
        radius: 8,
        fillColor: color,
        color: "rgba(0, 0, 0, 0.2)",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.7
      })
        .bindPopup(`<strong>${county.county}</strong><br/>Zero-Sum Index: ${county.zeroSumAvg.toFixed(3)}<br/>N: ${county.n}`)
        .addTo(window.countyMarkers);
    }
  });
}

// default route
setRoute("learn");
