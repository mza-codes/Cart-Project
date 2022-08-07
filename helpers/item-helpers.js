var db = require('../db-connect/connectdb')
var values = require('../data')
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt');


module.exports = {

    addItem: (item, callback) => {
        item.price = parseInt(item.price)
        db.get().collection(values.ITEM_COLLECTION).insertOne(item).then((data) => {
            callback(data.insertedId)
        })
    },

    getAllItems: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(values.ITEM_COLLECTION).find({}, { sort: [['_id', 'desc']] }).toArray()
            // let products= await db.get().collection(values.ITEM_COLLECTION).find().sort({KEY:1}).toArray()
            resolve(products)
        })
    },
    delItem: (del) => {
        return new Promise((resolve, reject) => {
            db.get().collection(values.ITEM_COLLECTION).deleteOne({ _id: objectId(del) }).then((response) => {
                resolve(response)
            })
        })
    },
    getItem: (itemId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(values.ITEM_COLLECTION).findOne({ _id: ObjectID(itemId) }).then((item) => {
                resolve(item);
            })
        })
    },
    updateItem: (id, itemDetails) => {
        return new Promise((resolve, reject) => {
            let cost = parseInt(itemDetails.price)
            if (itemDetails.picture) {
                db.get().collection(values.ITEM_COLLECTION)
                    .updateOne({ _id: ObjectID(id) }, {
                        $set: {
                            name: itemDetails.name,
                            year: itemDetails.year,
                            genre: itemDetails.genre,
                            description: itemDetails.description,
                            price: cost,
                            picture: itemDetails.picture,
                        }
                    }).then((response) => {
                        resolve()
                    })
            } else {
                db.get().collection(values.ITEM_COLLECTION)
                    .updateOne({ _id: ObjectID(id) }, {
                        $set: {
                            name: itemDetails.name,
                            year: itemDetails.year,
                            genre: itemDetails.genre,
                            price: cost,
                            description: itemDetails.description,
                        }
                    }).then((response) => {
                        resolve()
                    })
            }
        })
    },
    // -------------- WebUsers Modification Section ------------------------------------------ //
    getWebUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            webusers = await db.get().collection(values.USER_COLLECTION).find({}, { sort: [['admin', 'desc']] }).toArray()
            console.log('LOGGING WEBUSERS FROM LINE 73',webusers);
            length = webusers.length
            webusers.count = length
            resolve(webusers)
        })
    },
    getUser:async(userId)=>{
        let webuser = await db.get().collection(values.USER_COLLECTION).findOne({_id:objectId(userId)})
        return webuser ;
    },
    updateUser:async(userId,userData)=>{
        userData.password = await bcrypt.hash(userData.password, 10)
        db.get().collection(values.USER_COLLECTION)
                    .updateOne({ _id: ObjectID(userId) }, {
                        $set: {
                            name: userData.name,
                            email:userData.email,
                            password:userData.password,
                            admin:userData.admin
                        }
                    })
            return true

    },
    delUser:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(values.CART_COLLECTION).deleteMany({user:objectId(userId)})
                //await db.get().collection(values.ORDER_COLLECTION).delete({_id:objectId(userId)})
                await db.get().collection(values.WISHLIST_COLLECTION).deleteMany({user:objectId(userId)})
                await db.get().collection(values.ORDER_COLLECTION)
                .updateMany({ userId: ObjectID(userId) }, {
                    $set: {
                        userAccountRemoved: true
                    }
                })
                await db.get().collection(values.CANCELLED_ORDERS)
                .updateMany({ userId: ObjectID(userId) }, {
                    $set: {
                        userAccountRemoved: true,
                        orderStatus: false
                    }
                })
            await db.get().collection(values.USER_COLLECTION).deleteOne({_id:objectId(userId)}).then(async(response)=>{
                
                console.log('logging MAINRESPONSEE',response);

                resolve(true)
            })
        })
    }
}