const test = require("node:test");
const assert = require("node:assert/strict");

const { sendUdpRequest } = require("../../helpers/udpClient");
const { startServerProcess, stopServerProcess } = require("../../helpers/serverProcess");
const {
    backupDatabase,
    prepareTestDatabase,
    restoreDatabase
} = require("../../helpers/databaseBackup");

let serverProcess = null;
let token = null;

test.before(async () => {
    backupDatabase();
    prepareTestDatabase();
    serverProcess = await startServerProcess();
});

test.after(async () => {
    await stopServerProcess(serverProcess);
    restoreDatabase();
});

async function getToken() {
    if (token) return token;

    const response = await sendUdpRequest({
        action: "login",
        data: {
            login: "test",
            password: "123"
        }
    });

    token = response.token;
    return token;
}

test("RegisterNewUser", async () => {

    const request = {
        action: "register",
        data: {
            login: "new_user",
            password: "111"
        }
    };

    const response = await sendUdpRequest(request);

    assert.equal(response.success, true);
    assert.equal(response.message, "Реєстрація успішна");
});

test("RegisterExistingUser", async () => {

    const request = {
        action: "register",
        data: {
            login: "new_user",
            password: "111"
        }
    };

    const response = await sendUdpRequest(request);

    assert.equal(response.success, false);
    assert.equal(response.message, "Користувач з таким логіном уже існує");
});

test("LoginValidUser", async () => {

    const request = {
        action: "login",
        data: {
            login: "test",
            password: "123"
        }
    };

    const response = await sendUdpRequest(request);

    assert.equal(response.success, true);
    assert.equal(response.message, "Авторизація успішна");
    assert.equal(typeof response.token, "string");
    assert.ok(response.token.length > 0);

    token = response.token;
});

test("ProductsWithoutToken", async () => {

    const request = {
        action: "getAllProducts",
        data: {}
    };

    const response = await sendUdpRequest(request);

    assert.equal(response.success, false);
    assert.equal(response.message, "Користувач не авторизований");
});

test("SearchProduct", async () => {

    const authToken = await getToken();
    const request = {
        action: "searchProduct",
        token: authToken,
        data: {
            name: "Молоко"
        }
    };

    const response = await sendUdpRequest(request);

    assert.equal(response.success, true);
    assert.equal(response.products.length, 3);
    assert.equal(response.products[0].price, 42.9);
    assert.equal(response.products[1].price, 43.7);
    assert.equal(response.products[2].price, 45.5);
});
