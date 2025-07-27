const crypto = require("node:crypto");

async function getToken() {
    const resp = await fetch('http://localhost/auth/publicKey');
    const publicKey = await resp.text();

    console.log('publicKey:');
    console.log(publicKey);

    const resp2 = await fetch('http://localhost/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: encryptString(JSON.stringify({
                login: "user",
                pwd: "very strong password",
                date: Date.now()
            }), publicKey)
        }),
    });

    const token = await resp2.text();

    console.log(resp2.status);
    console.log(token);

    return token;
}

module.exports = getToken();

function encryptString(text, publicKey) {
    const key = {key: publicKey, oaepHash: "SHA512", padding: 4};
    const encrypted = crypto.publicEncrypt(key, Buffer.from(text));
    return encrypted.toString("base64");
}