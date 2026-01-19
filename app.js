// ---------------------------
// Simple router (Learn/Explore/Test/Visualization/About)
// ---------------------------
const pages = {
  learn: document.getElementById("page-learn"),
  concept: document.getElementById("page-concept"),
  research: document.getElementById("page-research"),
  data: document.getElementById("page-data"),
  test: document.getElementById("page-test"),
  about: document.getElementById("page-about"),
};

const navButtons = document.querySelectorAll(".nav__link");
const navDropdownItems = document.querySelectorAll(".nav__dropdown-item");
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

// Add click handlers for dropdown items
navDropdownItems.forEach((item) => {
  item.addEventListener("click", () => {
    const route = item.dataset.route;
    const section = item.dataset.section;
    
    // First switch to the correct page
    setRoute(route);
    
    // Then scroll to the section if specified
    if (section) {
      // Small delay to ensure page is visible before scrolling
      setTimeout(() => {
        const targetElement = document.getElementById(section);
        if (targetElement) {
          // For visualization tabs, also activate the tab
          if (section.startsWith('tab-')) {
            const tabName = section.replace('tab-', '');
            // Activate the corresponding tab button
            const tabButtons = document.querySelectorAll('.viz-step-btn');
            tabButtons.forEach(btn => {
              btn.classList.toggle('viz-step-btn--active', btn.dataset.tab === tabName);
            });
            // Show the corresponding tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
              content.classList.toggle('tab-content--active', content.id === section);
            });
          }
          
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  });
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

// ZS4_unif 直方图数据（每5分为一个bin，共20个区间：0-5, 5-10, ..., 95-100）
// 通过对原始0.02粒度数据加权插值得到
const zs4Breaks = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
const zs4Counts = [
  406,   // 0-5
  206,   // 5-10
  304,   // 10-15
  442,   // 15-20
  829,   // 20-25
  1040,  // 25-30
  1138,  // 30-35
  1539,  // 35-40
  1357,  // 40-45
  3167,  // 45-50
  1363,  // 50-55
  1779,  // 55-60
  1732,  // 60-65
  1132,  // 65-70
  1189,  // 70-75
  898,   // 75-80
  467,   // 80-85
  490,   // 85-90
  261,   // 90-95
  544    // 95-100
];

function isTestComplete() {
  return testState.ethnic && testState.trade && testState.citizen && testState.income;
}

function createDistributionChart(userScore) {
  const ctx = document.getElementById('distribution-chart');
  if (!ctx) return;

  // 构造labels为0-100的整数区间，如"0–10", "10–20"等
  const labels = zs4Breaks.slice(0, -1).map((b, i) => {
    const start = Math.round(b * 100);
    const end = Math.round(zs4Breaks[i + 1] * 100);
    return `${start}–${end}`;
  });
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

  // 用户得分转换为0-100
  const userScorePercent = Math.round(userScore * 100);

  distributionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Respondents',
        data: counts,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        borderRadius: 6
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
            label: (item) => `${counts[item.dataIndex].toLocaleString()} respondents`
          }
        }
      },
      scales: {
        x: { 
          title: { display: true, text: 'Zero-Sum Thinking Score (0–100)' }, 
          ticks: { maxRotation: 0, minRotation: 0, autoSkip: false }
        },
        y: { 
          title: { display: true, text: 'Number of Respondents' }, 
          beginAtZero: true 
        }
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
    
    // Update main score display
    if (scoreDisplay) scoreDisplay.textContent = scorePercent;
    
    // 1️⃣ Relative position statement - distribution-based, neutral language
    const percentileStatement = document.getElementById("percentile-statement");
    if (percentileStatement) {
      let positionText = '';
      if (percentile < 25) {
        positionText = `You scored higher than <strong>${percentile}%</strong> of the ~20,000 U.S. respondents in the study. This places you <strong>below the median</strong> in zero-sum thinking.`;
      } else if (percentile < 50) {
        positionText = `You scored higher than <strong>${percentile}%</strong> of the ~20,000 U.S. respondents in the study. This places you <strong>somewhat below the median</strong> in zero-sum thinking.`;
      } else if (percentile < 75) {
        positionText = `You scored higher than <strong>${percentile}%</strong> of the ~20,000 U.S. respondents in the study. This places you <strong>somewhat above the median</strong> in zero-sum thinking.`;
      } else {
        positionText = `You scored higher than <strong>${percentile}%</strong> of the ~20,000 U.S. respondents in the study. This places you <strong>above the median</strong> in zero-sum thinking.`;
      }
      percentileStatement.innerHTML = positionText;
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
    description: "Average zero-sum thinking index across age groups." 
  },
  gender: { 
    label: "Gender", 
    description: "Comparison of zero-sum thinking by gender." 
  },
  race: { 
    label: "Race/Ethnicity", 
    description: "Average zero-sum thinking across racial and ethnic groups." 
  },
  education: { 
    label: "Education Level", 
    description: "Zero-sum thinking by educational attainment." 
  },
  income: { 
    label: "Relative Income", 
    description: "Zero-sum thinking by self-reported relative income." 
  },
  hhIncome: { 
    label: "Household Income", 
    description: "Zero-sum thinking by household income brackets." 
  },
  party: { 
    label: "Party Affiliation", 
    description: "Comparison of zero-sum thinking across political parties." 
  },
  partyDetail: { 
    label: "Party Affiliation (Detailed)", 
    description: "Zero-sum thinking by detailed partisan identity." 
  },
  urbanicity: { 
    label: "Urbanicity", 
    description: "Zero-sum thinking by residential area type." 
  },
  immigrationStatus: { 
    label: "Immigration Status", 
    description: "Zero-sum thinking by generational immigration status." 
  }
};

// Research insights from the paper for each demographic variable
// Strictly based on paper content - only include mechanisms explicitly stated by authors
const demographicInsights = {
  age: {
    finding: "Younger respondents are more zero-sum; older respondents are less zero-sum. This is one of the clearest patterns in Figure 3.",
    explanation: "The authors propose and test a specific mechanism: <em>birth cohort economic experience</em>. Younger cohorts grew up in conditions of lower growth and more stagnation. Using bottom-50% income growth during respondents' first 20 years of life, the paper shows: <em>'the answer to why younger individuals today are more zero-sum may be that they were born and raised in economic conditions that featured less growth and more stagnation.'</em>",
    paperRef: "Figure 3, Figure 11, Figure 12, and Section 5"
  },
  gender: {
    finding: "Women show slightly higher zero-sum thinking than men on average.",
    explanation: "The paper documents this pattern as part of the broader demographic profile of zero-sum thinking. Gender differences are included in the analysis primarily as control variables and in interaction effects with policy preferences. The focus of the paper lies elsewhere — on origins (immigration, economic history) and consequences (policy views).",
    paperRef: "Figure 3 (Section 3: Correlates of Zero-Sum Thinking)"
  },
  race: {
    finding: "Black respondents are the most zero-sum. Asian/Asian American respondents are the least zero-sum. Hispanic/Latino respondents are slightly above White respondents.",
    explanation: "The authors develop an extensive explanation centered on the history of slavery and systemic oppression, which created a 'fully zero-sum (or negative-sum)' environment. This experience is transmitted through: (1) direct ancestral experience, (2) local history (county-level slavery), and (3) cultural diffusion (Southern migration, Confederate culture). The paper states: <em>'we expect a history of slavery to correlate with more pronounced zero-sum thinking.'</em>",
    paperRef: "Figure 3, Table 5, and Section 4.C (extensive discussion)"
  },
  education: {
    finding: "Higher education is associated with lower zero-sum thinking. Those with high school or less are most zero-sum; college/postgraduate are least zero-sum.",
    explanation: "The paper documents this gradient as a robust empirical pattern. Education serves as an important control variable throughout the analysis. The paper's focus is on other origins of zero-sum thinking (immigration experience, economic history) rather than the education channel.",
    paperRef: "Figure 3 (Section 3: Correlates of Zero-Sum Thinking)"
  },
  income: {
    finding: "Lower-income respondents are more zero-sum; higher-income respondents are less zero-sum. The relationship is <strong>monotonic</strong>.",
    explanation: "The paper states: <em>'the lowest-income respondents … tend to be more zero-sum than higher-income respondents.'</em> Income is documented as part of the demographic correlates and used as a control variable. The paper's theoretical focus is on other determinants of zero-sum thinking.",
    paperRef: "Figure 3 (Section 3: Correlates of Zero-Sum Thinking)"
  },
  hhIncome: {
    finding: "Lower household income brackets are associated with higher zero-sum thinking. The gradient is monotonic.",
    explanation: "Similar to relative income, this pattern is documented as part of the demographic profile. Household income serves as a control variable in the analysis. The paper explores other factors — particularly immigration and historical experiences — as primary explanations for variation in zero-sum thinking.",
    paperRef: "Figure 3 (Section 3: Correlates of Zero-Sum Thinking)"
  },
  party: {
    finding: "Democrats are on average more zero-sum than Republicans. However, there is substantial variation <em>within</em> each party.",
    explanation: "The authors emphasize that zero-sum thinking is <strong>not caused by</strong> partisan identity — rather, it is <em>orthogonal</em> to partisanship. Zero-sum thinking helps explain <strong>within-party heterogeneity</strong>: zero-sum Democrats are more anti-immigration; zero-sum Republicans are more pro-redistribution. It functions as an 'interpretive lens' that shapes policy views independently of party affiliation.",
    paperRef: "Figure 3, Figure 4, and Section 4"
  },
  partyDetail: {
    finding: "Strong Democrats show the highest zero-sum thinking; Strong Republicans show the lowest. But the key insight is the variation <em>within</em> partisan categories.",
    explanation: "The paper's central argument is that zero-sum thinking cuts across party lines. It predicts policy preferences <em>even after controlling for party</em>. A zero-sum Republican looks different from a non-zero-sum Republican on many policy questions — and the same applies to Democrats. This is what makes zero-sum thinking analytically distinct from partisanship.",
    paperRef: "Figure 4, Table 3, and Section 4"
  },
  urbanicity: {
    finding: "Urban residents show higher zero-sum thinking than suburban or rural residents.",
    explanation: "The paper documents this as part of the demographic correlates of zero-sum thinking. Urbanicity is included as a control variable in the regression analyses. The paper's main focus is on other sources of variation in zero-sum beliefs.",
    paperRef: "Demographic controls in regression analyses (Section 3)"
  },
  immigrationStatus: {
    finding: "First-generation immigrants are the <strong>least</strong> zero-sum. Second-generation are still low but weaker. Third-generation effect fades substantially toward the baseline.",
    explanation: "This is a central finding with a clearly articulated mechanism: the immigration experience provides direct evidence of a non-zero-sum world — immigrants observe that their economic success does not require harming others. The paper states: <em>'the immigrant experience benefits the newcomer and their descendants economically without detriment to others.'</em> This 'lived proof' is strongest for immigrants themselves and weakens across generations.",
    paperRef: "Figure 14, Table 3, and Section 5 (Origins of Zero-Sum Thinking)"
  }
};

// Function to update the insight card based on selected variable
function updateDemographicInsight(variable) {
  const insightCard = document.getElementById("demographic-insight-content");
  if (!insightCard) return;
  
  const insight = demographicInsights[variable];
  if (!insight) {
    insightCard.innerHTML = '<p style="margin: 0; color: var(--muted); font-size: 13px;">Select a variable to see research insights from the paper.</p>';
    return;
  }
  
  insightCard.innerHTML = `
    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: var(--text);">
      <strong>Key Finding:</strong> ${insight.finding}
    </p>
    <div style="padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px; margin-bottom: 12px;">
      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: var(--text);">
        <strong>Why?</strong> ${insight.explanation}
      </p>
    </div>
    <p style="margin: 0; font-size: 11px; color: var(--muted);">
      <em>Reference: Chinoy, Nunn, Sequeira & Stantcheva (2024) — ${insight.paperRef}</em>
    </p>
  `;
}

// Current state
let currentXAxis = "age";

// Load visualization data from JSON files
async function loadVizData() {
  try {
    const [aggRes, orderRes, metaRes, rawRes] = await Promise.all([
      fetch('./data/vizplot/aggregated_data.json'),
      fetch('./data/vizplot/variable_order.json'),
      fetch('./data/vizplot/variable_metadata.json'),
      fetch('./data/vizplot/viz_data.json')  // Individual-level data for filtering
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

  // Update research insight card for selected variable
  updateDemographicInsight(variable);

  // Clear previous chart and tooltip
  d3.select("#d3-chart-container").selectAll("*").remove();
  d3.selectAll(".demo-chart-tooltip").remove();

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
  const height = 480 - margin.top - margin.bottom;

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

  // Create tooltip (appended to body for correct positioning)
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "demo-chart-tooltip")
    .style("position", "fixed")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.85)")
    .style("color", "white")
    .style("padding", "10px 14px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("z-index", "1000")
    .style("box-shadow", "0 2px 8px rgba(0,0,0,0.2)");

  // Color: slate blue-gray for all bars (neutral, non-partisan)
  const barColor = "#7b9cb5";  // Slate blue-gray (matches primary-light)
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
        .style("top", (event.clientY - 10) + "px")
        .style("left", (event.clientX + 15) + "px");
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
  
  // Title is now fixed as "Zero-Sum Thinking by" with interactive dropdown
  // Only update subtitle for filter status
  if (chartSubtitle) {
    if (hasActiveFilters) {
      chartSubtitle.innerHTML = `<span style="color: #5b7c99; font-weight: 500;">Active Filters: ${filterDescription}</span>`;
      chartSubtitle.style.display = 'block';
      chartSubtitle.style.textAlign = 'right';
    } else {
      chartSubtitle.textContent = '';
      chartSubtitle.style.display = 'none';
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
    filterInfo = `<br><span style="font-size: 11px; color: #5b7c99; font-weight: 500;">🔍 Filtered: ${filteredCount.toLocaleString()} of ${totalCount.toLocaleString()} records shown (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied)</span>`;
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

  // Update summary info with comparison - now positioned above the chart
  const sampleInfoEl = document.getElementById('sample-info');
  
  // Chart summary (left box)
  chartInfo.innerHTML = `
    <span style="color: #4a90a4; font-weight: 600;">${minGroup.label}</span> shows the lowest zero-sum thinking (${minScore.toFixed(2)}), 
    while <span style="color: #e8a838; font-weight: 600;">${maxGroup.label}</span> shows the highest (${maxScore.toFixed(2)}) — 
    a difference of <strong>${diff} percentage points</strong>.${sampleWarning}
  `;
  
  // Sample info (above filters - subtle styling)
  if (sampleInfoEl) {
    const totalSample = 20278; // Full dataset size
    if (hasActiveFilters) {
      const percent = ((totalN / totalSample) * 100).toFixed(1);
      sampleInfoEl.innerHTML = `<strong>N = ${totalN.toLocaleString()}</strong> <span style="opacity: 0.7;">(${percent}% of ${totalSample.toLocaleString()})</span>`;
      sampleInfoEl.style.background = 'rgba(37, 99, 235, 0.08)';
      sampleInfoEl.style.color = '#5b7c99';
    } else {
      sampleInfoEl.innerHTML = `<strong>N = ${totalN.toLocaleString()}</strong>`;
      sampleInfoEl.style.background = 'rgba(108, 117, 125, 0.04)';
      sampleInfoEl.style.color = 'var(--muted)';
    }
  }

  // Data coverage info removed - now consolidated into chart summary above

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
    filterGroup.style.cssText = 'margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border);';
    
    // Create collapsible header
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 4px;';
    header.innerHTML = `
      <span style="font-size: 12px; font-weight: 600; color: var(--text);">${varInfo.label}</span>
      <span class="filter-toggle" style="font-size: 10px; color: var(--muted);">▼</span>
    `;
    
    // Create options container (collapsible)
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'filter-options';
    optionsContainer.style.cssText = 'display: none; max-height: 120px; overflow-y: auto;';
    
    // Track selected count
    const selectedCount = (currentFilters[variable] || []).length;
    if (selectedCount > 0) {
      header.querySelector('.filter-toggle').textContent = `${selectedCount} selected`;
      header.querySelector('.filter-toggle').style.color = '#5b7c99';
      optionsContainer.style.display = 'block';
    }
    
    // Toggle collapse (accordion style - close others when opening one)
    header.addEventListener('click', () => {
      const isOpen = optionsContainer.style.display !== 'none';
      
      // Close all other filter options first (accordion behavior)
      if (!isOpen) {
        const allFilterGroups = filtersPanel.querySelectorAll('.filter-group');
        allFilterGroups.forEach(group => {
          const otherOptions = group.querySelector('.filter-options');
          const otherHeader = group.querySelector('.filter-toggle');
          if (otherOptions && otherOptions !== optionsContainer) {
            otherOptions.style.display = 'none';
            // Reset toggle text if no selections
            const otherSelectedCount = parseInt(otherHeader.textContent) || 0;
            if (!otherHeader.textContent.includes('selected')) {
              otherHeader.textContent = '▼';
            }
          }
        });
      }
      
      optionsContainer.style.display = isOpen ? 'none' : 'block';
      if (selectedCount === 0) {
        header.querySelector('.filter-toggle').textContent = isOpen ? '▼' : '▲';
      }
    });
    
    // Create checkboxes for each value
    values.forEach(value => {
      const checkboxWrapper = document.createElement('label');
      checkboxWrapper.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; font-size: 11px; color: var(--text);';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = value;
      checkbox.style.cssText = 'cursor: pointer; accent-color: #5b7c99;';
      
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
      chartInfo.innerHTML = '<span style="color: #dc3545;">⚠️ Failed to load visualization data. Please check that the data files exist in data/vizplot/ folder.</span>';
    }
  }
  
  // Initialize policy indices (still uses mock data for now)
  initializePolicyIndices();
});

// ---------------------------
// Story 3.2: Policy Indices
// ---------------------------

const policySelect = document.getElementById("policy-select");
const policyD3Container = document.getElementById("policy-d3-chart-container");
const policyDescription = document.getElementById("policy-description");
const policyDistributionNote = document.getElementById("policy-distribution-note");

const policyMean = document.getElementById("policy-mean");
const policyMedian = document.getElementById("policy-median");
const policyStddev = document.getElementById("policy-stddev");
const policyRange = document.getElementById("policy-range");
const policyN = document.getElementById("policy-n");

const policyDescriptions = {
  redistIndex: {
    title: "Pro-Redistribution Index",
    description: "Captures support for government redistribution policies. Constructed from 6 survey items covering tax preferences, healthcare, wealth, and equality. Higher scores indicate stronger support for redistribution. The research finds this index is positively correlated with zero-sum thinking.",
    components: ["Tax rich vs poor", "Universal healthcare", "Wealth accumulation (rev)", "Gov income support", "Gov outcome equality", "Gov opportunity equality"],
    itemCount: 6,
    isDiscrete: false,
    distributionNote: null
  },
  raceIndex: {
    title: "Race Attitudes Index",
    description: "Captures acknowledgment of systemic racism and its effects. Constructed from 2 survey items on perceived racism and slavery's lasting impact. Higher scores indicate greater acknowledgment of racial inequities. The research analyzes how this attitude relates to zero-sum thinking.",
    components: ["Racism is a problem", "Slavery makes it hard for Blacks to escape poverty"],
    itemCount: 2,
    isDiscrete: true,
    distributionNote: "This index is constructed from only 2 survey items, resulting in a multi-modal (clustered) distribution rather than a smooth curve. This is expected and reflects the discrete nature of the underlying responses."
  },
  immigIndex: {
    title: "Anti-Immigration Index",
    description: "Captures restrictive attitudes toward immigration. Constructed from 2 survey items on immigration levels and national identity. Higher scores indicate more anti-immigration views. The research finds this index is positively correlated with zero-sum thinking.",
    components: ["Oppose increasing immigration", "Important to be born in U.S."],
    itemCount: 2,
    isDiscrete: true,
    distributionNote: "This index is constructed from only 2 survey items, resulting in a multi-modal (clustered) distribution rather than a smooth curve. This is expected and reflects the discrete nature of the underlying responses."
  },
  womenIndex: {
    title: "Gender Attitudes Index",
    description: "Captures recognition of gender discrimination and support for corrective policies. Constructed from 2 survey items on discrimination and hiring preferences. Higher scores indicate stronger pro-women attitudes. The research analyzes how this attitude relates to zero-sum thinking.",
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
  
  // Update description in toggle
  const policyInfo = policyDescriptions[indexKey];
  if (!policyInfo) {
    console.error('No description found for index:', indexKey);
    return;
  }
  
  policyDescription.innerHTML = `
    <p style="margin: 0 0 8px 0;">${policyInfo.description}</p>
    <p style="margin: 0; font-size: 11px;"><strong>Components:</strong> ${policyInfo.components.join(' • ')}</p>
  `;
  
  // Show distribution note if applicable
  if (policyDistributionNote) {
    if (policyInfo.distributionNote) {
      policyDistributionNote.innerHTML = `<strong>📊 Note:</strong> ${policyInfo.distributionNote}`;
      policyDistributionNote.style.display = 'block';
    } else {
      policyDistributionNote.style.display = 'none';
    }
  }
  
  // Create histogram with 10 bins for all indices
  const bins = 10;
  const binSize = 1 / bins;
  const histogram = Array(bins).fill(0);
  
  policyValues.forEach(value => {
    const binIndex = Math.min(Math.floor(value / binSize), bins - 1);
    histogram[binIndex]++;
  });
  
  // Prepare data for D3
  const histogramData = histogram.map((count, i) => ({
    binStart: i * binSize,
    binEnd: (i + 1) * binSize,
    count: count,
    label: `${(i * binSize).toFixed(1)}–${((i + 1) * binSize).toFixed(1)}`
  }));
  
  // Clear previous chart and tooltip
  d3.select("#policy-d3-chart-container").selectAll("*").remove();
  d3.selectAll(".policy-chart-tooltip").remove();
  
  // Color based on index type
  const colorMap = {
    redistIndex: { main: '#6b9a9e', gradient: ['#b3cfd1', '#6b9a9e'] },
    raceIndex: { main: '#8b5cf6', gradient: ['#c4b5fd', '#8b5cf6'] },
    immigIndex: { main: '#f59e0b', gradient: ['#fcd34d', '#f59e0b'] },
    womenIndex: { main: '#ec4899', gradient: ['#f9a8d4', '#ec4899'] }
  };
  const colors = colorMap[indexKey] || { main: '#64748b', gradient: ['#cbd5e1', '#64748b'] };
  
  // Set up dimensions (similar to demographic chart)
  const container = document.getElementById("policy-d3-chart-container");
  const containerWidth = container ? container.clientWidth : 600;
  const maxWidth = 650;
  const effectiveWidth = Math.min(containerWidth, maxWidth);
  const margin = { top: 30, right: 30, bottom: 60, left: 70 };
  const width = effectiveWidth - margin.left - margin.right;
  const height = 380 - margin.top - margin.bottom;
  
  // Create SVG (centered in container)
  const svg = d3.select("#policy-d3-chart-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "0 auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // X scale
  const x = d3.scaleBand()
    .range([0, width])
    .domain(histogramData.map(d => d.label))
    .padding(0.15);
  
  // Y scale
  const maxCount = d3.max(histogramData, d => d.count);
  const y = d3.scaleLinear()
    .domain([0, maxCount * 1.1])
    .range([height, 0]);
  
  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-35)")
    .style("text-anchor", "end")
    .style("font-size", "11px")
    .style("fill", "#666");
  
  // X axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#666")
    .text("Index Value (0–1)");
  
  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(y).ticks(6).tickFormat(d => d.toLocaleString()))
    .selectAll("text")
    .style("font-size", "11px")
    .style("fill", "#666");
  
  // Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "#666")
    .text("Count");
  
  // Create tooltip (appended to body for correct positioning)
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "policy-chart-tooltip")
    .style("position", "fixed")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.85)")
    .style("color", "white")
    .style("padding", "10px 14px")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("z-index", "1000")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.2)");
  
  // Add bars with gradient effect
  svg.selectAll(".bar")
    .data(histogramData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.label))
    .attr("width", x.bandwidth())
    .attr("y", height)
    .attr("height", 0)
    .attr("fill", colors.main)
    .attr("rx", 3)
    .attr("ry", 3)
    .style("opacity", 0.85)
    .on("mouseover", function(event, d) {
      d3.select(this)
        .style("opacity", 1)
        .attr("stroke", colors.main)
        .attr("stroke-width", 2);
      
      const pct = ((d.count / policyValues.length) * 100).toFixed(1);
      tooltip
        .style("visibility", "visible")
        .html(`<strong>${d.label}</strong><br/>Count: ${d.count.toLocaleString()}<br/>Percentage: ${pct}%`);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("top", (event.clientY - 10) + "px")
        .style("left", (event.clientX + 15) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .style("opacity", 0.85)
        .attr("stroke", "none");
      tooltip.style("visibility", "hidden");
    })
    .transition()
    .duration(600)
    .attr("y", d => y(d.count))
    .attr("height", d => height - y(d.count));
  
  // Update statistics display
  policyMean.textContent = stats.mean.toFixed(3);
  policyMedian.textContent = stats.median.toFixed(3);
  policyStddev.textContent = stats.stddev.toFixed(3);
  policyRange.textContent = `${stats.min.toFixed(3)} – ${stats.max.toFixed(3)}`;
  if (policyN) policyN.textContent = policyValues.length.toLocaleString();
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
}

// ---------------------------
// Story 3.2.2: Scatter Plot (Zero-Sum vs Policy Index)
// ---------------------------

const policySelectScatter = document.getElementById("policy-select-scatter");
const scatterD3Container = document.getElementById("scatter-d3-container");
const scatterDescription = document.getElementById("scatter-description");
const scatterSampleInfo = document.getElementById("scatter-sample-info");
const correlationR = document.getElementById("correlation-r");
const correlationR2 = document.getElementById("correlation-r2");
const scatterN = document.getElementById("scatter-n");
const scatterFiltersPanel = document.getElementById("scatter-filters-panel");
const resetScatterFiltersBtn = document.getElementById("reset-scatter-filters-btn");
const scatterFilterSummary = document.getElementById("scatter-filter-summary");

// Scatter plot filter state
let scatterFilters = {};

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
    
    // Toggle visibility on header click (accordion style - close others when opening one)
    header.addEventListener("click", () => {
      const isHidden = optionsContainer.style.display === "none";
      
      // Close all other filter options first (accordion behavior)
      if (isHidden) {
        const allFilterItems = scatterFiltersPanel.querySelectorAll('.filter-options-container');
        const allArrows = scatterFiltersPanel.querySelectorAll('.filter-arrow');
        allFilterItems.forEach((container, idx) => {
          if (container !== optionsContainer) {
            container.style.display = 'none';
          }
        });
        allArrows.forEach(arr => {
          if (arr !== arrow) {
            arr.style.transform = 'rotate(0deg)';
          }
        });
      }
      
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
  
  // Clear previous chart and tooltip
  d3.select("#scatter-d3-container").selectAll("*").remove();
  d3.selectAll(".scatter-chart-tooltip").remove();
  
  // Handle empty filtered data
  if (xValues.length === 0) {
    correlationR.textContent = "—";
    correlationR2.textContent = "—";
    scatterN.textContent = "0";
    const slopeEl = document.getElementById("scatter-slope");
    if (slopeEl) slopeEl.textContent = "—";
    
    d3.select("#scatter-d3-container")
      .append("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("height", "400px")
      .style("color", "var(--muted)")
      .style("font-size", "14px")
      .text("No data available for selected filters");
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
  const numBins = 20;
  const binWidth = 1 / numBins;
  const bins = [];
  
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
  
  for (let i = 0; i < xValues.length; i++) {
    const x = xValues[i];
    const y = yValues[i];
    const binIndex = Math.min(Math.floor(x / binWidth), numBins - 1);
    bins[binIndex].yValues.push(y);
    bins[binIndex].count++;
  }
  
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
  
  // Update title and description
  const policyInfo = policyDescriptions[indexKey];
  if (!policyInfo) {
    console.error('No description found for index:', indexKey);
    return;
  }
  
  scatterDescription.innerHTML = `
    <strong>Binned scatter plot:</strong> Each dot shows the average ${policyInfo.title.toLowerCase()} score for respondents in that zero-sum bin.
  `;
  
  if (scatterSampleInfo) {
    scatterSampleInfo.innerHTML = `N = ${xValues.length.toLocaleString()} respondents across ${binscatterData.length} bins`;
  }
  
  // Color based on index type
  const colorMap = {
    redistIndex: { bin: '#4d8387', raw: 'rgba(107, 154, 158, 0.12)', binLight: '#8fb8bc' },
    raceIndex: { bin: '#5b21b6', raw: 'rgba(167, 139, 250, 0.12)', binLight: '#8b5cf6' },
    immigIndex: { bin: '#b45309', raw: 'rgba(217, 179, 130, 0.12)', binLight: '#f59e0b' },
    womenIndex: { bin: '#9d174d', raw: 'rgba(219, 150, 180, 0.12)', binLight: '#ec4899' }
  };
  const colors = colorMap[indexKey] || { bin: '#3d5a6c', raw: 'rgba(91, 124, 153, 0.12)', binLight: '#7b9cb5' };
  
  // Prepare raw data points
  const rawDataPoints = xValues.map((x, i) => ({ x: x, y: yValues[i] }));
  
  // ========== D3 CHART ==========
  const container = document.getElementById("scatter-d3-container");
  const containerWidth = container ? container.clientWidth : 700;
  const margin = { top: 30, right: 40, bottom: 90, left: 60 };
  const width = Math.min(containerWidth, 750) - margin.left - margin.right;
  const height = 440 - margin.top - margin.bottom;
  
  // Create SVG
  const svg = d3.select("#scatter-d3-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "0 auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Scales
  const x = d3.scaleLinear().domain([0, 1]).range([0, width]);
  const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);
  
  // Add grid lines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickSize(-height).tickFormat(""))
    .selectAll("line")
    .style("stroke", "rgba(0,0,0,0.05)");
  
  svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y).ticks(10).tickSize(-width).tickFormat(""))
    .selectAll("line")
    .style("stroke", "rgba(0,0,0,0.05)");
  
  // Remove grid domain lines
  svg.selectAll(".grid .domain").remove();
  
  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10))
    .selectAll("text")
    .style("font-size", "11px")
    .style("fill", "#666");
  
  // X axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("fill", "#333")
    .text("Zero-Sum Index (0–1)");
  
  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(y).ticks(10))
    .selectAll("text")
    .style("font-size", "11px")
    .style("fill", "#666");
  
  // Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -45)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("fill", "#333")
    .text(`${policyInfo.title} (0–1)`);
  
  // Create tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "scatter-chart-tooltip")
    .style("position", "fixed")
    .style("visibility", "hidden")
    .style("background-color", "rgba(0, 0, 0, 0.9)")
    .style("color", "white")
    .style("padding", "10px 14px")
    .style("border-radius", "8px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "1000")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");
  
  // Draw raw data points with animation
  svg.selectAll(".raw-point")
    .data(rawDataPoints)
    .enter()
    .append("circle")
    .attr("class", "raw-point")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", 0)
    .attr("fill", colors.raw)
    .transition()
    .duration(600)
    .delay((d, i) => Math.random() * 200)
    .attr("r", 2.5);
  
  // Draw regression line with animation
  const line = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y));
  
  const regressionData = [
    { x: 0, y: intercept },
    { x: 1, y: slope + intercept }
  ];
  
  const regressionPath = svg.append("path")
    .datum(regressionData)
    .attr("fill", "none")
    .attr("stroke", "#dc2626")
    .attr("stroke-width", 2.5)
    .attr("stroke-dasharray", "8,5")
    .attr("d", line)
    .style("opacity", 0);
  
  regressionPath.transition()
    .duration(800)
    .delay(400)
    .style("opacity", 0.85);
  
  // Draw bin scatter points with animation
  svg.selectAll(".bin-point")
    .data(binscatterData)
    .enter()
    .append("circle")
    .attr("class", "bin-point")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", 0)
    .attr("fill", colors.bin)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", 10)
        .attr("fill", colors.binLight);
      
      tooltip
        .style("visibility", "visible")
        .html(`<strong>Bin: ${d.x.toFixed(2)}</strong><br/>Mean ${policyInfo.title}: <strong>${d.y.toFixed(3)}</strong><br/>Respondents: ${d.count.toLocaleString()}`);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("top", (event.clientY - 10) + "px")
        .style("left", (event.clientX + 15) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 7)
        .attr("fill", colors.bin);
      tooltip.style("visibility", "hidden");
    })
    .transition()
    .duration(600)
    .delay((d, i) => 300 + i * 30)
    .attr("r", 7);
  
  // Add legend (centered at bottom)
  const legendWidth = 230;
  const legend = svg.append("g")
    .attr("transform", `translate(${(width - legendWidth) / 2}, ${height + 60})`);
  
  // Raw data legend
  legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 4)
    .attr("fill", colors.raw.replace("0.12", "0.5"));
  legend.append("text")
    .attr("x", 10)
    .attr("y", 4)
    .style("font-size", "11px")
    .style("fill", "#666")
    .text("Raw Data");
  
  // Bin means legend
  legend.append("circle")
    .attr("cx", 85)
    .attr("cy", 0)
    .attr("r", 5)
    .attr("fill", colors.bin)
    .attr("stroke", "white")
    .attr("stroke-width", 1.5);
  legend.append("text")
    .attr("x", 95)
    .attr("y", 4)
    .style("font-size", "11px")
    .style("fill", "#666")
    .text("Bin Means");
  
  // OLS fit legend
  legend.append("line")
    .attr("x1", 175)
    .attr("y1", 0)
    .attr("x2", 195)
    .attr("y2", 0)
    .attr("stroke", "#dc2626")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,3");
  legend.append("text")
    .attr("x", 200)
    .attr("y", 4)
    .style("font-size", "11px")
    .style("fill", "#666")
    .text("OLS Fit");
  
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
  const methodologyTextEl = document.getElementById("index-methodology-text-toggle");
  if (methodologyTextEl) {
    const isTwoItemIndex = ["raceIndex", "immigIndex", "womenIndex"].includes(indexKey);
    if (isTwoItemIndex) {
      methodologyTextEl.innerHTML = `This index is constructed from <strong>only 2 survey items</strong> via PCA. With each item on a 5-point Likert scale (1–5), there are only 5×5 = 25 possible response combinations, producing at most <strong>~25 distinct index values</strong>. A raw scatter plot would show horizontal "stripes" due to this limited discreteness—binscatter averages within X-bins to reveal the true underlying relationship, which is exactly how Chinoy et al. (2024) present their Figures 7 and 12.`;
    } else {
      methodologyTextEl.innerHTML = `This index is constructed from <strong>6 survey items</strong> via PCA. With 5<sup>6</sup> = 15,625 possible response combinations, the index approaches a near-continuous distribution. Even so, Chinoy et al. (2024) use binscatter (not raw scatter) in their published figures to smooth measurement noise and highlight the systematic relationship between zero-sum thinking and policy attitudes.`;
    }
  }
}

// View selector switching for Policy Indices (Distribution / Correlation)
const viewSelectorBtns = document.querySelectorAll(".view-selector__btn");
const subTabContents = document.querySelectorAll(".sub-tab-content");

viewSelectorBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const subTabName = btn.dataset.subTab;
    
    // Remove active class
    viewSelectorBtns.forEach(b => b.classList.remove("view-selector__btn--active"));
    subTabContents.forEach(stc => stc.classList.remove("sub-tab-content--active"));
    
    // Add active class
    btn.classList.add("view-selector__btn--active");
    document.getElementById(`sub-tab-${subTabName}`).classList.add("sub-tab-content--active");
    
    // Refresh scatter chart if switching to correlation
    if (subTabName === "correlation") {
      setTimeout(() => {
        renderScatterPlot(policySelectScatter.value);
      }, 100);
    }
  });
});

// Tab switching (using new step-based navigation)
const tabBtns = document.querySelectorAll(".viz-step-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const tabName = btn.dataset.tab;
    
    // Remove active class from all tabs and buttons
    tabBtns.forEach(b => b.classList.remove("viz-step-btn--active"));
    tabContents.forEach(tc => tc.classList.remove("tab-content--active"));
    
    // Add active class to selected tab and button
    btn.classList.add("viz-step-btn--active");
    const activeTab = document.getElementById(`tab-${tabName}`);
    activeTab.classList.add("tab-content--active");
    
    // Refresh D3 chart when switching back to demographic-patterns
    if (tabName === "demographic-patterns") {
      // Clear D3 scatter chart and tooltip when leaving policy tab
      d3.select("#scatter-d3-container").selectAll("*").remove();
      d3.selectAll(".scatter-chart-tooltip").remove();
      
      setTimeout(() => {
        renderDemographicChart(demoSelect.value);
      }, 50);
    }
    
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
        renderStateMap();
      }, 100);
    }
  });
});

// ---------------------------
// Story 3.3: Geographic Map (State-Level) - D3 Implementation
// Uses preprocessed data from data/vizmap/state_zero_sum_long.json
// State GeoJSON loaded from CDN (US Atlas TopoJSON)
// ---------------------------

// Global state for D3 map
let stateGeoData = null;       // GeoJSON for state boundaries
let stateZeroSumData = null;   // Zero-sum thinking data by state and group (from R)
let currentMapGroup = "all";   // Currently selected filter group
let d3MapSvg = null;           // D3 SVG element
let d3MapPath = null;          // D3 geo path generator
let stateDataLookup = {};      // Quick lookup: state_fips -> data for current group
let currentColorScaleMin = 0;  // Current color scale min (dynamic per group)
let currentColorScaleMax = 1;  // Current color scale max (dynamic per group)

// Color scale: Green (low) → Yellow (mid) → Orange (high)
// Domain will be dynamically set based on actual data range for better differentiation
let mapColorScale = d3.scaleLinear()
  .domain([0, 0.5, 1])
  .range(["#2ecc71", "#f1c40f", "#e67e22"])
  .clamp(true);

// State FIPS to name mapping
const stateFipsToName = {
  "01": "Alabama", "02": "Alaska", "04": "Arizona", "05": "Arkansas", "06": "California",
  "08": "Colorado", "09": "Connecticut", "10": "Delaware", "11": "District of Columbia",
  "12": "Florida", "13": "Georgia", "15": "Hawaii", "16": "Idaho", "17": "Illinois",
  "18": "Indiana", "19": "Iowa", "20": "Kansas", "21": "Kentucky", "22": "Louisiana",
  "23": "Maine", "24": "Maryland", "25": "Massachusetts", "26": "Michigan", "27": "Minnesota",
  "28": "Mississippi", "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada",
  "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico", "36": "New York",
  "37": "North Carolina", "38": "North Dakota", "39": "Ohio", "40": "Oklahoma", "41": "Oregon",
  "42": "Pennsylvania", "44": "Rhode Island", "45": "South Carolina", "46": "South Dakota",
  "47": "Tennessee", "48": "Texas", "49": "Utah", "50": "Vermont", "51": "Virginia",
  "53": "Washington", "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming", "72": "Puerto Rico"
};

// Filter labels for display (generational classification per paper)
const filterLabels = {
  "all": "All respondents",
  "first_gen": "1st generation (immigrant)",
  "second_gen": "2nd generation (immigrant parents)",
  "third_gen": "3rd generation (immigrant grandparents)"
};

// Animation duration for map transitions (ms)
const MAP_TRANSITION_DURATION = 600;

/**
 * Get the currently selected map group from dropdown
 */
function getSelectedGroup() {
  const select = document.getElementById("map-group-select");
  return select?.value || "all";
}

/**
 * Load state boundaries (TopoJSON from CDN) and zero-sum data (local JSON)
 * NO aggregation or computation - data is already preprocessed in R
 */
async function loadMapData() {
  try {
    console.log("[Map] Loading map data...");
    
    // Load state boundaries from US Atlas CDN (TopoJSON)
    // and zero-sum data from local preprocessed JSON
    const [topoRes, zsRes] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'),
      fetch('./data/vizmap/state_zero_sum_long.json')
    ]);
    
    if (!topoRes.ok || !zsRes.ok) {
      throw new Error(`HTTP error: topo=${topoRes.status}, zs=${zsRes.status}`);
    }
    
    const topoData = await topoRes.json();
    const zsJson = await zsRes.json();
    
    // Convert TopoJSON to GeoJSON using topojson library (loaded from CDN)
    // The states object contains state boundaries
    if (typeof topojson !== 'undefined') {
      stateGeoData = topojson.feature(topoData, topoData.objects.states);
    } else {
      // Fallback: manually convert if topojson library not available
      // Load topojson library dynamically
      await loadScript('https://cdn.jsdelivr.net/npm/topojson-client@3');
      stateGeoData = topojson.feature(topoData, topoData.objects.states);
    }
    
    // Extract data array from the JSON structure (already preprocessed)
    stateZeroSumData = zsJson.data || zsJson;
    
    console.log(`[Map] Loaded ${stateGeoData.features?.length || 0} state boundaries`);
    console.log(`[Map] Loaded ${stateZeroSumData.length} state zero-sum records (preprocessed)`);
    
    // Log available groups
    const groups = [...new Set(stateZeroSumData.map(d => d.group))];
    console.log(`[Map] Available groups: ${groups.join(", ")}`);
    
    return true;
  } catch (error) {
    console.error("[Map] Failed to load map data:", error);
    return false;
  }
}

/**
 * Helper to dynamically load a script
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Build lookup table for current group selection
 * Maps state_fips -> { avg_zs, n, small_n_state }
 * NO computation - just indexing the preprocessed data
 */
function buildStateDataLookup(group) {
  stateDataLookup = {};
  
  if (!stateZeroSumData) return;
  
  // Simply index the preprocessed data by state_fips for the selected group
  // A state has data if there is a matching record for state_fips + group
  stateZeroSumData
    .filter(d => d.group === group)
    .forEach(d => {
      // Store the raw record - avg_zs may be a number, null, or undefined (missing field)
      stateDataLookup[d.state_fips] = {
        avg_zs: d.avg_zs,        // Number if present, undefined if field missing
        n: d.n,                   // Sample size from R
        hasRecord: true           // Flag to indicate record exists in data
      };
    });
  
  // Debug: Log Nevada (state_fips="32") data for verification
  const nevadaData = stateDataLookup["32"];
  console.log(`[Map Debug] Nevada (32) for group "${group}":`, nevadaData);
    
  console.log(`[Map] Built lookup for group "${group}": ${Object.keys(stateDataLookup).length} states`);
  
  // Update color scale domain based on actual data range for better differentiation
  updateColorScaleDomain();
}

/**
 * Update color scale domain - use FIXED scale for cross-group comparison
 * Per paper's logic, we need to compare across generations, so scale must be constant
 * This allows users to visually compare: 1st gen (greener) vs 3rd gen (more yellow)
 */
function updateColorScaleDomain(minVal = null, maxVal = null) {
  // Use provided values or default to fixed scale [0.30, 0.70]
  currentColorScaleMin = minVal !== null ? minVal : 0.30;
  currentColorScaleMax = maxVal !== null ? maxVal : 0.70;
  
  // Update the scale with domain (min, mid, max)
  const mid = (currentColorScaleMin + currentColorScaleMax) / 2;
  mapColorScale.domain([currentColorScaleMin, mid, currentColorScaleMax]);
  
  console.log(`[Map] Color scale: [${currentColorScaleMin.toFixed(2)}, ${mid.toFixed(2)}, ${currentColorScaleMax.toFixed(2)}]`);
  
  // Update legend and slider displays
  updateLegendLabels();
}

/**
 * Update legend labels to reflect current color scale domain
 */
function updateLegendLabels() {
  const minLabel = document.getElementById("legend-min-label");
  const maxLabel = document.getElementById("legend-max-label");
  
  if (minLabel) minLabel.textContent = currentColorScaleMin.toFixed(2);
  if (maxLabel) maxLabel.textContent = currentColorScaleMax.toFixed(2);
}

/**
 * Initialize the D3 SVG map
 */
function initializeD3Map() {
  const container = document.getElementById("d3-map-container");
  if (!container) {
    console.warn("[Map] Container #d3-map-container not found");
    return;
  }
  
  // Clear any existing content
  container.innerHTML = "";
  
  const width = container.clientWidth || 960;
  const height = container.clientHeight || 520;
  
  // Create SVG
  d3MapSvg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background", "#f8fafc");
  
  // Create projection centered on continental US
  // Adjust scale to fit all states including Hawaii/Alaska/Washington
  const projection = d3.geoAlbersUsa();
  
  // Smaller scale to ensure all states fit, centered properly
  const scale = Math.min(width * 1.1, 1000);
  projection
    .scale(scale)
    .translate([width / 2, height / 2]);
  
  d3MapPath = d3.geoPath().projection(projection);
  
  // Add a group for states
  d3MapSvg.append("g").attr("class", "states");
  
  console.log(`[Map] D3 SVG initialized: ${width}x${height}`);
}

/**
 * Render state boundaries with colors based on preprocessed zero-sum data
 * Uses D3 transitions for smooth color changes when filters change
 * NO computation - just visualization of R-processed data
 */
function renderStateMap() {
  if (!d3MapSvg || !stateGeoData) {
    console.warn("[Map] Cannot render: SVG or GeoData not ready");
    return;
  }
  
  const tooltip = document.getElementById("map-tooltip");
  const statesGroup = d3MapSvg.select("g.states");
  
  // Build lookup for current group (just indexing, no computation)
  buildStateDataLookup(currentMapGroup);
  
  // Helper function to get fill color for a state
  const getFillColor = (d) => {
    const fips = String(d.id).padStart(2, '0');
    const data = stateDataLookup[fips];
    
    if (!data) return "#dfe6e9";
    if (typeof data.avg_zs === 'number' && !isNaN(data.avg_zs)) {
      return mapColorScale(data.avg_zs);
    }
    return "#dfe6e9";
  };
  
  // Helper to check low reliability
  const isLowReliability = (d) => {
    const fips = String(d.id).padStart(2, '0');
    const data = stateDataLookup[fips];
    return data && typeof data.n === 'number' && data.n > 0 && data.n < 50;
  };
  
  // Bind data and render states
  const states = statesGroup.selectAll("path")
    .data(stateGeoData.features, d => d.id);
  
  // Enter: New states (first render)
  const statesEnter = states.enter()
    .append("path")
    .attr("class", "state")
    .attr("d", d3MapPath)
    .attr("fill", "#dfe6e9") // Start gray
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .style("cursor", "pointer");
  
  // Merge enter + update and apply transitions
  statesEnter.merge(states)
    .transition()
    .duration(MAP_TRANSITION_DURATION)
    .ease(d3.easeCubicInOut)
    .attr("fill", getFillColor)
    .attr("stroke", d => isLowReliability(d) ? "#e67e22" : "#fff")
    .attr("stroke-width", d => isLowReliability(d) ? 1.5 : 1)
    .attr("stroke-dasharray", d => isLowReliability(d) ? "4,2" : "none");
  
  // Add event handlers (only need to set once on enter, but merge ensures all have them)
  statesEnter.merge(states)
    .on("mouseenter", function(event, d) {
      const fips = String(d.id).padStart(2, '0');
      const data = stateDataLookup[fips];
      const stateName = stateFipsToName[fips] || d.properties?.name || "Unknown State";
      
      // Debug: Log Nevada data when hovering
      if (fips === "32") {
        console.log(`[Map Debug] Tooltip for Nevada (32), group="${currentMapGroup}":`, JSON.stringify(data));
      }
      
      // Highlight state (preserve dash for low reliability: n < 50)
      const lowReliability = isLowReliability(d);
      d3.select(this)
        .transition()
        .duration(150)
        .attr("stroke", "#2c3e50")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", lowReliability ? "4,2" : "none");
      
      // Build tooltip content
      let tooltipHtml = `<strong>${stateName}</strong>`;
      tooltipHtml += `<br/><span style="color: #7f8c8d; font-size: 11px;">FIPS: ${fips}</span>`;
      
      if (!data) {
        tooltipHtml += `<hr style="margin: 8px 0; border: none; border-top: 1px solid #ecf0f1;">`;
        tooltipHtml += `<span style="color: #95a5a6;">No data available for this group</span>`;
      } else {
        // Record exists - show the data
        tooltipHtml += `<hr style="margin: 8px 0; border: none; border-top: 1px solid #ecf0f1;">`;
        
        // Check if avg_zs is a valid number
        if (typeof data.avg_zs === 'number' && !isNaN(data.avg_zs)) {
          const color = mapColorScale(data.avg_zs);
          tooltipHtml += `<div style="display: flex; justify-content: space-between; gap: 16px;">`;
          tooltipHtml += `<span>Zero-Sum Index:</span>`;
          tooltipHtml += `<strong style="color: ${color};">${data.avg_zs.toFixed(2)}</strong>`;
          tooltipHtml += `</div>`;
        } else {
          // Record exists but avg_zs is missing/invalid
          tooltipHtml += `<div style="display: flex; justify-content: space-between; gap: 16px;">`;
          tooltipHtml += `<span>Zero-Sum Index:</span>`;
          tooltipHtml += `<strong style="color: #95a5a6;">—</strong>`;
          tooltipHtml += `</div>`;
        }
        
        // Show sample size
        tooltipHtml += `<div style="display: flex; justify-content: space-between; gap: 16px;">`;
        tooltipHtml += `<span>Sample Size (n):</span>`;
        tooltipHtml += `<strong>${data.n.toLocaleString()}</strong>`;
        // Warning only when 0 < n < 50
        if (typeof data.n === 'number' && data.n > 0 && data.n < 50) {
          tooltipHtml += ` <span style="color: #e67e22;">⚠️ Low reliability</span>`;
        }
        tooltipHtml += `</div>`;
      }
      
      tooltip.innerHTML = tooltipHtml;
      tooltip.style.display = "block";
    })
    .on("mousemove", function(event) {
      const container = document.getElementById("d3-map-container");
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left + 15;
      const y = event.clientY - rect.top + 15;
      
      // Keep tooltip within container
      const tooltipRect = tooltip.getBoundingClientRect();
      const maxX = rect.width - tooltipRect.width - 10;
      const maxY = rect.height - tooltipRect.height - 10;
      
      tooltip.style.left = Math.min(x, maxX) + "px";
      tooltip.style.top = Math.min(y, maxY) + "px";
    })
    .on("mouseleave", function(event, d) {
      const lowReliability = isLowReliability(d);
      d3.select(this)
        .transition()
        .duration(150)
        .attr("stroke", lowReliability ? "#e67e22" : "#fff")
        .attr("stroke-width", lowReliability ? 1.5 : 1)
        .attr("stroke-dasharray", lowReliability ? "4,2" : "none");
      tooltip.style.display = "none";
    });
  
  // Remove old states
  states.exit().remove();
  
  // Update statistics display
  updateMapStatistics();
}

/**
 * Update the statistics panel with current data
 * Just displays the preprocessed values, no computation
 */
function updateMapStatistics() {
  const dataPoints = Object.values(stateDataLookup);
  // Valid data = avg_zs is a number (record exists and has value)
  const validData = dataPoints.filter(d => typeof d.avg_zs === 'number' && !isNaN(d.avg_zs));
  // Low reliability = record exists AND 0 < n < 50
  const lowReliabilityCount = dataPoints.filter(d => typeof d.n === 'number' && d.n > 0 && d.n < 50).length;
  // No data count for states in lookup but missing avg_zs
  const noDataCount = dataPoints.length - validData.length;
  
  const countEl = document.getElementById("map-state-count");
  const meanEl = document.getElementById("map-mean");
  const medianEl = document.getElementById("map-median");
  const rangeEl = document.getElementById("map-range");
  const smallNEl = document.getElementById("map-small-n-count");
  const warningDiv = document.getElementById("map-sample-size-warning");
  const warningText = document.getElementById("map-warning-text");
  
  if (validData.length === 0) {
    if (countEl) countEl.textContent = "0";
    if (meanEl) meanEl.textContent = "—";
    if (medianEl) medianEl.textContent = "—";
    if (rangeEl) rangeEl.textContent = "—";
    if (smallNEl) smallNEl.textContent = "0";
    if (warningDiv) warningDiv.style.display = "none";
    return;
  }
  
  // Simple statistics for display (these are just summaries of the viz)
  const scores = validData.map(d => d.avg_zs).sort((a, b) => a - b);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const median = scores[Math.floor(scores.length / 2)];
  const min = scores[0];
  const max = scores[scores.length - 1];
  
  if (countEl) countEl.textContent = validData.length.toString();
  if (meanEl) meanEl.textContent = mean.toFixed(2);
  if (medianEl) medianEl.textContent = median.toFixed(2);
  if (rangeEl) rangeEl.textContent = `${min.toFixed(2)} – ${max.toFixed(2)}`;
  if (smallNEl) smallNEl.textContent = lowReliabilityCount.toString();
  
  // Show banner warning for low reliability states (third-person wording)
  if (lowReliabilityCount > 0 && warningDiv && warningText) {
    warningText.textContent = `${lowReliabilityCount} state${lowReliabilityCount > 1 ? 's' : ''} in this subgroup ha${lowReliabilityCount > 1 ? 've' : 's'} sample sizes below 50 (low reliability). These are shown with dashed orange borders on the map.`;
    warningDiv.style.display = "block";
  } else if (warningDiv) {
    warningDiv.style.display = "none";
  }
}

/**
 * Set up filter radio button event listeners
 * Replaces the old button-based filter system
 */
function setupFilterListeners() {
  const groupSelect = document.getElementById("map-group-select");
  
  const handleFilterChange = () => {
    // Update global state
    currentMapGroup = getSelectedGroup();
    
    // Update filter summary
    updateMapFilterSummary();
    
    // Re-render map with new group (smooth transitions)
    renderStateMap();
  };
  
  if (groupSelect) groupSelect.addEventListener("change", handleFilterChange);
}

/**
 * Update filter summary display based on current selection
 */
function updateMapFilterSummary() {
  const summaryDiv = document.getElementById("map-filter-summary");
  if (!summaryDiv) return;
  
  const selectedGroup = getSelectedGroup();
  
  if (selectedGroup === "all") {
    summaryDiv.style.display = "none";
  } else {
    const label = filterLabels[selectedGroup] || selectedGroup;
    summaryDiv.innerHTML = `<strong>Current Subgroup:</strong> Respondents with ${label}`;
    summaryDiv.style.display = "block";
  }
}

/**
 * Initialize everything for the geographic map
 */
async function initializeGeographicMap() {
  console.log("[Map] Initializing state-level geographic map...");
  
  // Show loading state
  const container = document.getElementById("d3-map-container");
  if (container) {
    container.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #7f8c8d;"><p>Loading map data...</p></div>';
  }
  
  // Load data (state boundaries from CDN, zero-sum data from local JSON)
  const success = await loadMapData();
  
  if (!success) {
    if (container) {
      container.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #e74c3c;"><p>⚠️ Failed to load map data. Please check that data files exist in data/vizmap/ folder.</p></div>';
    }
    return;
  }
  
  // Initialize D3 map
  initializeD3Map();
  
  // Set up filter listeners (dropdown selects)
  setupFilterListeners();
  
  // Initial render
  renderStateMap();
  
  console.log("[Map] State-level geographic map initialized successfully");
}

// Initialize map when the tab is first shown (lazy loading)
let mapInitialized = false;
document.querySelectorAll(".viz-step-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.tab === "geographic-map" && !mapInitialized) {
      mapInitialized = true;
      initializeGeographicMap();
    }
  });
});

// Also initialize if we're already on the map tab (direct navigation)
document.addEventListener("DOMContentLoaded", () => {
  const activeTab = document.querySelector(".viz-step-btn--active");
  if (activeTab && activeTab.dataset.tab === "geographic-map" && !mapInitialized) {
    mapInitialized = true;
    initializeGeographicMap();
  }
});

// default route
setRoute("learn");
