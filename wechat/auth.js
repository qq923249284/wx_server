const sha1 = require('sha1')

const config = require('../config')
const {getUserDataAsync,parseXMLAsync,formatMessage} = require('../utils/tool')

module.exports = () => {
  return async (req,res,next) => {
    const {signature,echostr,timestamp,nonce} = req.query;
    const {token} = config;

    const sha1Str = sha1([timestamp,nonce,token].sort().join(''))
    
    if(req.method === 'GET'){
      if(sha1Str === signature){
        res.send(echostr)
      }else{
        res.end('err')
      }
    } else if(req.method === 'POST'){
      if(sha1Str !== signature){
        res.send('err')
        console.log(req.query)

        const xmlData = await getUserDataAsync(req)
        const jsData = await parseXMLAsync(xmlData)

        const message = formatMessage(jsData)

        //回复
        let content = '你说什么？';
        if(message.MsgType === 'text'){
          if(message.Content === '1'){
            content = '你说的是1';
          }
        }
        let replyMessage = `<xml>
          <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
          <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
          <CreateTime>${Date.now()}</CreateTime>
          <MsgType><![CDATA[text]]></MsgType>
          <Content><![CDATA[${content}]]></Content>
        </xml>`



        res.end(replyMessage)
      }
    }
  
  
  
    console.log(req.query)
  }
}