import { exec } from "child_process";
import dotenv from "dotenv";
import { URL } from "url";

dotenv.config();

const LOCAL_DB_URL = "postgresql://postgres:postgres@localhost:5432/mdriven-hackathon";
const NEON_DB_URL = "postgresql://neondb_owner:npg_aCedFTI1w2NO@ep-billowing-frog-a4bl3cvu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
const DUMP_FILE = "neon_backup.dump";


if (!LOCAL_DB_URL || !NEON_DB_URL) {
  console.error("❌ Missing database URLs in .env file");
  process.exit(1);
}

function run(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ Running: ${cmd}\n`);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${stderr}`);
        return reject(error);
      }
      if (stdout) console.log(stdout);
      resolve();
    });
  });
}

async function syncNeonToLocal() {
  try {
    console.log("🚀 Starting sync: Neon → Local");
    
    // Step 1: Dump from Neon
    console.log("=== 1) Dumping from Neon ===");
    await run(`pg_dump "${NEON_DB_URL}" -Fc -f ${DUMP_FILE}`);
    
    // Step 2: Parse database name
    const dbMatch = LOCAL_DB_URL.match(/postgresql:\/\/[^/]+\/(.+)$/);
    if (!dbMatch) {
      throw new Error("Could not parse database name from LOCAL_DB_URL");
    }
    const dbName = dbMatch[1];
    
    // Create base URL (connection to default 'postgres' database)
    const baseUrl = LOCAL_DB_URL.replace(`/${dbName}`, '/postgres');
    
    console.log(`Database: ${dbName}`);
    console.log(`Base URL: ${baseUrl}`);

    // Step 3: Recreate local DB - FIXED QUOTING
    console.log("=== 2) Preparing local database ===");
    
    // Terminate connections (using single quotes in SQL)
    try {
      await run(`psql "${baseUrl}" -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbName}' AND pid <> pg_backend_pid();"`);
    } catch (e) {
      console.log("Note: Could not terminate connections");
    }
    
    // FIX: Use proper escaping for quoted identifier
    // The trick: use single quotes in bash command, double quotes in SQL
    await run(`psql '${baseUrl}' -c 'DROP DATABASE IF EXISTS "${dbName}";'`);
    await run(`psql '${baseUrl}' -c 'CREATE DATABASE "${dbName}";'`);

    // Step 4: Restore to local
    console.log("=== 3) Restoring to local ===");
    await run(`pg_restore --no-owner --no-privileges -d "${LOCAL_DB_URL}" ${DUMP_FILE}`);

    // Cleanup
    const fs = require('fs');
    if (fs.existsSync(DUMP_FILE)) {
      fs.unlinkSync(DUMP_FILE);
      console.log(`🗑️  Cleaned up ${DUMP_FILE}`);
    }
    
    console.log("\n🎉 Sync successful!");
    console.log(`📊 Neon database copied to local: ${dbName}`);
  } catch (err) {
    console.error("\n❌ Sync failed:", err.message);
    process.exit(1);
  }
}

syncNeonToLocal();