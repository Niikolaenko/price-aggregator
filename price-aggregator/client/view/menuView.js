class MenuView {
    showMenu() {
        console.log("\n=== МЕНЮ КЛІЄНТА ===");
        console.log("1. Реєстрація");
        console.log("2. Авторизація");
        console.log("3. Показати всі товари");
        console.log("4. Пошук товару");
        console.log("5. Додати товар");
        console.log("0. Вийти");
    }

    showServerResponse(response) {
        console.log("\nВідповідь від сервера:");
        console.log(response);
    }

    showError(message) {
        console.log("Помилка:", message);
    }

    showExitMessage() {
        console.log("Клієнт завершив роботу.");
    }

    showInvalidChoice() {
        console.log("Невірний вибір.");
    }
}

module.exports = MenuView;