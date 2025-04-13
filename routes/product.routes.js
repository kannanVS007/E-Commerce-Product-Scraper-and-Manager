const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const apiConfig = require('../config/api.config');

// Get all products with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = apiConfig.pagination.defaultLimit,
            sort = '-createdAt',
            minPrice,
            maxPrice,
            category,
            rating
        } = req.query;

        const query = {};
        
        // Apply filters
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        
        if (category) query.category = category;
        if (rating) query.rating = { $gte: Number(rating) };

        const products = await Product.find(query)
            .sort(sort)
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Product.countDocuments(query);

        res.json({
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new product
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a product
router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products by website
router.get('/website/:website', async (req, res) => {
    try {
        const products = await Product.findByWebsite(req.params.website);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products by price range
router.get('/price-range/:min/:max', async (req, res) => {
    try {
        const { min, max } = req.params;
        const products = await Product.findByPriceRange(Number(min), Number(max));
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 