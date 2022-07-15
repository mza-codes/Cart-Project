var db = require('../db-connect/connectdb')
var values = require('../data')
const bcrypt = require('bcrypt')
const { GridFSBucket } = require('mongodb')
var objectId = require('mongodb').ObjectId

module.exports = {
    recordUser(userData) {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(values.USER_COLLECTION).insertOne(userData).then((res) => {
                resolve(userData)
            })

        })

    },
    validateUser(loginData) {
        return new Promise(async (resolve, reject) => {
            let logInStatus = false
            let response = {}
            //console.log(loginData.email);
            let dbuser = await db.get().collection(values.USER_COLLECTION).findOne({ email: loginData.email })  //! important to use findOne to get desired value
            if (dbuser) {
                bcrypt.compare(loginData.password, dbuser.password).then((status) => {
                    if (status) {
                        console.log('Passwords Matched');
                        if (dbuser.admin == "true") {
                            admin = true
                        } else if (dbuser.admin == "false") {
                            admin = false
                        } else {
                            admin = false
                        }
                        response.user = dbuser
                        response.status = true
                        response.admin = admin
                        response.user.admin = admin
                        resolve(response)

                    } else {
                        console.log('Incorrect Password');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('User Does Not Exist in Databse');
                resolve({ status: false })
            }

        })
    },
    addToCart: (itemId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(values.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                db.get().collection(values.CART_COLLECTION).updateOne({ user: objectId(userId) },
                    {
                        $push: { items: objectId(itemId) }
                    }
                ).then((response) => {
                    resolve()
                })
            } else {
                let cart = {
                    user: objectId(userId),
                    items: [objectId(itemId)]
                }
                db.get().collection(values.CART_COLLECTION).insertOne(cart).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCart: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(values.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $lookup: {
                            from: values.ITEM_COLLECTION,
                            let: { prodList: '$items' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $in: ['$_id', "$$prodList"]
                                        }
                                    }
                                }
                            ],
                            as: 'cartItems'
                        }
                    }
                ]).toArray()
                resolve(cartItems[0].cartItems)   
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count = 0
            let cart = await db.get().collection(values.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count = cart.items.length
                resolve(count)
            }

        })
    }


}