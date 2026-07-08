import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { requireAuth, requireAdmin, AuthRequest } from "./src/middleware/auth";
import { db } from "./src/db/index";
import { entreprises, subscriptions, users, revendeurs } from "./src/db/schema";
import { eq, and } from "drizzle-orm";
import { generateToken, hashPassword, comparePassword } from "./src/lib/auth";
import { startEmailNotificationScheduler, sendExpirationNotificationEmail } from "./src/services/email-notification";

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth Routes (Public) ---
  // Note: there is no public registration route. Accounts are created only by
  // an admin via POST /api/admin/users.

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user by email
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (result.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = result[0];

      // Verify password
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = generateToken(user.id, user.email, user.role);

      res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not login" });
    }
  });

  // --- Protected API Routes ---

  // Apply auth middleware to all /api routes except auth routes
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth/') || req.path === '/cron/trigger-notifications') {
      return next();
    }
    requireAuth(req, res, next);
  });

  app.get("/api/entreprises", async (req: AuthRequest, res) => {
    try {
      const results = await db.select().from(entreprises);
      res.json(results);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not fetch entreprises" });
    }
  });

  app.post("/api/entreprises", async (req: AuthRequest, res) => {
    try {
      const { name, revendeurId, email, phone, matriculeFiscale, rne } = req.body;
      const result = await db.insert(entreprises).values({
        name,
        revendeurId: revendeurId ? parseInt(revendeurId) : null,
        email: email || null,
        phone: phone || null,
        matriculeFiscale: matriculeFiscale || null,
        rne: rne || null,
        userId: req.user!.userId
      }).returning();
      res.json(result[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not create entreprise" });
    }
  });

  app.put("/api/entreprises/:id", async (req: AuthRequest, res) => {
    try {
      const { name, revendeurId, email, phone, matriculeFiscale, rne } = req.body;
      const result = await db.update(entreprises)
        .set({
          name,
          revendeurId: revendeurId ? parseInt(revendeurId) : null,
          email: email || null,
          phone: phone || null,
          matriculeFiscale: matriculeFiscale || null,
          rne: rne || null
        })
        .where(eq(entreprises.id, parseInt(req.params.id)))
        .returning();

      // Cascade update subscriptions name
      if (result.length > 0) {
        await db.update(subscriptions)
          .set({ entrepriseName: name })
          .where(eq(subscriptions.entrepriseId, parseInt(req.params.id)));
      }
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ error: "Could not update entreprise" });
    }
  });

  app.delete("/api/entreprises/:id", async (req: AuthRequest, res) => {
    try {
      // Get entreprise to delete PDF files
      const entreprise = await db.select().from(entreprises)
        .where(eq(entreprises.id, parseInt(req.params.id)))
        .limit(1);

      // Delete PDF files if they exist
      if (entreprise.length > 0) {
        if (entreprise[0].rnePdfPath) {
          const rnePath = path.join(UPLOADS_DIR, path.basename(entreprise[0].rnePdfPath));
          if (fs.existsSync(rnePath)) fs.unlinkSync(rnePath);
        }
        if (entreprise[0].patentePdfPath) {
          const patentePath = path.join(UPLOADS_DIR, path.basename(entreprise[0].patentePdfPath));
          if (fs.existsSync(patentePath)) fs.unlinkSync(patentePath);
        }
      }

      // Cascade delete subscriptions
      await db.delete(subscriptions)
        .where(eq(subscriptions.entrepriseId, parseInt(req.params.id)));

      await db.delete(entreprises)
        .where(eq(entreprises.id, parseInt(req.params.id)));

      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Could not delete entreprise" });
    }
  });

  // --- Revendeurs Routes ---

  app.get("/api/revendeurs", async (req: AuthRequest, res) => {
    try {
      const results = await db.select().from(revendeurs);
      res.json(results);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not fetch revendeurs" });
    }
  });

  app.post("/api/revendeurs", async (req: AuthRequest, res) => {
    try {
      const { name, email, phone } = req.body;
      const result = await db.insert(revendeurs).values({
        name,
        email: email || null,
        phone: phone || null,
        userId: req.user!.userId
      }).returning();
      res.json(result[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not create revendeur" });
    }
  });

  app.put("/api/revendeurs/:id", async (req: AuthRequest, res) => {
    try {
      const { name, email, phone } = req.body;
      const result = await db.update(revendeurs)
        .set({ name, email: email || null, phone: phone || null })
        .where(eq(revendeurs.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not update revendeur" });
    }
  });

  app.delete("/api/revendeurs/:id", async (req: AuthRequest, res) => {
    try {
      // Set revendeurId to null for all entreprises that reference this revendeur
      await db.update(entreprises)
        .set({ revendeurId: null })
        .where(eq(entreprises.revendeurId, parseInt(req.params.id)));

      await db.delete(revendeurs)
        .where(eq(revendeurs.id, parseInt(req.params.id)));

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not delete revendeur" });
    }
  });

  // --- Subscriptions Routes ---

  app.get("/api/subscriptions", async (req: AuthRequest, res) => {
    try {
      const results = await db.select().from(subscriptions);
      res.json(results);
    } catch (e) {
      res.status(500).json({ error: "Could not fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", async (req: AuthRequest, res) => {
    try {
      const { entrepriseId, entrepriseName, quantity, type, endDate } = req.body;
      const result = await db.insert(subscriptions).values({
        userId: req.user!.userId,
        entrepriseId,
        entrepriseName,
        quantity,
        type,
        endDate
      }).returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ error: "Could not create subscription" });
    }
  });

  app.put("/api/subscriptions/:id", async (req: AuthRequest, res) => {
    try {
      const { quantity, type, endDate } = req.body;
      const result = await db.update(subscriptions)
        .set({ quantity, type, endDate })
        .where(eq(subscriptions.id, parseInt(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (e) {
      res.status(500).json({ error: "Could not update subscription" });
    }
  });

  app.delete("/api/subscriptions/:id", async (req: AuthRequest, res) => {
    try {
      await db.delete(subscriptions)
        .where(eq(subscriptions.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Could not delete subscription" });
    }
  });

  app.post("/api/subscriptions/:id/renew", async (req: AuthRequest, res) => {
    try {
      const { newEndDate, newQuantity } = req.body;
      const subId = parseInt(req.params.id);

      if (!newEndDate) {
        return res.status(400).json({ error: "New end date is required" });
      }

      // Get the old subscription first
      const oldSubscription = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.id, subId))
        .limit(1);

      if (oldSubscription.length === 0) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const oldSub = oldSubscription[0];

      // Delete the old subscription first
      await db.delete(subscriptions)
        .where(eq(subscriptions.id, subId));

      // Create new subscription with new data
      let finalQuantity = oldSub.quantity;
      if (newQuantity !== undefined && newQuantity !== null) {
        finalQuantity = typeof newQuantity === 'string' ? parseInt(newQuantity) : newQuantity;
      }

      const newSubscription = await db.insert(subscriptions).values({
        entrepriseId: oldSub.entrepriseId,
        entrepriseName: oldSub.entrepriseName,
        quantity: finalQuantity,
        type: oldSub.type,
        endDate: newEndDate,
        isActive: 1,
        isPaid: 1,
        userId: req.user!.userId
      }).returning();

      res.json(newSubscription[0]);
    } catch (e) {
      console.error('Error renewing subscription:', e);
      res.status(500).json({ error: "Could not renew subscription" });
    }
  });

  // --- Admin User Management Routes ---

  // Get all users (admin only)
  app.get("/api/admin/users", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      }).from(users);
      res.json(allUsers);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not fetch users" });
    }
  });

  // Create new user (admin only)
  app.post("/api/admin/users", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      if (role && role !== 'user' && role !== 'admin') {
        return res.status(400).json({ error: "Role must be 'user' or 'admin'" });
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const result = await db.insert(users).values({
        email,
        password: hashedPassword,
        role: role || 'user',
      }).returning({
        id: users.id,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt
      });

      res.json(result[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not create user" });
    }
  });

  // Change user role (admin only)
  app.put("/api/admin/users/:id/role", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;

      if (!role || (role !== 'user' && role !== 'admin')) {
        return res.status(400).json({ error: "Role must be 'user' or 'admin'" });
      }

      // Check if user exists and get their email
      const userToModify = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userToModify.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent changing the superadmin's role (admin@subtrack.com)
      if (userToModify[0].email === 'admin@subtrack.com') {
        return res.status(403).json({ error: "Cannot modify the superadmin account" });
      }

      // Prevent admin from changing their own role
      if (userId === req.user!.userId) {
        return res.status(403).json({ error: "Cannot change your own role" });
      }

      // Check if this is the last admin
      if (role === 'user') {
        const adminCount = await db.select().from(users).where(eq(users.role, 'admin'));
        if (adminCount.length === 1) {
          const lastAdmin = adminCount[0];
          if (lastAdmin.id === userId) {
            return res.status(403).json({ error: "Cannot demote the last admin" });
          }
        }
      }

      const result = await db.update(users)
        .set({ role })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt
        });

      res.json(result[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not update user role" });
    }
  });

  // Delete user (admin only) - with cascade deletion
  app.delete("/api/admin/users/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Prevent admin from deleting themselves
      if (userId === req.user!.userId) {
        return res.status(403).json({ error: "Cannot delete your own account" });
      }

      // Check if user exists and get their info
      const userToDelete = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userToDelete.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent deleting the superadmin (admin@subtrack.com)
      if (userToDelete[0].email === 'admin@subtrack.com') {
        return res.status(403).json({ error: "Cannot delete the superadmin account" });
      }

      // Check if this is the last admin
      if (userToDelete[0].role === 'admin') {
        const adminCount = await db.select().from(users).where(eq(users.role, 'admin'));
        if (adminCount.length === 1) {
          return res.status(403).json({ error: "Cannot delete the last admin" });
        }
      }

      // Cascade delete: Delete all user's data

      // 1. Get all entreprises for this user to delete PDFs
      const userEntreprises = await db.select().from(entreprises).where(eq(entreprises.userId, userId));

      // Delete PDF files
      for (const entreprise of userEntreprises) {
        if (entreprise.rnePdfPath) {
          const rnePath = path.join(UPLOADS_DIR, path.basename(entreprise.rnePdfPath));
          if (fs.existsSync(rnePath)) fs.unlinkSync(rnePath);
        }
        if (entreprise.patentePdfPath) {
          const patentePath = path.join(UPLOADS_DIR, path.basename(entreprise.patentePdfPath));
          if (fs.existsSync(patentePath)) fs.unlinkSync(patentePath);
        }
      }

      // 2. Delete user's subscriptions
      await db.delete(subscriptions).where(eq(subscriptions.userId, userId));

      // 3. Delete user's entreprises
      await db.delete(entreprises).where(eq(entreprises.userId, userId));

      // 4. Delete user's revendeurs
      await db.delete(revendeurs).where(eq(revendeurs.userId, userId));

      // 5. Finally, delete the user
      await db.delete(users).where(eq(users.id, userId));

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Could not delete user" });
    }
  });

  // --- PDF Upload Routes ---

  app.post("/api/entreprises/:id/upload-rne", upload.single('rne'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const entrepriseId = parseInt(req.params.id);

      // Verify entreprise exists
      const existing = await db.select().from(entreprises)
        .where(eq(entreprises.id, entrepriseId))
        .limit(1);

      if (existing.length === 0) {
        fs.unlinkSync(req.file.path); // Delete uploaded file
        return res.status(404).json({ error: "Entreprise not found" });
      }

      // Delete old file if exists
      if (existing[0].rnePdfPath) {
        const oldPath = path.join(UPLOADS_DIR, path.basename(existing[0].rnePdfPath));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Update database with new file path
      const result = await db.update(entreprises)
        .set({ rnePdfPath: `/uploads/${req.file.filename}` })
        .where(eq(entreprises.id, entrepriseId))
        .returning();

      res.json(result[0]);
    } catch (e) {
      console.error(e);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Could not upload RNE PDF" });
    }
  });

  app.post("/api/entreprises/:id/upload-patente", upload.single('patente'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const entrepriseId = parseInt(req.params.id);

      // Verify entreprise exists
      const existing = await db.select().from(entreprises)
        .where(eq(entreprises.id, entrepriseId))
        .limit(1);

      if (existing.length === 0) {
        fs.unlinkSync(req.file.path); // Delete uploaded file
        return res.status(404).json({ error: "Entreprise not found" });
      }

      // Delete old file if exists
      if (existing[0].patentePdfPath) {
        const oldPath = path.join(UPLOADS_DIR, path.basename(existing[0].patentePdfPath));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      // Update database with new file path
      const result = await db.update(entreprises)
        .set({ patentePdfPath: `/uploads/${req.file.filename}` })
        .where(eq(entreprises.id, entrepriseId))
        .returning();

      res.json(result[0]);
    } catch (e) {
      console.error(e);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ error: "Could not upload Patente PDF" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(UPLOADS_DIR));

  // --- Email Notification System ---

  // Manual test endpoint for admins to trigger email notification
  app.post("/api/admin/test-email-notification", requireAdmin, async (req: AuthRequest, res) => {
    try {
      console.log(`\n📧 Manual email notification triggered by user: ${req.user!.email}`);
      await sendExpirationNotificationEmail();
      res.json({
        success: true,
        message: "Email notification sent successfully"
      });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      res.status(500).json({
        error: "Failed to send email notification",
        details: error.message
      });
    }
  });

  // External cron trigger endpoint (for hosts where the server sleeps and the
  // in-process node-cron scheduler can't be relied on to fire at the right time).
  // Protected by a static secret since external schedulers can't hold a login session.
  const handleCronTrigger = async (req: express.Request, res: express.Response) => {
    const providedSecret = req.headers['x-cron-secret'] || req.query.secret;
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      return res.status(500).json({ error: "CRON_SECRET is not configured on the server" });
    }
    if (providedSecret !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      console.log('\n📧 Email notification triggered by external cron');
      await sendExpirationNotificationEmail();
      res.json({ success: true, message: "Email notification job executed" });
    } catch (error: any) {
      console.error('Error running external cron notification:', error);
      res.status(500).json({ error: "Failed to send email notification", details: error.message });
    }
  };
  app.post("/api/cron/trigger-notifications", handleCronTrigger);
  app.get("/api/cron/trigger-notifications", handleCronTrigger);

  // Start the email notification scheduler if enabled
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
    try {
      startEmailNotificationScheduler();
    } catch (error) {
      console.error('⚠️  Failed to start email notification scheduler:', error);
    }
  } else {
    console.log('ℹ️  Email notifications are disabled (ENABLE_EMAIL_NOTIFICATIONS=false)');
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
