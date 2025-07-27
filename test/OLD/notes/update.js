const login = require("../login");

login.then(preToken => {
    const token = JSON.parse(preToken).token;

    fetch('http://localhost/note', {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({
            id: 1,
            title:"some title 123",
            //desc:"zxc"
        })
    }).then(async resp => {
        const publicKey = await resp.text();

        console.log('reply:');
        console.log(publicKey);
    })
});