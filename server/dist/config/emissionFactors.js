export const EMISSION_FACTORS = {
    transportation: {
        car: { kgCO2PerUnit: 0.18, unit: "km" },
        bike: { kgCO2PerUnit: 0.0, unit: "km" },
        bus: { kgCO2PerUnit: 0.08, unit: "km" },
        train: { kgCO2PerUnit: 0.04, unit: "km" },
        flight: { kgCO2PerUnit: 0.25, unit: "km" },
        walking: { kgCO2PerUnit: 0.0, unit: "km" },
    },
    food: {
        vegetarian: { kgCO2PerUnit: 1.2, unit: "meals" },
        vegan: { kgCO2PerUnit: 0.6, unit: "meals" },
        poultry: { kgCO2PerUnit: 2.4, unit: "meals" },
        beef: { kgCO2PerUnit: 7.2, unit: "meals" },
        seafood: { kgCO2PerUnit: 3.1, unit: "meals" },
    },
    energy: {
        electricity: { kgCO2PerUnit: 0.45, unit: "kWh" },
        ac: { kgCO2PerUnit: 0.8, unit: "hours" },
        appliance: { kgCO2PerUnit: 0.2, unit: "hours" },
    },
    waste: {
        recycling: { kgCO2PerUnit: -0.5, unit: "kg" },
        general: { kgCO2PerUnit: 1.0, unit: "kg" },
        composting: { kgCO2PerUnit: -0.2, unit: "kg" },
    },
};
