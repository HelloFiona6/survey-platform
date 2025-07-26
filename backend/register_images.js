const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); // Ensure you have csv-parser installed
const db = require('./db');

const imagesDir = path.join(__dirname, 'images');


/**
 * Encapsulate CSV
 * @param {String} fileName 
 * @returns {Promise<Object[]>}
 */
async function readCsv(fileName) {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(fileName)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

/**
 * Assumes good index.
 * @param {String} dirName 
 * @returns {Promise<{ location: String, dot_count: Number, distribution: String }[]>}
 */
async function adaptIndex(dirName) {
  const indexFilePath = path.join(dirName, 'index.csv');
  if (!fs.existsSync(indexFilePath)) {
    throw new Error(`Index file not found at ${indexFilePath}`);
  }
  let entries = await readCsv(indexFilePath);
  return entries
    .map(entry => {
      return {
        location: path.join(dirName, entry['filename']),
        dot_count: entry['dot_number'],
        distribution: entry['distribution']
      };
    });
}


async function initQuestionsFromImagesAsync(db) {
  // const filesAndDirs = await fs.promises.readdir(directoryPath, { withFileTypes: true });
  // const directories = filesAndDirs
  //   .filter(ent => ent.isDirectory())
  //   .map(dir => dir.name);

  let results = [];
  for (const dir of /*directories*/['.']) {
    try {
      const adaptedEntries = await adaptIndex(path.join(imagesDir, dir));
      results = results.concat(adaptedEntries);
    } catch (error) {
      console.error(`Error processing directory ${dir}:`, error.message);
    }
  }

  try {
    await db.runAsync("BEGIN TRANSACTION");
    const get_stmt = await db.prepareAsync("SELECT id FROM dot_material WHERE location = ?");

    for (const entry of results) {
      get_stmt.run(entry.location, (err, row) => {
        if (err) {
          console.error(`Error checking material for ${entry.location}:`, err.message);
          return;
        }
        if (row) {
          console.log(`Dot material for ${entry.location} already exists.`);
          return;
        }
        db.run("INSERT INTO dot_material (location, dot_count, distribution) VALUES (?, ?, ?)", ...entry);
      });
    }

    get_stmt.finalize();
    await db.runAsync("COMMIT");
  } catch (err){
    if (err) {
      console.error('Error during database transaction:', err.message);
    } else {
      console.log('Successfully initialized dot materials from images.');
    }
  }
}


module.exports = {
  init: async function (db) {
    try {
      await initQuestionsFromImagesAsync(db)
      console.log('All dot materials initialized successfully.');
    } catch (err) {
      console.error('Error initializing dot materials:', err.message);
    }
  }
};
