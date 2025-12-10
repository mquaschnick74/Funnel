import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";
import { createHash } from "crypto";

// Simple hash function for passwords
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function setupAuth(app: Express) {
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "admin-email-generator-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password auth
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const hashedPassword = hashPassword(password);
        if (user.password !== hashedPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || null);
    } catch (error) {
      done(error, null);
    }
  });

  // Create default admin user if it doesn't exist
  createDefaultAdmin();
}

async function createDefaultAdmin() {
  try {
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      const hashedPassword = hashPassword("admin123"); // Default password - should be changed!
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
      });
      console.log("✅ Default admin user created (username: admin, password: admin123)");
      console.log("⚠️  Please change the default admin password in production!");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
}

// Middleware to check if user is authenticated
export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};

// Middleware to check if user is admin
export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated() && (req.user as any)?.role === "admin") {
    return next();
  }
  if (req.isAuthenticated()) {
    res.status(403).json({ error: "Forbidden - Admin access required" });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export { hashPassword };
