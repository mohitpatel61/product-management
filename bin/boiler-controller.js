const fs = require('fs');
const path = require('path');

// Get the controller name from command line arguments
const controllerName = process.argv[2];

if (!controllerName) {
  console.error('Error: Please provide a controller name. Example: node createController.js user');
  process.exit(1);
}

// Define the controllers directory
const controllerDir = path.join(__dirname, '../controllers'); // Moves up from `bin` and creates in `controllers`

// Ensure the controllers directory exists
if (!fs.existsSync(controllerDir)) {
  fs.mkdirSync(controllerDir, { recursive: true }); // Create the folder if it doesn't exist
}

const controllerBoilerplate = `
module.exports = {
  demoFunction: async (req, res) => {
    try {
      res.send('This is a demo function in the ${controllerName} controller');
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
`;

const filePath = path.join(controllerDir, `${controllerName}.js`);

// Write the controller file
fs.writeFile(filePath, controllerBoilerplate, (err) => {
  if (err) {
    console.error(`Error creating controller file: ${err}`);
  } else {
    console.log(`Controller file "${controllerName}.js" created successfully in controllers/ folder.`);
  }
});
