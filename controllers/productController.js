
const { winston, error } = require("winston");
const { validationResult, check } = require("express-validator");
const fs = require('fs');
const moment = require("moment");
const csrfService = require('../services/csrfService'); // Import CSRF service
const { User, Product, Sequelize } = require("../models");
const { EmptyResultError, json, Op, where } = require("sequelize");
const sharp = require("sharp");
const path = require("path");
const imageUploadFolder = path.join(__dirname, '..', 'uploads', 'products');
const thumbnailFolder = path.join(imageUploadFolder, 'thumbnails');


module.exports = {
  getAjaxProduct: async (req, res) => {
  
      try {
  
        // console.log("req================",req);return false;
     
  
        const draw = parseInt(req.body.draw) || 1; // DataTable draw counter
        const start = parseInt(req.body.start) || 0; // Start index
        const length = parseInt(req.body.length) || 10; // Records per page
        const searchValue = req.body.search || ''; // Search value
        const orderColumn = req.body.order?.[0]?.column || 0; // Ordered column index
        const orderDir = req.body.order?.[0]?.dir || 'asc'; // Order direction (asc/desc)
        const columns = ['created_at', 'title', 'product_price', 'product_number']; // Define columns for ordering
  
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
              { title: { [Sequelize.Op.like]: `%${searchValue}%` } },
              { product_price: { [Sequelize.Op.like]: `%${searchValue}%` } },
              { product_number: { [Sequelize.Op.like]: `%${searchValue}%` } },
            ],
          }
          : {};
  
        // Fetch products with pagination
        const { count, rows } = await Product.findAndCountAll({
          where: { ...whereClause },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id','first_name', 'last_name']  
            }
          ],
          attributes: ['id', 'title', 'product_number', 'product_price', 'created_at', 'status'],
          order: [[columns[orderColumn] || 'created_at', orderDir]],
          limit,
          offset,
        });
  
        // Format rows for DataTables
        const data = rows.map((product) => ({
          id: product.id,
          title: `${product.title}`,
          price: product.product_price,
          createdBy: `${product.user.first_name} ${product.user.last_name} `,
          product_number: product.product_number,
          created_at: new Date(product.created_at).toLocaleString(),
          status: product.status,
  
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

  getProductListView: async (req, res) => {
      try {
         res.render("products/product-list",
          {
            title: "Products"
          }
        )
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
  },

  addNewProductView: async (req, res) => {
    try {
       res.render("products/add-product",
        {
          title: "Add product",
          errors: req.flash("error") || "",  // Ensure flash errors are passed
          success: req.flash("success") || "",
          productData: req.body
        }
      )
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  addNewProduct: async (req, res) => {
    try {
        const errorsData = validationResult(req);
        if (!errorsData.isEmpty()) {
            return res.render("products/add-product", {
                title: "Add product",
                errors: errorsData.mapped(),
                productData: req.body
            });
        }
        // Multer Upload Middleware Execution

        let imagePath = "";
        let thumbnailPath = "";

        if (req.file) {
          const imageName = req.file.filename;
          imagePath = `/uploads/products/${imageName}`;
          thumbnailPath = `/uploads/products/thumbnails/${imageName}`;
    
          // Generate Thumbnail
          await sharp(req.file.path)
            .resize(150, 150) // Resize to 150x150 pixels
            .toFile(path.join(thumbnailFolder, imageName));
        }

            const { title, product_price, product_number, description } = req.body;
          console.log("req.body -----------", req.body);
            // Check if product number already exists
            const checkProductNumber = await Product.findOne({
                where: { product_number: product_number }
            });

            if (checkProductNumber) {
                req.flash("error", `Product number ${product_number} already exists`);
                return res.redirect("/products/add-product");
            }

          

            // Save the product data
            await Product.create({
                title : title,
                product_number : product_number,
                product_price : product_price,
                description : description,
                created_by: req.session.user.id,
                product_image: imagePath,
                thumbnail_image: thumbnailPath
            });

            req.flash("success", "Product has been added successfully");
            return res.redirect("/products");
        

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  },

   
  deleteProduct: async (req, res) => {

    try {
   
      const productId = req.params.id;
      const productData = await Product.findOne({
        where: {id : productId}
       });
       
      if(!productData){
        req.flash("error", `This product Number ${product_number} is not found`);
        return res.redirect("/products");
       }

       await productData.destroy();
       const newCsrfToken = csrfService.generateToken(req);

       return res.json({
         success: true,
         message: 'Product marked as deleted successfully',
         csrfToken: newCsrfToken // Send new CSRF token in response
       });
    } catch (error) {
      
    }
  },
   
  getProductDetail : async (req, res) => {
    try {
        
        const productDetails = await Product.findOne({
          where: {id: req.params.id},
          include :[
            {
              model: User,
              as: "user",
              attributes: ['id','first_name', 'last_name']
            }
          ]
        });
        
        if(!productDetails){
          req.flash("error", "Product not found");
          return res.redirect("/products");

        }

        if(req.query.type === "view"){
          res.render("products/product-detail", {
            title: "Product View",
            productDetails : productDetails,

          })
        }

        if(req.query.type === "edit"){
          res.render("products/product-edit", {
            title: "Edit Product",
            productData : productDetails,
            errors: ""
          })
        }

    } catch (error) {
      req.flash("error", `Error occured when get data ${$error.message}`);
      return res.redirect("/products");
    }
  },
  
  editProduct: async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("error", "Validation failed! Please check your inputs.");
            return res.redirect(`/products/edit-product/${req.body.productId}?type=edit`);
        }

        const { title, product_price, product_number, description, productId } = req.body;
        const parsedProductId = parseInt(productId);

        const productDetails = await Product.findOne({ where: { id: parsedProductId } });

        if (!productDetails) {
            req.flash("error", "Product not found");
            return res.redirect("/products");
        }

        const checkCode = await Product.findOne({
            where: { id: { [Op.not]: parsedProductId }, product_number: product_number }
        });

  
        if (checkCode) {
            req.flash("error", `Product code ${product_number} already exists`);
            return res.redirect(`/products/edit-product/${productId}?type=edit`);
        }

        productDetails.title = title;
        productDetails.product_number = product_number;
        productDetails.product_price = product_price;
        productDetails.description = description;
        await productDetails.save();

        req.flash("success", "Product has been updated successfully");
        return res.redirect("/products");
    } catch (error) {
        console.error("Error updating product:", error);
        req.flash("error", `Error occurred: ${error.message}`);
        return res.redirect("/products");
    }
  },

  uploadProductImage: async (req, res) => {
    try {

      const productId = req.body.productId; // Get the user ID from the session or JWT token
      const file = req.file; // Assuming you're using multer
     
      if (!file) {
        return res.status(400).send('No file uploaded');
      }

      // Generate a new filename using current timestamp (or you can use UUID or any other strategy)
      const imageName = moment().valueOf() + path.extname(file.originalname).toLowerCase();
      const imagePath = `/uploads/products/${imageName}`; // This is the path to store in the database
      const thumbnailPath = `/uploads/products/thumbnails/${imageName}`;

      // Update the user's profile image in the database
      const product = await Product.findOne({ where: { id: productId } });
      if (!product) {
        return res.status(404).json({ error: 'product not found' });
      }
     
       // If the user already has a profile image, delete the old one
       if (product.product_image) {
        const oldImagePath = path.join(__dirname, '..', product.product_image); // Construct the full path
        const oldThumbnailPath = path.join(__dirname, '..', product.thumbnail_image);
        
        if (fs.existsSync(oldImagePath))
          { 
          fs.unlinkSync(oldImagePath);
          } // Delete the old image file
        if (fs.existsSync(oldThumbnailPath)) { 
          fs.unlinkSync(oldThumbnailPath);
          }
      }

      fs.renameSync(file.path, path.join(imageUploadFolder, imageName));
      // Generate a thumbnail
      await sharp(path.join(imageUploadFolder, imageName))
        .resize(150, 150) // Resize to 150x150 pixels
        .toFile(path.join(thumbnailFolder, imageName));


      // Update the user's profile image field
      product.product_image = imagePath;
      product.thumbnail_image = thumbnailPath;
      await product.save();
  
      const newCsrfToken = csrfService.generateToken(req);
      // Respond with success message
     
      res.status(200).json({ message: 'Product image uploaded successfully', status: 'success', csrfToken: newCsrfToken, profileImage: imagePath, thumbnailImage: thumbnailPath });
    } catch (error) {
      res.status(200).json({ message: 'Profile picture uploaded successfully', status: 'error', error });
      console.log('Error uploading profile picture:', error);
      res.status(500).json({ error: 'Failed to upload profile picture' });
    }
  },

};
