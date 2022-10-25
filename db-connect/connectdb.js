require('dotenv').config()
const mongoClient = require('mongodb').MongoClient
const state = {
    db: null
}
module.exports.connect = (connected) => {
    // const url ='mongodb://localhost:27017'
    const url = process.env.NEWDB
    const dbname = 'mza_Cart'
    // items

    mongoClient.connect(url, (err, data) => {
        if (err) return connected(err)
        state.db = data.db(dbname)
        connected()
    })
}

module.exports.get = () => {
    return state.db
}