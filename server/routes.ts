import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { insertWorkoutSchema, insertExerciseSchema, insertFoodLogSchema, insertWorkoutExerciseSchema, updateUserSchema } from "@shared/schema";
import { storage } from "./storage";
import { analyzeNutrition } from "./gemini";
import { calculateCalories } from "./calories";
import { generateWorkoutPlan, saveGeneratedWorkout } from "./workout-generator";

export async function registerRoutes(app: Express): Promise<Server> {
    setupAuth(app);

    // ── Exercises ──
    app.get("/api/exercises", async (_req, res) => {
        const exercises = await storage.getExercises();
        res.json(exercises);
    });

    app.post("/api/exercises", async (req, res) => {
        const parsed = insertExerciseSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }
        const exercise = await storage.createExercise(parsed.data);
        res.json(exercise);
    });

    // ── Workouts ──
    app.get("/api/workouts", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const workouts = await storage.getWorkouts(req.user!.id);
        res.json(workouts);
    });

    app.get("/api/workouts/:id", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const workout = await storage.getWorkout(Number(req.params.id));
        if (!workout || workout.userId !== req.user!.id) {
            return res.sendStatus(404);
        }
        const exercises = await storage.getWorkoutExercises(workout.id);
        res.json({ ...workout, exercises });
    });

    app.post("/api/workouts", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);

        const parsed = insertWorkoutSchema.safeParse({
            ...req.body,
            userId: req.user!.id,
        });

        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }

        const workout = await storage.createWorkout(parsed.data);
        res.status(201).json(workout);
    });

    app.delete("/api/workouts/:id", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const workout = await storage.getWorkout(Number(req.params.id));
        if (!workout || workout.userId !== req.user!.id) return res.sendStatus(404);
        await storage.deleteWorkout(workout.id);
        res.sendStatus(204);
    });

    // ── Workout Exercises ──
    app.get("/api/workouts/:workoutId/exercises", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const workout = await storage.getWorkout(Number(req.params.workoutId));
        if (!workout || workout.userId !== req.user!.id) return res.sendStatus(404);
        const exercises = await storage.getWorkoutExercises(workout.id);
        res.json(exercises);
    });

    app.post("/api/workouts/:workoutId/exercises", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const workout = await storage.getWorkout(Number(req.params.workoutId));
        if (!workout || workout.userId !== req.user!.id) return res.sendStatus(404);

        const parsed = insertWorkoutExerciseSchema.safeParse({
            ...req.body,
            workoutId: workout.id,
        });

        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }

        const entry = await storage.createWorkoutExercise(parsed.data);
        res.status(201).json(entry);
    });

    app.patch("/api/workouts/exercises/:id", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const entry = await storage.updateWorkoutExercise(Number(req.params.id), req.body);
        if (!entry) return res.sendStatus(404);
        res.json(entry);
    });

    app.delete("/api/workouts/exercises/:id", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        await storage.deleteWorkoutExercise(Number(req.params.id));
        res.sendStatus(204);
    });

    // ── AI Workout Generator ──
    app.get("/api/workouts/generate/options", (_req, res) => {
        res.json({
            splits: ["Push", "Pull", "Upper", "Lower", "Full Body"],
            muscleGroups: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"],
            timeOptions: [
                { minutes: 15, label: "Quick (15 min)" },
                { minutes: 30, label: "Standard (30 min)" },
                { minutes: 45, label: "Extended (45 min)" },
                { minutes: 60, label: "Full (60 min)" },
            ],
        });
    });

    app.post("/api/workouts/generate", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);

        const { muscleGroup, timeMinutes } = req.body;

        if (!muscleGroup || !timeMinutes) {
            return res.status(400).json({ message: "muscleGroup and timeMinutes are required" });
        }

        if (timeMinutes < 10 || timeMinutes > 120) {
            return res.status(400).json({ message: "timeMinutes must be between 10 and 120" });
        }

        try {
            const plan = generateWorkoutPlan(muscleGroup, timeMinutes);
            const result = await saveGeneratedWorkout(req.user!.id, plan);
            res.status(201).json({ ...plan, ...result });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    // ── Nutrition ──
    app.get("/api/nutrition", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const date = req.query.date as string | undefined;
        const logs = await storage.getFoodLogs(req.user!.id, date);
        res.json(logs);
    });

    app.post("/api/nutrition", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);

        const parsed = insertFoodLogSchema.safeParse({
            ...req.body,
            userId: req.user!.id,
        });

        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }

        const log = await storage.createFoodLog(parsed.data);
        res.status(201).json(log);
    });

    app.post("/api/nutrition/analyze", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);

        try {
            const { text } = req.body;
            if (!text) {
                return res.status(400).json({ message: "Text description is required" });
            }

            const analysis = await analyzeNutrition(text);
            res.json(analysis);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    });

    // ── User Profile ──
    app.get("/api/user/profile", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const user = await storage.getUser(req.user!.id);
        res.json(user);
    });

    app.patch("/api/user/profile", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);

        const parsed = updateUserSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json(parsed.error);
        }

        const user = await storage.updateUser(req.user!.id, parsed.data);
        if (!user) return res.sendStatus(404);

        // Auto-calculate calorie/protein/carbs/fat targets if body stats provided
        if (user.weight && user.height && user.age && user.gender && user.activityLevel) {
            const targets = calculateCalories(
                Number(user.weight),
                Number(user.height),
                user.age,
                user.gender,
                user.activityLevel,
            );
            await storage.updateUser(user.id, {
                calorieTarget: targets.calorieTarget,
                proteinTarget: targets.proteinTarget,
                carbsTarget: targets.carbsTarget,
                fatTarget: targets.fatTarget,
            });
            const updated = await storage.getUser(user.id);
            return res.json(updated);
        }

        res.json(user);
    });

    // ── Dashboard Stats ──
    app.get("/api/dashboard/stats", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const userId = req.user!.id;

        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekStartStr = weekStart.toISOString();

        const todayStr = new Date().toISOString().split("T")[0];

        const [workoutsThisWeek, caloriesToday, streak, totalWorkouts, totalMeals, exerciseLogCount] = await Promise.all([
            storage.getWorkoutCountSince(userId, weekStartStr),
            storage.getTotalCaloriesSince(userId, todayStr),
            storage.getStreak(userId),
            storage.getTotalWorkouts(userId),
            storage.getTotalMeals(userId),
            storage.getExerciseLogCount(userId),
        ]);

        res.json({
            workoutsThisWeek,
            caloriesToday,
            streak,
            totalWorkouts,
            totalMeals,
            exerciseLogCount,
        });
    });

    const httpServer = createServer(app);

    return httpServer;
}
