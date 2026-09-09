import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        condition: {
            type: String,
            enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
            required: true,
        },
        images: [
            {
                url: { type: String, required: true },
                public_id: { type: String, required: true },
            },
        ],
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        listingType: {
            type: String,
            enum: ['Sell', 'Rent', 'Both'],
            required: true,
        },
        price: {
            type: Number,
            required: function () {
                return this.listingType === 'Sell' || this.listingType === 'Both';
            }
        },
        rentPrice: {
            type: Number,
            required: function () {
                return this.listingType === 'Rent' || this.listingType === 'Both';
            }
        },
        status: {
            type: String,
            enum: ['Available', 'Sold', 'Rented', 'Unavailable'],
            default: 'Available',
        },
        stock: {
            type: Number,
            default: 1,
            min: 1,
        },
        approvalStatus: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

// Add index for search
productSchema.index({ title: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
