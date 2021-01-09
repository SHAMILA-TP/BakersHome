var db = require('../Config/connection')
var collection = require('../Config/collections')
var objectId = require('mongodb').ObjectID

module.exports = {
    CreateCategory : (userEnteredData) => {
        return new Promise((resolve,reject)=>{
                        db.get().collection(collection.CATEGORY_COLLECTION).insertOne(userEnteredData).then((data)=>{
                           resolve(data.ops[0])
                        })
                    })
    },
    getAllCategories : () =>{
        return new Promise(async(resolve,reject)=>{
            let categories = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categories)
        })
    },
    updateCategoryByCategoryId:(categoryDetails,categoryid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).
            updateOne({ "_id": objectId(categoryid) }, {
                $set: {
                    CategoryName : categoryDetails.CategoryName,
                    CategoryCode : categoryDetails.CategoryCode
                }
            }).then(async(result, err) => {
                let modifiedCount = await result.modifiedCount
               if (modifiedCount != null)
                    resolve(modifiedCount)

            })
        })
    },
    getCategoryByCategoryId : (categoryid) =>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ "_id": objectId(categoryid) }).then((category) => {
                resolve(category)
            })
        })
    },
    deleteCategoryByCategoryId : (categoryid) =>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).
            deleteOne( {  "_id": objectId(categoryid)}).then(async(result, err) => {
                let deletedCount = await result.deletedCount
               if (deletedCount != null)
                    resolve(deletedCount)

            })
        })
    }
    }
