import { storage } from "./storage";

type ExerciseTemplate = {
  name: string;
  muscleGroup: string;
  sets: number;
  repsRange: [number, number];
  restTime: number;
  rpe: number;
  isCompound: boolean;
};

const SPLITS: Record<string, string[]> = {
  "Push": ["Chest", "Shoulders", "Arms"],
  "Pull": ["Back", "Arms"],
  "Upper": ["Chest", "Back", "Shoulders", "Arms"],
  "Lower": ["Legs", "Core"],
  "Full Body": ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"],
};

const EXERCISE_TEMPLATES: Record<string, ExerciseTemplate[]> = {
  "Chest": [
    { name: "Barbell Bench Press", muscleGroup: "Chest", sets: 4, repsRange: [6, 10], restTime: 90, rpe: 8, isCompound: true },
    { name: "Incline Dumbbell Press", muscleGroup: "Chest", sets: 3, repsRange: [8, 12], restTime: 75, rpe: 8, isCompound: true },
    { name: "Dumbbell Flyes", muscleGroup: "Chest", sets: 3, repsRange: [10, 15], restTime: 60, rpe: 8, isCompound: false },
    { name: "Push Ups", muscleGroup: "Chest", sets: 3, repsRange: [12, 20], restTime: 45, rpe: 7, isCompound: true },
  ],
  "Back": [
    { name: "Deadlift", muscleGroup: "Back", sets: 3, repsRange: [4, 6], restTime: 180, rpe: 9, isCompound: true },
    { name: "Barbell Row", muscleGroup: "Back", sets: 4, repsRange: [6, 10], restTime: 90, rpe: 8, isCompound: true },
    { name: "Pull Ups", muscleGroup: "Back", sets: 3, repsRange: [6, 12], restTime: 90, rpe: 8, isCompound: true },
    { name: "Lat Pulldown", muscleGroup: "Back", sets: 3, repsRange: [8, 12], restTime: 75, rpe: 8, isCompound: false },
    { name: "Seated Cable Row", muscleGroup: "Back", sets: 3, repsRange: [8, 12], restTime: 75, rpe: 8, isCompound: false },
  ],
  "Legs": [
    { name: "Barbell Squat", muscleGroup: "Legs", sets: 4, repsRange: [5, 8], restTime: 120, rpe: 9, isCompound: true },
    { name: "Romanian Deadlift", muscleGroup: "Legs", sets: 3, repsRange: [6, 10], restTime: 90, rpe: 8, isCompound: true },
    { name: "Leg Press", muscleGroup: "Legs", sets: 3, repsRange: [8, 12], restTime: 90, rpe: 8, isCompound: false },
    { name: "Leg Extension", muscleGroup: "Legs", sets: 3, repsRange: [10, 15], restTime: 60, rpe: 8, isCompound: false },
    { name: "Leg Curl", muscleGroup: "Legs", sets: 3, repsRange: [10, 15], restTime: 60, rpe: 8, isCompound: false },
    { name: "Calf Raises", muscleGroup: "Legs", sets: 4, repsRange: [12, 20], restTime: 45, rpe: 7, isCompound: false },
  ],
  "Shoulders": [
    { name: "Overhead Press", muscleGroup: "Shoulders", sets: 4, repsRange: [6, 10], restTime: 90, rpe: 8, isCompound: true },
    { name: "Lateral Raise", muscleGroup: "Shoulders", sets: 3, repsRange: [10, 15], restTime: 45, rpe: 8, isCompound: false },
    { name: "Front Raise", muscleGroup: "Shoulders", sets: 3, repsRange: [10, 15], restTime: 45, rpe: 7, isCompound: false },
    { name: "Face Pull", muscleGroup: "Shoulders", sets: 3, repsRange: [12, 18], restTime: 45, rpe: 7, isCompound: false },
  ],
  "Arms": [
    { name: "Barbell Curl", muscleGroup: "Arms", sets: 3, repsRange: [8, 12], restTime: 60, rpe: 8, isCompound: false },
    { name: "Hammer Curl", muscleGroup: "Arms", sets: 3, repsRange: [8, 12], restTime: 60, rpe: 8, isCompound: false },
    { name: "Tricep Pushdown", muscleGroup: "Arms", sets: 3, repsRange: [8, 12], restTime: 60, rpe: 8, isCompound: false },
    { name: "Skull Crushers", muscleGroup: "Arms", sets: 3, repsRange: [8, 12], restTime: 60, rpe: 8, isCompound: false },
  ],
  "Core": [
    { name: "Plank", muscleGroup: "Core", sets: 3, repsRange: [30, 60], restTime: 30, rpe: 7, isCompound: false },
    { name: "Hanging Leg Raise", muscleGroup: "Core", sets: 3, repsRange: [10, 15], restTime: 45, rpe: 8, isCompound: false },
    { name: "Crunches", muscleGroup: "Core", sets: 3, repsRange: [15, 25], restTime: 30, rpe: 7, isCompound: false },
    { name: "Russian Twist", muscleGroup: "Core", sets: 3, repsRange: [12, 20], restTime: 30, rpe: 7, isCompound: false },
  ],
};

function getTimeMultiplier(minutes: number): { setsMultiplier: number; maxExercises: number } {
  if (minutes <= 15) return { setsMultiplier: 0.5, maxExercises: 3 };
  if (minutes <= 30) return { setsMultiplier: 0.75, maxExercises: 4 };
  if (minutes <= 45) return { setsMultiplier: 1, maxExercises: 5 };
  return { setsMultiplier: 1.25, maxExercises: 7 };
}

function pickExercises(
  templates: ExerciseTemplate[],
  count: number,
): ExerciseTemplate[] {
  const compounds = templates.filter((t) => t.isCompound);
  const isolations = templates.filter((t) => !t.isCompound);
  const result: ExerciseTemplate[] = [];

  const compoundCount = Math.min(Math.ceil(count * 0.5), compounds.length);
  const shuffledCompounds = [...compounds].sort(() => Math.random() - 0.5);
  for (let i = 0; i < compoundCount; i++) {
    result.push(shuffledCompounds[i]);
  }

  const remaining = count - result.length;
  const shuffledIsos = [...isolations].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(remaining, shuffledIsos.length); i++) {
    result.push(shuffledIsos[i]);
  }

  return result;
}

function getRepsFromRange(range: [number, number]): number {
  if (range[0] >= 30) return range[0];
  return Math.floor((range[0] + range[1]) / 2);
}

export type GeneratedWorkout = {
  name: string;
  date: string;
  exercises: {
    exerciseName: string;
    sets: number;
    reps: number;
    weight: number | null;
    restTime: number;
    rpe: number;
  }[];
  totalVolume: number;
  estimatedMinutes: number;
};

export function generateWorkoutPlan(
  muscleGroup: string,
  timeMinutes: number,
): GeneratedWorkout {
  const targetGroups = SPLITS[muscleGroup] ?? [muscleGroup];
  const { setsMultiplier, maxExercises } = getTimeMultiplier(timeMinutes);

  let allTemplates: ExerciseTemplate[] = [];
  for (const group of targetGroups) {
    const templates = EXERCISE_TEMPLATES[group];
    if (templates) {
      allTemplates = allTemplates.concat(templates);
    }
  }

  if (allTemplates.length === 0) {
    allTemplates = EXERCISE_TEMPLATES["Chest"] ?? [];
  }

  const exercisesPerGroup = Math.ceil(maxExercises / targetGroups.length);
  let selected: ExerciseTemplate[] = [];

  for (const group of targetGroups) {
    const groupTemplates = allTemplates.filter((t) => t.muscleGroup === group);
    if (groupTemplates.length > 0) {
      const picked = pickExercises(groupTemplates, exercisesPerGroup);
      selected = selected.concat(picked);
    }
  }

  selected = selected.slice(0, maxExercises);

  const exercises = selected.map((template) => {
    const adjustedSets = Math.max(1, Math.round(template.sets * setsMultiplier));
    return {
      exerciseName: template.name,
      sets: adjustedSets,
      reps: getRepsFromRange(template.repsRange),
      weight: null,
      restTime: template.restTime,
      rpe: template.rpe,
    };
  });

  const totalVolume = exercises.reduce((sum, e) => sum + e.sets * e.reps, 0);

  return {
    name: `${muscleGroup} - ${timeMinutes}min`,
    date: new Date().toISOString(),
    exercises,
    totalVolume,
    estimatedMinutes: timeMinutes,
  };
}

export async function saveGeneratedWorkout(
  userId: number,
  plan: GeneratedWorkout,
): Promise<{ workoutId: number; exerciseCount: number }> {
  const workout = await storage.createWorkout({
    userId,
    date: plan.date,
    name: plan.name,
  });

  let exerciseCount = 0;
  for (const ex of plan.exercises) {
    const allExercises = await storage.getExercises();
    const match = allExercises.find(
      (e) => e.name.toLowerCase() === ex.exerciseName.toLowerCase(),
    );
    if (match) {
      await storage.createWorkoutExercise({
        workoutId: workout.id,
        exerciseId: match.id,
        sets: ex.sets,
        reps: ex.reps,
        weight: null,
        restTime: ex.restTime,
        rpe: String(ex.rpe),
        notes: null,
      });
      exerciseCount++;
    }
  }

  return { workoutId: workout.id, exerciseCount };
}
