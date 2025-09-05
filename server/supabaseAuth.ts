import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { createClient } from "@supabase/supabase-js";
import { storage } from "./storage";

if (!process.env.SUPABASE_URL) {
  throw new Error("Environment variable SUPABASE_URL not provided");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Environment variable SUPABASE_SERVICE_ROLE_KEY not provided"
  );
}

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(user: any) {
  await storage.upsertUser({
    id: user.id,
    email: user.email,
    firstName:
      user.user_metadata?.first_name ||
      user.user_metadata?.full_name?.split(" ")[0] ||
      "",
    lastName:
      user.user_metadata?.last_name ||
      user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
      "",
    profileImageUrl: user.user_metadata?.avatar_url || "",
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
        },
        email_confirm: true,
      });

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      await upsertUser(data.user);
      
      // Assign default researcher role to new users
      try {
        await storage.assignUserRole(data.user.id, "researcher");
      } catch (error) {
        // Role might already exist, ignore error
        console.log("Role assignment info:", error);
      }
      
      res.json({ message: "User created successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ message: error.message });
      }

      // Store user session
      (req.session as any).user = {
        id: data.user.id,
        email: data.user.email,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      };

      await upsertUser(data.user);
      res.json({ message: "Signed in successfully" });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  app.post("/api/auth/signout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to sign out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Signed out successfully" });
    });
  });

  app.post("/api/auth/refresh", async (req, res) => {
    try {
      const user = (req.session as any)?.user;
      if (!user?.refresh_token) {
        return res.status(401).json({ message: "No refresh token available" });
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: user.refresh_token,
      });

      if (error) {
        return res.status(401).json({ message: "Failed to refresh session" });
      }

      // Update session with new tokens
      (req.session as any).user = {
        ...user,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      };

      res.json({ message: "Session refreshed successfully" });
    } catch (error) {
      console.error("Refresh error:", error);
      res.status(500).json({ message: "Failed to refresh session" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = (req.session as any)?.user;

  if (!user?.access_token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (user.expires_at && now >= user.expires_at) {
    // Try to refresh the token
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: user.refresh_token,
      });

      if (error) {
        return res.status(401).json({ message: "Session expired" });
      }

      // Update session with new tokens
      (req.session as any).user = {
        ...user,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      };
    } catch (error) {
      return res.status(401).json({ message: "Session expired" });
    }
  }

  // Verify the token with Supabase
  try {
    const { data, error } = await supabase.auth.getUser(user.access_token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user info to request for use in routes
    (req as any).user = {
      id: data.user.id,
      email: data.user.email,
      claims: { sub: data.user.id },
    };

    next();
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};

export { supabase };
