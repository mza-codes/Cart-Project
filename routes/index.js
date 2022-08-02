var express = require('express');
var router = express.Router();
var itemHelpers = require('../helpers/item-helpers')
const userHelpers = require('../helpers/user-helpers')
let adminStatus = false
let cartCount = null
let orderCount = null
const verifyLogin = async(req, res, next) => {
  if (req.session.loggedIn) {
    user = req.session.user
    adminstat = req.session.user.admin
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let orderCount = await userHelpers.getOrderCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(user._id)
    user.wishlistCount = wishlistCount
    user.cartCount = cartCount
    user.orderCount = orderCount
    console.log('up prinitning cartCountlogging USER from MAIN',user);
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
  if (user) {
    console.log('looking for user cart');
    user.cartCount = await userHelpers.getCartCount(req.session.user._id)
    user.orderCount = await userHelpers.getOrderCount(req.session.user._id)
    user.wishlistCount = await userHelpers.getWishlistCount(user._id)
    itemHelpers.getAllItems().then((products) => {
      console.log(user);
      res.render('index', { title: 'Life - Your Journey', products, user, adminstat});
    })
  }else{
  itemHelpers.getAllItems().then((products) => {
    console.log(user);
    res.render('index', { title: 'Life - Your Journey', products, user, adminstat});
  })
}
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
router.get('/signup', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
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

router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelpers.getCart(req.session.user._id)
  // cartCount = await userHelpers.getCartCount(req.session.user._id)
  let total = await userHelpers.getTotal(req.session.user._id)
  // orderCount = await userHelpers.getOrderCount(req.session.user._id)
  if (req.session.user.cartCount) {
    res.render('user/cart', { user, adminstat, products,total })
  } else {
    let msg = 'Your Cart is Empty'
    res.render('user/cart', { user, adminstat, products, cartCount, msg ,orderCount})
  }
})

router.get('/add-to-cart/:id([0-9a-fA-F]{24})', (req, res) => {
  console.log('log from get/addtocart ');
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})

router.get('/add-to-wishlist/:id([0-9a-fA-F]{24})',async(req,res)=>{
  console.log('LOGGING STEP 1')
  proId = req.params.id
  userId = req.session.user._id
  await userHelpers.addToWishList(proId,userId).then((response)=>{
    console.log('LOGGING RESPONSE FROM 112',response);
    res.json(response)

  })
  console.log('COMPLETE');
})

router.post('/changeQty', (req, res, next) => {
  userHelpers.changeQty(req.body).then(async (response) => {
    response.total = await userHelpers.getTotal(req.body.user)
    res.json(response)
  })
})

router.get('/place-order', verifyLogin, async (req, res) => {  //add this option in cart > checkout/place order button
  total = await userHelpers.getTotal(req.session.user._id)
  // orderCount = await userHelpers.getOrderCount(req.session.user._id)
  let deliveryDetails = null
  deliveryDetails = await userHelpers.getOrder(req.session.user._id)
  address = deliveryDetails[0]
  date = new Date().toLocaleString()
  res.render('user/order-form', { user: req.session.user, total, date,address })
})

router.post('/place-order', async (req, res) => {
  console.log(req.body);
  let cart = await userHelpers.getCart(req.body.userId)
  let totalAmount = await userHelpers.getTotal(req.body.userId)
  userHelpers.createOrder(req.body, cart, totalAmount).then((response) => {
    res.render('user/order-status',{user:req.session.user})
  })

})

router.get('/orders', verifyLogin, async (req, res) => {
  order = await userHelpers.getOrder(req.session.user._id)
  // orderCount = await userHelpers.getOrderCount(req.session.user._id)
  // cartCount = await userHelpers.getCartCount(req.session.user._id)
  let cancelled=true
  res.render('user/view-orders',{user:req.session.user,order,cancelled})
})

router.get('/view-order-details/:id([0-9a-fA-F]{24})',verifyLogin,async(req,res)=>{
  // res.send(req.params)
  let orderProducts= await userHelpers.getOrderProducts(req.params.id)
  console.log('LOGGING ORDERPRODUCTS FROM INDEX.JS',orderProducts);
  // let orderCount = await userHelpers.getOrderCount(req.session.user._id)
  let orderStatus= await userHelpers.getOrderStatus(req.params.id)
  res.render('user/order-details',{user:req.session.user,orderProducts,orderStatus})
})

router.post('/cancel-order/',verifyLogin,async(req,res)=>{
  await userHelpers.cancelOrder(orderId,req.body)
  console.log('LOGGING REQ.BODY');
  console.log(req.body);
  res.redirect('/orders')
})

router.get('/cancel-form/:id([0-9a-fA-F]{24})',verifyLogin,async(req,res)=>{
  orderId=req.params.id
  order = await userHelpers.getOrderStatus(orderId)
  console.log('LOGGING ORDER ',order);
  res.render('user/reason',{user:req.session.user,orderId,order})
})

router.get('/wishlist',verifyLogin,async(req,res)=>{
  user = req.session.user
  wishlist = await userHelpers.getWishlistProducts(user._id)
  console.log('LOGGING WISHLIST AGGREGATION',wishlist);
  res.render('user/wishlist',{user,wishlist})
})

module.exports = router;
