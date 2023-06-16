const sarlib = require('@500historias/sarlib');

(() => { 
    sarlib.init({uuid: '', secretKey: ''}, () => {
        console.log('Sarlib is ready!');
    });
})();