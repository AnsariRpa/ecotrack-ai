import { Activity } from "@prisma/client";

export interface PersonalizedRecommendation {
  category: string;
  title: string;
  content: string;
  potentialSaving: number; // in kg CO2
}

export function generateRecommendations(activities: Activity[]): PersonalizedRecommendation[] {
  const recommendations: PersonalizedRecommendation[] = [];

  // Group emissions by category
  const categoryTotals: Record<string, number> = {
    transportation: 0,
    food: 0,
    energy: 0,
    waste: 0,
  };

  let totalEmissions = 0;
  activities.forEach((act) => {
    if (categoryTotals[act.category] !== undefined) {
      categoryTotals[act.category] += act.carbonTons;
    }
    totalEmissions += act.carbonTons;
  });

  // 1. Analyze Transportation
  const carTravel = activities.filter((act) => act.category === "transportation" && act.type === "car");
  const carKm = carTravel.reduce((sum, act) => sum + act.amount, 0);
  if (carKm > 50) {
    recommendations.push({
      category: "transportation",
      title: "Opt for Public Transit or Carpooling",
      content: `You logged ${carKm.toFixed(0)} km in a single-occupancy car this week. Commuting by bus or train could cut your transit carbon emissions by up to 60%.`,
      potentialSaving: Math.round(carKm * (0.18 - 0.08) * 100) / 100, // saving vs bus
    });
  }

  const flightTravel = activities.filter((act) => act.category === "transportation" && act.type === "flight");
  const flightKm = flightTravel.reduce((sum, act) => sum + act.amount, 0);
  if (flightKm > 0) {
    recommendations.push({
      category: "transportation",
      title: "Offset Your Air Travel & Choose Trains",
      content: `Flights are highly carbon-intensive. You travelled ${flightKm.toFixed(0)} km by air. Consider carbon offsets or high-speed rail options for distances under 500 km.`,
      potentialSaving: Math.round(flightKm * 0.25 * 0.2 * 100) / 100, // 20% offset/saving
    });
  }

  // 2. Analyze Food
  const beefMeals = activities.filter((act) => act.category === "food" && act.type === "beef");
  const beefCount = beefMeals.reduce((sum, act) => sum + act.amount, 0);
  if (beefCount >= 2) {
    recommendations.push({
      category: "food",
      title: "Introduce Meatless Mondays",
      content: `Beef has a massive environmental footprint (${beefCount} meals logged). Switching just two of these beef meals to delicious plant-based vegan alternatives will significantly lower your footprint.`,
      potentialSaving: Math.round(beefCount * (7.2 - 0.6) * 100) / 100, // beef vs vegan
    });
  }

  const poultryMeals = activities.filter((act) => act.category === "food" && act.type === "poultry");
  const poultryCount = poultryMeals.reduce((sum, act) => sum + act.amount, 0);
  if (poultryCount >= 3 && beefCount < 2) {
    recommendations.push({
      category: "food",
      title: "Substitute Poultry with Plant-based Meals",
      content: `You logged ${poultryCount} poultry-based meals. Substituting some of these with vegetarian alternatives lowers emissions and uses less freshwater.`,
      potentialSaving: Math.round(poultryCount * 0.5 * (2.4 - 1.2) * 100) / 100,
    });
  }

  // 3. Analyze Energy
  const electricity = activities.filter((act) => act.category === "energy" && act.type === "electricity");
  const elecKwh = electricity.reduce((sum, act) => sum + act.amount, 0);
  if (elecKwh > 30) {
    recommendations.push({
      category: "energy",
      title: "Unplug Standby Appliances",
      content: `Your electricity logs total ${elecKwh.toFixed(0)} kWh. Standby 'vampire' power can consume up to 10% of household electricity. Turn off devices at the power strip when not in use.`,
      potentialSaving: Math.round(elecKwh * 0.1 * 100) / 100,
    });
  }

  const acUsage = activities.filter((act) => act.category === "energy" && act.type === "ac");
  const acHours = acUsage.reduce((sum, act) => sum + act.amount, 0);
  if (acHours > 10) {
    recommendations.push({
      category: "energy",
      title: "Set Thermostat 1°C Higher",
      content: `You logged ${acHours.toFixed(0)} hours of A/C. Raising your thermostat by 1°C (or 2°F) reduces cooling costs and A/C emissions by roughly 7%.`,
      potentialSaving: Math.round(acHours * 0.8 * 0.07 * 100) / 100,
    });
  }

  // 4. Analyze Waste
  const wasteLogs = activities.filter((act) => act.category === "waste");
  const recyclingAmt = wasteLogs.filter((act) => act.type === "recycling").reduce((sum, act) => sum + act.amount, 0);
  const generalAmt = wasteLogs.filter((act) => act.type === "general").reduce((sum, act) => sum + act.amount, 0);
  if (generalAmt > 5 && recyclingAmt === 0) {
    recommendations.push({
      category: "waste",
      title: "Start Sorting Recyclables",
      content: `You logged ${generalAmt.toFixed(1)} kg of general waste and zero recycling. Sorting plastic, paper, and glass saves resources and prevents landfill methane emissions.`,
      potentialSaving: Math.round(generalAmt * 0.5 * (1.0 - (-0.5)) * 100) / 100,
    });
  }

  const compostAmt = wasteLogs.filter((act) => act.type === "composting").reduce((sum, act) => sum + act.amount, 0);
  if (generalAmt > 5 && compostAmt === 0) {
    recommendations.push({
      category: "waste",
      title: "Compost Organic Food Waste",
      content: `Food scraps rotting in landfills create methane, a potent greenhouse gas. Composting your organic waste saves landfill space and generates rich soil.`,
      potentialSaving: Math.round(generalAmt * 0.3 * (1.0 - (-0.2)) * 100) / 100,
    });
  }

  // Base/fallback recommendations if logs are empty or low
  if (recommendations.length < 3) {
    if (!recommendations.some((r) => r.category === "transportation")) {
      recommendations.push({
        category: "transportation",
        title: "Walk or Cycle for Short Trips",
        content: "For trips under 2 km, walking or cycling produces zero emissions, improves physical fitness, and helps build sustainable local habits.",
        potentialSaving: 2.5,
      });
    }
    if (!recommendations.some((r) => r.category === "food")) {
      recommendations.push({
        category: "food",
        title: "Choose Seasonal and Local Produce",
        content: "Local, seasonal food reduces transportation distance (food miles) and packaging, reducing the lifecycle footprint of your meals.",
        potentialSaving: 4.2,
      });
    }
    if (!recommendations.some((r) => r.category === "energy")) {
      recommendations.push({
        category: "energy",
        title: "Switch to Energy-Efficient LED Bulbs",
        content: "LED bulbs use up to 80% less energy than traditional incandescent bulbs and last 25 times longer, saving both carbon and utility costs.",
        potentialSaving: 5.0,
      });
    }
    if (!recommendations.some((r) => r.category === "waste")) {
      recommendations.push({
        category: "waste",
        title: "Ditch Single-Use Plastics",
        content: "Carry a reusable water bottle and canvas shopping bags. Reducing plastic production is key to reducing petroleum drilling emissions.",
        potentialSaving: 1.5,
      });
    }
  }

  return recommendations.slice(0, 4); // Limit to 4 tailored tips
}
