const express = require('express');
const app = express();

const auth = require('./wechat/auth')
const Wechat = require('./wechat/accessToken')
let wechat = new Wechat();

app.set('views','./views')
app.set('view engine','ejs')

app.get('/search',async (req,res) => {
  const noncestr = Math.random().split('.')[1]
  const timestamp = Date.now();
  const {ticket} =await wechat.fetchTicket();

  res.render('search')
})

app.use(auth())

app.listen(3000,() => {console.log("服务器启动成功3000")})