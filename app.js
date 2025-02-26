const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const http = require("http");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mysql = require("mysql2"); // Use mysql2
const MySQLStore = require("express-mysql-session")(session);
const dbConnection = require("./config/db");
const apiRoutes = require("./routes/APIroutes/index");

const csrfService = require("./services/csrfService");
const indexRouter = require("./routes/index");
const { isAuthenticated } = require("./middlewares/checkAuthLogin");
const cors = require("cors");

require("dotenv").config(); // Load environment variables
const app = express()

//ALLOW for ALl REQS
// app.use(cors());

// Restricted purpose
app.use(
    cors({
      origin: "http://localhost:3001", // Allow only this frontend to access the API
     
      credentials: true, // Allow cookies if needed
    })
  );
// ✅ Use MySQL connection for session store
const sessionStore = new MySQLStore({}, dbConnection);

app.use(
    session({
        name: "user_sid",
        secret: process.env.SESSION_SECRET || "your-secret-key", 
        store: sessionStore,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 86400000, // 1 Day
        },
    })
);


// Load configuration
// const config = require("./config/config.json");
// const environment = process.env.NODE_ENV || "development";
// const configForEnv = config[environment];

// if (!configForEnv) {
//     console.error(`Configuration for environment "${environment}" is missing!`);
//     process.exit(1);
// }

// Initialize express app

const server = http.createServer(app);

// Middleware Setup
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", apiRoutes);


// 🛠️ **Flash Messages Middleware (Placed Immediately After Session)**
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// 🔍 **Flash Debugging Middleware (Check If Flash Works)**
// app.use((req, res, next) => {
//     console.log("Success Flash Message:", req.flash("success"));
//     console.log("Error Flash Message:", req.flash("error"));
//     next();
// });

// 🛠️ **Auth Middleware to Protect Routes**
app.use((req, res, next) => {
    if (req.path === "/user/login" || req.path === "/user/auth/google" || req.path === "/user/auth/google/callback" || req.path === "/user/logout") {

        return next();
    }
    isAuthenticated(req, res, next);
});

// 🛠️ **Flash Messages Available in Views**

// 🛠️ **CSRF Token Middleware**
app.use((req, res, next) => {
    try {
        const csrfToken = csrfService.generateToken(req);
        res.locals.csrfToken = csrfToken;
    } catch (error) {
        console.error("CSRF Token Generation Error:", error);
    }
    next();
});

// 🛠️ **EJS and Layouts Setup**
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("views", "./views");

// 🛠️ **Set Layout Dynamically**
app.use((req, res, next) => {
    res.locals.layout = req.path.startsWith("/user/login") ? "loginLayout" : "layout";
    next();
});

// 🛠️ **Make User Session Data Available Globally in Views**
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user; // Making user data available globally
    }
    next();
});

// 🛠️ **Define Routes**

app.use("/", indexRouter);


// 🛠️ **Handle 404 Errors**
app.use((req, res) => {
    res.status(404).render("404", { title: "Page Not Found", layout: "loginLayout" });
});

// 🛠️ **Start Server**
const PORT = process.env.PORT || 2100;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
