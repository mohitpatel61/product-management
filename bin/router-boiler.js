const fs = require('fs');
const path = require('path');

// Get the router name from command line arguments
const routerName = process.argv[2];
const routesDir = path.join(__dirname, '..', 'routes'); // Your folder path

if (!routerName) {
  console.error('Error: Please provide a router name. Example: node createRouter.js user');
  process.exit(1);
}

// const routesDir = path.join(__dirname, );

// Ensure the routes directory exists
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir);
}

const routerBoilerplate = `
const express = require('express');
const router = express.Router();

// Define routes here
router.get('/', (req, res) => {
  res.send('GET request to the ${routerName} route');
});

router.post('/', (req, res) => {
  res.send('POST request to the ${routerName} route');
});

// Add more routes as needed

module.exports = router;
`;

const filePath = path.join(routesDir, `${routerName}.js`);

// Write the router file
fs.writeFile(filePath, routerBoilerplate, (err) => {
  if (err) {
    console.error(`Error creating router file: ${err}`);
  } else {
    console.log(`Router file "${routerName}.js" created successfully in routes/ folder.`);
  }
});
