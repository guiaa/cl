var express = require('express');
var router = express.Router();
var db = require("../db");
let {createToken} = require("../jwt")
/* GET home page. */

// 这是上传图片的接口
var multer = require('multer')
var router = express.Router();
router.post('/upload', multer({
  //设置文件存储路径
  dest: 'images/'
}).array('file', 1), function (req, res, next) {
  let files = req.files;
  let file = files[0];
  console.log(req.files)
  let fileInfo = {};
  let path = 'images/' + Date.now().toString() + '_' + file.originalname;
  fs.renameSync('./images/' + file.filename, path);
  //获取文件基本信息
  fileInfo.type = file.mimetype;
  fileInfo.name = file.originalname;
  fileInfo.size = file.size;
  fileInfo.path = path;
  res.json({
    code: 0,
    msg: 'OK',
    data: fileInfo
  })
});

//商品新增
router.post('/newtrade', function (req,res) {
  console.log(req.body)
  db.query("INSERT INTO trade (trade_name,trade_price,trade_class,trade_introduce,trade_img) VALUES (?,?,?,?,?)",[req.body.tradename, req.body.price, req.body.class, req.body.indro, req.body.imgpath],function(results){
    // console.log(results);
    // console.log(fields);
    res.send({msg:'新建商品成功'});
  })
})

//商品图片修改
router.post('/updatetradeimg', function (req,res) {
  db.query("SELECT trade_img FROM trade WHERE tradeid=?",[req.body.tradeid],function(results){
    fs.unlink(`./${results[0].trade_img}`, err=> {
      console.log(err)
    })
    db.query("UPDATE trade set trade_img=? WHERE tradeid=?",[req.body.imgpath, req.body.tradeid],function(results){
    // console.log(results);
    // console.log(fields);
    res.send({msg:'修改商品成功'});
  })
  })
  
})
router.post('/updatetradeval', function (req,res) {
    db.query("SELECT trade_name FROM trade WHERE tradeid=?",[req.body.tradeid],function(re){
  db.query("UPDATE trade set trade_name=?,trade_price=?,trade_class=?,trade_introduce=? WHERE tradeid=?",[req.body.tradename, req.body.price, req.body.class, req.body.indro, req.body.tradeid],function(results){
      console.log(re)
    db.query("UPDATE orders set trade_name=? WHERE trade_name=?",[req.body.tradename, re[0].trade_name],function(r){

    res.send({msg:'修改商品内容成功'});
    })
    })
    // console.log(results);
    // console.log(fields);
  })
})
//首页搜索数据的
router.post('/selet', function (req, res) {
  db.query("SELECT trade_name FROM trade where trade_name like ?",[`%${req.body.val}%`],function(results){
    console.log(results)
    res.send({data: results,msg: '查询成功'})
  })
})

// //输入框更改备选
// router.post('/selet', function (req, res) {
//   db.query("SELECT trade_name FROM trade",[],function(results){
//     let r=[]
//     for (let o = 0;o<results.length;o++){
//       r.push({value: results[o].trade_name})
//     }
//     res.send({data: r},{msg: '查询成功'})
//   })
// })
// 这是申请图片及详情的接口
const app=express()
const fs = require('fs')
router.get('/getimg', function (req, res) {
  let sort = req.query.tradename
  db.query("SELECT trade_introduce,trade_img,trade_price FROM trade WHERE trade_name=?",[sort],function(results){
    if(results.length === 0){
      res.send('无此商品')
      return
    }
  let path = `./${results[0].trade_img}`
  console.log(path)
  const data = fs.readFile(path, function (err, data) {
    if (err) {
      console.log(err)
      res.send('读取错误')
    } else {
      res.send({
        indro: results[0].trade_introduce,
        price: results[0].trade_price,
        img: data})
    }
  })
})
})
//用户购买商品的  待付款 待收货 已完成
router.post('/userbuy', function (req, res) {
  // db.query("INSERT INTO orders (id,trade_name,num,state) VALUES (?,?,?,?)",[req.user.data.id, req.body.tradename, req.body.num,''],function(results){
    console.log(req.body)
    db.query("INSERT INTO orders (id,trade_name,num,state) VALUES (?,?,?,?)",[req.user.data.id, req.body.tradename, req.body.num, '待付款'],function(results){
    res.send({
      msg: '购买成功'
    })
})
})
//加入购物车
router.post('/usershopping', function (req, res) {
  // db.query("INSERT INTO orders (id,trade_name,num,state) VALUES (?,?,?,?)",[req.user.data.id, req.body.tradename, req.body.num,''],function(results){
    console.log(req.body)
    db.query("INSERT INTO orders (id,trade_name,num) VALUES (?,?,?)",[req.user.data.id, req.body.tradename, req.body.num],function(results){
      
    res.send({
      msg: '加入成功'
    })
})
})
//从购物车购买
router.post('/shopbuy', function (req, res) {
  // db.query("INSERT INTO orders (id,trade_name,num,state) VALUES (?,?,?,?)",[req.user.data.id, req.body.tradename, req.body.num,''],function(results){
    console.log(req.body)
    for(let i =0;i<req.body.buyval.length; i++){
    db.query("UPDATE orders SET num=?, state=? WHERE orderid=?",[req.body.buyval[i].num, '待收货',req.body.buyval[i].orderid],function(results){
})}
res.send({
  msg: '购买成功'
})
})
//获取用户订单
router.get('/userorder', function (req, res) {
  // console.log(req.user.data.id)
  db.query("SELECT orders.orderid, orders.id, orders.trade_name,Orders.num,orders.state, trade.trade_price, trade_img, trade_class "+
  "FROM orders "+
  "INNER JOIN trade "+
  "ON orders.trade_name = trade.trade_name WHERE orders.id=? "+
  "ORDER BY orders.orderid",[req.user.data.id],function(results){
    
    for (let i=0; i<results.length; i++){
      let sort = results[i].trade_img
      let path = `./${sort}`
      let data = fs.readFileSync(path)
        
      results[i].trade_img =data
      // console.log(results[i].trade_img)
      
        }
    res.send({
      msg: '查找成功',
      data: results
    })
  })
})
//后台管理系统root获取用户订单
router.get('/orderback', function (req, res) {
  // console.log(req.user.data.id===1)
  if(req.user.data.id === 1){
  db.query("SELECT users.user, orders.orderid, orders.id, orders.trade_name,Orders.num,orders.state, trade.trade_price, trade_img, trade_class "+
  "FROM ((orders "+
  "INNER JOIN trade "+
  "ON orders.trade_name = trade.trade_name) INNER JOIN users ON users.id = orders.id) WHERE orders.state is not null "+
  "ORDER BY orders.orderid",[],function(results){
    
    for (let i=0; i<results.length; i++){
      let sort = results[i].trade_img
      let path = `./${sort}`
      let data = fs.readFileSync(path)
        
      results[i].trade_img =data
      // console.log(results[i].trade_img)
      
        }
        console.log(results)
    res.send({
      msg: '查找成功',
      data: results
    })
  })} else {
    res.send({
      msg: '你不是root'
    })
  }
})

//获取用户购物车
router.get('/usershop', function (req, res) {
  // console.log(req.user.data.id)
  db.query("SELECT orders.orderid, orders.id, orders.trade_name,Orders.num, trade.trade_price, trade_img, trade_class "+
  "FROM orders "+
  "INNER JOIN trade "+
  "ON orders.trade_name = trade.trade_name WHERE orders.id=?  and orders.state is null "+
  "ORDER BY orders.orderid",[req.user.data.id],function(results){
    console.log(req.user.data.id)
    for (let i=0; i<results.length; i++){
      let sort = results[i].trade_img
      let path = `./${sort}`
      let data = fs.readFileSync(path)
        
      results[i].trade_img =data
      // console.log(results[i].trade_img)
      
        }
    res.send({
      msg: '查找成功',
      data: results
    })
  })
})
//删除购物车商品
router.post('/delshop', function (req, res) {
  db.query("DELETE FROM orders WHERE orderid = ?",[req.body.orderid],function(results){
    // console.log(results);
    // console.log(fields);
    res.send({
      msg:'删除成功'
  })
})
})
//后台删除商品
router.post('/deltrade', function (req, res) {
  db.query("DELETE FROM trade WHERE trade_name = ?",[req.body.trade_name],function(results){
    // console.log(results);
     })
    db.query("SELECT trade_img FROM trade where trade_name=?",[req.body.trade_name],function(results2){
      // console.log(results2)
      // console.log(req.body.trade_name);
      fs.unlink(`./${results2[0].trade_img}`, err=> {
        console.log(err)
      })
})
    res.send({
      msg:'删除商品成功'
 
    })

})
//这是show页面获取图片的接口
router.get('/show', function (req, res) {
  db.query("SELECT trade_name,trade_img,trade_price,trade_class FROM trade",[],function(results){
    console.log(results.length)
    let i=0
    for (i; i<results.length; i++){
      let sort = results[i].trade_img
      let path = `./${sort}`
      console.log(path)
      let data = fs.readFileSync(path)
        
          // console.log(data)
          results[i].trade_img =data

        }
        // console.log(data
    // }).then(data => {
    //   results[i].trade_img =data
    //   console.log(data)
    // })
      
    
    // console.log(results)
    res.send({
      msg: '读取成功',
    data: results})
  })
})


//这是后台获取所有商品的接口
router.get('/goods', function (req, res) {
  db.query("SELECT * FROM trade",[],function(results){
    console.log(results.length)
    let i=0
    for (i; i<results.length; i++){
      let sort = results[i].trade_img
      let path = `./${sort}`
      console.log(path)
      let data = fs.readFileSync(path)
        
          // console.log(data)
          results[i].trade_img =data

        }
        // console.log(data
    // }).then(data => {
    //   results[i].trade_img =data
    //   console.log(data)
    // })
      
    
    // console.log(results)
    res.send({
      msg: '商品展示',
    data: results})
  })
})

// 管理系统的user页面
router.get('/user', function(req, res) {
  // console.log(req.headers);
  db.query("SELECT * FROM USERS",[],function(results){
    // console.log(results);
    // console.log(fields);
    res.send(JSON.stringify(results));
  })
});
// 管理系统的user删除键
router.post('/deleteUser', function(req, res) {
  // console.log(req.headers);
  console.log(req.body)
  db.query("DELETE FROM users WHERE id = ?",[req.body.id],function(results){
    // console.log(results);
    // console.log(fields);
    res.send({
      msg:'删除成功'
  });
  })
}
);
// 注册的接口
router.post('/register', function(req, res) {
    console.log(req.body)
  db.query("INSERT INTO users (user,password,phone,address) VALUES (?,?,?,?)",[req.body.user, req.body.password, req.body.phone, req.body.address],function(results){
    // console.log(results);
    // console.log(fields);
    res.send('注册成功');
  })
});

//登录的接口
router.post('/login', function(req, res) {
  db.query("SELECT user,password,id FROM USERS WHERE user=?",[req.body.user],function(results){
    console.log(results[0].password === req.body.password)
    // console.log(fields)
    if (results[0].password === req.body.password){
      let token=createToken({user: results[0].user,id: results[0].id})
      res.send({
        msg:'登录成功',
        token: token
    });
    } else {
      res.send('密码错误')
    }
  })
})
// router.get('/login', function(req, res) {
//   res.send('登录成功')
// })
// 修改密码接口
router.post('/passwordc', function(req, res) {
  console.log(req.user.data.id, req.body)
  db.query("SELECT id,password FROM USERS WHERE id=?",[req.user.data.id],function(results){
    console.log(results)
    if(results[0].password === req.body.password) {
      db.query("UPDATE users SET password=? WHERE id=?",[req.body.password2, req.user.data.id], function(resule){
        res.send({ ok: 1, msg:'修改成功'})
      })
    } else {
      res.send({ ok: 0, msg:'密码错误'})
    }
  })
})

//修改用户信息接口
router.post('/userc', function(req, res) {
  db.query("UPDATE users SET phone=?, address=?, user=? WHERE id=?",[req.body.phone, req.body.address, req.body.user, req.user.data.id], function(result) {
    res.send({msg: '修改成功'})
  })
})


//修改订单状态接口
router.post('/changestate', function(req, res) {
  db.query("UPDATE orders SET state=? WHERE orderid=?",[req.body.state, req.body.orderid], function(result) {
    res.send({msg: '修改成功'})
  })
})
//获取个人用户信息接口
router.post('/getuser', function(req, res) {
  db.query("SELECT phone,address,user FROM USERS WHERE id=?",[req.user.data.id],function(results){
    res.send({
      user: results[0].user,
      phone: results[0].phone,
      address: results[0].address
    })
  })
})

//管理系统的登录接口
router.post('/admin', function(req, res) {
  db.query("SELECT user,password,id FROM USERS WHERE user=?",[req.body.user],function(results){
    console.log(req.body.user)
    // console.log(fields);
    if (results[0].password === req.body.password && req.body.user === 'root'){
      let token=createToken({user: results[0].user,id: results[0].id})
      res.send({
        msg:'登录成功',
        token: token
    });
    } else {
      res.send({
        msg:'登陆失败'
    })
    }
    
  })
})

module.exports = router;
