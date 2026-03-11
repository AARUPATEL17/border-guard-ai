import { users, alerts, sensorStats, patrolRoutes, systemLogs, type User, type InsertUser, type Alert, type InsertAlert, type SensorStat, type InsertSensorStat, type PatrolRoute, type InsertPatrolRoute, type SystemLog, type InsertSystemLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;

  getSensorStats(): Promise<SensorStat[]>;
  updateSensorStat(stat: InsertSensorStat): Promise<SensorStat>;

  getPatrolRoutes(): Promise<PatrolRoute[]>;
  createPatrolRoute(route: InsertPatrolRoute): Promise<PatrolRoute>;
  getSystemLogs(): Promise<SystemLog[]>;
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
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

  async getAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(desc(alerts.timestamp)).limit(50);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async getSensorStats(): Promise<SensorStat[]> {
    return await db.select().from(sensorStats);
  }

  async updateSensorStat(stat: InsertSensorStat): Promise<SensorStat> {
    const [updated] = await db.insert(sensorStats)
      .values(stat)
      .onConflictDoUpdate({
        target: sensorStats.sensorName,
        set: {
          status: stat.status,
          healthScore: stat.healthScore,
          lastPing: new Date(),
        }
      })
      .returning();
    return updated;
  }

  async getPatrolRoutes(): Promise<PatrolRoute[]> {
    return await db.select().from(patrolRoutes);
  }

  async createPatrolRoute(route: InsertPatrolRoute): Promise<PatrolRoute> {
    const [newRoute] = await db.insert(patrolRoutes).values(route).returning();
    return newRoute;
  }

  async getSystemLogs(): Promise<SystemLog[]> {
    return await db.select().from(systemLogs).orderBy(desc(systemLogs.timestamp)).limit(100);
  }

  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const [newLog] = await db.insert(systemLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
