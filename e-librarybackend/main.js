import { exec } from "child_process";
import dotenv from "dotenv";

dotenv.config();

const LOCAL_DB_URL = "postgresql://postgres:postgres@localhost:5432/mdriven-hackathon";
const NEON_DB_URL = "postgresql://neondb_owner:npg_aCedFTI1w2NO@ep-billowing-frog-a4bl3cvu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
const DUMP_FILE = "pg_backup.dump";

if (!LOCAL_DB_URL || !NEON_DB_URL) {
  console.error("❌ Missing LOCAL_DB_URL or NEON_DB_URL environment variables.");
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
      console.log(stdout);
      resolve();
    });
  });
}

async function sync() {
  try {
    console.log("=== 1) Dumping local PostgreSQL database ===");
    await run(`pg_dump "${LOCAL_DB_URL}" -Fc -f ${DUMP_FILE}`);

    console.log("=== 2) Restoring dump to Neon PostgreSQL ===");
    await run(`pg_restore -c -d "${NEON_DB_URL}" ${DUMP_FILE}`);

    console.log("\n✅ Sync complete! Your local DB is now in Neon.");
  } catch (err) {
    console.error("\n❌ Sync failed:", err.message);
  }
}

sync();
