const express = require('express');
const app = express();

const auth = require('./wechat/auth')
const Wechat = require('./wechat/accessToken')
let wechat = new Wechat();

app.set('views','./views')
app.set('view engine','ejs')

app.get('/search',async (req,res) => {
  let noncestr = Math.random().toString().split('.')[1]
  let timestamp = Date.now();
  let {ticket} =await wechat.fetchTicket();
  console.log(ticket)
  res.render('search')
})

app.get('/tk',async (req,res) => {
  let noncestr = Math.random().toString().split('.')[1]
  let timestamp = Date.now();
  let {ticket} =await wechat.fetchTicket();
  console.log(ticket)
})


app.use(auth())

app.listen(3000,() => {console.log("服务器启动成功3000")})