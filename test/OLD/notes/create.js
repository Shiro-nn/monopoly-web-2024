const login = require("../login");

login.then(preToken => {
    const token = JSON.parse(preToken).token;

    fetch('http://localhost/note', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            title:"test",
            desc:"hi!!"
        })
    }).then(async resp => {
        const publicKey = await resp.text();

        console.log('reply:');
        console.log(publicKey);
    })
});