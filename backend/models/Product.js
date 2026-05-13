import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  quantity: {
    type: String, // e.g., "1kg", "500gms", "1 piece"
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock_status: {
    type: String,
    enum: ['In Stock', 'Out of Stock'],
    default: 'In Stock'
  }
});

const productSchema = new mongoose.Schema({
  business_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  variants: [variantSchema],
  currency: {
    type: String,
    default: 'INR'
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
