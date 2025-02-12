const { validationResult } = require("express-validator");
const fs = require('fs');
const { User } = require("../models");
const moment = require("moment");
const { Op } = require("sequelize");
const sharp = require("sharp");
const path = require('path');  // Add this line to import the 'path' module
const csrfService = require("../services/csrfService");
const imageUploadFolder = path.join(__dirname, '..', 'uploads', 'profile_pics');
const thumbnailFolder = path.join(imageUploadFolder, 'thumbnails');

module.exports = {

  uploadProfilePicture: async (req, res) => {
    try {

      const userId = req.body.userId ? req.body.userId : req.session.user.id; // Get the user ID from the session or JWT token
      const file = req.file; // Assuming you're using multer
     
      if (!file) {
        return res.status(400).send('No file uploaded');
      }

      // Generate a new filename using current timestamp (or you can use UUID or any other strategy)
      const imageName = moment().valueOf() + path.extname(file.originalname).toLowerCase();
      const imagePath = `/uploads/profile_pics/${imageName}`; // This is the path to store in the database
      const thumbnailPath = `/uploads/profile_pics/thumbnails/${imageName}`;


      // Update the user's profile image in the database
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

       // If the user already has a profile image, delete the old one
       if (user.profile_image) {
        const oldImagePath = path.join(__dirname, '..', user.profile_image); // Construct the full path
        const oldThumbnailPath = path.join(__dirname, '..', user.thumbnail_image);

        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath); // Delete the old image file
        if (fs.existsSync(oldThumbnailPath)) fs.unlinkSync(oldThumbnailPath);
      }

      fs.renameSync(file.path, path.join(imageUploadFolder, imageName));
      // Generate a thumbnail
      await sharp(path.join(imageUploadFolder, imageName))
        .resize(150, 150) // Resize to 150x150 pixels
        .toFile(path.join(thumbnailFolder, imageName));


      // Update the user's profile image field
      user.profile_image = imagePath;
      user.thumbnail_image = thumbnailPath;
      await user.save();
  
      const newCsrfToken = csrfService.generateToken(req);
      // Respond with success message
     
      res.status(200).json({ message: 'Profile picture uploaded successfully', status: 'success', csrfToken: newCsrfToken, profileImage: imagePath, thumbnailImage: thumbnailPath });
    } catch (error) {
      res.status(200).json({ message: 'Profile picture uploaded successfully', status: 'error', error });
      console.log('Error uploading profile picture:', error);
      res.status(500).json({ error: 'Failed to upload profile picture' });
    }
  },

  getUserProfileView: async (req, res) => {
    try {

      //  console.log(req.user.id);return false;
      const empDetail = await User.findOne({
        where: { id: req.session.user.id },
        attributes: ['id', 'first_name', 'last_name', 'email', 'status', 'profile_image', 'thumbnail_image']
      });

      const errorMessages = "";
      return res.render("userProfile", {
        title: 'Profile',
        userDetail: empDetail,  errors: "", moment: moment
      });


    } catch (error) {
      res.status(error.status).send(error.message);
    }
  },

  editProfile: async (req, res) => {
    try {
      const errors = validationResult(req); // Collect validation errors
      const getUserData =  await User.findOne({
          where: { id: req.session.user.id }
        });

      if (!errors.isEmpty()) {
        // If validation errors exist, return to the form with error messages
        const errorMessages = errors.array().map((error) => error.msg);
        return res.render("userProfile", {
          title: "Edit Profile",
          errors: errorMessages,
          moment: moment,
          userDetail:  getUserData, // Pre-fill form with submitted data
        });
      }

      const { first_name, last_name, email } = req.body;


      // Check if the employee email already exists
      const checkEmpEmail = async (email) => {
        return await User.findOne({
          where: {
            email: email, id: { [Op.not]: req.session.user.id },
          }
        });
      };

      const emailCheck = await checkEmpEmail(email);
      if (emailCheck) {
        req.flash("error", "This email " + email + " already exists.");
        return res.redirect(`/profile/user-profile`);
      }

      // update the profile
     
      if (getUserData) {
        getUserData.first_name = first_name;
        getUserData.last_name = last_name;
        getUserData.email = email;

        await getUserData.save();
      }

      req.flash("success", "Profile updated successfully!");
      return res.redirect('/profile/user-profile');


    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to Update profile. Please try again.");
      return res.redirect('/profile/user-profile');
    }
  },
};
