// ============================================
// Zero-Sum Thinking Test Calculator
// Based on: Chinoy, Nunn, Sequeira, and Stantcheva (2024)
// "Zero-Sum Thinking and the Roots of U.S. Political Divides"
// American Economic Review
// ============================================

const ZeroSumTest = (function() {
  // ============================================
  // PCA Parameters extracted from paper data (N ≈ 20,000)
  // ============================================

  // Means (for centering)
  const MEAN_ETHNIC = 2.908078;
  const MEAN_TRADE = 3.073035;
  const MEAN_CITIZEN = 3.012131;
  const MEAN_INCOME = 3.214715;

  // Standard deviations (for standardization)
  const SD_ETHNIC = 1.166274;
  const SD_TRADE = 0.998071;
  const SD_CITIZEN = 1.169406;
  const SD_INCOME = 1.110485;

  // PC1 loadings (first principal component weights)
  const LOADING_ETHNIC = 0.545158;
  const LOADING_TRADE = 0.524543;
  const LOADING_CITIZEN = 0.399967;
  const LOADING_INCOME = 0.517381;

  // zs4 score range (for normalization to 0-1)
  const ZS4_MIN = -3.701452;
  const ZS4_MAX = 3.502246;

  // Percentile reference values
  const PERCENTILES = {
    10: 0.2500,
    25: 0.3794,
    50: 0.5000,
    75: 0.6516,
    90: 0.7846
  };

  // Distribution data for visualization (approximated from paper)
  const DISTRIBUTION_DATA = [
    { bin: '0-10%', count: 1850, range: [0, 0.1] },
    { bin: '10-20%', count: 1650, range: [0.1, 0.2] },
    { bin: '20-30%', count: 2100, range: [0.2, 0.3] },
    { bin: '30-40%', count: 2850, range: [0.3, 0.4] },
    { bin: '40-50%', count: 3200, range: [0.4, 0.5] },
    { bin: '50-60%', count: 3100, range: [0.5, 0.6] },
    { bin: '60-70%', count: 2450, range: [0.6, 0.7] },
    { bin: '70-80%', count: 1650, range: [0.7, 0.8] },
    { bin: '80-90%', count: 950, range: [0.8, 0.9] },
    { bin: '90-100%', count: 600, range: [0.9, 1.0] }
  ];

  /**
   * Calculate Zero-Sum Thinking score using PCA method
   * @param {number} ethnic - Response to ethnic group question (1-5)
   * @param {number} trade - Response to trade question (1-5)
   * @param {number} citizen - Response to citizen question (1-5)
   * @param {number} income - Response to income question (1-5)
   * @returns {number} Normalized score between 0 and 1
   */
  function calculateScore(ethnic, trade, citizen, income) {
    // Step 1: Standardize (Z-score transformation)
    const z_ethnic = (ethnic - MEAN_ETHNIC) / SD_ETHNIC;
    const z_trade = (trade - MEAN_TRADE) / SD_TRADE;
    const z_citizen = (citizen - MEAN_CITIZEN) / SD_CITIZEN;
    const z_income = (income - MEAN_INCOME) / SD_INCOME;
    
    // Step 2: Calculate PC1 score (weighted sum)
    const zs4 = z_ethnic * LOADING_ETHNIC 
              + z_trade * LOADING_TRADE 
              + z_citizen * LOADING_CITIZEN 
              + z_income * LOADING_INCOME;
    
    // Step 3: Normalize to 0-1 range
    const zs4_unif = (zs4 - ZS4_MIN) / (ZS4_MAX - ZS4_MIN);
    
    // Clamp to [0, 1] range (prevent extreme values)
    return Math.max(0, Math.min(1, zs4_unif));
  }

  /**
   * Get percentile rank description
   * @param {number} score - Normalized score (0-1)
   * @returns {object} Percentile information
   */
  function getPercentileRank(score) {
    let percentile;
    let description;
    
    if (score < PERCENTILES[10]) {
      percentile = Math.round(score / PERCENTILES[10] * 10);
      description = 'bottom 10%';
    } else if (score < PERCENTILES[25]) {
      percentile = 10 + Math.round((score - PERCENTILES[10]) / (PERCENTILES[25] - PERCENTILES[10]) * 15);
      description = '10th-25th percentile';
    } else if (score < PERCENTILES[50]) {
      percentile = 25 + Math.round((score - PERCENTILES[25]) / (PERCENTILES[50] - PERCENTILES[25]) * 25);
      description = '25th-50th percentile';
    } else if (score < PERCENTILES[75]) {
      percentile = 50 + Math.round((score - PERCENTILES[50]) / (PERCENTILES[75] - PERCENTILES[50]) * 25);
      description = '50th-75th percentile';
    } else if (score < PERCENTILES[90]) {
      percentile = 75 + Math.round((score - PERCENTILES[75]) / (PERCENTILES[90] - PERCENTILES[75]) * 15);
      description = '75th-90th percentile';
    } else {
      percentile = 90 + Math.round((score - PERCENTILES[90]) / (1 - PERCENTILES[90]) * 10);
      description = 'top 10%';
    }
    
    percentile = Math.max(1, Math.min(99, percentile));
    
    return {
      percentile: percentile,
      description: description,
      higherThan: percentile,
      lowerThan: 100 - percentile
    };
  }

  /**
   * Get interpretation of the score
   * @param {number} score - Normalized score (0-1)
   * @param {string} lang - Language ('en' or 'zh')
   * @returns {object} Interpretation details
   */
  function getInterpretation(score, lang = 'en') {
    const interpretations = {
      low: {
        en: {
          level: 'Low',
          title: 'Positive-Sum Thinker',
          description: 'You tend to see economic relationships as opportunities for mutual gain. You believe that one group\'s success doesn\'t necessarily come at another\'s expense.'
        },
        zh: {
          level: '低',
          title: '正和思维者',
          description: '你倾向于认为经济关系是共赢的机会。你相信一个群体的成功不一定以牺牲另一个群体为代价。'
        }
      },
      medium: {
        en: {
          level: 'Moderate',
          title: 'Mixed Perspective',
          description: 'You have a balanced view, recognizing that some situations may be zero-sum while others offer opportunities for mutual benefit.'
        },
        zh: {
          level: '中等',
          title: '混合视角',
          description: '你持有平衡的观点，认识到某些情况可能是零和的，而另一些情况则提供共赢的机会。'
        }
      },
      high: {
        en: {
          level: 'High',
          title: 'Zero-Sum Thinker',
          description: 'You tend to view economic relationships as competitive. You believe that gains for one group often come at the expense of others.'
        },
        zh: {
          level: '高',
          title: '零和思维者',
          description: '你倾向于将经济关系视为竞争性的。你相信一个群体的收益往往以其他群体的损失为代价。'
        }
      }
    };
    
    let category;
    if (score < 0.35) {
      category = 'low';
    } else if (score < 0.65) {
      category = 'medium';
    } else {
      category = 'high';
    }
    
    return {
      category: category,
      ...interpretations[category][lang]
    };
  }

  /**
   * Get distribution data for visualization
   * @returns {Array} Distribution histogram data
   */
  function getDistributionData() {
    return DISTRIBUTION_DATA;
  }

  /**
   * Get percentile markers for visualization
   * @returns {object} Percentile values
   */
  function getPercentileMarkers() {
    return PERCENTILES;
  }

  /**
   * Get benchmark statistics
   * @returns {object} Sample statistics
   */
  function getBenchmarkStats() {
    return {
      n: 20400,
      mean: 0.50,
      median: 0.50,
      min: 0,
      max: 1,
      p25: PERCENTILES[25],
      p75: PERCENTILES[75]
    };
  }

  // Public API
  return {
    calculateScore: calculateScore,
    getPercentileRank: getPercentileRank,
    getInterpretation: getInterpretation,
    getDistributionData: getDistributionData,
    getPercentileMarkers: getPercentileMarkers,
    getBenchmarkStats: getBenchmarkStats
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZeroSumTest;
}
