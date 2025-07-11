/*
A JS version of dot generator, using Node.js and canvas.
However, it seems useless. Just for fun and learning JS.
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas'); // 确保已安装: npm install canvas

// Configuration from Python script
const DOT_NUMBERS = [100]; // for each image. we may use range iterators or list comprehensions
const DOT_SEP = 0.03;      // don't overlap
const BASE_PATH = '/workspaces/dotsactivity-data/tmp'; // Renamed PATH to BASE_PATH to avoid conflict with path module
const SAMPLER = 'quarter';

// Ensure the output directory exists
if (!fs.existsSync(BASE_PATH)) {
    fs.mkdirSync(BASE_PATH, { recursive: true });
}

// Equivalent to quadrant_cluster in Python
function quadrantCluster() {
    const cellIndexX = Math.floor(Math.random() * 2); // 0 or 1
    const cellIndexY = Math.floor(Math.random() * 2); // 0 or 1

    // Simulate normal distribution around (cell_index*2+1)/4
    // Using Box-Muller transform for normal distribution
    // This is a simplified normal distribution, a more robust one might be needed for perfect fidelity
    const stdDev = 0.1; // Corresponds to Python's 0.1

    // Box-Muller transform to get two standard normal (mean 0, std dev 1) variates
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);

    const posX = ((cellIndexX * 2 + 1) / 4) + z0 * stdDev;
    const posY = ((cellIndexY * 2 + 1) / 4) + z1 * stdDev;

    return [posX, posY];
}

// Equivalent to DOT_SAMPLERS in Python
const DOT_SAMPLERS = {
    'uniform': () => [Math.random(), Math.random()], // uniform(0, 1, 2)
    'normal': () => {
        // Simplified normal distribution (Box-Muller) centered at 0.5 with std dev 0.2
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        const z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
        return [0.5 + z0 * 0.2, 0.5 + z1 * 0.2];
    },
    'quarter': quadrantCluster,
};

// Function to calculate Euclidean distance (np.linalg.norm equivalent)
function euclideanDistance(p1, p2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];
    return Math.sqrt(dx * dx + dy * dy);
}

// Main logic for generating a single image
async function generateImage(nDots) {
    const canvasWidth = 1024; // Equivalent to matplotlib's default figure size/DPI
    const canvasHeight = 1024;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Set background to white (matplotlib default is often transparent, or white for savefig)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Marker properties: 'ko' in matplotlib means black circles. markersize is in points.
    // We need to scale DOT_SEP (0.03 of 1.0 range) to canvas pixels for markerSize.
    // 0.03 * 100 in Python means a marker size of 3 (in matplotlib's default units).
    // Let's assume markersize is scaled relative to the canvas size.
    // If the original DOT_SEP * 100 refers to matplotlib's default points,
    // a good visual equivalent for 'o' might be a radius of DOT_SEP * 0.5 * canvasWidth (rough estimate).
    // Or, more directly, Python's markersize unit can be roughly scaled.
    // Let's use a fixed radius that looks good. A radius of say, 5 pixels, would be reasonable.
    // Or, trying to scale: DOT_SEP * (canvasWidth / 1.0) / 2 for radius if DOT_SEP is a diameter.
    // Python's markersize is diameter in points. If 0.03 * 100 = 3 points, let's say 3 pixels.
    const markerRadius = (DOT_SEP * 100) / 2; // Convert to radius from diameter, or adjust based on visual need

    ctx.fillStyle = 'black'; // 'k' in 'ko' means black color
    ctx.lineCap = 'round'; // For better looking lines if any were drawn

    const existingLocations = [];

    while (existingLocations.length < nDots) {
        const newLocation = DOT_SAMPLERS[SAMPLER]();

        // Check if new_location is within [0, 1) range
        if (newLocation[0] < 0 || newLocation[0] >= 1 || newLocation[1] < 0 || newLocation[1] >= 1) {
            continue;
        }

        // Check to ensure new dot is not too close to others
        const tooClose = existingLocations.some(loc => {
            return euclideanDistance(loc, newLocation) < DOT_SEP;
        });

        if (tooClose) {
            continue;
        }

        existingLocations.push(newLocation);

        // Draw the dot on the canvas
        // Convert normalized [0, 1] coordinates to canvas pixel coordinates
        // Python's xlim/ylim are -0.02 to 1.02, so adjust mapping
        const plotMinX = -0.02;
        const plotMaxX = 1.02;
        const plotMinY = -0.02;
        const plotMaxY = 1.02;

        const normalizedX = (newLocation[0] - plotMinX) / (plotMaxX - plotMinX);
        const normalizedY = (newLocation[1] - plotMinY) / (plotMaxY - plotMinY);

        const pixelX = normalizedX * canvasWidth;
        const pixelY = normalizedY * canvasHeight;

        ctx.beginPath();
        ctx.arc(pixelX, pixelY, markerRadius, 0, Math.PI * 2); // Draw a circle
        ctx.fill();
    }

    // Save the image
    const outputPath = path.join(BASE_PATH, `${nDots}.png`); // Using .png as a common format
    const outStream = fs.createWriteStream(outputPath);
    const pngStream = canvas.createPNGStream(); // Or .createJPEGStream() for JPEG

    pngStream.pipe(outStream);

    return new Promise((resolve, reject) => {
        outStream.on('finish', () => {
            console.log(`Generated: ${outputPath}`);
            resolve();
        });
        outStream.on('error', (err) => {
            console.error(`Error generating ${outputPath}:`, err);
            reject(err);
        });
    });
}

// Main execution block
async function main() {
    for (const nDots of DOT_NUMBERS) {
        await generateImage(nDots);
    }
    console.log('All specified images generated.');
}

main().catch(console.error);