const test = require("node:test");
const assert = require("node:assert/strict");

const ClientController = require("../../../client/controller/clientController");

function createControllerForUnitTest() {
    const controller = new ClientController();

    try {
        controller.rl.close();
    } catch (error) {}

    try {
        controller.client.close();
    } catch (error) {}

    controller.view = {
        showError: () => {},
        showExitMessage: () => {},
        showMenu: () => {},
        showServerResponse: () => {},
        showInvalidChoice: () => {}
    };

    controller.showMenu = () => {};

    return controller;
}

test("CheckAuthorization", () => {

    const controller = createControllerForUnitTest();
    controller.token = "valid-token";

    const result = controller.checkAuthorization();

    assert.equal(result, true);
});
