var db = require('../db-connect/connectdb')
var values = require('../data')
const bcrypt = require('bcrypt')
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
                        if (dbuser.admin === true) {
                            admin = true
                        } else if (dbuser.admin === false) {
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
        let itemObj = {
            item: objectId(itemId),  // 'item' will be the field name in 'products' db
            quantity: 1,
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(values.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (userCart) {
                let itemExist = userCart.products.findIndex(product => product.item == itemId) // product=> not a function,instead a matching // loop to find itemexist or not // the value here represents the item is in cart or not
                console.log('LOGGING itemExist from addToCart', itemExist);
                if (itemExist != -1) {      // if value is -1 the item not in cart,there are other conditions (!= is ! =)
                    db.get().collection(values.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(itemId) },
                            {
                                $inc: { 'products.$.quantity': 1 },                                  // if item exist quantity increases by one

                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(values.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: itemObj }
                        }
                    ).then((response) => {
                        resolve()
                    })
                }
            } else {
                let cart = {
                    user: objectId(userId),
                    products: [itemObj],         // here 'products' is the field name in cart database
                }
                db.get().collection(values.CART_COLLECTION).insertOne(cart).then((response) => {
                    resolve()
                    console.log('logging cart from cart creation' + cart);
                })
            }
        })
    },

    addToWishList: (itemId, userId) => {
        let item = {
            item: objectId(itemId),
            wishdate: new Date().toLocaleString()
        }
        return new Promise(async (resolve, reject) => {
            let userWishlist = await db.get().collection(values.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            console.log('LOGGING USERWISHLIST', userWishlist);
            if (userWishlist) {
                let itemExist = userWishlist.products.findIndex(product => product.item == itemId)
                console.log('LOGGING ITEMEXIST VALUE', itemExist);

                if (itemExist != -1) {
                    resolve({ status: false })

                } else {
                    db.get().collection(values.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                        {
                            $push: { products: item }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
                }
            } else {
                let wishlist = {
                    user: objectId(userId),
                    products: [item],         // here 'products' is the field name in wishlist database
                }
                db.get().collection(values.WISHLIST_COLLECTION).insertOne(wishlist).then((response) => {
                    resolve({ status: true })
                    console.log('LOGGING WISHLIST FROM WISHLIST FUNCT.', wishlist);
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
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: values.ITEM_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()

            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(values.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log('logging cart from getCartcount function', cart);
            if (cart) {
                let count = 0
                for (let i = 0; i < cart.products.length; i++) {
                    count += cart.products[i].quantity;
                }
                resolve(count)
            } else {
                console.log('logging cartcount from cartcount false (else) state');
                count = null
                resolve(count)
            }

        })
    },
    changeQty: (data) => {
        let count = parseInt(data.count)
        let qty = parseInt(data.quantity)
        console.log(data.count);
        console.log('data first , count second');
        return new Promise((resolve, reject) => {
            console.log(qty);
            if (count == -1 && qty == 1) {
                db.get().collection(values.CART_COLLECTION)
                    .updateOne({ _id: objectId(data.cart) },
                        {
                            $pull: { products: { item: objectId(data.product) } }
                        }
                    ).then((response) => {
                        resolve({ removed: true })
                    })
            } else {
                db.get().collection(values.CART_COLLECTION)
                    .updateOne({ _id: objectId(data.cart), 'products.item': objectId(data.product) },
                        {
                            $inc: { 'products.$.quantity': count }
                        }
                    ).then((response) => {
                        console.log('logging reponse from plus/minus btn');
                        console.log(count);
                        resolve({ status: true })
                    })
            }
        })
    },
    getTotal: (userId) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(values.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                if (userCart.products.length == 0) {
                    // resolve({empty:true})
                    resolve()
                } else {
                    let totalValue = await db.get().collection(values.CART_COLLECTION).aggregate([
                        {
                            $match: { user: objectId(userId) }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $project: {
                                item: '$products.item',
                                quantity: '$products.quantity'
                            }
                        },
                        {
                            $lookup: {
                                from: values.ITEM_COLLECTION,
                                localField: 'item',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        {
                            $project: {
                                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                            }
                        }
                    ]).toArray()
                    console.log('logging total');
                    console.log(totalValue[0].total);
                    resolve(totalValue[0].total)
                }
            } else {
                resolve()
            }
        })


    },
    createOrder: (order, cartItems, total) => {
        return new Promise(async (resolve, reject) => {
            let status = order.payment === 'COD' ? true : false
            let orderObj = {
                deliveryDetails: {
                    fullname: order.fullname,
                    address: order.address,
                    landmark: order.landmark,
                    mobile: order.mobile,
                    pincode: order.pincode,
                    payment: order.payment
                },
                userId: objectId(order.userId),
                payment: order.payment,
                products: cartItems,
                totalAmount: total,
                status: status,
                orderStatus: true,
                date: new Date().toLocaleString()
            }

            db.get().collection(values.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(values.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                console.log('data insert complete, printing response');
                console.log(response);
            })
            resolve()
        })
    },
    getOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(values.ORDER_COLLECTION).find({ userId: objectId(userId) },
                { sort: [['date', 'desc']] }).toArray()
            resolve(orders)
        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderProducts = await db.get().collection(values.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            if (orderProducts) {
                console.log('LOGGING ORDER PRODUCTS', orderProducts.products);
                console.log('logging orderId from main', orderId);
                resolve(orderProducts.products)
            } else {
                resolve(null)
            }
        })

    },
    getOrderStatus: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(values.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            resolve(order)
        })
    },
    getOrderCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = null
            let order = await db.get().collection(values.ORDER_COLLECTION).find({ userId: objectId(userId), orderStatus: true }).toArray()

            if (order != 0) {
                count = order.length
                console.log('LOG FROM ORDER TRUE STATE', count);
                resolve(count)
            } else {
                // count = null
                resolve(null)
            }
        })
    },

    cancelOrder: (orderId, cancelled) => {
        return new Promise((resolve, reject) => {
            console.log('LOGGING cancelled values', cancelled);
            let cancelledOrder = {
                orderDate: cancelled.orderDate,
                reason: cancelled.reason,
                otherReason: cancelled.otherReason,
                userId: cancelled.userId,
                orderId: cancelled.orderId,
                totalCost: cancelled.totalCost,
                paymentMethod: cancelled.payment,
                cancelledProductsId: cancelled.proId,
                dateCancelled: new Date().toLocaleString()
            }
            db.get().collection(values.ORDER_COLLECTION).deleteOne({ _id: objectId(orderId) })
            db.get().collection(values.CANCELLED_ORDERS).insertOne(cancelledOrder)
            resolve()
        })
    },
    getWishlistCount: async (userId) => {
        let wishlist = await db.get().collection(values.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
        if (wishlist) {
            count = wishlist.products.length
            return count
        } else {
            return null
        }
    },
    getWishlistProducts: async (userId) => {
        return new Promise(async (resolve, reject) => {
            wishlistItems = await db.get().collection(values.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        wishdate: '$products.wishdate'
                    }
                },
                {
                    $lookup: {
                        from: values.ITEM_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, wishdate: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $sort: { wishdate: -1 }
                }

            ]).toArray()
            resolve(wishlistItems)
        })
    },
    removeFromWishlist: (proId, userId) => {
        db.get().collection(values.WISHLIST_COLLECTION)
            .updateOne({ user: objectId(userId) },
                {
                    $pull: { products: { item: objectId(proId) } }
                }
            )
        return true
    },
    getCancelledOrders: (userId) => {
        console.log('logging userIDIDIUD',userId);
        return new Promise(async (resolve, reject) => {
            
            let order = await db.get().collection(values.CANCELLED_ORDERS).find({ userId: userId },
                { sort: [['dateCancelled', 'desc']] }).toArray()
            console.log('KfdsLOGGING CANCELLED', order);
            resolve(order)
        })
    }


}