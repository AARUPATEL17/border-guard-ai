import { sql } from "drizzle-orm";
import { pgTable, text, serial, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  sensorType: text("sensor_type").notNull(), // e.g., "Motion Camera", "Infrared", "Radar"
  threatLevel: text("threat_level").notNull(), // "Low", "Medium", "High"
  message: text("message").notNull(),
  objectType: text("object_type"), // "Person", "Vehicle", "Unknown"
  confidenceScore: integer("confidence_score"), // 0-100
  location: text("location"), // GPS or sector coordinates
  isAuthorized: boolean("is_authorized").default(false),
  riskScore: integer("risk_score"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const sensorStats = pgTable("sensor_stats", {
  id: serial("id").primaryKey(),
  sensorName: text("sensor_name").notNull().unique(),
  status: text("status").notNull(), // "Online", "Offline", "Maintenance"
  healthScore: integer("health_score").notNull(), // 0-100
  lastPing: timestamp("last_ping").defaultNow().notNull(),
});

export const patrolRoutes = pgTable("patrol_routes", {
  id: serial("id").primaryKey(),
  routeName: text("route_name").notNull(),
  status: text("status").default("Active"),
  lastPatrol: timestamp("last_patrol"),
});

export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  operatorId: varchar("operator_id"),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, timestamp: true });
export const insertSensorStatsSchema = createInsertSchema(sensorStats).omit({ id: true, lastPing: true });
export const insertPatrolRouteSchema = createInsertSchema(patrolRoutes).omit({ id: true });
export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({ id: true, timestamp: true });

// === EXPLICIT API CONTRACT TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type SensorStat = typeof sensorStats.$inferSelect;
export type InsertSensorStat = z.infer<typeof insertSensorStatsSchema>;

export type PatrolRoute = typeof patrolRoutes.$inferSelect;
export type InsertPatrolRoute = z.infer<typeof insertPatrolRouteSchema>;

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;

export type CreateAlertRequest = InsertAlert;
export type AlertResponse = Alert;
export type AlertsListResponse = Alert[];

// Auth specific types
export type AuthResponse = Omit<User, 'password'>;
