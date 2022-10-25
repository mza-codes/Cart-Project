var express = require('express');
var router = express.Router();
var itemHelpers = require('../helpers/item-helpers')
const fs = require('fs');
// let adminStatus = false

const verifyAdmin = (req, res, next) => {
  let status = req.session.loggedIn
  user = req.session.user
  if (status) {
    let checkadmin = req.session.user.admin
    console.log('checkadmin = ::');
    console.log(checkadmin);
    if (checkadmin) {
      adminstat = true
      next()
    } else {
      adminstat = false
      res.send('<h3> You are not an Admin to perform this action </h3>')
    }
  } else {
    res.redirect('/login')
  }
}


/* GET users listing. */
router.get('/', verifyAdmin, function (req, res) {
  let user = req.session.user
  console.log('printing req sess loggedin from /admin');
  console.log(req.session.loggedIn);
  itemHelpers.getAllItems().then((products) => {
    res.render('admin/view-items0', { products, user, adminstat })
  })
});

router.get('/add-item', verifyAdmin, (req, res) => {
  res.render('admin/add-item', { user, adminstat })
})

router.post('/add-item', verifyAdmin, (req, res) => {
  if (req.body.picture) {
    itemHelpers.addItem(req.body, (result) => {
      res.redirect('/')
    })
  } else {
    itemHelpers.addItem(req.body, (id) => {
      let image = req?.files?.poster
      if(!image){
        res.redirect('/'); // include json to display error
      }
      //console.log(id);
      image.mv('./public/poster-images/' + id + '.png', (err, done) => {
        if (!err) {
          res.redirect('/')
        } else {
          console.log(err)
        }
      })
    })
  }
})

router.get('/delete-item/:id([0-9a-fA-F]{24})', verifyAdmin, (req, res) => {
  let del = req.params.id
  //let image = req.files.poster
  console.log(del);
  itemHelpers.delItem(del).then((resp) => {
    const path = './public/poster-images/' + del + '.png'
    try {
      fs.unlinkSync(path)
      //file removed
    } catch (err) {
      console.error(err)
    }
    res.redirect('/admin/')
  })
})

router.get('/edit-item/:id([0-9a-fA-F]{24})', verifyAdmin, (req, res) => {
  //console.log(req.params.id)
  itemHelpers.getItem(req.params.id).then((item) => {
    console.log(item);
    res.render('admin/edit-item', { item, user, adminstat })
  })
})

router.post('/edit-item/:id([0-9a-fA-F]{24})', verifyAdmin, (req, res) => {
  itemHelpers.updateItem(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    let id = req.params.id
    if (req.body.picture) {
      const path = './public/poster-images/' + id + '.png'
      try {
        fs.unlinkSync(path)
        //file removed
      } catch (err) {
        console.error(err)
      }
    } else if (req.body.poster) {
      let image = req.files.poster
      image.mv('./public/poster-images/' + id + '.png')
    } else {

    }
  })
})
router.get('/users-list', verifyAdmin, async (req, res) => {
  let webusers = await itemHelpers.getWebUsers()
  user = req.session.user
  console.log('LOGGING USER', user);
  if (user.superAdmin) {
    // superUserMode = true
    res.render('admin/view-webusers', { webusers, user })
  } else {
    let message = "You're not a SuperAdmin"
    res.render('admin/view-webusers', { message, user })
  }
  console.log('LOGGINGIFSDVSZFHFSHB', webusers);
})
router.get('/edit-user/:id([0-9a-fA-F]{24})', verifyAdmin, (req, res) => {
  //console.log(req.params.id)
  itemHelpers.getUser(req.params.id).then((webuser) => {
    res.render('admin/edit-user', { webuser, user })
  })
})
router.post('/edit-user/:id([0-9a-fA-F]{24})', verifyAdmin, (req, res) => {
  if (req.body.admin === 'true') {
    req.body.admin = true
  } else {
    req.body.admin = false
  }
  console.log('LOGGING REQ.BODY.ADMIN AFTER IFF', req.body);
  itemHelpers.updateUser(req.params.id, req.body).then((stat) => {
    console.log('LOGGING STAT FROM 123GGSDA', stat);
    if (stat) {
      res.redirect('/admin/users-list')
    } else {
      res.send('failure')
    }
  })
})
router.get('/delete-user/:id([0-9a-fA-F]{24})', verifyAdmin, (req, res) => {
  let userId = req.params.id
  itemHelpers.delUser(userId).then((response) => {
    console.log('loggingfdss sdf response', response);
    res.redirect('/admin')
  })
})
router.get('/order-control/', verifyAdmin,async (req, res) => {
  user = req.session.user
  console.log('LOG FROM ORDER-CONTROL')
  let order = await itemHelpers.getFullOrder()
  console.log('LOGGING dATA XXCMAIN',order);
  res.render('admin/order-control',{user,order})
})
router.get('/pack-order/:id([0-9a-fA-F]{24})',verifyAdmin,async(req,res)=>{
  orderId = req.params.id
  console.log('LOG FROM PACK-ORDER')
  await itemHelpers.packageOrder(orderId).then(()=>{
    res.redirect('/admin/order-control')
  })
})
router.get('/ship-order/:id([0-9a-fA-F]{24})',verifyAdmin,async(req,res)=>{
  orderId = req.params.id
  console.log('LOG FROM ship x SHIP-ORDER')
  await itemHelpers.shipOrder(orderId).then(()=>{
    // res.redirect('/admin/order-control')
    res.send('SUCCESS')
  })
})
router.get('/complete-order/:id([0-9a-fA-F]{24})',verifyAdmin,async(req,res)=>{
  orderId = req.params.id
  console.log('LOG FROM ship x complete-ORDER')
  await itemHelpers.completeOrder(orderId).then(()=>{
    // res.redirect('/admin/order-control')
    res.send('SUCCESS')
  })
})





module.exports = router;
