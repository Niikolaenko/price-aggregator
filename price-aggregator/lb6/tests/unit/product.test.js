const test = require("node:test");
const assert = require("node:assert/strict");

const Product = require("../../../client/model/product");

test("ProductData", () => {

    const data = {
        name: "Молоко",
        supermarket: "АТБ",
        price: 42.9,
        category: "Молочні продукти",
        address: "м. Харків, вул. Сумська, 102"
    };

    const product = new Product(
        data.name,
        data.supermarket,
        data.price,
        data.category,
        data.address
    );

    assert.equal(product.name, data.name);
    assert.equal(product.supermarket, data.supermarket);
    assert.equal(product.price, data.price);
    assert.equal(product.category, data.category);
    assert.equal(product.address, data.address);
});
