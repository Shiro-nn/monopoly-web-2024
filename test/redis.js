const {createClient} = require('redis');

createClient({
    url: 'redis://localhost:6379'
})
    .on('error', err => console.log('Redis Client Error', err))
    .once('connect', () => console.log('Подключен к Redis'))
    .connect()
    .then(async cl => {
        console.log(cl);

        console.log(await cl.hExists('register:', 'code'))
        console.log(await cl.hGet('register:', 'code'))

        await cl.hSet('register:', 'obj', JSON.stringify({'ss': 'zxc', 'zxc':'loli'}));
        console.log(await cl.hGet('register:', 'obj'))
    });