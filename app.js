const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const http = require('http');
const path = require('path');
const session = require("express-session");
const flash = require('connect-flash');
const indexRouter = require("./routes/index");
const csrfService = require('./services/csrfService'); // Import the CSRF service
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const App = express();
const server = http.createServer(App);
const sessionSecret = process.env.SESSION_SECRET || 'default_secret';

// Middleware Setup
App.use(express.json());
App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));
App.use(cookieParser());
App.use(express.static(path.join(__dirname, 'public')));
App.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session Middleware (Set before CSRF)
App.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set to true in production with HTTPS
    })
);


App.use(flash());
App.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
// Set CSRF Token Middleware (Before rendering views)
App.use((req, res, next) => {
    try {
        const csrfToken = csrfService.generateToken(req); // Generate per request
        res.locals.csrfToken = csrfToken; // Pass CSRF token to views
    } catch (error) {
        console.error("CSRF Token Generation Error:", error);
    }
    next();
});

// EJS and Layouts Setup
App.set('view engine', 'ejs');
App.use(expressLayouts);
App.set('views', './views');

App.use((req, res, next) => {
    res.locals.layout = req.path.startsWith('/user/login') ? 'loginLayout' : 'layout';
    next();
});

// Define Routes
App.use("/", indexRouter);

// Handle 404 Errors
App.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found', layout: 'loginLayout' });
});

const PORT = process.env.PORT || 2100;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
