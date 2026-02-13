import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { insertWorkoutSchema, insertExerciseSchema, insertFoodLogSchema } from "@shared/schema";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
    setupAuth(app);

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

    app.get("/api/workouts", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const workouts = await storage.getWorkouts(req.user!.id);
        res.json(workouts);
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
        res.json(workout);
    });

    app.get("/api/nutrition", async (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        const logs = await storage.getFoodLogs(req.user!.id);
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
        res.json(log);
    });

    const httpServer = createServer(app);

    return httpServer;
}
