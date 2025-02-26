const { validationResult } = require("express-validator");
const { User } = require("../models");
const bcrypt = require("bcrypt");
const csrfService = require('../services/csrfService'); // CSRF protection service
const axios = require("axios");
const fs = require('fs');
const path = require("path");
const imageUploadFolder = path.join(__dirname, '..', 'uploads', 'profile_pics'); // Your folder path
const thumbnailFolder = path.join(imageUploadFolder, 'thumbnails');
const moment = require("moment");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");


module.exports = {
  getLoginView: async (req, res) => {
    try {
      res.render("login", {
        title: 'Login',
        errorMessages: "",
        userData: req.body,
      });
    } catch (error) {
      res.status(500).send("Server error");
    }
  },

  userLogin: async (req, res, next) => {
    try {
  
      // Validate input fields
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("login", {
          title: "Login",
          errorMessages: errors.array().map((error) => error.msg),
          userData: req.body,
        });
      }

      // Validate CSRF Token


      const { email, password } = req.body;
      const userInfo = await User.findOne({ where: { email } });

      if (!userInfo || !(await bcrypt.compare(password, userInfo.password))) {
        return redirectWithError(req, res, "Invalid email or password");
      }

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate(async (err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return next(err);
        }

        // Store only necessary user details in session
        req.session.user = { id: userInfo.id, name: `${userInfo.first_name} ${userInfo.last_name}`, email: userInfo.email };

        // Ensure session is saved before redirecting
        await new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));
        
        res.redirect("/dashboard"); // Redirect after successful login
      });
    } catch (error) {
      console.error("Login error:", error);
      return redirectWithError(req, res, "Failed to login. Please try again.");
    }
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Could not log out");
      }
      res.clearCookie("user_sid"); // Clear session cookie
      res.redirect("/user/login");
    });
  },

  googleAuth: async(req, res) => {
    try {

      const url = `${process.env.GOOGLE_AUTH_URL}=${process.env.CLIENTID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=profile email`;
      
      return res.redirect(url);
    } catch (error) {
      // req.flash("error", `Could Not authenticate google ${error.message}`);
      return redirectWithError(req,res, `Failed to Authentication. Please try again ${error.message}.`);
    }
  },

  googleAuthCallBack :  async (req, res) => {
    const { code } = req.query;
  
    try {
      // Exchange authorization code for access token
      const { data } = await axios.post(`${process.env.GOOGLE_TOKEN_URL}`, {
        client_id: process.env.CLIENTID,
        client_secret: process.env.CLIENTSECRET,
        code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code',
      });
  
      const { access_token, id_token } = data;
  
      // Use access_token or id_token to fetch user profile
      const { data: profile } = await axios.get(`${process.env.GET_PROFILE_DATA_URL}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      
      // Code to handle user authentication and retrieval using the profile data
      if(profile){

        const url = profile.picture;
        const image = await axios.get(url, {responseType: 'arraybuffer'});
        let contentType = image.headers['content-type'];
        // console.log(base64Image);return false;
        let extention = 'jpg';

        if(contentType === 'image/jpeg'){
          extention = 'jpg';
        }
        else if(contentType === 'image/png'){
          extention = 'png';
        }
        else if(contentType === "image/gif"){
          extention = 'gif';
        }
        else if(contentType === 'image/webp'){
          extention = 'webp';
        }
        const filename = `userImage.${extention}`;
        const imageName = moment().valueOf() + path.extname(filename).toLowerCase();
        const imagePath = `/uploads/profile_pics/${imageName}`; // This is the path to store in the database
        const thumbnailPath = `/uploads/profile_pics/thumbnails/${imageName}`;

        const password = "123456";
        const hashedPassword = await bcrypt.hash(password, 10);
        
        //Check if already exists email in users table
        const checkUserInfo  = await User.findOne({where: {email: profile.email}});
        if(checkUserInfo){
          checkUserInfo.password = hashedPassword;
          req.session.user = {id : res.id, name: `${res.first_name} ${res.last_name}`, email: res.email};
          // Ensure session is saved before redirecting
          await new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));
          return res.redirect("/dashboard");
        }
        else{
          fs.writeFileSync(path.join(imageUploadFolder, imageName), image.data);
          // Generate a thumbnail
          await sharp(path.join(imageUploadFolder, imageName))
            .resize(150, 150) // Resize to 150x150 pixels
            .toFile(path.join(thumbnailFolder, imageName));
  

          // Create new user
          const createUser = await User.create({
            first_name: profile.given_name,
            last_name: profile.family_name,
            email: profile.email,
            password: hashedPassword,
            profile_image: imagePath,
            thumbnail_image: thumbnailPath

          }).then(async (res) => {
            // Store only necessary user details in session
            req.session.user = {id : res.id, name: `${res.first_name} ${res.last_name}`, email: res.email};
            // Ensure session is saved before redirecting
            await new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));
          });
            return res.redirect("/dashboard");
        }
      }
      else{
        return res.redirect("/user/login");
      }
      
    } catch (error) {
      console.error('Error:', error);
      res.redirect('/login');
    }
  },

  // Login with API
  loginWithAPI: async (req, res, next) => {
    try {
  
      // Validate input fields
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("login", {
          title: "Login",
          errorMessages: errors.array().map((error) => error.msg),
          userData: req.body,
        });
      }

// console.log(req.body);return false;
      const { email, password } = req.body;
      const userInfo = await User.findOne({ where: { email } });

      if (!userInfo || !(await bcrypt.compare(password, userInfo.password))) {
        return res.status(404).json({ status: false, message: "Login failed"});
      }
      const token = jwt.sign({ id: userInfo.id, email: userInfo.email, password:password  }, process.env.JWT_SECRET, { expiresIn: "1d" });

      // Regenerate session to prevent session fixation attacks
      return res.status(200).json({ status: true, message: "Login success" , 'token' : token, userInfo: userInfo});
    } catch (error) {
      console.error("Login error:", error);
      return redirectWithError(req, res, "Failed to login. Please try again.");
    }
  }
};

// ✅ Helper Function for Flash Messages & Redirects
function redirectWithError(req, res, message) {
  req.flash("error", message);
  return res.redirect("/user/login");
}
