const login = require('../login');

login.then(preToken => {
    const token = JSON.parse(preToken).token;

    fetch('http://localhost/note/find?owner=1', {
        headers: {
            'Authorization': token
        }
    }).then(async resp => {
        const reply = await resp.text();

        console.log('reply:');
        console.log(reply);
    })
})
