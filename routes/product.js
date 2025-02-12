
const express = require('express');
const router = express.Router();
const productController = require("../controllers/productController");
const { body } = require("express-validator");
const { isAuthenticated } = require("../middlewares/checkAuthLogin");
const uploadMiddleware = require("../services/uploadService"); // Import the multer upload function
const {verifyToken} = require("../services/csrfService");

// Define routes here
router.get('/add-product', isAuthenticated,  productController.addNewProductView);
router.get("/", isAuthenticated, productController.getProductListView);
router.get('/view-product/:id', isAuthenticated,  productController.getProductDetail);
router.get('/edit-product/:id', isAuthenticated,  productController.getProductDetail);

router.post("/ajax-list", isAuthenticated, verifyToken, productController.getAjaxProduct);

router.post('/edit-product', isAuthenticated, verifyToken,
  [
    body("title").trim().isLength({min:1}).withMessage("Please enter valid title").escape(),
    body("product_price").trim().isLength({min:1}).withMessage("Please enter valid price").escape(),
    body("product_number").trim().isLength({min:1}).withMessage("Please enter valid number").escape(),
  ],
  productController.editProduct
);

router.patch("/delete-product/:id", isAuthenticated, verifyToken, productController.deleteProduct);


router.post('/add-product',  isAuthenticated, uploadMiddleware,
  [
    body("title").trim().isLength({min:1}).withMessage("Please enter valid title").escape(),
    body("product_price").trim().isLength({min:1}).withMessage("Please enter valid price").escape(),
    body("product_number").trim().isLength({min:1}).withMessage("Please enter valid number").escape(),
  ],
  productController.addNewProduct
);

router.post(
  "/upload-product-image", 
  isAuthenticated,  // Ensure that the user is authorized
  uploadMiddleware,  // Use the upload middleware for handling file upload
  productController.uploadProductImage // New controller function for saving the uploaded image
);
// Add more routes as needed

module.exports = router;
