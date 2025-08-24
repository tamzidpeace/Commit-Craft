const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a 256x256 canvas
const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

// Draw a blue background
ctx.fillStyle = '#4F8CC9';
ctx.fillRect(0, 0, 256, 256);

// Draw white "CC" text
ctx.fillStyle = 'white';
ctx.font = 'bold 120px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('CC', 128, 128);

// Save the canvas as a PNG file
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon.png', buffer);

console.log('Icon generated: icon.png');