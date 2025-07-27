console.log(containsInvalidCharacters('test ✨'));

function containsInvalidCharacters(str) {
    const regex = /[^a-zA-Z0-9_\-<>\[\]#№!?]/;
    return regex.test(str);
}