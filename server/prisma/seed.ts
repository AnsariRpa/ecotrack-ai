import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing database...");
  await prisma.activity.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.recommendation.deleteMany({});
  await prisma.educationHubFact.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding data...");

  // Create default user
  const user = await prisma.user.create({
    data: {
      email: "eco@example.com",
      name: "Jane Doe",
    },
  });

  console.log(`Created user: ${user.name}`);

  // Create education hub facts
  const facts = [
    {
      category: "transportation",
      title: "Active Travel Benefits",
      content: "Choosing to walk or cycle for short journeys instead of driving reduces emissions to zero, cuts local air pollution, and yields immense cardiovascular health benefits.",
      source: "World Health Organization (WHO)",
    },
    {
      category: "transportation",
      title: "Aviation Footprint",
      content: "A single long-haul round-trip flight can emit more CO2 than an average person in many developing countries produces in an entire year. Train travel reduces emissions by up to 85% compared to flying.",
      source: "Our World in Data",
    },
    {
      category: "food",
      title: "Impact of Animal Agriculture",
      content: "Beef production emits about 60kg of greenhouse gases per kg of meat—more than double that of lamb and over 10 times that of poultry. Plant-based proteins like lentils and tofu emit under 2kg per kg.",
      source: "Science Journal",
    },
    {
      category: "food",
      title: "Food Waste Methane Emissions",
      content: "If food waste were a country, it would be the third-largest emitter of greenhouse gases globally, behind only the US and China. Food rotting in landfills creates high levels of methane.",
      source: "UN Environment Programme (UNEP)",
    },
    {
      category: "energy",
      title: "Vampire Power Consumption",
      content: "Vampire energy—electricity consumed by appliances in standby mode—accounts for about 5% to 10% of residential electricity use in an average home, costing up to $100 annually.",
      source: "US Department of Energy",
    },
    {
      category: "energy",
      title: "The Power of Thermostat Settings",
      content: "Adjusting your thermostat just 1°C lower in winter or 1°C higher in summer can reduce the energy consumption of your heating or cooling system by 7% to 10%.",
      source: "International Energy Agency (IEA)",
    },
    {
      category: "waste",
      title: "Plastic Lifetime in Landfills",
      content: "A single-use plastic water bottle takes up to 450 years to decompose in a landfill. During this time, it fragments into microplastics, absorbing toxins and contaminating ecosystems.",
      source: "National Oceanic and NOAA",
    },
    {
      category: "waste",
      title: "Composting Carbon Capture",
      content: "Composting organic waste diverts material from landfills and creates a carbon-rich soil amendment. When applied to land, compost enhances soil water retention and aids long-term carbon sequestration.",
      source: "US Environmental Protection Agency (EPA)",
    },
  ];

  for (const fact of facts) {
    await prisma.educationHubFact.create({ data: fact });
  }
  console.log("Seeded educational facts.");

  // Create goals
  const goals = [
    {
      userId: user.id,
      title: "Reduce Car Travel",
      description: "Commute by train, bus, or bicycle to keep car travel under 50 km per week.",
      category: "transportation",
      targetValue: 50,
      currentValue: 35,
      unit: "km",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isCompleted: false,
    },
    {
      userId: user.id,
      title: "Plant-Based Transition",
      description: "Log at least 15 vegan or vegetarian meals this month.",
      category: "food",
      targetValue: 15,
      currentValue: 12,
      unit: "meals",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      isCompleted: false,
    },
    {
      userId: user.id,
      title: "Power Down",
      description: "Limit electricity consumption to under 150 kWh this month.",
      category: "energy",
      targetValue: 150,
      currentValue: 110,
      unit: "kWh",
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      isCompleted: false,
    },
    {
      userId: user.id,
      title: "Waste Reduction Warrior",
      description: "Increase sorted recycling to 15 kg this month.",
      category: "waste",
      targetValue: 15,
      currentValue: 15,
      unit: "kg",
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // completed 2 days ago
      isCompleted: true,
    },
  ];

  for (const goal of goals) {
    await prisma.goal.create({ data: goal });
  }
  console.log("Seeded goals.");

  // Seed achievements
  const achievements = [
    {
      userId: user.id,
      badgeCode: "GREEN_COMMUTER",
      name: "Green Commuter",
      description: "Logged a walking, cycling, or train activity for 5 consecutive days.",
      icon: "🚲",
    },
    {
      userId: user.id,
      badgeCode: "PLANT_PIONEER",
      name: "Plant-Based Pioneer",
      description: "Logged 10 vegan or vegetarian meals.",
      icon: "🌿",
    },
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach });
  }
  console.log("Seeded achievements.");

  // Generate activities for the past 30 days
  console.log("Seeding 30 days of activities...");
  const now = new Date();
  const activityData: any[] = [];

  for (let i = 29; i >= 0; i--) {
    const currentDate = new Date(now);
    currentDate.setDate(now.getDate() - i);

    // Everyday energy usage
    activityData.push({
      userId: user.id,
      category: "energy",
      type: "electricity",
      amount: 8 + Math.random() * 6, // 8-14 kWh
      unit: "kWh",
      carbonTons: 0,
      date: new Date(currentDate),
    });

    activityData.push({
      userId: user.id,
      category: "energy",
      type: "ac",
      amount: Math.random() > 0.4 ? 2 + Math.random() * 3 : 0, // 2-5 hours or 0
      unit: "hours",
      carbonTons: 0,
      date: new Date(currentDate),
    });

    // Everyday food
    const mealTypes = ["vegan", "vegetarian", "poultry", "beef", "seafood"];
    const lunch = mealTypes[Math.floor(Math.random() * mealTypes.length)];
    const dinner = mealTypes[Math.floor(Math.random() * mealTypes.length)];

    activityData.push({
      userId: user.id,
      category: "food",
      type: lunch,
      amount: 1,
      unit: "meals",
      carbonTons: 0,
      date: new Date(currentDate),
    });

    activityData.push({
      userId: user.id,
      category: "food",
      type: dinner,
      amount: 1,
      unit: "meals",
      carbonTons: 0,
      date: new Date(currentDate),
    });

    // Transportation - commute on weekdays
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (Math.random() > 0.3) {
        const isTrain = Math.random() > 0.5;
        activityData.push({
          userId: user.id,
          category: "transportation",
          type: isTrain ? "train" : "bus",
          amount: 25,
          unit: "km",
          carbonTons: 0,
          date: new Date(currentDate),
        });
      } else {
        activityData.push({
          userId: user.id,
          category: "transportation",
          type: "car",
          amount: 20,
          unit: "km",
          carbonTons: 0,
          date: new Date(currentDate),
        });
      }
    } else {
      activityData.push({
        userId: user.id,
        category: "transportation",
        type: Math.random() > 0.5 ? "bike" : "walking",
        amount: 5 + Math.random() * 10,
        unit: "km",
        carbonTons: 0,
        date: new Date(currentDate),
      });
    }

    // Waste - logged twice a week
    if (dayOfWeek === 2 || dayOfWeek === 5) {
      activityData.push({
        userId: user.id,
        category: "waste",
        type: "general",
        amount: 2 + Math.random() * 3, // 2-5 kg
        unit: "kg",
        carbonTons: 0,
        date: new Date(currentDate),
      });
      activityData.push({
        userId: user.id,
        category: "waste",
        type: "recycling",
        amount: 1 + Math.random() * 2, // 1-3 kg
        unit: "kg",
        carbonTons: 0,
        date: new Date(currentDate),
      });
      if (Math.random() > 0.5) {
        activityData.push({
          userId: user.id,
          category: "waste",
          type: "composting",
          amount: 1 + Math.random(),
          unit: "kg",
          carbonTons: 0,
          date: new Date(currentDate),
        });
      }
    }
  }

  // Calculate carbon emissions based on configurable factors
  const factors: Record<string, Record<string, number>> = {
    transportation: { car: 0.18, bike: 0, bus: 0.08, train: 0.04, flight: 0.25, walking: 0 },
    food: { vegetarian: 1.2, vegan: 0.6, poultry: 2.4, beef: 7.2, seafood: 3.1 },
    energy: { electricity: 0.45, ac: 0.8, appliance: 0.2 },
    waste: { recycling: -0.5, general: 1.0, composting: -0.2 },
  };

  for (const act of activityData) {
    const categoryFactors = factors[act.category];
    const factor = categoryFactors ? categoryFactors[act.type] || 0 : 0;
    act.carbonTons = Math.round(act.amount * factor * 100) / 100;

    await prisma.activity.create({ data: act });
  }

  console.log(`Successfully seeded database with ${activityData.length} activities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
