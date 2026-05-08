const path = require("path");
const { spawn } = require("child_process");

const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SERVER_PATH = path.join(PROJECT_ROOT, "server", "server.js");

function startServerProcess(timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [SERVER_PATH], {
            cwd: PROJECT_ROOT,
            stdio: ["ignore", "pipe", "pipe"]
        });

        let resolved = false;

        const timer = setTimeout(() => {
            if (!resolved) {
                child.kill();
                reject(new Error("Timeout: server was not started"));
            }
        }, timeoutMs);

        child.stdout.on("data", (data) => {
            const text = data.toString();

            if (text.includes("UDP-сервер запущено") && !resolved) {
                resolved = true;
                clearTimeout(timer);
                resolve(child);
            }
        });

        child.stderr.on("data", (data) => {
            const text = data.toString();

            if (text.includes("EADDRINUSE") && !resolved) {
                resolved = true;
                clearTimeout(timer);
                child.kill();
                reject(new Error("Port 4000 is already in use"));
            }
        });

        child.on("exit", (code) => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                reject(new Error(`Server exited before start. Code: ${code}`));
            }
        });
    });
}

function stopServerProcess(child) {
    return new Promise((resolve) => {
        if (!child || child.killed) {
            resolve();
            return;
        }

        child.once("exit", () => resolve());
        child.kill();

        setTimeout(() => resolve(), 500);
    });
}

module.exports = {
    PROJECT_ROOT,
    startServerProcess,
    stopServerProcess
};
