//https请求方式: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
const {appID,appsecret} = require('../config')
const rp = require('request-promise-native')
const {writeFile,readFile} = require('fs');
const api = require('../utils/api')

class Wechat {
  constructor (){
  }
  //获取accessToken
  getAccessToken(){
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
    
    return new Promise((resolve,reject) => {
      rp({method:'GET',url,json:true})
      .then(res => {
        res.expires_in = Date.now() +(res.expires_in - 3000) * 1000;
        resolve(res)
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  saveAccessToken(accessToken){
    accessToken = JSON.stringify(accessToken)
    return new Promise((resolve,reject) => {
      writeFile('./accessToken.txt',accessToken, err => {
        if(!err){
          console.log('文件保存成功')
          resolve()
        }else{
          console.log('文件保存失败')
          reject(err)
        }
      })
    })
  }

  readAccessToken(){
    return new Promise((resolve,reject) => {
      readFile('./accessToken.txt', (err,data)=> {
        if(!err){
          console.log('文件读取成功')
          data = JSON.parse(data)
          resolve(data)
        }else{
          console.log('文件读取失败')
          reject(err)
        }
      })
    })
  }

  isValidAccessToken(data){
    if(!accessToken && !data.access_token && !data.expires_in){
      return false
    }
    return data.expires_in > Date.now()
  }

  //获取accessToken
  fetchAccessToken(){
    if(this.access_token && this.expires_in && this.isValidAccessToken(this)){
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    return this.readAccessToken()
        .then( async res => {
          if(this.isValidAccessToken(res)){
            return Promise.resolve(res)
            // resolve(res)
          }else{
            const res = await this.getAccessToken();
            await this.saveAccessToken(res);
            return Promise.resolve(res)
            // resolve(res)
          }
        })
        .catch( async err => {
          const res = await this.getAccessToken();
          await this.saveAccessToken(res);
          return Promise.resolve(res)
          // resolve(res)
        })
        .then(res => {
          this.access_token = res.access_token;
          this.expires_in = res.expires_in
          // console.log(this.access_token)
          return Promise.resolve(res)
        })
  }


//获取临时票价
  getTicket(){
    return new Promise(async (resolve,reject) => {
      const data = await this.fetchAccessToken();
      const url = `${api.ticket}&access_token=${data.access_token}`;
      // console.log("url"    +url)
      rp({method:'GET',url,json:true})
      .then(res => {
        // console.log("tk"  +  res)
        resolve({
          ticket:res.ticket,
          expires_in:Date.now() + (res.expires_in - 3000) * 1000
        })
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  saveTicket(ticket){
    ticket = JSON.stringify(ticket)
    // console.log("ticket   " + ticket)
    return new Promise((resolve,reject) => {
      writeFile('./ticket.txt',ticket, err => {
        if(!err){
          console.log('文件保存成功')
          resolve()
        }else{
          console.log('文件保存失败')
          reject(err)
        }
      })
    })
  }

  readTicket(){
    return new Promise((resolve,reject) => {
      readFile('./ticket.txt', (err,data)=> {
        if(!err&&data){
          console.log('文件读取成功')
          data = JSON.parse(data)
          resolve(data)
        }else{
          console.log('文件读取失败')
          reject(err)
        }
      })
    })
  }

  isValidTicket(data){
    if(!data && !data.ticket && !data.expires_in){
      return false
    }
    return data.expires_in > Date.now()
  }

  //获取Ticket
  fetchTicket(){
    if(this.ticket && this.ticket_expires_in && this.isValidTicket(this)){
      return Promise.resolve({
        ticket: this.ticket,
        expires_in: this.expires_in
      })
    }
    return this.readTicket()
        .then( async res => {
          if(this.isValidTicket(res)){
            return Promise.resolve(res)
            // resolve(res)
          }else{
            const res = await this.getTicket();
            await this.saveTicket(res);
            return Promise.resolve(res)
            // resolve(res)
          }
        })
        .catch( async err => {
          const res = await this.getTicket();
          // console.log("res    " + JSON.stringify(res))
          await this.saveTicket(res);
          return Promise.resolve(res)
          // resolve(res)
        })
        .then(res => {
          this.ticket = res.ticket;
          this.ticket_expires_in = res.expires_in
          return Promise.resolve(res)
        })
  }
}


module.exports = Wechat;

