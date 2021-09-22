const jwt = require("jsonwebtoken")
const secret = "secret12345";
let createToken = (data,expiresIn)=>{//创建token的方法
    let obj = {};
    obj.data = data || {};//存入token的数据
    obj.ctime = (new Date()).getTime();//token的创建时间
    obj.expiresIn = 1000*60*60*24*7//设定的过期时间
    let token = jwt.sign(obj,secret)
    return token;
}
let varifyToken = (token)=>{//验证token是否合法的方法
    let result = null;
    try{
        let {data,ctime,expiresIn} = jwt.verify(token,secret);
        let nowTime = (new Date()).getTime();
        if(nowTime-ctime<expiresIn){
            result = data;        
        }
    }catch(error){

    }
    //console.log(result)
    return result;
}

module.exports = {createToken,varifyToken};