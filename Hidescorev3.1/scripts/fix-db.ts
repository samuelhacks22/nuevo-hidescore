
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Cleaning up orphan records...");

  // Delete reports where the user_id does not exist in the users table
  console.log("Cleaning reports...");
  await db.execute(sql`
    DELETE FROM reports 
    WHERE user_id NOT IN (SELECT id FROM users);
  `);

  // Delete ratings where the user_id does not exist in the users table
  console.log("Cleaning ratings...");
  await db.execute(sql`
    DELETE FROM ratings 
    WHERE user_id NOT IN (SELECT id FROM users);
  `);

  // Delete comments where the user_id does not exist in the users table
  console.log("Cleaning comments...");
  await db.execute(sql`
    DELETE FROM comments 
    WHERE user_id NOT IN (SELECT id FROM users);
  `);

  console.log("Cleanup complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
