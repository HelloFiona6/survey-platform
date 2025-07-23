const path = require('path');
const fs = require('fs').promises; // Use promises for async file operations

const MIGRATIONS_DIR = path.resolve(__dirname, 'migrations'); // Adjust path

async function runMigrations(db) {
  try {
    console.log('Starting database migration...');

    // 1. Ensure the migrations table exists
    db.run(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        migration_name TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Migration tracking table checked/created.');

    // 2. Get applied migrations
    const appliedMigrations = new Set(
      db
      .all("SELECT migration_name FROM _migrations ORDER BY id ASC")
      .map(row => row.migration_name)
      );
    console.log('Applied migrations:', [...appliedMigrations]);

    // 3. Read migration files
    const migrationFiles = await fs.readdir(MIGRATIONS_DIR);
    const sortedMigrationFiles = migrationFiles
      .filter(file => file.endsWith('.sql') && /^\d{3}_/.test(file))
      .sort(); // Sorts them numerically

    console.log('Found migration files:', sortedMigrationFiles);

    // 4. Apply new migrations
    for (const fileName of sortedMigrationFiles) {
      if (!appliedMigrations.has(fileName)) {
        console.log(`Applying migration: ${fileName}`);
        const migrationSql = await fs.readFile(path.join(MIGRATIONS_DIR, fileName), 'utf8');

        // the file contains transaction statements
        db.exec(migrationSql, (err) => {
          if (err) {
            console.error(`Failed to apply migration ${fileName}:`, err);
            throw err; // Stop on error
          }
        });

        // Record the migration as applied
        db.run("INSERT INTO _migrations (migration_name) VALUES (?)", [fileName]);
        console.log(`Successfully applied: ${fileName}`);
      }
    }
    console.log('All migrations applied successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

module.exports = runMigrations;
