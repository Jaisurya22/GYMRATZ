import { users, type User, type InsertUser, type UpdateUser, exercises, type Exercise, type InsertExercise, workouts, type Workout, type InsertWorkout, workoutExercises, type WorkoutExercise, type InsertWorkoutExercise, foodLogs, type FoodLog, type InsertFoodLog } from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";

const PostgresSessionStore = connectPg(session);
const MemorySessionStore = MemoryStore(session);

export interface IStorage {
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    updateUser(id: number, data: UpdateUser): Promise<User | undefined>;
    sessionStore: session.Store;

    // Exercises
    getExercises(): Promise<Exercise[]>;
    createExercise(exercise: InsertExercise): Promise<Exercise>;

    // Workouts
    createWorkout(workout: InsertWorkout): Promise<Workout>;
    getWorkouts(userId: number): Promise<Workout[]>;
    deleteWorkout(id: number): Promise<void>;
    getWorkout(id: number): Promise<Workout | undefined>;

    // Workout Exercises
    getWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]>;
    createWorkoutExercise(data: InsertWorkoutExercise): Promise<WorkoutExercise>;
    updateWorkoutExercise(id: number, data: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined>;
    deleteWorkoutExercise(id: number): Promise<void>;

    // Nutrition
    getFoodLogs(userId: number, date?: string): Promise<FoodLog[]>;
    createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog>;

    // Dashboard
    getWorkoutCountSince(userId: number, sinceDate: string): Promise<number>;
    getTotalCaloriesSince(userId: number, sinceDate: string): Promise<number>;
    getStreak(userId: number): Promise<number>;
    getTotalWorkouts(userId: number): Promise<number>;
    getTotalMeals(userId: number): Promise<number>;
    getExerciseLogCount(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private exercises: Map<number, Exercise>;
    private workouts: Map<number, Workout>;
    private workoutExercises: Map<number, WorkoutExercise>;
    private foodLogs: Map<number, FoodLog>;
    sessionStore: session.Store;
    currentId: { [key: string]: number };

    constructor() {
        this.users = new Map();
        this.exercises = new Map();
        this.workouts = new Map();
        this.workoutExercises = new Map();
        this.foodLogs = new Map();
        this.currentId = { users: 1, exercises: 1, workouts: 1, workoutExercises: 1, foodLogs: 1 };
        this.sessionStore = new MemorySessionStore({
            checkPeriod: 86400000,
        });
    }

    async getUser(id: number): Promise<User | undefined> {
        return this.users.get(id);
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        return Array.from(this.users.values()).find(
            (user) => user.username === username,
        );
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const id = this.currentId.users++;
        const user: User = {
            ...insertUser,
            id,
            weight: null,
            height: null,
            age: null,
            gender: null,
            activityLevel: null,
            calorieTarget: null,
            proteinTarget: null,
            carbsTarget: null,
            fatTarget: null,
        };
        this.users.set(id, user);
        return user;
    }

    async updateUser(id: number, data: UpdateUser): Promise<User | undefined> {
        const existing = this.users.get(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...data };
        this.users.set(id, updated);
        return updated;
    }

    async getExercises(): Promise<Exercise[]> {
        return Array.from(this.exercises.values());
    }

    async createExercise(exercise: InsertExercise): Promise<Exercise> {
        const id = this.currentId.exercises++;
        const newExercise: Exercise = {
            ...exercise,
            id,
            description: exercise.description ?? null
        };
        this.exercises.set(id, newExercise);
        return newExercise;
    }

    async createWorkout(workout: InsertWorkout): Promise<Workout> {
        const id = this.currentId.workouts++;
        const newWorkout: Workout = {
            ...workout,
            id,
            name: workout.name ?? null
        };
        this.workouts.set(id, newWorkout);
        return newWorkout;
    }

    async getWorkout(id: number): Promise<Workout | undefined> {
        return this.workouts.get(id);
    }

    async deleteWorkout(id: number): Promise<void> {
        this.workouts.delete(id);
        Array.from(this.workoutExercises.values())
            .filter((we) => we.workoutId === id)
            .forEach((we) => this.workoutExercises.delete(we.id));
    }

    async getWorkouts(userId: number): Promise<Workout[]> {
        return Array.from(this.workouts.values()).filter(
            (workout) => workout.userId === userId,
        ).sort((a, b) => b.date.localeCompare(a.date));
    }

    async getWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]> {
        return Array.from(this.workoutExercises.values()).filter(
            (we) => we.workoutId === workoutId,
        );
    }

    async createWorkoutExercise(data: InsertWorkoutExercise): Promise<WorkoutExercise> {
        const id = this.currentId.workoutExercises++;
        const newEntry: WorkoutExercise = {
            ...data,
            id,
            weight: data.weight ?? null,
            restTime: data.restTime ?? null,
            rpe: data.rpe ?? null,
            notes: data.notes ?? null,
        };
        this.workoutExercises.set(id, newEntry);
        return newEntry;
    }

    async updateWorkoutExercise(id: number, data: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined> {
        const existing = this.workoutExercises.get(id);
        if (!existing) return undefined;
        const updated = { ...existing, ...data };
        this.workoutExercises.set(id, updated);
        return updated;
    }

    async deleteWorkoutExercise(id: number): Promise<void> {
        this.workoutExercises.delete(id);
    }

    async getFoodLogs(userId: number, date?: string): Promise<FoodLog[]> {
        let logs = Array.from(this.foodLogs.values()).filter(
            (log) => log.userId === userId,
        );
        if (date) {
            logs = logs.filter((log) => log.date.startsWith(date));
        }
        return logs.sort((a, b) => b.date.localeCompare(a.date));
    }

    async createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog> {
        const id = this.currentId.foodLogs++;
        const newLog: FoodLog = { ...foodLog, id, portionWeight: foodLog.portionWeight ?? null };
        this.foodLogs.set(id, newLog);
        return newLog;
    }

    async getWorkoutCountSince(userId: number, sinceDate: string): Promise<number> {
        return Array.from(this.workouts.values()).filter(
            (w) => w.userId === userId && w.date >= sinceDate,
        ).length;
    }

    async getTotalCaloriesSince(userId: number, sinceDate: string): Promise<number> {
        return Array.from(this.foodLogs.values())
            .filter((l) => l.userId === userId && l.date >= sinceDate)
            .reduce((sum, l) => sum + Number(l.calories), 0);
    }

    async getStreak(userId: number): Promise<number> {
        const logs = Array.from(this.foodLogs.values())
            .filter((l) => l.userId === userId)
            .map((l) => l.date.split("T")[0]);
        const uniqueDays = Array.from(new Set(logs)).sort().reverse();
        if (uniqueDays.length === 0) return 0;
        let streak = 1;
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;
        for (let i = 1; i < uniqueDays.length; i++) {
            const prev = new Date(uniqueDays[i - 1]);
            const curr = new Date(uniqueDays[i]);
            const diff = (prev.getTime() - curr.getTime()) / 86400000;
            if (Math.abs(diff - 1) < 0.1) streak++;
            else break;
        }
        return streak;
    }

    async getTotalWorkouts(userId: number): Promise<number> {
        return Array.from(this.workouts.values()).filter((w) => w.userId === userId).length;
    }

    async getTotalMeals(userId: number): Promise<number> {
        return Array.from(this.foodLogs.values()).filter((l) => l.userId === userId).length;
    }

    async getExerciseLogCount(userId: number): Promise<number> {
        const userWorkoutIds = Array.from(this.workouts.values())
            .filter((w) => w.userId === userId)
            .map((w) => w.id);
        return Array.from(this.workoutExercises.values())
            .filter((we) => userWorkoutIds.includes(we.workoutId))
            .length;
    }
}

export class DatabaseStorage implements IStorage {
    sessionStore: session.Store;

    constructor() {
        this.sessionStore = new PostgresSessionStore({
            pool,
            createTableIfMissing: true,
        });
    }

    async getUser(id: number): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.username, username));
        return user;
    }

    async createUser(insertUser: InsertUser): Promise<User> {
        const [user] = await db.insert(users).values({
            ...insertUser,
            weight: null,
            height: null,
            age: null,
            gender: null,
            activityLevel: null,
            calorieTarget: null,
            proteinTarget: null,
            carbsTarget: null,
            fatTarget: null,
        }).returning();
        return user;
    }

    async updateUser(id: number, data: UpdateUser): Promise<User | undefined> {
        const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
        return user;
    }

    async getExercises(): Promise<Exercise[]> {
        return await db.select().from(exercises);
    }

    async createExercise(exercise: InsertExercise): Promise<Exercise> {
        const [newExercise] = await db.insert(exercises).values(exercise).returning();
        return newExercise;
    }

    async createWorkout(workout: InsertWorkout): Promise<Workout> {
        const [newWorkout] = await db.insert(workouts).values(workout).returning();
        return newWorkout;
    }

    async getWorkout(id: number): Promise<Workout | undefined> {
        const [workout] = await db.select().from(workouts).where(eq(workouts.id, id));
        return workout;
    }

    async deleteWorkout(id: number): Promise<void> {
        await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, id));
        await db.delete(workouts).where(eq(workouts.id, id));
    }

    async getWorkouts(userId: number): Promise<Workout[]> {
        return await db.select().from(workouts)
            .where(eq(workouts.userId, userId))
            .orderBy(sql`${workouts.date} DESC`);
    }

    async getWorkoutExercises(workoutId: number): Promise<WorkoutExercise[]> {
        return await db.select().from(workoutExercises)
            .where(eq(workoutExercises.workoutId, workoutId));
    }

    async createWorkoutExercise(data: InsertWorkoutExercise): Promise<WorkoutExercise> {
        const [entry] = await db.insert(workoutExercises).values(data).returning();
        return entry;
    }

    async updateWorkoutExercise(id: number, data: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined> {
        const [entry] = await db.update(workoutExercises).set(data)
            .where(eq(workoutExercises.id, id)).returning();
        return entry;
    }

    async deleteWorkoutExercise(id: number): Promise<void> {
        await db.delete(workoutExercises).where(eq(workoutExercises.id, id));
    }

    async getFoodLogs(userId: number, date?: string): Promise<FoodLog[]> {
        if (date) {
            return await db.select().from(foodLogs)
                .where(and(eq(foodLogs.userId, userId), sql`${foodLogs.date}::text LIKE ${date + '%'}`))
                .orderBy(sql`${foodLogs.date} DESC`);
        }
        return await db.select().from(foodLogs)
            .where(eq(foodLogs.userId, userId))
            .orderBy(sql`${foodLogs.date} DESC`);
    }

    async createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog> {
        const [newLog] = await db.insert(foodLogs).values(foodLog).returning();
        return newLog;
    }

    async getWorkoutCountSince(userId: number, sinceDate: string): Promise<number> {
        const [result] = await db.select({ count: sql<number>`count(*)` }).from(workouts)
            .where(and(eq(workouts.userId, userId), sql`${workouts.date} >= ${sinceDate}`));
        return Number(result.count);
    }

    async getTotalCaloriesSince(userId: number, sinceDate: string): Promise<number> {
        const [result] = await db.select({ total: sql<string>`COALESCE(SUM(CAST(${foodLogs.calories} AS numeric)), 0)` }).from(foodLogs)
            .where(and(eq(foodLogs.userId, userId), sql`${foodLogs.date} >= ${sinceDate}`));
        return Number(result.total);
    }

    async getStreak(userId: number): Promise<number> {
        const logs = await db.select({ date: foodLogs.date }).from(foodLogs)
            .where(eq(foodLogs.userId, userId))
            .orderBy(sql`${foodLogs.date} DESC`);
        const uniqueDays = Array.from(new Set(logs.map(l => l.date.split("T")[0])));
        if (uniqueDays.length === 0) return 0;
        let streak = 1;
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;
        for (let i = 1; i < uniqueDays.length; i++) {
            const prev = new Date(uniqueDays[i - 1]);
            const curr = new Date(uniqueDays[i]);
            const diff = (prev.getTime() - curr.getTime()) / 86400000;
            if (Math.abs(diff - 1) < 0.1) streak++;
            else break;
        }
        return streak;
    }

    async getTotalWorkouts(userId: number): Promise<number> {
        const [result] = await db.select({ count: sql<number>`count(*)` }).from(workouts)
            .where(eq(workouts.userId, userId));
        return Number(result.count);
    }

    async getTotalMeals(userId: number): Promise<number> {
        const [result] = await db.select({ count: sql<number>`count(*)` }).from(foodLogs)
            .where(eq(foodLogs.userId, userId));
        return Number(result.count);
    }

    async getExerciseLogCount(userId: number): Promise<number> {
        const [result] = await db.select({ count: sql<number>`count(*)` }).from(workoutExercises)
            .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
            .where(eq(workouts.userId, userId));
        return Number(result.count);
    }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
