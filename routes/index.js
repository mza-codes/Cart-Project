var express = require('express');
var router = express.Router();
var itemHelpers = require('../helpers/item-helpers')
const userHelpers = require('../helpers/user-helpers')
let adminStatus = false
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    user = req.session.user
    adminstat= req.session.user.admin
    next()
  } else {
    res.redirect('/login')
  }
}


/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let adminstat = adminStatus
  let cartCount = null
  if(user){
  cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  itemHelpers.getAllItems().then((products) => {
    res.render('index', { title: 'Life - Your Journey', products, user ,adminstat,cartCount});
  })
});

router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { 'logInErr': req.session.logInErr })
    req.session.logInErr = false
  }
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
router.get('/signup',(req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  }else{
  res.render('user/signup')
}
})
router.post('/signup', (req, res) => {
  userHelpers.recordUser(req.body).then((response) => {
    req.session.loggedIn = true
    req.session.user = response
    res.redirect('/')
  })
  // res.send('Account Creation Successful')
})
router.post('/login', (req, res) => {
  userHelpers.validateUser(req.body).then((resp) => {
    if (resp.status) {
      req.session.loggedIn = true
      req.session.user = resp.user
      adminStatus = resp.admin
      console.log('login end');
      res.redirect('/')
    } else {
      req.session.logInErr = "Invalid Username or Password !"
      res.redirect('/login')
    }
  })
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getCart(req.session.user._id)
  res.render('user/cart',{user,adminstat,products})

  
  // }else{
  //   let msg = 'Your Cart is Empty'
  //   res.render('user/cart',{user,adminstat,msg})
  // }
})

router.get('/add-to-cart/:id',(req,res)=>{
  console.log('log from get/addtocart ');
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    //res.redirect('/')
    console.log(req.params.id);
    res.json({status:true})
    
  })
})


module.exports = router;
