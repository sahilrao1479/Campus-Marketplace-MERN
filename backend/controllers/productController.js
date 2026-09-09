import Product from '../models/Product.js';

// @desc    Fetch all products with pagination and filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.pageNumber) || 1;

        const keyword = req.query.keyword
            ? {
                $text: { $search: req.query.keyword }
            }
            : {};

        const filter = { ...keyword };

        if (req.query.category) {
            filter.category = req.query.category;
        }
        if (req.query.condition) {
            filter.condition = req.query.condition;
        }
        if (req.query.type) {
            filter.listingType = { $in: [req.query.type, 'Both'] };
        }

        // Only show approved/available on public endpoints unless specified otherwise
        if (!req.query.adminView) {
            filter.approvalStatus = 'Approved';
            filter.status = 'Available';
        }

        let query = Product.find(filter).populate('category', 'name').populate('seller', 'name email');

        if (req.query.sort) {
            if (req.query.sort === 'newest') {
                query = query.sort({ createdAt: -1 });
            } else if (req.query.sort === 'priceLowToHigh') {
                query = query.sort({ price: 1 });
            } else if (req.query.sort === 'priceHighToLow') {
                query = query.sort({ price: -1 });
            }
        } else {
            query = query.sort({ createdAt: -1 });
        }

        const count = await Product.countDocuments(filter);
        const products = await query.limit(pageSize).skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('seller', 'name email');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }

        const {
            title,
            description,
            category,
            condition,
            listingType,
            price,
            rentPrice,
            stock,
        } = req.body;

        // Images are added via req.files (local disk storage in dev)
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        const images = req.files ? req.files.map(file => ({
            url: `${backendUrl}/uploads/${file.filename}`,
            public_id: file.filename
        })) : [];

        const product = new Product({
            title,
            description,
            category,
            condition,
            listingType,
            price: price || 0,
            rentPrice: rentPrice || 0,
            stock: stock ? Number(stock) : 1,
            seller: req.user._id,
            images,
            approvalStatus: 'Pending',
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product (approval etc)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProductAdmin = async (req, res) => {
    try {
        const { approvalStatus, status } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            if (approvalStatus) product.approvalStatus = approvalStatus;
            if (status) product.status = status;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Must be owner or admin
            if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to delete this product' });
            }

            await Product.findByIdAndDelete(req.params.id);
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
