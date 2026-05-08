const test = require("node:test");
const assert = require("node:assert/strict");

const User = require("../../../client/model/user");

test("ValidUser", () => {

    const login = "student";
    const password = "12345";

    const user = new User(login, password);

    assert.equal(user.login, login);
    assert.equal(user.password, password);
});
