import { config } from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

config();

async function testConnection() {
  console.log("Testing database connection...");
  console.log(
    "DATABASE_URL:",
    process.env.DATABASE_URL ? "Present" : "Missing"
  );

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Attempting to connect...");
    const client = await pool.connect();
    console.log("✅ Successfully connected to database!");

    const result = await client.query("SELECT version()");
    console.log("Database version:", result.rows[0].version);

    client.release();
    await pool.end();
    console.log("✅ Connection test completed successfully");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.error("Error details:", error);
    process.exit(1);
  }
}

testConnection();
