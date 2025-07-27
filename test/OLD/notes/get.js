fetch('http://localhost/note?id=1').then(async resp => {
    const reply = await resp.text();

    console.log('reply:');
    console.log(reply);
})