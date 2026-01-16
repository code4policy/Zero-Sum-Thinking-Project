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

const navButtons = document.querySelectorAll(".nav__link");
const mobileToggle = document.querySelector(".nav__mobile-toggle");
const navMenu = document.querySelector(".nav");

function setRoute(route) {
  Object.entries(pages).forEach(([k, el]) => {
    if (el) el.classList.toggle("page--active", k === route);
  });
  navButtons.forEach((b) => {
    b.setAttribute("aria-current", b.dataset.route === route ? "page" : "false");
  });
  // Close mobile menu after navigation
  if (navMenu) navMenu.classList.remove("nav--open");
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => setRoute(btn.dataset.route));
});

// Mobile menu toggle
if (mobileToggle && navMenu) {
  mobileToggle.addEventListener("click", () => {
    navMenu.classList.toggle("nav--open");
  });
}

// ---------------------------
// Methodology panel toggle (Story 2.2)
// ---------------------------
function toggleMethodology() {
  const content = document.getElementById('methodology-content');
  const icon = document.getElementById('methodology-toggle-icon');
  if (content && icon) {
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'block' : 'none';
    icon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

// ---------------------------
// Story 1.2 mini-game placeholder

// ---------------------------
// Story 2: survey (4 questions) + PCA scoring
// ---------------------------
const choicesContainers = document.querySelectorAll(".choices");
const testState = { ethnic: null, trade: null, citizen: null, income: null };

function renderChoices(container, qKey) {
  if (!container) return;
  container.innerHTML = '';
  const labels = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
  for (let v = 1; v <= 5; v++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice choice--text";
    btn.textContent = labels[v - 1];
    btn.setAttribute("aria-pressed", "false");

    btn.addEventListener("click", () => {
      testState[qKey] = v;
      [...container.children].forEach((c) => c.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
    });

    container.appendChild(btn);
  }
}

choicesContainers.forEach((c) => renderChoices(c, c.dataset.q));

const computeBtn = document.getElementById("compute-btn");
const resetBtn = document.getElementById("reset-btn");
const testResults = document.getElementById("test-results");
const scoreDisplay = document.getElementById("score-display");
const percentileText = document.getElementById("percentile-text");
const interpretationLevel = document.getElementById("interpretation-level");
const interpretationTitle = document.getElementById("interpretation-title");
const interpretationDesc = document.getElementById("interpretation-desc");

let distributionChart = null;

// ZS4_unif 直方图数据（每0.02为一个bin）
const zs4Breaks = [
  0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3, 0.32, 0.34, 0.36, 0.38, 0.4, 0.42, 0.44, 0.46, 0.48, 0.5, 0.52, 0.54, 0.56, 0.58, 0.6, 0.62, 0.64, 0.66, 0.68, 0.7, 0.72, 0.74, 0.76, 0.78, 0.8, 0.82, 0.84, 0.86, 0.88, 0.9, 0.92, 0.94, 0.96, 0.98
];
const zs4Counts = [
  379, 0, 53, 121, 58, 43, 194, 133, 49, 326, 227, 86, 1031, 182, 342, 423, 545, 340, 747, 622, 465, 548, 688, 531, 2292, 549, 487, 654, 841, 611, 570, 951, 421, 434, 487, 485, 222, 963, 136, 280, 285, 135, 94, 323, 120, 27, 197, 74, 0, 507
];

function isTestComplete() {
  return testState.ethnic && testState.trade && testState.citizen && testState.income;
}

function createDistributionChart(userScore) {
  const ctx = document.getElementById('distribution-chart');
  if (!ctx) return;

  // 构造labels为区间字符串，如0.00–0.02
  const labels = zs4Breaks.map((b, i) =>
    i < zs4Breaks.length - 1 ? `${zs4Breaks[i].toFixed(2)}–${zs4Breaks[i+1].toFixed(2)}` : `${zs4Breaks[i].toFixed(2)}–1.00`
  ).slice(0, zs4Counts.length);
  const counts = zs4Counts;

  // 找到用户得分所在bin
  let userBinIndex = zs4Breaks.findIndex((b, i) =>
    i < zs4Breaks.length - 1 && userScore >= zs4Breaks[i] && userScore < zs4Breaks[i+1]
  );
  // 若正好等于1.0，归到最后一个bin
  if (userScore === 1) userBinIndex = zs4Counts.length - 1;

  // Color scheme: 
  // - Below user: light blue (low saturation) 
  // - Above user: light purple (low saturation)
  // - User's bin: orange (visible but neutral, not negative)
  const backgroundColors = counts.map((_, i) => {
    if (i === userBinIndex) {
      return '#f97316'; // Orange for user's position (neutral, visible)
    } else if (i < userBinIndex) {
      return '#bfdbfe'; // Light blue for lower scores (low saturation)
    } else {
      return '#ddd6fe'; // Light purple for higher scores (low saturation)
    }
  });

  if (distributionChart) {
    distributionChart.destroy();
  }

  distributionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Respondents',
        data: counts,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => `Score: ${labels[items[0].dataIndex]}`,
            label: (item) => `Count: ${counts[item.dataIndex]}`
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Zero-Sum Thinking Score (zs4_unif)' }, ticks: { maxRotation: 0, minRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
        y: { title: { display: true, text: 'Number of Respondents' }, beginAtZero: true }
      }
    }
  });
}

if (computeBtn) {
  computeBtn.addEventListener("click", () => {
    if (!isTestComplete()) {
      alert("Please answer all four questions before calculating your score.");
      return;
    }

    const score = ZeroSumTest.calculateScore(
      testState.ethnic,
      testState.trade,
      testState.citizen,
      testState.income
    );
    
    const percentileInfo = ZeroSumTest.getPercentileRank(score);
    const interpretation = ZeroSumTest.getInterpretation(score, 'en');
    
    const scorePercent = Math.round(score * 100);
    const percentile = percentileInfo.percentile;
    
    // Update inline score display
    const scoreInline = document.getElementById("score-inline");
    if (scoreInline) scoreInline.textContent = scorePercent;
    
    // 1️⃣ PRIMARY: Main conclusion based on percentile (cognitive anchor)
    const mainConclusionText = document.getElementById("main-conclusion-text");
    if (mainConclusionText) {
      if (percentile < 25) {
        mainConclusionText.innerHTML = `You are <strong style="color: #2563eb;">less zero-sum</strong> than most people.`;
      } else if (percentile < 50) {
        mainConclusionText.innerHTML = `You are <strong style="color: #0891b2;">somewhat less zero-sum</strong> than average.`;
      } else if (percentile < 75) {
        mainConclusionText.innerHTML = `You are <strong style="color: #d97706;">somewhat more zero-sum</strong> than average.`;
      } else {
        mainConclusionText.innerHTML = `You are <strong style="color: #dc2626;">more zero-sum</strong> than most people.`;
      }
    }
    
    // Percentile text (secondary to main conclusion)
    if (percentileText) {
      percentileText.innerHTML = `You score higher than <strong>${percentile}%</strong> of the ~20,000 U.S. respondents in the study.`;
    }
    
    // Interpretation labels
    if (interpretationLevel) interpretationLevel.textContent = interpretation.level;
    if (interpretationTitle) interpretationTitle.textContent = interpretation.title;
    if (interpretationDesc) interpretationDesc.textContent = interpretation.description;
    
    // 5️⃣ TL;DR summary (most important for users)
    const tldrText = document.getElementById("tldr-text");
    if (tldrText) {
      // Convert percentile to "X out of Y people" format
      let comparisonText = '';
      if (percentile < 25) {
        comparisonText = `Compared to about <strong>3 out of 4 people</strong> in the study, you are <strong>less likely</strong> to see the world as zero-sum.`;
      } else if (percentile < 50) {
        comparisonText = `Compared to about <strong>half</strong> of the people in the study, you are <strong>less likely</strong> to see the world as zero-sum.`;
      } else if (percentile < 75) {
        comparisonText = `Compared to about <strong>half</strong> of the people in the study, you are <strong>more likely</strong> to see the world as zero-sum.`;
      } else {
        comparisonText = `Compared to about <strong>3 out of 4 people</strong> in the study, you are <strong>more likely</strong> to see the world as zero-sum.`;
      }
      tldrText.innerHTML = comparisonText;
    }
    
    createDistributionChart(score);
    
    if (testResults) {
      testResults.style.display = 'block';
      testResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    testState.ethnic = testState.trade = testState.citizen = testState.income = null;

    choicesContainers.forEach((c) => {
      [...c.children].forEach((btn) => btn.setAttribute("aria-pressed", "false"));
    });

    if (testResults) testResults.style.display = 'none';
    if (scoreDisplay) scoreDisplay.textContent = '--';
  });
}

// ---------------------------
// Story 3: Visualization (Demographic patterns)
// ---------------------------

// Data storage - will be loaded from JSON files
let aggregatedData = null;
let variableOrder = null;
let variableMetadata = null;
let rawVizData = null;  // Individual-level data for filtering (Story 3.1.2)
let vizDataLoaded = false;

// All demographic variables available for filtering
const demographicVariables = ['age', 'gender', 'race', 'education', 'income', 'hhIncome', 'party', 'partyDetail', 'urbanicity', 'immigrationStatus'];

// Current filter state (Story 3.1.2)
let currentFilters = {};  // { variableName: [selectedValues] }

const demoSelect = document.getElementById("demo-select");
const d3ChartContainer = document.getElementById("d3-chart-container");
const chartInfo = document.getElementById("chart-info");
const chartTitle = document.getElementById("chart-title");
const chartSubtitle = document.getElementById("chart-subtitle");
const missingDataInfo = document.getElementById("missing-data-info");
const variableNote = document.getElementById("variable-note");
const filtersPanel = document.getElementById("filters-panel");
const resetFiltersBtn = document.getElementById("reset-filters-btn");

// Variable labels and descriptions for dynamic titles
const variableLabels = {
  age: { 
    label: "Age Group", 
    description: "Average zero-sum thinking index across different age groups. Younger adults (18-40) tend to show higher zero-sum beliefs than older adults (56+)." 
  },
  gender: { 
    label: "Gender", 
    description: "Comparison of zero-sum thinking between male and female respondents. Men show slightly higher zero-sum thinking than women on average." 
  },
  race: { 
    label: "Race/Ethnicity", 
    description: "Average zero-sum thinking across racial and ethnic groups. Black respondents show the highest levels, while Asian respondents show the lowest." 
  },
  education: { 
    label: "Education Level", 
    description: "How zero-sum thinking varies by educational attainment. Those with a Bachelor's degree show the lowest zero-sum beliefs." 
  },
  income: { 
    label: "Relative Income", 
    description: "Zero-sum thinking by self-reported relative income. Those who perceive themselves as 'far above average' show the highest zero-sum beliefs." 
  },
  hhIncome: { 
    label: "Household Income", 
    description: "Zero-sum thinking by household income brackets. The lowest income group (<$15k) shows higher zero-sum thinking than middle-income groups." 
  },
  party: { 
    label: "Party Affiliation", 
    description: "Comparison of zero-sum thinking across political party affiliations. Democrats show higher zero-sum thinking than Republicans and Independents." 
  },
  partyDetail: { 
    label: "Party Affiliation (Detailed)", 
    description: "Zero-sum thinking by detailed partisan identity. Strong Democrats show the highest levels, while Moderate Republicans show the lowest." 
  },
  urbanicity: { 
    label: "Urbanicity", 
    description: "How zero-sum thinking varies by residential area. Urban residents show notably higher zero-sum beliefs than suburban or rural residents." 
  },
  immigrationStatus: { 
    label: "Immigration Status", 
    description: "Zero-sum thinking by generational immigration status. First-generation immigrants show the lowest zero-sum beliefs, while 4th+ generation Americans show the highest." 
  }
};

// Current state
let currentXAxis = "age";

// Load visualization data from JSON files
async function loadVizData() {
  try {
    const [aggRes, orderRes, metaRes, rawRes] = await Promise.all([
      fetch('./data/viz/aggregated_data.json'),
      fetch('./data/viz/variable_order.json'),
      fetch('./data/viz/variable_metadata.json'),
      fetch('./data/viz/viz_data.json')  // Individual-level data for filtering
    ]);
    
    aggregatedData = await aggRes.json();
    variableOrder = await orderRes.json();
    variableMetadata = await metaRes.json();
    rawVizData = await rawRes.json();  // ~20k individual records
    vizDataLoaded = true;
    
    console.log(`Visualization data loaded successfully. ${rawVizData.length} individual records available for filtering.`);
    return true;
  } catch (error) {
    console.error('Failed to load visualization data:', error);
    return false;
  }
}

// Render D3.js bar chart
function renderD3BarChart(variable) {
  if (!vizDataLoaded) {
    console.error('Data not loaded yet');
    return;
  }

  // Clear previous chart
  d3.select("#d3-chart-container").selectAll("*").remove();

  // Check if any filters are active
  const hasActiveFilters = Object.keys(currentFilters).length > 0;
  
  let data;
  let filteredCount = 0;
  let totalCount = rawVizData ? rawVizData.length : 0;
  
  if (hasActiveFilters && rawVizData) {
    // Apply filters to raw data and aggregate
    const filteredData = applyFiltersToData(rawVizData, currentFilters);
    filteredCount = filteredData.length;
    data = aggregateByVariable(filteredData, variable);
  } else {
    // Use pre-aggregated data for better performance
    if (!aggregatedData[variable]) {
      console.error('Data not available for variable:', variable);
      return;
    }
    data = aggregatedData[variable].slice();
    filteredCount = totalCount;
  }
  
  // Sort by defined order
  const order = variableOrder[variable] || [];
  
  data = data.slice().sort((a, b) => {
    const indexA = order.indexOf(a.label);
    const indexB = order.indexOf(b.label);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Set up dimensions
  const containerWidth = d3ChartContainer.clientWidth || 600;
  const maxWidth = 700; // Maximum chart width for better aesthetics
  const effectiveWidth = Math.min(containerWidth, maxWidth);
  const margin = { top: 30, right: 30, bottom: 80, left: 60 };
  const width = effectiveWidth - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select("#d3-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale
  const x = d3.scaleBand()
    .range([0, width])
    .domain(data.map(d => d.label))
    .padding(0.2);

  // Y scale (0 to 1 for normalized zero-sum index)
  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

  // Color scale: blue (low) -> yellow (high) - avoiding red/blue partisan association
  const colorScale = d3.scaleLinear()
    .domain([0.35, 0.55, 0.65])
    .range(["#2171b5", "#74c476", "#fec44f"])
    .clamp(true);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-35)")
    .style("text-anchor", "end")
    .style("font-size", "12px");

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toFixed(1)))
    .selectAll("text")
    .style("font-size", "12px");

  // Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -45)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("fill", "#666")
    .text("Zero-Sum Index (0–1)");

  // Create tooltip
  const tooltip = d3.select("#d3-chart-container")
    .append("div")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.85)")
    .style("color", "white")
    .style("padding", "10px 14px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("z-index", "1000")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.2)");

  // Color: soft blue for all bars (comfortable, non-partisan)
  const barColor = "#6baed6";  // Soft steel blue
  const hoverColor = "#f5a623"; // Warm amber/orange on hover

  // Add bars with animation
  svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.label))
    .attr("width", x.bandwidth())
    .attr("y", height)
    .attr("height", 0)
    .attr("fill", barColor)
    .attr("rx", 4)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("fill", hoverColor);
      
      const se = d.se || 0;
      tooltip
        .style("visibility", "visible")
        .html(`<strong>${d.label}</strong><br/>Mean: ${d.mean.toFixed(3)}<br/>N: ${d.n.toLocaleString()}${se > 0 ? `<br/>SE: ±${se.toFixed(4)}` : ''}`);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", barColor);
      tooltip.style("visibility", "hidden");
    })
    .transition()
    .duration(800)
    .ease(d3.easeCubicOut)
    .attr("y", d => y(d.mean))
    .attr("height", d => height - y(d.mean));

  // Add value labels on bars
  svg.selectAll(".bar-label")
    .data(data)
    .join("text")
    .attr("class", "bar-label")
    .attr("x", d => x(d.label) + x.bandwidth() / 2)
    .attr("y", d => y(d.mean) - 8)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "600")
    .style("fill", "#333")
    .style("opacity", 0)
    .text(d => d.mean.toFixed(2))
    .transition()
    .delay(600)
    .duration(400)
    .style("opacity", 1);

  // Update dynamic title and subtitle
  const varInfo = variableLabels[variable] || { label: variable, description: "" };
  const metaInfo = variableMetadata[variable] || {};
  // Note: hasActiveFilters is already declared above
  
  // Build filter description for title/subtitle
  let filterDescription = '';
  if (hasActiveFilters) {
    const filterParts = [];
    for (const [filterVar, values] of Object.entries(currentFilters)) {
      const filterLabel = variableLabels[filterVar]?.label || filterVar;
      if (values.length <= 2) {
        filterParts.push(`${filterLabel}: ${values.join(', ')}`);
      } else {
        filterParts.push(`${filterLabel}: ${values.length} selected`);
      }
    }
    filterDescription = filterParts.join(' | ');
  }
  
  if (chartTitle) {
    if (hasActiveFilters) {
      chartTitle.textContent = `Zero-Sum Thinking by ${varInfo.label} (Filtered)`;
    } else {
      chartTitle.textContent = `Zero-Sum Thinking by ${varInfo.label}`;
    }
  }
  if (chartSubtitle) {
    if (hasActiveFilters) {
      chartSubtitle.innerHTML = `<span style="color: #2563eb; font-weight: 500;">Active Filters: ${filterDescription}</span><br><span style="color: var(--muted); font-size: 13px;">${varInfo.description}</span>`;
    } else {
      chartSubtitle.textContent = varInfo.description;
    }
  }

  // Calculate statistics
  const scores = data.map(d => d.mean);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const minGroup = data.find(d => d.mean === minScore);
  const maxGroup = data.find(d => d.mean === maxScore);
  const totalN = data.reduce((sum, d) => sum + d.n, 0);
  const diff = ((maxScore - minScore) * 100).toFixed(1);

  // Build filter info string
  const activeFilterCount = Object.values(currentFilters).reduce((sum, arr) => sum + arr.length, 0);
  let filterInfo = '';
  if (activeFilterCount > 0) {
    filterInfo = `<br><span style="font-size: 11px; color: #2563eb; font-weight: 500;">🔍 Filtered: ${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} records shown (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied)</span>`;
  }

  // Sample size warning thresholds
  const SMALL_SAMPLE_THRESHOLD = 100;  // Warning for total sample
  const VERY_SMALL_GROUP_THRESHOLD = 30;  // Warning for individual groups
  
  // Check for small samples
  const smallGroups = data.filter(d => d.n < VERY_SMALL_GROUP_THRESHOLD);
  let sampleWarning = '';
  
  if (totalN < SMALL_SAMPLE_THRESHOLD) {
    sampleWarning = `<br><span style="font-size: 11px; color: #dc3545; font-weight: 600;">⚠️ Caution: Very small sample size (N = ${totalN}). Results may not be reliable.</span>`;
  } else if (smallGroups.length > 0) {
    const groupNames = smallGroups.map(g => `${g.label} (n=${g.n})`).join(', ');
    sampleWarning = `<br><span style="font-size: 11px; color: #f59e0b; font-weight: 500;">⚠️ Small sample warning: ${smallGroups.length} group${smallGroups.length > 1 ? 's have' : ' has'} fewer than ${VERY_SMALL_GROUP_THRESHOLD} responses: ${groupNames}</span>`;
  }

  // Update summary info with comparison
  chartInfo.innerHTML = `
    <strong>Key Finding:</strong> 
    <span style="color: #4a90a4; font-weight: 600;">${minGroup.label}</span> shows the lowest zero-sum thinking (${minScore.toFixed(2)}), 
    while <span style="color: #e8a838; font-weight: 600;">${maxGroup.label}</span> shows the highest (${maxScore.toFixed(2)}) — 
    a difference of <strong>${diff} percentage points</strong>.
    <br><span style="font-size: 11px;">Total sample size: N = ${totalN.toLocaleString()}</span>${filterInfo}${sampleWarning}
  `;

  // Show data coverage info based on current filter state
  if (missingDataInfo) {
    const totalSample = 20278; // Total sample size
    
    if (hasActiveFilters) {
      // When filtered, show coverage relative to filtered subsample
      const coveragePercent = ((totalN / filteredCount) * 100).toFixed(1);
      const subsamplePercent = ((filteredCount / totalSample) * 100).toFixed(1);
      
      missingDataInfo.innerHTML = `
        <strong>📊 Data Coverage:</strong> 
        ${totalN.toLocaleString()} valid responses included (${coveragePercent}% of filtered subsample).
        <br><span style="font-size: 11px; color: var(--muted);">Filtered subsample: ${filteredCount.toLocaleString()} records (${subsamplePercent}% of full dataset of ${totalSample.toLocaleString()}).</span>
      `;
      missingDataInfo.style.display = 'block';
    } else {
      // Original logic for unfiltered view
      const available = metaInfo.available || totalN;
      const missing = metaInfo.missing || 0;
      const missingPercent = ((missing / totalSample) * 100).toFixed(1);
      
      if (missing > 0) {
        missingDataInfo.innerHTML = `
          <strong>📊 Data Coverage:</strong> 
          ${available.toLocaleString()} valid responses (${((available / totalSample) * 100).toFixed(1)}% of total sample). 
          ${missing.toLocaleString()} responses (${missingPercent}%) have missing data for this variable.
          ${metaInfo.note && typeof metaInfo.note === 'string' ? `<br><em>Note: ${metaInfo.note}</em>` : ''}
        `;
        missingDataInfo.style.display = 'block';
      } else {
        missingDataInfo.innerHTML = `<strong>📊 Data Coverage:</strong> Complete data — all ${available.toLocaleString()} responses included (100% coverage).`;
        missingDataInfo.style.display = 'block';
      }
    }
  }

  // Show variable note if available (for special warnings)
  if (variableNote) {
    if (metaInfo.note && typeof metaInfo.note === 'string' && metaInfo.note.length > 0) {
      variableNote.innerHTML = `<strong>⚠️ Important:</strong> ${metaInfo.note}`;
      variableNote.style.display = 'block';
      variableNote.style.background = 'rgba(255, 193, 7, 0.15)';
      variableNote.style.padding = '8px 12px';
      variableNote.style.borderRadius = '6px';
      variableNote.style.borderLeft = '3px solid #ffc107';
    } else {
      variableNote.style.display = 'none';
    }
  }
}

// ========================================
// Story 3.1.2: Filter Functions
// ========================================

// Apply filters to raw data
function applyFiltersToData(data, filters) {
  if (!data || Object.keys(filters).length === 0) return data;
  
  return data.filter(record => {
    for (const [variable, selectedValues] of Object.entries(filters)) {
      if (selectedValues.length === 0) continue;
      const recordValue = record[variable];
      // Skip records with null/undefined values for this variable
      if (recordValue === null || recordValue === undefined) return false;
      if (!selectedValues.includes(recordValue)) return false;
    }
    return true;
  });
}

// Aggregate filtered data by variable
function aggregateByVariable(data, variable) {
  if (!data || data.length === 0) return [];
  
  const groups = {};
  
  data.forEach(record => {
    const groupKey = record[variable];
    if (groupKey === null || groupKey === undefined) return;
    
    if (!groups[groupKey]) {
      groups[groupKey] = { sum: 0, count: 0, values: [] };
    }
    if (record.zeroSumScore !== null && record.zeroSumScore !== undefined) {
      groups[groupKey].sum += record.zeroSumScore;
      groups[groupKey].count += 1;
      groups[groupKey].values.push(record.zeroSumScore);
    }
  });
  
  // Calculate mean and standard error for each group
  const result = [];
  Object.entries(groups).forEach(([label, stats]) => {
    if (stats.count > 0) {
      const mean = stats.sum / stats.count;
      const variance = stats.values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / stats.count;
      const se = Math.sqrt(variance / stats.count);
      result.push({
        label: label,
        mean: Math.round(mean * 10000) / 10000,
        n: stats.count,
        se: Math.round(se * 10000) / 10000
      });
    }
  });
  
  return result;
}

// Get unique values for a variable from raw data
function getUniqueValuesFromData(variable) {
  if (!rawVizData) return [];
  
  const values = new Set();
  rawVizData.forEach(record => {
    if (record[variable] !== null && record[variable] !== undefined) {
      values.add(record[variable]);
    }
  });
  
  // Sort by predefined order if available
  const order = variableOrder[variable] || [];
  const sortedValues = Array.from(values).sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA === -1 && indexB === -1) return String(a).localeCompare(String(b));
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
  
  return sortedValues;
}

// Render the filters panel (Story 3.1.2)
function renderFiltersPanel() {
  if (!filtersPanel) return;
  
  filtersPanel.innerHTML = '';
  
  // Get all demographic variables except the current X-axis
  const availableFilters = demographicVariables.filter(v => v !== currentXAxis);
  
  availableFilters.forEach(variable => {
    const varInfo = variableLabels[variable] || { label: variable };
    const values = getUniqueValuesFromData(variable);
    
    if (values.length === 0) return;
    
    // Create filter group container
    const filterGroup = document.createElement('div');
    filterGroup.className = 'filter-group';
    filterGroup.style.cssText = 'margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border);';
    
    // Create collapsible header
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 8px;';
    header.innerHTML = `
      <span style="font-size: 12px; font-weight: 600; color: var(--text);">${varInfo.label}</span>
      <span class="filter-toggle" style="font-size: 10px; color: var(--muted);">▼</span>
    `;
    
    // Create options container (collapsible)
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'filter-options';
    optionsContainer.style.cssText = 'display: none; max-height: 150px; overflow-y: auto;';
    
    // Track selected count
    const selectedCount = (currentFilters[variable] || []).length;
    if (selectedCount > 0) {
      header.querySelector('.filter-toggle').textContent = `${selectedCount} selected`;
      header.querySelector('.filter-toggle').style.color = '#2563eb';
      optionsContainer.style.display = 'block';
    }
    
    // Toggle collapse
    header.addEventListener('click', () => {
      const isOpen = optionsContainer.style.display !== 'none';
      optionsContainer.style.display = isOpen ? 'none' : 'block';
      if (selectedCount === 0) {
        header.querySelector('.filter-toggle').textContent = isOpen ? '▼' : '▲';
      }
    });
    
    // Create checkboxes for each value
    values.forEach(value => {
      const checkboxWrapper = document.createElement('label');
      checkboxWrapper.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 4px 0; cursor: pointer; font-size: 11px; color: var(--text);';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = value;
      checkbox.style.cssText = 'cursor: pointer; accent-color: #2563eb;';
      
      // Check if already selected
      if (currentFilters[variable] && currentFilters[variable].includes(value)) {
        checkbox.checked = true;
      }
      
      checkbox.addEventListener('change', () => {
        handleFilterChange(variable, value, checkbox.checked);
      });
      
      const labelText = document.createElement('span');
      labelText.textContent = value;
      labelText.style.cssText = 'flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      
      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(labelText);
      optionsContainer.appendChild(checkboxWrapper);
    });
    
    filterGroup.appendChild(header);
    filterGroup.appendChild(optionsContainer);
    filtersPanel.appendChild(filterGroup);
  });
  
  // Show active filters summary
  const activeFilterCount = Object.values(currentFilters).reduce((sum, arr) => sum + arr.length, 0);
  if (activeFilterCount > 0) {
    const summary = document.createElement('div');
    summary.style.cssText = 'margin-top: 12px; padding: 8px; background: rgba(37, 99, 235, 0.08); border-radius: 6px; font-size: 11px; color: var(--text);';
    summary.innerHTML = `<strong>Active filters:</strong> ${activeFilterCount} selected across ${Object.keys(currentFilters).length} variable(s)`;
    filtersPanel.appendChild(summary);
  }
}

// Handle filter checkbox change
function handleFilterChange(variable, value, isChecked) {
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
  
  // Re-render chart with filtered data
  renderD3BarChart(currentXAxis);
  // Update filter panel to show selected counts
  renderFiltersPanel();
}

// Reset all filters
function resetAllFilters() {
  currentFilters = {};
  renderFiltersPanel();
  renderD3BarChart(currentXAxis);
}

// Event listener for demographic variable selector
if (demoSelect) {
  demoSelect.addEventListener("change", (e) => {
    const newXAxis = e.target.value;
    // Remove the new X-axis variable from filters (can't filter on X-axis)
    if (currentFilters[newXAxis]) {
      delete currentFilters[newXAxis];
    }
    currentXAxis = newXAxis;
    renderFiltersPanel();
    renderD3BarChart(currentXAxis);
  });
}

// Reset filters button
if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", () => {
    resetAllFilters();
  });
}

// Initialize visualization with default selection
window.addEventListener("load", async () => {
  // Load visualization data first
  const dataLoaded = await loadVizData();
  
  if (dataLoaded) {
    currentXAxis = "age";
    renderFiltersPanel();
    renderD3BarChart("age");
  } else {
    if (chartInfo) {
      chartInfo.innerHTML = '<span style="color: #dc3545;">⚠️ Failed to load visualization data. Please check that the data files exist in data/viz/ folder.</span>';
    }
  }
  
  // Initialize policy indices (still uses mock data for now)
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
  redistIndex: {
    title: "Pro-Redistribution Index",
    description: "Measures support for government redistribution policies. Constructed via PCA from 6 items: tax preferences, universal healthcare, wealth accumulation, income support, outcome equality, and opportunity equality. Higher scores indicate stronger support for redistribution.",
    components: ["Tax rich vs poor", "Universal healthcare", "Wealth accumulation (rev)", "Gov income support", "Gov outcome equality", "Gov opportunity equality"],
    itemCount: 6,
    isDiscrete: false,
    distributionNote: null
  },
  raceIndex: {
    title: "Race Attitudes Index",
    description: "Measures acknowledgment of systemic racism and its effects. Constructed via PCA from 2 items: perceived racism as a problem, and slavery's lasting impact on Black Americans. Higher scores indicate greater acknowledgment of racial inequities.",
    components: ["Racism is a problem", "Slavery makes it hard for Blacks to escape poverty"],
    itemCount: 2,
    isDiscrete: true,
    distributionNote: "This index is constructed from only 2 survey items, resulting in a multi-modal (clustered) distribution rather than a smooth curve. This is expected and reflects the discrete nature of the underlying responses."
  },
  immigIndex: {
    title: "Anti-Immigration Index",
    description: "Measures restrictive attitudes toward immigration. Constructed via PCA from 2 items: opposition to increasing immigration, and importance of being born in U.S. for American identity. Higher scores indicate more anti-immigration views.",
    components: ["Oppose increasing immigration", "Important to be born in U.S."],
    itemCount: 2,
    isDiscrete: true,
    distributionNote: "This index is constructed from only 2 survey items, resulting in a multi-modal (clustered) distribution rather than a smooth curve. This is expected and reflects the discrete nature of the underlying responses."
  },
  womenIndex: {
    title: "Gender Attitudes Index",
    description: "Measures recognition of gender discrimination and support for corrective policies. Constructed via PCA from 2 items: women face discrimination, and women should receive hiring preference. Higher scores indicate stronger pro-women attitudes.",
    components: ["Women face discrimination", "Women should get hiring preference"],
    itemCount: 2,
    isDiscrete: true,
    distributionNote: "This index is constructed from only 2 survey items, resulting in a multi-modal (clustered) distribution rather than a smooth curve. This is expected and reflects the discrete nature of the underlying responses."
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
  // Check if data is loaded
  if (!rawVizData || rawVizData.length === 0) {
    console.error('Raw visualization data not loaded yet');
    return;
  }
  
  // Extract policy values from all records (filter out null/undefined)
  const policyValues = rawVizData
    .map(record => record[indexKey])
    .filter(v => v !== null && v !== undefined && !isNaN(v));
  
  if (policyValues.length === 0) {
    console.error('No valid values found for index:', indexKey);
    return;
  }
  
  // Calculate statistics
  const stats = calculateStats(policyValues);
  
  // Update title and description
  const policyInfo = policyDescriptions[indexKey];
  if (!policyInfo) {
    console.error('No description found for index:', indexKey);
    return;
  }
  
  policyTitle.textContent = policyInfo.title;
  policyDescription.innerHTML = `
    <span>${policyInfo.description}</span>
    <br><br>
    <strong>Components:</strong> ${policyInfo.components.join(' • ')}
    <br>
    <span style="font-size: 11px; color: var(--muted);">Sample size: N = ${policyValues.length.toLocaleString()}</span>
    ${policyInfo.distributionNote ? `
      <div style="margin-top: 12px; padding: 10px 12px; background: rgba(255, 193, 7, 0.1); border-left: 3px solid rgba(255, 193, 7, 0.7); border-radius: 4px; font-size: 12px; color: var(--text);">
        <strong>📊 Note:</strong> ${policyInfo.distributionNote}
      </div>
    ` : ''}
  `;
  
  // Create histogram with 10 bins for all indices
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
    return `${start}–${end}`;
  });
  
  // Destroy previous chart if exists
  if (policyChartInstance) {
    policyChartInstance.destroy();
  }
  
  // Color based on index type
  const colorMap = {
    redistIndex: { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' },
    raceIndex: { bg: 'rgba(139, 92, 246, 0.7)', border: 'rgba(139, 92, 246, 1)' },
    immigIndex: { bg: 'rgba(245, 158, 11, 0.7)', border: 'rgba(245, 158, 11, 1)' },
    womenIndex: { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgba(236, 72, 153, 1)' }
  };
  const colors = colorMap[indexKey] || { bg: 'rgba(100, 200, 100, 0.7)', border: 'rgba(100, 200, 100, 1)' };
  
  // Create histogram chart
  policyChartInstance = new Chart(policyChartContainer, {
    type: "bar",
    data: {
      labels: binLabels,
      datasets: [
        {
          label: "Frequency",
          data: histogram,
          backgroundColor: colors.bg,
          borderColor: colors.border,
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
            text: "Index Value (0–1)"
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 10
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: (items) => `Range: ${items[0].label}`,
            label: (item) => `Count: ${item.raw.toLocaleString()} (${((item.raw / policyValues.length) * 100).toFixed(1)}%)`
          }
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
  // Only initialize if data is loaded
  if (!rawVizData || rawVizData.length === 0) {
    console.log('Waiting for data to load before initializing policy indices...');
    return;
  }
  
  renderPolicyIndices("redistIndex");
  renderScatterFiltersPanel();
  renderScatterPlot("redistIndex");
  
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
  if (!scatterFiltersPanel) return;
  
  // Wait for data to be loaded
  if (!rawVizData || rawVizData.length === 0) {
    scatterFiltersPanel.innerHTML = '<p style="font-size: 12px; color: var(--muted);">Loading filters...</p>';
    return;
  }
  
  scatterFiltersPanel.innerHTML = "";
  
  const allVariables = ["gender", "race", "education", "income", "hhIncome", "party", "partyDetail", "urbanicity", "immigrationStatus"];
  
  allVariables.forEach(variable => {
    const values = getUniqueValuesFromData(variable);
    if (values.length === 0) return; // Skip if no data for this variable
    
    // Create filter row with collapsible dropdown style (like Demographic Patterns)
    const filterItem = document.createElement("div");
    filterItem.style.cssText = "border-bottom: 1px solid var(--border-light); padding: 8px 0;";
    
    // Create clickable header
    const header = document.createElement("div");
    header.style.cssText = "display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;";
    
    const varLabel = variableLabels[variable]?.label || variable;
    const labelSpan = document.createElement("span");
    labelSpan.style.cssText = "font-size: 13px; color: var(--text);";
    labelSpan.textContent = varLabel;
    
    const arrow = document.createElement("span");
    arrow.style.cssText = "color: var(--muted); font-size: 10px; transition: transform 0.2s;";
    arrow.innerHTML = "▼";
    arrow.className = "filter-arrow";
    
    header.appendChild(labelSpan);
    header.appendChild(arrow);
    
    // Create options container (hidden by default)
    const optionsContainer = document.createElement("div");
    optionsContainer.style.cssText = "display: none; padding-top: 8px; padding-left: 8px;";
    optionsContainer.className = "filter-options-container";
    
    // Toggle visibility on header click
    header.addEventListener("click", () => {
      const isHidden = optionsContainer.style.display === "none";
      optionsContainer.style.display = isHidden ? "block" : "none";
      arrow.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
    });
    
    // Create checkboxes for each value
    values.forEach(value => {
      const optionDiv = document.createElement("label");
      optionDiv.style.cssText = "display: flex; align-items: center; gap: 6px; padding: 4px 0; cursor: pointer; font-size: 12px; color: var(--text-light);";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.style.cssText = "accent-color: var(--primary); cursor: pointer;";
      checkbox.value = value;
      
      // Check if currently selected
      if (scatterFilters[variable] && scatterFilters[variable].includes(value)) {
        checkbox.checked = true;
      }
      
      checkbox.addEventListener("change", () => {
        updateScatterFilter(variable, value, checkbox.checked);
      });
      
      const labelText = document.createElement("span");
      labelText.textContent = value;
      
      optionDiv.appendChild(checkbox);
      optionDiv.appendChild(labelText);
      optionsContainer.appendChild(optionDiv);
    });
    
    filterItem.appendChild(header);
    filterItem.appendChild(optionsContainer);
    scatterFiltersPanel.appendChild(filterItem);
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
  // Check if data is loaded
  if (!rawVizData || rawVizData.length === 0) {
    console.error('Raw visualization data not loaded yet');
    return;
  }
  
  // Apply filters first
  const filteredData = applyScatterFilters(rawVizData);
  
  // Extract data points from filtered data (filter out null/undefined values)
  const validData = filteredData.filter(record => 
    record.zeroSumScore !== null && record.zeroSumScore !== undefined &&
    record[indexKey] !== null && record[indexKey] !== undefined &&
    !isNaN(record.zeroSumScore) && !isNaN(record[indexKey])
  );
  
  const xValues = validData.map(record => record.zeroSumScore);
  const yValues = validData.map(record => record[indexKey]);
  
  // Handle empty filtered data
  if (xValues.length === 0) {
    correlationR.textContent = "—";
    correlationR2.textContent = "—";
    scatterN.textContent = "0";
    const slopeEl = document.getElementById("scatter-slope");
    if (slopeEl) slopeEl.textContent = "—";
    
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
          title: {
            display: true,
            text: "No data available for selected filters"
          }
        }
      }
    });
    
    return;
  }
  
  // Calculate correlation using ALL data
  const correlation = calculateCorrelation(xValues, yValues);
  
  // Calculate regression line (y = slope * x + intercept)
  const meanX = xValues.reduce((a, b) => a + b, 0) / xValues.length;
  const meanY = yValues.reduce((a, b) => a + b, 0) / yValues.length;
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < xValues.length; i++) {
    numerator += (xValues[i] - meanX) * (yValues[i] - meanY);
    denominator += (xValues[i] - meanX) ** 2;
  }
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = meanY - slope * meanX;
  
  // ========== BINSCATTER CALCULATION ==========
  // Following Chinoy et al. (2024) methodology: divide X into equal-width bins
  // and compute mean Y for each bin
  const numBins = 20;
  const binWidth = 1 / numBins;
  const bins = [];
  
  // Initialize bins
  for (let i = 0; i < numBins; i++) {
    bins.push({
      xMin: i * binWidth,
      xMax: (i + 1) * binWidth,
      xMid: (i + 0.5) * binWidth,
      yValues: [],
      yMean: null,
      count: 0
    });
  }
  
  // Assign data points to bins
  for (let i = 0; i < xValues.length; i++) {
    const x = xValues[i];
    const y = yValues[i];
    const binIndex = Math.min(Math.floor(x / binWidth), numBins - 1);
    bins[binIndex].yValues.push(y);
    bins[binIndex].count++;
  }
  
  // Calculate mean Y for each bin
  const binscatterData = [];
  bins.forEach(bin => {
    if (bin.count > 0) {
      bin.yMean = bin.yValues.reduce((a, b) => a + b, 0) / bin.count;
      binscatterData.push({
        x: bin.xMid,
        y: bin.yMean,
        count: bin.count
      });
    }
  });
  
  // Regression line data points
  const regressionLine = [
    { x: 0, y: intercept },
    { x: 1, y: slope + intercept }
  ];
  
  // Update title and description
  const policyInfo = policyDescriptions[indexKey];
  if (!policyInfo) {
    console.error('No description found for index:', indexKey);
    return;
  }
  
  scatterTitle.textContent = `Zero-Sum Index vs ${policyInfo.title}`;
  scatterDescription.innerHTML = `
    <strong>Binned scatter plot:</strong> Each dot represents the <strong>mean ${policyInfo.title}</strong> for respondents within that Zero-Sum Index bin.
    <br><span style="font-size: 11px; color: var(--muted);">Based on N = ${xValues.length.toLocaleString()} respondents across ${binscatterData.length} bins with data.</span>
  `;
  
  // Color based on index type
  // raw: desaturated/grayish for background, bin: darker saturated for emphasis
  const colorMap = {
    redistIndex: { 
      bin: 'rgba(30, 64, 175, 1)',      // darker blue for bin means
      raw: 'rgba(147, 165, 207, 0.15)'  // desaturated grayish-blue for raw
    },
    raceIndex: { 
      bin: 'rgba(91, 33, 182, 1)',      // darker purple
      raw: 'rgba(167, 139, 250, 0.15)'  // desaturated grayish-purple
    },
    immigIndex: { 
      bin: 'rgba(180, 83, 9, 1)',       // darker amber
      raw: 'rgba(217, 179, 130, 0.15)'  // desaturated grayish-amber
    },
    womenIndex: { 
      bin: 'rgba(157, 23, 77, 1)',      // darker pink
      raw: 'rgba(219, 150, 180, 0.15)'  // desaturated grayish-pink
    }
  };
  const colors = colorMap[indexKey] || { 
    bin: 'rgba(30, 64, 175, 1)', 
    raw: 'rgba(147, 165, 207, 0.15)' 
  };
  
  // Prepare raw data points for display (transparent background layer)
  const rawDataPoints = xValues.map((x, i) => ({ x: x, y: yValues[i] }));
  
  // Destroy previous chart if exists
  if (scatterChartInstance) {
    scatterChartInstance.destroy();
  }
  
  // Create binscatter plot with raw data overlay
  scatterChartInstance = new Chart(scatterChartContainer, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Raw Data",
          data: rawDataPoints,
          backgroundColor: colors.raw,
          borderColor: 'transparent',
          borderWidth: 0,
          pointRadius: 2.5,
          pointHoverRadius: 4,
          pointStyle: 'circle',
          order: 3  // Draw first (behind everything)
        },
        {
          label: "Bin Means",
          data: binscatterData,
          backgroundColor: colors.bin,
          borderColor: 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointStyle: 'circle',
          order: 1  // Draw on top
        },
        {
          label: "OLS Fit",
          data: regressionLine,
          type: "line",
          borderColor: "rgba(220, 38, 38, 0.85)",
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointStyle: 'line',  // Use line style for legend
          fill: false,
          tension: 0,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          min: 0,
          max: 1,
          title: {
            display: true,
            text: "Zero-Sum Index (0–1)",
            font: { weight: 'bold' }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          min: 0,
          max: 1,
          title: {
            display: true,
            text: `${policyInfo.title} (0–1)`,
            font: { weight: 'bold' }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 11 },
            generateLabels: function(chart) {
              const datasets = chart.data.datasets;
              return datasets.map((dataset, i) => {
                return {
                  text: dataset.label,
                  fillStyle: i === 2 ? 'transparent' : dataset.backgroundColor,
                  strokeStyle: i === 2 ? dataset.borderColor : dataset.borderColor,
                  lineWidth: i === 2 ? 2 : 1,
                  lineDash: i === 2 ? [6, 4] : [],
                  pointStyle: i === 2 ? 'line' : 'circle',
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i
                };
              });
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 1) {  // Bin Means is now index 1
                const point = context.raw;
                return [
                  `Mean ${policyInfo.title}: ${point.y.toFixed(3)}`,
                  `Respondents in bin: ${point.count.toLocaleString()}`
                ];
              }
              return null;
            }
          }
        }
      }
    }
  });
  
  // Update correlation stats with interpretation
  const rValue = correlation.r;
  let interpretation = '';
  if (Math.abs(rValue) < 0.1) interpretation = '(negligible)';
  else if (Math.abs(rValue) < 0.3) interpretation = '(weak)';
  else if (Math.abs(rValue) < 0.5) interpretation = '(moderate)';
  else if (Math.abs(rValue) < 0.7) interpretation = '(strong)';
  else interpretation = '(very strong)';
  
  correlationR.innerHTML = `${rValue.toFixed(3)} <span style="color: var(--muted); font-size: 11px;">${interpretation}</span>`;
  correlationR2.textContent = correlation.r2.toFixed(3);
  scatterN.textContent = xValues.length.toLocaleString();
  
  // Update slope display
  const slopeEl = document.getElementById("scatter-slope");
  if (slopeEl) {
    const slopeDir = slope > 0 ? "positive" : slope < 0 ? "negative" : "zero";
    slopeEl.innerHTML = `${slope.toFixed(3)} <span style="color: var(--muted); font-size: 11px;">(${slopeDir})</span>`;
  }
  
  // Update sample size warning
  const scatterSampleWarning = document.getElementById("scatter-sample-warning");
  if (scatterSampleWarning) {
    const SCATTER_SMALL_THRESHOLD = 500;
    const SCATTER_VERY_SMALL_THRESHOLD = 100;
    
    if (xValues.length < SCATTER_VERY_SMALL_THRESHOLD) {
      scatterSampleWarning.innerHTML = `<strong>⚠️ Very small sample (N=${xValues.length})</strong><br>Results may not be reliable. Consider removing some filters.`;
      scatterSampleWarning.style.display = "block";
      scatterSampleWarning.style.background = "rgba(220, 38, 38, 0.1)";
      scatterSampleWarning.style.borderLeftColor = "#dc2626";
    } else if (xValues.length < SCATTER_SMALL_THRESHOLD) {
      scatterSampleWarning.innerHTML = `<strong>⚠️ Small sample (N=${xValues.length})</strong><br>Interpret results with caution.`;
      scatterSampleWarning.style.display = "block";
      scatterSampleWarning.style.background = "rgba(245, 158, 11, 0.1)";
      scatterSampleWarning.style.borderLeftColor = "#f59e0b";
    } else {
      scatterSampleWarning.style.display = "none";
    }
  }
  
  // Update dynamic methodology note based on index type
  const methodologyTextEl = document.getElementById("index-methodology-text");
  if (methodologyTextEl) {
    const isTwoItemIndex = ["raceIndex", "immigIndex", "womenIndex"].includes(indexKey);
    if (isTwoItemIndex) {
      methodologyTextEl.innerHTML = `This index is constructed from <strong>only 2 survey items</strong> via PCA. With each item on a 5-point Likert scale (1–5), there are only 5×5 = 25 possible response combinations, producing at most <strong>~25 distinct index values</strong>. A raw scatter plot would show horizontal "stripes" due to this limited discreteness—binscatter averages within X-bins to reveal the true underlying relationship, which is exactly how Chinoy et al. (2024) present their Figures 7 and 12.`;
    } else {
      methodologyTextEl.innerHTML = `This index is constructed from <strong>6 survey items</strong> via PCA. With 5<sup>6</sup> = 15,625 possible response combinations, the index approaches a near-continuous distribution. Even so, Chinoy et al. (2024) use binscatter (not raw scatter) in their published figures to smooth measurement noise and highlight the systematic relationship between zero-sum thinking and policy attitudes.`;
    }
  }
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
