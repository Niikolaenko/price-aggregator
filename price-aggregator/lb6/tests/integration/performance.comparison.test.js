const fs = require("fs");
const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { performance } = require("node:perf_hooks");

const User = require("../../../client/model/user");
const { sendUdpRequest } = require("../../helpers/udpClient");
const { startServerProcess, stopServerProcess, PROJECT_ROOT } = require("../../helpers/serverProcess");
const {
    backupDatabase,
    prepareTestDatabase,
    restoreDatabase
} = require("../../helpers/databaseBackup");

let serverProcess = null;

test.before(async () => {
    backupDatabase();
    prepareTestDatabase();
    serverProcess = await startServerProcess();
});

test.after(async () => {
    await stopServerProcess(serverProcess);
    restoreDatabase();
});

function runMockLoginRequests(iterations) {
    const mockSocket = {
        sentMessages: [],
        send(buffer, port, host, callback) {
            this.sentMessages.push({
                request: JSON.parse(buffer.toString()),
                port,
                host
            });

            callback(null);
        }
    };

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        const user = new User("test", "123");
        const request = {
            action: "login",
            data: user
        };
        const buffer = Buffer.from(JSON.stringify(request));

        mockSocket.send(buffer, 4000, "127.0.0.1", () => {});
    }

    const end = performance.now();

    return {
        timeMs: Number((end - start).toFixed(3)),
        sentCount: mockSocket.sentMessages.length
    };
}

async function runRealUdpLoginRequests(iterations) {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
        const response = await sendUdpRequest({
            action: "login",
            data: {
                login: "test",
                password: "123"
            }
        });

        assert.equal(response.success, true);
    }

    const end = performance.now();

    return {
        timeMs: Number((end - start).toFixed(3)),
        sentCount: iterations
    };
}

test("PerformanceMockObjects", async () => {

    const iterations = 5;

    const mockResult = runMockLoginRequests(iterations);
    const realResult = await runRealUdpLoginRequests(iterations);

    const report = {
        testName: "PerformanceMockObjects",
        iterations,
        mockObjects: mockResult,
        realObjects: realResult,
        conclusion: mockResult.timeMs < realResult.timeMs
            ? "Mock-objects виконуються швидше, тому що не запускають реальний UDP-сервер і не працюють з файлами JSON."
            : "У цьому запуску різниця часу не є типовою, але mock-objects все одно ізолюють тест від зовнішніх залежностей."
    };

    const outputPath = path.join(PROJECT_ROOT, "lb6", "performance-results.json");
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

    assert.equal(mockResult.sentCount, iterations);
    assert.equal(realResult.sentCount, iterations);
    assert.ok(realResult.timeMs > 0);
    assert.ok(mockResult.timeMs >= 0);
});
