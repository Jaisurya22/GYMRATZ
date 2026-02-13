import { users, type User, type InsertUser, exercises, type Exercise, type InsertExercise, workouts, type Workout, type InsertWorkout, foodLogs, type FoodLog, type InsertFoodLog } from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";

const PostgresSessionStore = connectPg(session);
const MemorySessionStore = MemoryStore(session);

export interface IStorage {
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    sessionStore: session.Store;

    // Exercises
    getExercises(): Promise<Exercise[]>;
    createExercise(exercise: InsertExercise): Promise<Exercise>;

    // Workouts
    createWorkout(workout: InsertWorkout): Promise<Workout>;
    getWorkouts(userId: number): Promise<Workout[]>;

    // Nutrition
    getFoodLogs(userId: number): Promise<FoodLog[]>;
    createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog>;
}

export class MemStorage implements IStorage {
    private users: Map<number, User>;
    private exercises: Map<number, Exercise>;
    private workouts: Map<number, Workout>;
    private foodLogs: Map<number, FoodLog>;
    sessionStore: session.Store;
    currentId: { [key: string]: number };

    constructor() {
        this.users = new Map();
        this.exercises = new Map();
        this.workouts = new Map();
        this.foodLogs = new Map();
        this.currentId = { users: 1, exercises: 1, workouts: 1, foodLogs: 1 };
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
        const user: User = { ...insertUser, id };
        this.users.set(id, user);
        return user;
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

    async getWorkouts(userId: number): Promise<Workout[]> {
        return Array.from(this.workouts.values()).filter(
            (workout) => workout.userId === userId,
        );
    }

    async getFoodLogs(userId: number): Promise<FoodLog[]> {
        return Array.from(this.foodLogs.values()).filter(
            (log) => log.userId === userId,
        );
    }

    async createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog> {
        const id = this.currentId.foodLogs++;
        const newLog: FoodLog = { ...foodLog, id };
        this.foodLogs.set(id, newLog);
        return newLog;
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
        const [user] = await db.insert(users).values(insertUser).returning();
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

    async getWorkouts(userId: number): Promise<Workout[]> {
        return await db.select().from(workouts).where(eq(workouts.userId, userId));
    }

    async getFoodLogs(userId: number): Promise<FoodLog[]> {
        return await db.select().from(foodLogs).where(eq(foodLogs.userId, userId));
    }

    async createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog> {
        const [newLog] = await db.insert(foodLogs).values(foodLog).returning();
        return newLog;
    }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
