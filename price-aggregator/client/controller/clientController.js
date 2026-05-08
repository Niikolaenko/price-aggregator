const dgram = require("dgram");
const readline = require("readline");

const User = require("../model/user");
const Product = require("../model/product");
const MenuView = require("../view/menuView");

class ClientController {
    constructor() {
        this.client = dgram.createSocket("udp4");
        this.serverPort = 4000;
        this.serverHost = "127.0.0.1";
        this.view = new MenuView();

        this.token = null;
        this.pollingInterval = null;

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.client.on("message", (message) => {
            const response = JSON.parse(message.toString());

            if (response.success && response.token) {
                this.token = response.token;
                this.startPolling();
            }

            this.view.showServerResponse(response);
            this.showMenu();
        });
    }

    start() {
        this.showMenu();
    }

    sendRequest(requestObject) {
        const message = Buffer.from(JSON.stringify(requestObject));

        this.client.send(message, this.serverPort, this.serverHost, (error) => {
            if (error) {
                this.view.showError(error.message);
            }
        });
    }

    startPolling() {
        if (this.pollingInterval) return;

        this.pollingInterval = setInterval(() => {
            if (!this.token) return;

            this.sendRequest({
                action: "getAllProducts",
                token: this.token,
                data: {}
            });
        }, 5000);
    }

    checkAuthorization() {
        if (!this.token) {
            this.view.showError("Спочатку потрібно авторизуватися.");
            this.showMenu();
            return false;
        }

        return true;
    }

    showMenu() {
        this.view.showMenu();

        this.rl.question("Оберіть дію: ", (choice) => {
            switch (choice) {
                case "1":
                    this.registerUser();
                    break;
                case "2":
                    this.loginUser();
                    break;
                case "3":
                    this.getAllProducts();
                    break;
                case "4":
                    this.searchProduct();
                    break;
                case "5":
                    this.addProduct();
                    break;
                case "0":
                    this.closeClient();
                    break;
                default:
                    this.view.showInvalidChoice();
                    this.showMenu();
            }
        });
    }

    registerUser() {
        this.rl.question("Введіть логін: ", (login) => {
            this.rl.question("Введіть пароль: ", (password) => {
                const user = new User(login, password);

                this.sendRequest({
                    action: "register",
                    data: user
                });
            });
        });
    }

    loginUser() {
        this.rl.question("Введіть логін: ", (login) => {
            this.rl.question("Введіть пароль: ", (password) => {
                const user = new User(login, password);

                this.sendRequest({
                    action: "login",
                    data: user
                });
            });
        });
    }

    getAllProducts() {
        if (!this.checkAuthorization()) return;

        this.sendRequest({
            action: "getAllProducts",
            token: this.token,
            data: {}
        });
    }

    searchProduct() {
        if (!this.checkAuthorization()) return;

        this.rl.question("Введіть назву товару: ", (name) => {
            this.sendRequest({
                action: "searchProduct",
                token: this.token,
                data: { name }
            });
        });
    }

    addProduct() {
        if (!this.checkAuthorization()) return;

        this.rl.question("Назва товару: ", (name) => {
            this.rl.question("Супермаркет: ", (supermarket) => {
                this.rl.question("Ціна: ", (price) => {
                    this.rl.question("Категорія: ", (category) => {
                        this.rl.question("Адреса: ", (address) => {
                            const product = new Product(
                                name,
                                supermarket,
                                price,
                                category,
                                address
                            );

                            this.sendRequest({
                                action: "addProduct",
                                token: this.token,
                                data: product
                            });
                        });
                    });
                });
            });
        });
    }

    closeClient() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.view.showExitMessage();
        this.rl.close();
        this.client.close();
    }
}

module.exports = ClientController;