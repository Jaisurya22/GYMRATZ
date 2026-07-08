import { storage } from "./storage";

const EXERCISES = [
    { name: "Barbell Bench Press", muscleGroup: "Chest" },
    { name: "Dumbbell Flyes", muscleGroup: "Chest" },
    { name: "Incline Dumbbell Press", muscleGroup: "Chest" },
    { name: "Push Ups", muscleGroup: "Chest" },
    { name: "Deadlift", muscleGroup: "Back" },
    { name: "Barbell Row", muscleGroup: "Back" },
    { name: "Pull Ups", muscleGroup: "Back" },
    { name: "Lat Pulldown", muscleGroup: "Back" },
    { name: "Seated Cable Row", muscleGroup: "Back" },
    { name: "Barbell Squat", muscleGroup: "Legs" },
    { name: "Leg Press", muscleGroup: "Legs" },
    { name: "Romanian Deadlift", muscleGroup: "Legs" },
    { name: "Leg Extension", muscleGroup: "Legs" },
    { name: "Leg Curl", muscleGroup: "Legs" },
    { name: "Calf Raises", muscleGroup: "Legs" },
    { name: "Overhead Press", muscleGroup: "Shoulders" },
    { name: "Lateral Raise", muscleGroup: "Shoulders" },
    { name: "Front Raise", muscleGroup: "Shoulders" },
    { name: "Face Pull", muscleGroup: "Shoulders" },
    { name: "Barbell Curl", muscleGroup: "Arms" },
    { name: "Hammer Curl", muscleGroup: "Arms" },
    { name: "Tricep Pushdown", muscleGroup: "Arms" },
    { name: "Skull Crushers", muscleGroup: "Arms" },
    { name: "Plank", muscleGroup: "Core" },
    { name: "Crunches", muscleGroup: "Core" },
    { name: "Hanging Leg Raise", muscleGroup: "Core" },
    { name: "Russian Twist", muscleGroup: "Core" },
];

export async function seedExercises() {
    const existing = await storage.getExercises();
    if (existing.length > 0) return;
    for (const ex of EXERCISES) {
        await storage.createExercise(ex);
    }
    console.log(`Seeded ${EXERCISES.length} exercises`);
}
