var express = require('express');
var router = express.Router();
var itemHelpers = require('../helpers/item-helpers')
const fs = require('fs')
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
    res.render('admin/view-items', { products, user,adminstat })
  })
});

router.get('/add-item', verifyAdmin, (req, res) => {
  res.render('admin/add-item', {user,adminstat})
})

router.post('/add-item', verifyAdmin, (req, res) => {
  if (req.body.picture) {
    itemHelpers.addItem(req.body, (result) => {
      res.send('Successful By URL')
    })
  } else {
    itemHelpers.addItem(req.body, (id) => {
      let image = req.files.poster
      //console.log(id);
      image.mv('./public/poster-images/' + id + '.png', (err, done) => {
        if (!err) {
          res.send('Success By Upload')
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
    res.render('admin/edit-item', { item,user,adminstat })
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
    } else if(req.body.poster) {
      let image = req.files.poster
      image.mv('./public/poster-images/' + id + '.png')
    }else{
      
    }
  })
})
module.exports = router;
