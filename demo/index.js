const SarLib = require("@500historias/sarlib");
const express = require('express')
const app = express()
const port = 3000

app.use(SarLib.useExpress({uuid: '', secretKey: '', testMode: true}))


app.get('/', (req, res) => {
    req.sar.getUser(12).then((user) => {
    console.log(user);
    res.send(user);
  }).catch((err) => {
    res.send(err);
  });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });