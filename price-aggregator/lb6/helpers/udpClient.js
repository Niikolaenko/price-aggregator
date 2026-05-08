const dgram = require("dgram");

const SERVER_PORT = 4000;
const SERVER_HOST = "127.0.0.1";

function sendUdpRequest(requestObject, timeoutMs = 2000) {
    return new Promise((resolve, reject) => {
        const client = dgram.createSocket("udp4");
        const message = Buffer.from(JSON.stringify(requestObject));

        const timer = setTimeout(() => {
            client.close();
            reject(new Error("Timeout: server did not respond"));
        }, timeoutMs);

        client.on("message", (responseBuffer) => {
            clearTimeout(timer);
            client.close();

            try {
                resolve(JSON.parse(responseBuffer.toString()));
            } catch (error) {
                reject(error);
            }
        });

        client.on("error", (error) => {
            clearTimeout(timer);
            client.close();
            reject(error);
        });

        client.send(message, SERVER_PORT, SERVER_HOST, (error) => {
            if (error) {
                clearTimeout(timer);
                client.close();
                reject(error);
            }
        });
    });
}

module.exports = {
    sendUdpRequest,
    SERVER_PORT,
    SERVER_HOST
};
