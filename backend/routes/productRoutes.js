import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProductAdmin,
    deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, upload.array('images', 5), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProductAdmin)
    .delete(protect, deleteProduct);

export default router;
