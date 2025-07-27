const crypto = require("node:crypto");

fetch('http://localhost/auth/publicKey').then(async resp => {
    const publicKey = await resp.text();

    console.log('publicKey:');
    console.log(publicKey);

    const resp2 = await fetch('http://localhost/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: encryptString(JSON.stringify({
                login: "user",
                pwd: "very strong password",
                name: "zxcursed",
                date: Date.now()
            }), publicKey)
        }),
    });
    console.log(resp2.status);
    console.log(await resp2.text());
})

function encryptString(text, publicKey) {
    const key = {key: publicKey, oaepHash: "SHA512", padding: 4};
    const encrypted = crypto.publicEncrypt(key, Buffer.from(text));
    return encrypted.toString("base64");
}