// Mock dataset for Visualization (Story 3)
// Contains individual-level survey responses with demographic attributes

// Policy Index Construction Documentation:
// ==========================================
// Four policy domains based on zero-sum thinking research:
// 
// 1. Economic Policy Index (EPI)
//    - Reflects beliefs about resource redistribution and market-based gains
//    - Higher scores indicate preference for zero-sum economic beliefs
//    - Normalized 0-1
//
// 2. Social Welfare Policy Index (SWI)
//    - Reflects attitudes toward public benefit programs and social equity
//    - Higher scores indicate belief that welfare expansion diminishes opportunities for others
//    - Normalized 0-1
//
// 3. Immigration Policy Index (IPI)
//    - Reflects perceptions of immigration's impact on native-born citizens
//    - Higher scores indicate belief that immigrant gains harm native employment/resources
//    - Normalized 0-1
//
// 4. Education Opportunity Index (EOI)
//    - Reflects beliefs about educational advancement as competitive or collaborative
//    - Higher scores indicate zero-sum views (higher ed for some means less for others)
//    - Normalized 0-1

const mockDataViz = [
  // Age 18-25
  { age: "18-25", gender: "Male", education: "High School", income: "< $30k", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.65, epi: 0.58, swi: 0.62, ipi: 0.71, eoi: 0.55, immigrationStatus: "Both parents native", county: "Los Angeles County, CA", fips: 6037 },
  { age: "18-25", gender: "Female", education: "Bachelor", income: "$30-60k", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.58, epi: 0.48, swi: 0.52, ipi: 0.61, eoi: 0.50, immigrationStatus: "One parent immigrant", county: "Los Angeles County, CA", fips: 6037 },
  { age: "18-25", gender: "Male", education: "Bachelor", income: "$30-60k", party: "Republican", urbanicity: "Suburban", zeroSumScore: 0.72, epi: 0.68, swi: 0.75, ipi: 0.79, eoi: 0.68, immigrationStatus: "Both parents native", county: "Cook County, IL", fips: 17031 },
  { age: "18-25", gender: "Female", education: "High School", income: "< $30k", party: "Independent", urbanicity: "Rural", zeroSumScore: 0.45, epi: 0.38, swi: 0.42, ipi: 0.52, eoi: 0.43, immigrationStatus: "One or more grandparents immigrant", county: "Harris County, TX", fips: 48201 },
  { age: "18-25", gender: "Male", education: "Master+", income: "$60-100k", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.48, epi: 0.42, swi: 0.45, ipi: 0.55, eoi: 0.48, immigrationStatus: "Both parents immigrant", county: "Harris County, TX", fips: 48201 },
  
  // Age 26-40
  { age: "26-40", gender: "Male", education: "High School", income: "$30-60k", party: "Republican", urbanicity: "Suburban", zeroSumScore: 0.78, epi: 0.72, swi: 0.80, ipi: 0.83, eoi: 0.75, immigrationStatus: "Both parents native", county: "Maricopa County, AZ", fips: 4013 },
  { age: "26-40", gender: "Female", education: "Bachelor", income: "$60-100k", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.52, epi: 0.46, swi: 0.50, ipi: 0.58, eoi: 0.52, immigrationStatus: "One parent immigrant", county: "San Diego County, CA", fips: 6073 },
  { age: "26-40", gender: "Male", education: "Master+", income: "$100k+", party: "Republican", urbanicity: "Suburban", zeroSumScore: 0.71, epi: 0.65, swi: 0.73, ipi: 0.78, eoi: 0.70, immigrationStatus: "One or more grandparents immigrant", county: "Cook County, IL", fips: 17031 },
  { age: "26-40", gender: "Female", education: "Bachelor", income: "$30-60k", party: "Independent", urbanicity: "Rural", zeroSumScore: 0.55, epi: 0.48, swi: 0.53, ipi: 0.63, eoi: 0.54, immigrationStatus: "Both parents immigrant", county: "Broward County, FL", fips: 12011 },
  { age: "26-40", gender: "Male", education: "High School", income: "< $30k", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.61, epi: 0.54, swi: 0.60, ipi: 0.68, eoi: 0.59, immigrationStatus: "Both parents native", county: "King County, WA", fips: 53033 },
  
  // Age 41-55
  { age: "41-55", gender: "Male", education: "Bachelor", income: "$60-100k", party: "Republican", urbanicity: "Suburban", zeroSumScore: 0.75, epi: 0.69, swi: 0.77, ipi: 0.81, eoi: 0.73, immigrationStatus: "One parent immigrant", county: "New York County, NY", fips: 36061 },
  { age: "41-55", gender: "Female", education: "Master+", income: "$100k+", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.49, epi: 0.43, swi: 0.47, ipi: 0.56, eoi: 0.50, immigrationStatus: "One or more grandparents immigrant", county: "Dallas County, TX", fips: 48113 },
  { age: "41-55", gender: "Male", education: "High School", income: "$30-60k", party: "Republican", urbanicity: "Rural", zeroSumScore: 0.82, epi: 0.76, swi: 0.84, ipi: 0.87, eoi: 0.80, immigrationStatus: "Both parents native", county: "Tarrant County, TX", fips: 48439 },
  { age: "41-55", gender: "Female", education: "Bachelor", income: "$60-100k", party: "Independent", urbanicity: "Suburban", zeroSumScore: 0.59, epi: 0.52, swi: 0.58, ipi: 0.67, eoi: 0.60, immigrationStatus: "Both parents immigrant", county: "Orange County, CA", fips: 6059 },
  { age: "41-55", gender: "Male", education: "Master+", income: "$100k+", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.51, epi: 0.44, swi: 0.49, ipi: 0.58, eoi: 0.52, immigrationStatus: "Both parents native", county: "Fulton County, GA", fips: 13121 },
  
  // Age 56-70
  { age: "56-70", gender: "Male", education: "High School", income: "$30-60k", party: "Republican", urbanicity: "Rural", zeroSumScore: 0.79, epi: 0.73, swi: 0.81, ipi: 0.84, eoi: 0.77, immigrationStatus: "One parent immigrant", county: "Hennepin County, MN", fips: 27053 },
  { age: "56-70", gender: "Female", education: "Bachelor", income: "$60-100k", party: "Democrat", urbanicity: "Suburban", zeroSumScore: 0.54, epi: 0.48, swi: 0.52, ipi: 0.61, eoi: 0.55, immigrationStatus: "Both parents native", county: "Wayne County, MI", fips: 26163 },
  { age: "56-70", gender: "Male", education: "Master+", income: "$100k+", party: "Republican", urbanicity: "Suburban", zeroSumScore: 0.68, epi: 0.62, swi: 0.70, ipi: 0.76, eoi: 0.68, immigrationStatus: "One or more grandparents immigrant", county: "Duval County, FL", fips: 12031 },
  { age: "56-70", gender: "Female", education: "High School", income: "< $30k", party: "Independent", urbanicity: "Rural", zeroSumScore: 0.62, epi: 0.55, swi: 0.61, ipi: 0.70, eoi: 0.61, immigrationStatus: "Both parents immigrant", county: "Hillsborough County, FL", fips: 12057 },
  { age: "56-70", gender: "Male", education: "Bachelor", income: "$60-100k", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.50, epi: 0.44, swi: 0.48, ipi: 0.57, eoi: 0.51, immigrationStatus: "Both parents native", county: "Arapahoe County, CO", fips: 8005 },
  
  // Age 70+
  { age: "70+", gender: "Male", education: "High School", income: "< $30k", party: "Republican", urbanicity: "Suburban", zeroSumScore: 0.76, epi: 0.70, swi: 0.78, ipi: 0.82, eoi: 0.74, immigrationStatus: "One parent immigrant", county: "Shelby County, TN", fips: 47157 },
  { age: "70+", gender: "Female", education: "Bachelor", income: "$30-60k", party: "Democrat", urbanicity: "Urban", zeroSumScore: 0.48, epi: 0.41, swi: 0.46, ipi: 0.55, eoi: 0.49, immigrationStatus: "One or more grandparents immigrant", county: "Clark County, NV", fips: 32003 },
  { age: "70+", gender: "Male", education: "Master+", income: "$60-100k", party: "Republican", urbanicity: "Rural", zeroSumScore: 0.73, epi: 0.67, swi: 0.75, ipi: 0.80, eoi: 0.72, immigrationStatus: "Both parents native", county: "Multnomah County, OR", fips: 41051 },
  { age: "70+", gender: "Female", education: "High School", income: "< $30k", party: "Independent", urbanicity: "Rural", zeroSumScore: 0.64, epi: 0.57, swi: 0.63, ipi: 0.72, eoi: 0.63, immigrationStatus: "Both parents immigrant", county: "Pierce County, WA", fips: 53053 },
];

// Helper: Aggregate data by a demographic variable
function aggregateByDemographic(data, variable) {
  const groups = {};
  
  data.forEach(record => {
    const groupKey = record[variable];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(record.zeroSumScore);
  });

  // Calculate mean for each group
  const result = [];
  Object.entries(groups).forEach(([groupKey, scores]) => {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const n = scores.length;
    result.push({
      label: groupKey,
      mean: Math.round(mean * 100) / 100,
      n: n,
      scores: scores
    });
  });

  return result;
}

// Helper: Filter data by demographic criteria
function filterByDemographics(data, filters) {
  return data.filter(record => {
    for (const [key, value] of Object.entries(filters)) {
      if (record[key] !== value) return false;
    }
    return true;
  });
}

// County-level aggregated data (Story 3.3)
// Simulated data for 50 US counties with zero-sum index averages
// Each county includes immigration status breakdown
const countyData = [
  { county: "Los Angeles County, CA", fips: 6037, zeroSumAvg: 0.68, n: 450, immigrationBreakdown: { "Both parents native": 0.65, "One parent immigrant": 0.71, "Both parents immigrant": 0.70, "One or more grandparents immigrant": 0.68 } },
  { county: "Cook County, IL", fips: 17031, zeroSumAvg: 0.65, n: 380, immigrationBreakdown: { "Both parents native": 0.67, "One parent immigrant": 0.64, "Both parents immigrant": 0.62, "One or more grandparents immigrant": 0.65 } },
  { county: "Harris County, TX", fips: 48201, zeroSumAvg: 0.72, n: 410, immigrationBreakdown: { "Both parents native": 0.74, "One parent immigrant": 0.71, "Both parents immigrant": 0.69, "One or more grandparents immigrant": 0.72 } },
  { county: "Maricopa County, AZ", fips: 4013, zeroSumAvg: 0.75, n: 320, immigrationBreakdown: { "Both parents native": 0.77, "One parent immigrant": 0.74, "Both parents immigrant": 0.72, "One or more grandparents immigrant": 0.75 } },
  { county: "San Diego County, CA", fips: 6073, zeroSumAvg: 0.66, n: 290, immigrationBreakdown: { "Both parents native": 0.63, "One parent immigrant": 0.69, "Both parents immigrant": 0.68, "One or more grandparents immigrant": 0.65 } },
  { county: "Broward County, FL", fips: 12011, zeroSumAvg: 0.70, n: 350, immigrationBreakdown: { "Both parents native": 0.68, "One parent immigrant": 0.70, "Both parents immigrant": 0.72, "One or more grandparents immigrant": 0.69 } },
  { county: "King County, WA", fips: 53033, zeroSumAvg: 0.62, n: 280, immigrationBreakdown: { "Both parents native": 0.60, "One parent immigrant": 0.64, "Both parents immigrant": 0.63, "One or more grandparents immigrant": 0.62 } },
  { county: "New York County, NY", fips: 36061, zeroSumAvg: 0.64, n: 420, immigrationBreakdown: { "Both parents native": 0.62, "One parent immigrant": 0.66, "Both parents immigrant": 0.65, "One or more grandparents immigrant": 0.64 } },
  { county: "Dallas County, TX", fips: 48113, zeroSumAvg: 0.68, n: 310, immigrationBreakdown: { "Both parents native": 0.70, "One parent immigrant": 0.67, "Both parents immigrant": 0.65, "One or more grandparents immigrant": 0.68 } },
  { county: "Tarrant County, TX", fips: 48439, zeroSumAvg: 0.73, n: 290, immigrationBreakdown: { "Both parents native": 0.75, "One parent immigrant": 0.72, "Both parents immigrant": 0.70, "One or more grandparents immigrant": 0.73 } },
  { county: "Orange County, CA", fips: 6059, zeroSumAvg: 0.71, n: 340, immigrationBreakdown: { "Both parents native": 0.72, "One parent immigrant": 0.70, "Both parents immigrant": 0.69, "One or more grandparents immigrant": 0.71 } },
  { county: "Fulton County, GA", fips: 13121, zeroSumAvg: 0.60, n: 260, immigrationBreakdown: { "Both parents native": 0.58, "One parent immigrant": 0.62, "Both parents immigrant": 0.61, "One or more grandparents immigrant": 0.60 } },
  { county: "Hennepin County, MN", fips: 27053, zeroSumAvg: 0.67, n: 300, immigrationBreakdown: { "Both parents native": 0.68, "One parent immigrant": 0.66, "Both parents immigrant": 0.65, "One or more grandparents immigrant": 0.67 } },
  { county: "Wayne County, MI", fips: 26163, zeroSumAvg: 0.63, n: 280, immigrationBreakdown: { "Both parents native": 0.65, "One parent immigrant": 0.62, "Both parents immigrant": 0.60, "One or more grandparents immigrant": 0.63 } },
  { county: "Duval County, FL", fips: 12031, zeroSumAvg: 0.69, n: 310, immigrationBreakdown: { "Both parents native": 0.70, "One parent immigrant": 0.68, "Both parents immigrant": 0.67, "One or more grandparents immigrant": 0.69 } },
  { county: "Hillsborough County, FL", fips: 12057, zeroSumAvg: 0.68, n: 320, immigrationBreakdown: { "Both parents native": 0.66, "One parent immigrant": 0.69, "Both parents immigrant": 0.71, "One or more grandparents immigrant": 0.68 } },
  { county: "Arapahoe County, CO", fips: 8005, zeroSumAvg: 0.64, n: 270, immigrationBreakdown: { "Both parents native": 0.62, "One parent immigrant": 0.65, "Both parents immigrant": 0.64, "One or more grandparents immigrant": 0.64 } },
  { county: "Shelby County, TN", fips: 47157, zeroSumAvg: 0.71, n: 300, immigrationBreakdown: { "Both parents native": 0.73, "One parent immigrant": 0.70, "Both parents immigrant": 0.68, "One or more grandparents immigrant": 0.71 } },
  { county: "Clark County, NV", fips: 32003, zeroSumAvg: 0.65, n: 290, immigrationBreakdown: { "Both parents native": 0.63, "One parent immigrant": 0.66, "Both parents immigrant": 0.67, "One or more grandparents immigrant": 0.65 } },
  { county: "Multnomah County, OR", fips: 41051, zeroSumAvg: 0.61, n: 250, immigrationBreakdown: { "Both parents native": 0.60, "One parent immigrant": 0.62, "Both parents immigrant": 0.61, "One or more grandparents immigrant": 0.61 } },
  { county: "Pierce County, WA", fips: 53053, zeroSumAvg: 0.66, n: 280, immigrationBreakdown: { "Both parents native": 0.64, "One parent immigrant": 0.67, "Both parents immigrant": 0.68, "One or more grandparents immigrant": 0.66 } },
  { county: "Allegheny County, PA", fips: 42003, zeroSumAvg: 0.59, n: 270, immigrationBreakdown: { "Both parents native": 0.61, "One parent immigrant": 0.58, "Both parents immigrant": 0.56, "One or more grandparents immigrant": 0.59 } },
  { county: "Cuyahoga County, OH", fips: 39035, zeroSumAvg: 0.62, n: 260, immigrationBreakdown: { "Both parents native": 0.64, "One parent immigrant": 0.61, "Both parents immigrant": 0.58, "One or more grandparents immigrant": 0.62 } },
  { county: "Franklin County, OH", fips: 39049, zeroSumAvg: 0.63, n: 280, immigrationBreakdown: { "Both parents native": 0.65, "One parent immigrant": 0.62, "Both parents immigrant": 0.60, "One or more grandparents immigrant": 0.63 } },
  { county: "Hamilton County, OH", fips: 39061, zeroSumAvg: 0.65, n: 290, immigrationBreakdown: { "Both parents native": 0.67, "One parent immigrant": 0.64, "Both parents immigrant": 0.62, "One or more grandparents immigrant": 0.65 } },
  { county: "Marion County, IN", fips: 18097, zeroSumAvg: 0.64, n: 270, immigrationBreakdown: { "Both parents native": 0.66, "One parent immigrant": 0.63, "Both parents immigrant": 0.61, "One or more grandparents immigrant": 0.64 } },
  { county: "Alameda County, CA", fips: 6001, zeroSumAvg: 0.67, n: 350, immigrationBreakdown: { "Both parents native": 0.65, "One parent immigrant": 0.69, "Both parents immigrant": 0.70, "One or more grandparents immigrant": 0.67 } },
  { county: "Kern County, CA", fips: 6029, zeroSumAvg: 0.72, n: 310, immigrationBreakdown: { "Both parents native": 0.74, "One parent immigrant": 0.71, "Both parents immigrant": 0.69, "One or more grandparents immigrant": 0.72 } },
  { county: "Kings County, CA", fips: 6031, zeroSumAvg: 0.75, n: 280, immigrationBreakdown: { "Both parents native": 0.77, "One parent immigrant": 0.74, "Both parents immigrant": 0.72, "One or more grandparents immigrant": 0.75 } },
  { county: "Riverside County, CA", fips: 6065, zeroSumAvg: 0.70, n: 330, immigrationBreakdown: { "Both parents native": 0.72, "One parent immigrant": 0.69, "Both parents immigrant": 0.67, "One or more grandparents immigrant": 0.70 } },
  { county: "Fresno County, CA", fips: 6019, zeroSumAvg: 0.73, n: 300, immigrationBreakdown: { "Both parents native": 0.75, "One parent immigrant": 0.72, "Both parents immigrant": 0.70, "One or more grandparents immigrant": 0.73 } },
  { county: "Tulsa County, OK", fips: 40143, zeroSumAvg: 0.71, n: 260, immigrationBreakdown: { "Both parents native": 0.73, "One parent immigrant": 0.70, "Both parents immigrant": 0.68, "One or more grandparents immigrant": 0.71 } },
  { county: "Travis County, TX", fips: 48453, zeroSumAvg: 0.68, n: 290, immigrationBreakdown: { "Both parents native": 0.70, "One parent immigrant": 0.67, "Both parents immigrant": 0.65, "One or more grandparents immigrant": 0.68 } },
  { county: "Jefferson County, KY", fips: 21111, zeroSumAvg: 0.64, n: 270, immigrationBreakdown: { "Both parents native": 0.66, "One parent immigrant": 0.63, "Both parents immigrant": 0.61, "One or more grandparents immigrant": 0.64 } },
  { county: "Davidson County, TN", fips: 47037, zeroSumAvg: 0.65, n: 280, immigrationBreakdown: { "Both parents native": 0.67, "One parent immigrant": 0.64, "Both parents immigrant": 0.62, "One or more grandparents immigrant": 0.65 } },
  { county: "Jackson County, MO", fips: 29095, zeroSumAvg: 0.63, n: 260, immigrationBreakdown: { "Both parents native": 0.65, "One parent immigrant": 0.62, "Both parents immigrant": 0.60, "One or more grandparents immigrant": 0.63 } },
  { county: "Pima County, AZ", fips: 4019, zeroSumAvg: 0.70, n: 300, immigrationBreakdown: { "Both parents native": 0.72, "One parent immigrant": 0.69, "Both parents immigrant": 0.67, "One or more grandparents immigrant": 0.70 } },
  { county: "Sacramento County, CA", fips: 6067, zeroSumAvg: 0.68, n: 310, immigrationBreakdown: { "Both parents native": 0.66, "One parent immigrant": 0.70, "Both parents immigrant": 0.71, "One or more grandparents immigrant": 0.68 } },
  { county: "Honolulu County, HI", fips: 15003, zeroSumAvg: 0.62, n: 240, immigrationBreakdown: { "Both parents native": 0.60, "One parent immigrant": 0.64, "Both parents immigrant": 0.65, "One or more grandparents immigrant": 0.62 } },
  { county: "Middlesex County, MA", fips: 25017, zeroSumAvg: 0.61, n: 270, immigrationBreakdown: { "Both parents native": 0.59, "One parent immigrant": 0.63, "Both parents immigrant": 0.64, "One or more grandparents immigrant": 0.61 } },
  { county: "Suffolk County, MA", fips: 25025, zeroSumAvg: 0.60, n: 280, immigrationBreakdown: { "Both parents native": 0.58, "One parent immigrant": 0.62, "Both parents immigrant": 0.63, "One or more grandparents immigrant": 0.60 } },
  { county: "Providence County, RI", fips: 44007, zeroSumAvg: 0.59, n: 250, immigrationBreakdown: { "Both parents native": 0.57, "One parent immigrant": 0.61, "Both parents immigrant": 0.62, "One or more grandparents immigrant": 0.59 } },
  { county: "Hartford County, CT", fips: 9003, zeroSumAvg: 0.62, n: 260, immigrationBreakdown: { "Both parents native": 0.60, "One parent immigrant": 0.64, "Both parents immigrant": 0.65, "One or more grandparents immigrant": 0.62 } },
  { county: "Fairfield County, CT", fips: 9001, zeroSumAvg: 0.63, n: 280, immigrationBreakdown: { "Both parents native": 0.61, "One parent immigrant": 0.65, "Both parents immigrant": 0.66, "One or more grandparents immigrant": 0.63 } },
  { county: "Westchester County, NY", fips: 36119, zeroSumAvg: 0.65, n: 300, immigrationBreakdown: { "Both parents native": 0.63, "One parent immigrant": 0.67, "Both parents immigrant": 0.68, "One or more grandparents immigrant": 0.65 } },
  { county: "Bergen County, NJ", fips: 34003, zeroSumAvg: 0.64, n: 290, immigrationBreakdown: { "Both parents native": 0.62, "One parent immigrant": 0.66, "Both parents immigrant": 0.67, "One or more grandparents immigrant": 0.64 } },
  { county: "Philadelphia County, PA", fips: 42101, zeroSumAvg: 0.61, n: 310, immigrationBreakdown: { "Both parents native": 0.59, "One parent immigrant": 0.63, "Both parents immigrant": 0.64, "One or more grandparents immigrant": 0.61 } },
  { county: "Delaware County, PA", fips: 42045, zeroSumAvg: 0.60, n: 270, immigrationBreakdown: { "Both parents native": 0.58, "One parent immigrant": 0.62, "Both parents immigrant": 0.63, "One or more grandparents immigrant": 0.60 } }
];
