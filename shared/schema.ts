import { pgTable, text, serial, integer, numeric, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    weight: numeric("weight", { precision: 5, scale: 1 }),
    height: numeric("height", { precision: 5, scale: 1 }),
    age: integer("age"),
    gender: text("gender"),
    activityLevel: text("activity_level"),
    calorieTarget: integer("calorie_target"),
    proteinTarget: integer("protein_target"),
    carbsTarget: integer("carbs_target"),
    fatTarget: integer("fat_target"),
});

export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});

export const updateUserSchema = createInsertSchema(users)
    .pick({
        weight: true,
        height: true,
        age: true,
        gender: true,
        activityLevel: true,
        calorieTarget: true,
        proteinTarget: true,
        carbsTarget: true,
        fatTarget: true,
    })
    .partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

export const exercises = pgTable("exercises", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    muscleGroup: text("muscle_group").notNull(),
    description: text("description"),
});

export const workouts = pgTable("workouts", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    date: text("date").notNull(), // ISO date string
    name: text("name"),
});

export const workoutExercises = pgTable("workout_exercises", {
    id: serial("id").primaryKey(),
    workoutId: integer("workout_id").notNull().references(() => workouts.id),
    exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
    sets: integer("sets").notNull(),
    reps: integer("reps").notNull(),
    weight: numeric("weight", { precision: 6, scale: 1 }),
    restTime: integer("rest_time"),
    rpe: numeric("rpe", { precision: 3, scale: 1 }),
    notes: text("notes"),
});

export const foodLogs = pgTable("food_logs", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    date: text("date").notNull(),
    mealType: text("meal_type").notNull(),
    foodName: text("food_name").notNull(),
    calories: numeric("calories", { precision: 6, scale: 1 }).notNull(),
    protein: numeric("protein", { precision: 5, scale: 1 }).notNull(),
    carbs: numeric("carbs", { precision: 5, scale: 1 }).notNull(),
    fat: numeric("fat", { precision: 5, scale: 1 }).notNull(),
    portionWeight: numeric("portion_weight", { precision: 6, scale: 1 }),
});

export const insertExerciseSchema = createInsertSchema(exercises);
export const insertWorkoutSchema = createInsertSchema(workouts);
export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises);
export const insertFoodLogSchema = createInsertSchema(foodLogs);

export type Exercise = typeof exercises.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type FoodLog = typeof foodLogs.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;
