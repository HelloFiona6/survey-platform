const fs = require('fs');
const path = require('path');
const db = require('./db');

const imagesDir = path.join(__dirname, 'images');

const index = fs.readdirSync(path.join(imagesDir,''));
