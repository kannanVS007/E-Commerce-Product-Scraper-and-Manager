const db = require('../services/database.service');

class Product {
    constructor(data) {
        this._id = data._id;
        this.name = data.name;
        this.price = data.price;
        this.description = data.description;
        this.rating = data.rating || 0;
        this.source = data.source;
        this.category = data.category;
        this.images = data.images || [];
        this.metadata = data.metadata || {};
        this.lastUpdated = data.lastUpdated || new Date().toISOString();
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }

    static async find(query = {}) {
        return await db.findProducts(query);
    }

    static async findById(id) {
        return await db.findProductById(id);
    }

    static async findByWebsite(website) {
        return await db.findProducts({ 'source.website': website });
    }

    static async findByPriceRange(min, max) {
        return await db.findProducts({
            price: {
                $gte: min,
                $lte: max
            }
        });
    }

    async save() {
        if (this._id) {
            return await db.updateProduct(this._id, this);
        } else {
            return await db.createProduct(this);
        }
    }

    async updateFromScrape(scrapedData) {
        this.name = scrapedData.name;
        this.price = scrapedData.price;
        this.description = scrapedData.description;
        this.rating = scrapedData.rating;
        this.lastUpdated = new Date().toISOString();
        return await this.save();
    }

    static async delete(id) {
        return await db.deleteProduct(id);
    }
}

module.exports = Product; 