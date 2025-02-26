const mysql = require("mysql2");
const config = require("./config.json");

const environment = process.env.NODE_ENV || "development";
const dbConfig = config[environment];

if (!dbConfig) {
    console.error(`Database configuration for "${environment}" is missing!`);
    process.exit(1);
}

// ✅ Create MySQL Connection
const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database
});

// ✅ Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Error:", err);
    } else {
        console.log("✅ MySQL Connected Successfully!");
    }
});

// ✅ Export Connection for use in App.js
module.exports = connection;
