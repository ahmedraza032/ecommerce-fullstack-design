const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seed.js');
let seedContent = fs.readFileSync(seedPath, 'utf8');

// Replace rating: <number> with rating: <number/2>
seedContent = seedContent.replace(/rating:\s*([0-9]+\.[0-9]+)/g, (match, p1) => {
  const newRating = (Number(p1) / 2).toFixed(1);
  return `rating: ${newRating}`;
});

fs.writeFileSync(seedPath, seedContent);
console.log('Successfully updated ratings in seed.js to 0-5 scale.');
