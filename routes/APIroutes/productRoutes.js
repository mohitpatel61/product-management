const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");
const authenticateToken = require("../../middlewares/authMiddleware");
const uploadProductPicAPImiddleware = require("../../services/uploadProductPicAPImiddleware");
console.log("req.param.id");
// Define product routes
router.get("/products", authenticateToken, productController.getProducts);
router.post("/products/create", authenticateToken, productController.createProduct);
router.get('/products/getDetail/:id', authenticateToken,  productController.productDetails);
router.post('/products/updateProduct', authenticateToken, productController.updateProductDetail);
router.delete('/products/delete/:id', authenticateToken, productController.removeProduct);
router.post('/products/updateProductImage', authenticateToken, uploadProductPicAPImiddleware, productController.updateProductImage)
module.exports = router;
