const ACTIVITY_FACTORS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
} as const;

type ActivityLevel = keyof typeof ACTIVITY_FACTORS;

export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: string): number {
    let bmr: number;
    if (gender === "male") {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    }
    // Indian population adjustment: Mifflin-St Jeor overestimates by ~5% for Asian/Indian populations
    bmr = bmr * 0.95;
    return Math.round(bmr);
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    return Math.round(bmr * ACTIVITY_FACTORS[activityLevel]);
}

export function calculateCalories(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: string,
    activityLevel: string,
) {
    const level = activityLevel as ActivityLevel;
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, level);

    return {
        bmr,
        tdee,
        calorieTarget: tdee,
        proteinTarget: Math.round(weightKg * 1.6),
        carbsTarget: Math.round((tdee * 0.5) / 4),
        fatTarget: Math.round((tdee * 0.25) / 9),
    };
}
