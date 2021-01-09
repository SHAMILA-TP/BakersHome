var db = require('../Config/connection')
var collection = require('../Config/collections')
var objectId = require('mongodb').ObjectID

module.exports = {
            doLogin : (userEnteredData) =>{
                return new Promise(async(resolve)=>{
                let userDataFromDb = await db.get().collection(collection.ADMIN_COLLECTION).
                findOne({ 'username': userEnteredData.username ,'password' : userEnteredData.Password })
                resolve(userDataFromDb)
            })
            },
            getAllOrders : () =>{
                return new Promise(async(resolve,reject)=>{
                    let orders =await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
                    resolve(orders)
                })
            },
            getAllUsers : () =>{ //excluding blocked users
                return new Promise(async(resolve,reject)=>{
                    let users = await db.get().collection(collection.CUSTOMER_COLLECTION).find({IsBlocked : false}).toArray()
                    resolve(users)
                })
            },
            getBlockedUsers : () =>{
                return new Promise(async(resolve,reject)=>{
                    let blockedUsers = await db.get().collection(collection.CUSTOMER_COLLECTION).find({IsBlocked : true}).toArray()
                    resolve(blockedUsers)
                })
            },
            blockUserByUserId : (userid) =>{
                return new Promise((resolve,reject)=>{
                    db.get().collection(collection.CUSTOMER_COLLECTION).
                    updateOne({ "_id": objectId(userid) }, {
                        $set: {
                            IsBlocked: true
                        }
                    }).then(async(result, err) => {
                        let modifiedCount = await result.modifiedCount
                       if (modifiedCount != null)
                            resolve(modifiedCount)
        
                    })
                })
            },
            unblockUserByUserId :(userid) =>{
                return new Promise((resolve,reject)=>{
                    db.get().collection(collection.CUSTOMER_COLLECTION).
                    updateOne({ "_id": objectId(userid) }, {
                        $set: {
                            IsBlocked: false
                        }
                    }).then(async(result, err) => {
                        let modifiedCount = await result.modifiedCount
                       if (modifiedCount != null)
                            resolve(modifiedCount)
        
                    })
                })
            },
            getCollectionByMonth : ()=>{
                return new Promise(async(resolve,reject)=>{
                 let total = await   db.get().collection(collection.ORDER_COLLECTION).aggregate( [
                        {
                          $group:
                            {"_id": "$month",
                                totalAmount: { $sum:  [ "$totalPrice"]  }
                            }
                        }])
                        resolve(total)
                })
            },
            getCountsForDashboard : ()=>{
                return new Promise(async(resolve,reject)=>{
                     let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();
                     let CategoryCount = category.length;

                     let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
                     let OrderCount = orders.length;

                     let vendors = await db.get().collection(collection.VENDOR_COLLECTION).find().toArray();
                     let VendorCount = vendors.length;

                     let users = await db.get().collection(collection.CUSTOMER_COLLECTION).find().toArray();
                     let UserCount = users.length;

                     let Counts = { CategoryCount: CategoryCount,
                                     OrderCount: OrderCount,
                                    VendorCount: VendorCount,
                                    UserCount: UserCount
                                  }

                                  resolve(Counts)

                })
            }
    }
