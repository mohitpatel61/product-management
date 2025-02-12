const { winston } = require("winston");
const { User, Sequelize } = require("../models");
const { EmptyResultError, json, Op, where } = require("sequelize");
const csrfService = require('../services/csrfService'); // Import CSRF service
const moment = require("moment");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

module.exports = {

  getAjaxUser: async (req, res) => {

    try {

      // console.log("req================",req);return false;
  
      const draw = parseInt(req.body.draw) || 1; // DataTable draw counter
      const start = parseInt(req.body.start) || 0; // Start index
      const length = parseInt(req.body.length) || 10; // Records per page
      const searchValue = req.body.search || ''; // Search value
      const orderColumn = req.body.order?.[0]?.column || 0; // Ordered column index
      const orderDir = req.body.order?.[0]?.dir || 'asc'; // Order direction (asc/desc)
      const columns = ['created_at', 'first_name', 'email', 'status']; // Define columns for ordering

      const offset = start;
      const limit = length;


      // Access decoded user data
      const userId = req.session.user.id;
      const userName = req.session.user.name;

      const userEmail = req.session.user.email;

      // Build the "where" clause for search
      const whereClause = searchValue
        ? {
          [Sequelize.Op.or]: [
            { first_name: { [Sequelize.Op.like]: `%${searchValue}%` } },
            { last_name: { [Sequelize.Op.like]: `%${searchValue}%` } },
            { email: { [Sequelize.Op.like]: `%${searchValue}%` } },
          ],
        }
        : {};

      // Fetch employees with pagination
      const { count, rows } = await User.findAndCountAll({
        where: { ...whereClause },
        attributes: ['id', 'first_name', 'last_name', 'email', 'created_at', 'status'],
        order: [[columns[orderColumn] || 'created_at', orderDir]],
        limit,
        offset,
      });

      // Format rows for DataTables
      const data = rows.map((uesr) => ({
        id: uesr.id,
        name: `${uesr.first_name} ${uesr.last_name}`,
        email: uesr.email,
        created_at: new Date(uesr.created_at).toLocaleString(),
        status: uesr.status,

      }));

      // Return JSON response for DataTables
      res.json({
        draw,
        recordsTotal: count, // Total records
        recordsFiltered: count, // Filtered records
        data, // Paginated data
      });
    } catch (error) {
      console.error("Error in get data:", error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }

  },

  addUserView: async (req, res) => {
    try {
        res.render("users/addUser", { 
            title: "New user",
            errors: req.flash("error") || "",  // Ensure flash errors are passed
            success: req.flash("success") || "",
            userData: req.body
        });
    } catch (error) {
        res.status(500).send("Error occurred");
    }
},

  addUser: async(req,res) => {
    try {
     const errorsData = validationResult(req);
    //  console.log("errore ================",errors);
     if(!errorsData.isEmpty()){
      const errorMessages = errorsData.mapped();
      return res.render("users/addUser",
          {
            title: "New user",
            errors: errorMessages,
            userData: req.body
          });
        }

          const {email,firstName, lastName, password}= req.body;
          // check if same email is exists
          const checkEmail = await User.findOne({where: {email:email}});
          if(checkEmail){
            req.flash("error", `${email} is already exists`);
            return res.redirect("/users/add-user");
          }
          const hashedpassword = await bcrypt.hash(password, 10);
          const insertData = await User.create({
            first_name: firstName,
            last_name: lastName,
            password: hashedpassword,
            email: email
          });

          req.flash("success","New user has been created");
          return res.redirect("/users");
     

    } catch (error) {
      req.flash("error", `Error ${error.message}`);
      return res.redirect("/users/add-user");  
    }

  },

  getUsersListView: async (req, res) => {
    try {
      res.render('users/user-list', {
        title: 'Users',
      });
    } catch (error) {
      console.error("Error fetching users:", error.message);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteUser: async (req, res) => {
    try {
     const userId = req.params.id;

      const userData = await User.findOne({ where: { id: userId } });
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await userData.destroy();

      // Generate a new CSRF token after delete
      const newCsrfToken = csrfService.generateToken(req);

      return res.json({
        success: true,
        message: 'User marked as deleted successfully',
        csrfToken: newCsrfToken // Send new CSRF token in response
      });

      // res.json({ success: true, message: 'User marked as deleted successfully' });
    } catch (error) {

    }
  },

   
    getUserDetail : async (req, res) => {
      try {
          
          const userDetails = await User.findOne({
            where: {id: req.params.id},
          });
          
          if(!userDetails){
            req.flash("error", "User not found");
            return res.redirect("/users");
  
          }
  
          if(req.query.type === "view"){
            res.render("users/user-detail", {
              title: "User View",
              userDetails : userDetails,
  
            })
          }
  
          if(req.query.type === "edit"){
            res.render("users/user-edit", {
              title: "Edit User",
              userDetails : userDetails,
              errors: ""
            })
          }
  
      } catch (error) {
        req.flash("error", `Error occured when get data ${error.message}`);
        return res.redirect("/users");
      }
    },
    
    editUser: async (req, res) => {
      try {

          const errorsData = validationResult(req);
          const { first_name, last_name, email, userId } = req.body;
          const parseduserId = parseInt(userId);
          
          const userDetails = await User.findOne({ where: { id: parseduserId } });
         //  console.log("errore ================",errors);
          if(!errorsData.isEmpty()){
           const errorMessages = errorsData.mapped();
           return res.render("users/user-edit",
               {
                 title: "Update user",
                 errors: errorMessages,
                 userDetails: userDetails
               });
             }
  
      
         
          if (!userDetails) {
              req.flash("error", "User not found");
              return res.redirect("/users");
          }
         
          const checkEmail = await User.findOne({
              where: { id: { [Op.not]: parseduserId }, email: email }
          });
          if (checkEmail) {
              req.flash("error", `User email ${email} already exists`);
              // console.log("🚀 Setting Flash Message:", req.session.flash);
              console.log("🚀 Setting Flash Message before redirexct:", { success: req.flash("success"), error: req.flash("error") });
  
              return res.redirect(`/users/edit-user/${userId}?type=edit`);
          }
  
          userDetails.first_name = first_name;
          userDetails.last_name = last_name;
          userDetails.email = email;
          await userDetails.save();
  
          req.flash("success", "User has been updated successfully");
          return res.redirect("/users");
      } catch (error) {
          console.error("Error updating user:", error);
          req.flash("error", `Error occurred: ${error.message}`);
          return res.redirect("/users");
      }
    }
}