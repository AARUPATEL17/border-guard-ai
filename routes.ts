import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, hashPassword } from "./auth";
import passport from "passport";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      console.log("Registration attempt:", req.body.username);
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        username: req.body.username,
        password: hashedPassword,
      });

      console.log("User created:", user.id);
      await storage.createSystemLog({
        action: "USER_REGISTERED",
        operatorId: user.id,
        details: `Operator ${user.username} registered.`
      });

      req.login(user, (err) => {
        if (err) {
          console.error("Login after register failed:", err);
          return next(err);
        }
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      console.error("Registration error:", err);
      next(err);
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), async (req, res) => {
    const { password, ...userWithoutPassword } = req.user as any;
    await storage.createSystemLog({
      action: "USER_LOGIN",
      operatorId: (req.user as any).id,
      details: `Operator ${(req.user as any).username} established uplink.`
    });
    res.status(200).json(userWithoutPassword);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get(api.auth.user.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    res.status(200).json(userWithoutPassword);
  });

  app.get(api.alerts.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const alerts = await storage.getAlerts();
    res.json(alerts);
  });

  app.get(api.sensors.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const sensors = await storage.getSensorStats();
    res.json(sensors);
  });

  app.get(api.patrols.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const patrols = await storage.getPatrolRoutes();
    res.json(patrols);
  });

  app.get(api.logs.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const logs = await storage.getSystemLogs();
    res.json(logs);
  });

  app.post(api.alerts.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.alerts.create.input.parse(req.body);
      const alert = await storage.createAlert(input);
      res.status(201).json(alert);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.system.status.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const alerts = await storage.getAlerts();
    const activeThreats = alerts.filter(a => a.threatLevel === "High" || a.threatLevel === "Medium").length;
    const status = activeThreats > 3 ? "Alert" : "Monitoring";
    
    res.json({
      status,
      activeThreats,
      lastUpdated: new Date().toISOString()
    });
  });

  await seedDatabase();

  return httpServer;
}

export async function seedDatabase() {
  const existingAlerts = await storage.getAlerts();
  if (existingAlerts.length === 0) {
    await storage.createAlert({
      sensorType: "Infrared Camera (North Sector)",
      threatLevel: "Low",
      message: "Wildlife detected near the perimeter.",
      objectType: "Animal",
      confidenceScore: 92,
      location: "34.0522 N, 118.2437 W"
    });
    await storage.createAlert({
      sensorType: "Motion Sensor (East Gate)",
      threatLevel: "Medium",
      message: "Unidentified vehicle approached the gate.",
      objectType: "Vehicle",
      confidenceScore: 85,
      location: "34.0525 N, 118.2440 W"
    });
    await storage.createAlert({
      sensorType: "Radar Array (Sector 4)",
      threatLevel: "High",
      message: "Multiple individuals approaching the border fence.",
      objectType: "Person",
      confidenceScore: 98,
      location: "34.0530 N, 118.2450 W"
    });
  }

  const existingSensors = await storage.getSensorStats();
  if (existingSensors.length === 0) {
    const baseSensors = [
      { name: "CAM-01 MAIN", status: "Online", health: 98 },
      { name: "CAM-02 NORTH", status: "Online", health: 95 },
      { name: "RADAR-01 SECTOR 4", status: "Online", health: 100 },
      { name: "IR-GATE-EAST", status: "Online", health: 88 },
      { name: "DRONE-ALPHA", status: "Maintenance", health: 45 }
    ];
    for (const s of baseSensors) {
      await storage.updateSensorStat({
        sensorName: s.name,
        status: s.status,
        healthScore: s.health
      });
    }
  }

  const existingPatrols = await storage.getPatrolRoutes();
  if (existingPatrols.length === 0) {
    const basePatrols = [
      { routeName: "Alpha Sector Perimeter", status: "Active" },
      { routeName: "North Gate Checkpoint", status: "Active" },
      { routeName: "East Fence Line", status: "Active" }
    ];
    for (const p of basePatrols) {
      await storage.createPatrolRoute(p);
    }
  }
}
