const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("./serverProcess");

const usersPath = path.join(PROJECT_ROOT, "database", "users.json");
const productsPath = path.join(PROJECT_ROOT, "database", "products.json");

let usersBackup = null;
let productsBackup = null;

function backupDatabase() {
    usersBackup = fs.readFileSync(usersPath, "utf8");
    productsBackup = fs.readFileSync(productsPath, "utf8");
}

function prepareTestDatabase() {
    const users = [
        {
            id: 1,
            login: "test",
            password: "123"
        }
    ];

    const products = [
        {
            id: 1,
            name: "Молоко",
            supermarket: "АТБ",
            price: 42.9,
            category: "Молочні продукти",
            address: "м. Харків, вул. Сумська, 102"
        },
        {
            id: 2,
            name: "Молоко",
            supermarket: "Сільпо",
            price: 45.5,
            category: "Молочні продукти",
            address: "м. Харків, просп. Науки, 9"
        },
        {
            id: 3,
            name: "Молоко",
            supermarket: "КЛАСС",
            price: 43.7,
            category: "Молочні продукти",
            address: "м. Харків, вул. Клочківська, 104А"
        },
        {
            id: 4,
            name: "Хліб",
            supermarket: "АТБ",
            price: 28.4,
            category: "Хлібобулочні вироби",
            address: "м. Харків, вул. Сумська, 102"
        }
    ];

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8");
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), "utf8");
}

function restoreDatabase() {
    if (usersBackup !== null) {
        fs.writeFileSync(usersPath, usersBackup, "utf8");
    }

    if (productsBackup !== null) {
        fs.writeFileSync(productsPath, productsBackup, "utf8");
    }
}

module.exports = {
    usersPath,
    productsPath,
    backupDatabase,
    prepareTestDatabase,
    restoreDatabase
};
