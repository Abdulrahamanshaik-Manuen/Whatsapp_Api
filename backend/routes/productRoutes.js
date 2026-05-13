import express from 'express'; 
import { getProducts, createProduct, updateProduct, deleteProduct, bulkImportProducts } from '../controllers/productController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getProducts);
router.post('/', createProduct);
router.post('/bulk', bulkImportProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
