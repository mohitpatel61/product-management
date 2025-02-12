// const i18n = require("i18n");
const { winston } = require("winston");
const { User, Sequelize, Op } = require("../models");
const csrfService = require('../services/csrfService'); // Import CSRF service
const moment = require("moment");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");


module.exports = {
    //Controller function to list all the services
    getDashboardView: async (req, res) => {

      try {
        
       // Create the response data
       const resData = {
         title: "Dashboard",
         message: "Good Morning, All",
       };
       
       // Return or use the resData as needed
  
        res.render("dashboard", resData);
      } catch (error) {
        res.redirect("/user/login");
      }
    },
  }
  
  
  