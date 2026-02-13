import { users, type User, type InsertUser, exercises, type Exercise, type InsertExercise, workouts, type Workout, type InsertWorkout, foodLogs, type FoodLog, type InsertFoodLog } from "@shared/schema";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

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

export const storage = new DatabaseStorage();
