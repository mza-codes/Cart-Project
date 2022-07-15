var db = require('../db-connect/connectdb')
var values = require('../data')
const { ObjectID } = require('bson')
var objectId = require('mongodb').ObjectId


module.exports = {

    addItem: (item, callback) => {
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
            if (itemDetails.picture) {
                db.get().collection(values.ITEM_COLLECTION)
                    .updateOne({ _id: ObjectID(id) }, {
                        $set: {
                            name: itemDetails.name,
                            year: itemDetails.year,
                            genre: itemDetails.genre,
                            description: itemDetails.description,
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
                            description: itemDetails.description,
                        }
                    }).then((response) => {
                        resolve()
                    })
            }
        })
    }

}