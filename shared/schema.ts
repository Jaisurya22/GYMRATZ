import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
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
    weight: integer("weight"),
});

export const foodLogs = pgTable("food_logs", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    date: text("date").notNull(),
    mealType: text("meal_type").notNull(),
    foodName: text("food_name").notNull(),
    calories: integer("calories").notNull(),
    protein: integer("protein").notNull(),
    carbs: integer("carbs").notNull(),
    fat: integer("fat").notNull(),
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
