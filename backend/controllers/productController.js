import Product from '../models/Product.js';
import BusinessProfile from '../models/BusinessProfile.js';

export const getProducts = async (req, res) => {
  try {
    const business = await BusinessProfile.findOne({ userId: req.user.id });
    if (!business) return res.status(404).json({ error: 'Business profile not found' });

    const products = await Product.find({ business_id: business._id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const business = await BusinessProfile.findOne({ userId: req.user.id });
    if (!business) return res.status(404).json({ error: 'Business profile not found' });

    const newProduct = new Product({
      ...req.body,
      business_id: business._id
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bulkImportProducts = async (req, res) => {
  try {
    const business = await BusinessProfile.findOne({ userId: req.user.id });
    if (!business) return res.status(404).json({ error: 'Business profile not found' });

    const productsData = req.body; // Array of formatted product objects
    
    // We expect the frontend to have grouped variants already, 
    // but we can also handle it here if needed.
    // For reliability, we'll process them one by one or use insertMany.
    
    const formattedProducts = productsData.map(p => ({
      ...p,
      business_id: business._id
    }));

    const result = await Product.insertMany(formattedProducts);
    res.status(201).json({ message: `Successfully imported ${result.length} products`, count: result.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
