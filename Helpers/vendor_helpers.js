var db = require('../Config/connection')
var collection = require('../Config/collections')
var objectId = require('mongodb').ObjectID

module.exports = {
    CreateVendor : (userEnteredData) => {
        return new Promise((resolve,reject)=>{
                        db.get().collection(collection.VENDOR_COLLECTION).insertOne(userEnteredData).then(async(data)=>{
                           console.log('-------DAAATA : --------'+data);
                          vendorId = await data.ops[0]._id
                            resolve(vendorId)
                        })
                    })
    },
   
    getAllVendors : () =>{
        return new Promise(async(resolve,reject)=>{
            let vendors =await db.get().collection(collection.VENDOR_COLLECTION).find({IsDeleted : 'false',IsBlocked : 'false'}).toArray()
            resolve(vendors)
        })
    },
    getLatest4Vendors : () =>{
        return new Promise(async(resolve,reject)=>{
            let vendors =await db.get().collection(collection.VENDOR_COLLECTION).find({IsDeleted : 'false',IsBlocked : 'false'}).limit(4).toArray()
            resolve(vendors)
        })
    },
    getBlockedVendors : () =>{
        return new Promise(async(resolve,reject)=>{
            let vendors =await db.get().collection(collection.VENDOR_COLLECTION).find({IsBlocked : 'true'}).toArray()
            resolve(vendors)
        })
    },
    getVendorByVendorId : (vendorid) =>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.VENDOR_COLLECTION).findOne({ "_id": objectId(vendorid) }).then((Vendor) => {
                resolve(Vendor)
            })
        })
    },
    updateVendorByVendorId : (vendorDetails,vendorid)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.VENDOR_COLLECTION).
                updateOne({ "_id": objectId(vendorid) }, {
                    $set: {
                        name: vendorDetails.name,
                        category: vendorDetails.category,
                        Description: vendorDetails.Description,
                        Address: vendorDetails.Address,
                        city: vendorDetails.city,
                        district: vendorDetails.district,
                        zip: vendorDetails.zip,
                        email: vendorDetails.email,
                        phone: vendorDetails.phone,
                        contactPerson: vendorDetails.contactPerson
                        
                    }
                }).then(async(result, err) => {
                    let modifiedCount = await result.modifiedCount
                    if (modifiedCount != null)
                        resolve(modifiedCount)

                })
            })
    },
    deleteVendorByVendorId:(vendorid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.VENDOR_COLLECTION).
            updateOne({ "_id": objectId(vendorid) }, {
                $set: {
                    IsDeleted: 'true'
                }
            }).then(async(result, err) => {
                let modifiedCount = await result.modifiedCount
               if (modifiedCount != null)
                    resolve(modifiedCount)

            })
        })
    },
    blockVendorByVendorId:(vendorid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.VENDOR_COLLECTION).
            updateOne({ "_id": objectId(vendorid) }, {
                $set: {
                    IsBlocked: 'true'
                }
            }).then(async(result, err) => {
                let modifiedCount = await result.modifiedCount
               if (modifiedCount != null)
                    resolve(modifiedCount)

            })
        })
    },
    unblockVendorByVendorId:(vendorid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.VENDOR_COLLECTION).
            updateOne({ "_id": objectId(vendorid) }, {
                $set: {
                    IsBlocked: 'false'
                }
            }).then(async(result, err) => {
                let modifiedCount = await result.modifiedCount
               if (modifiedCount != null)
                    resolve(modifiedCount)

            })
        })
    },
    vendorDoLogin : (userEnteredData)=>{
            return new Promise(async(resolve)=>{
            let vendorDataFromDb = await db.get().collection(collection.VENDOR_COLLECTION).
            findOne({ 'username': userEnteredData.username ,'password' : userEnteredData.Password,IsDeleted : 'false',IsBlocked : 'false' })
            resolve(vendorDataFromDb)
            })
    },
    getOrdersByVendorID : (vendorId)=>{
        return new Promise(async(resolve, reject) => {
            // { "_id": objectId(vendorid) }
       let orders =     db.get().collection(collection.ORDER_COLLECTION).find({"isDelivered": { $exists: null, $ne: true }}).toArray()
//        let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
//             { $match: { _id: objectId('5fe6e1e1c8f33e333415ff81') }},
//         { $unwind : '$products'},
//     {$project : {item : '$products.item'}},
//     // { $match: { VendorId: objectId(vendorId) }},
//     { $lookup: {from : collection.PRODUCT_COLLECTION,localField : 'item',foreignField : '_id',as:'products'}},
//    // {$project : {item :1,quantity : 1,product:{$arrayElemAt:['$products',0]}}}
//     {$project : {date :1,totalPrice:1,deliveryDetails:1,paymentMethod:1,status:1}}

//     ]).toArray()
 // var x=  JSON.stringify(orders)
//console.log('-----------test :'+orders[0].totalPrice);

       resolve(orders)
        })
    },
    getAllOrdersByVendorID : (vendorId)=>{
        return new Promise(async(resolve, reject) => {
            // { "_id": objectId(vendorid) }
       let orders =     db.get().collection(collection.ORDER_COLLECTION).find({"isDelivered": { $exists: true, $ne: null }}).toArray()
       resolve(orders)
        })
    },
    salesReport : (vendorid)=>{
       return new Promise(async(resolve, reject) => {
            console.log('svjsdv'+vendorid);
            // { "_id": objectId(vendorid) }
    //    let orders =     db.get().collection(collection.ORDER_COLLECTION).find().toArray()
    //    resolve(orders)

       let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
        //    { $match: { _id: objectId(orderId) } },
           { $unwind : '$products'},
    {$project : {item : '$products.item', quantity : '$products.quantity',totalPrice:1 }},
    { $lookup: {from : collection.PRODUCT_COLLECTION,localField : 'item',foreignField : '_id',as:'products'}},
    {$project : {item :1,quantity : 1,product:{$arrayElemAt:['$products',0]},vendorId:'$products.VendorId',totalPrice:1}},
    {$match :{vendorId :objectId(vendorid) }},
    { $lookup:
        {
          from: collection.VENDOR_COLLECTION,
          localField: 'vendorId',
          foreignField: '_id',
          as: 'Vendor'
        }} ,
        // { $match:{  'Vendor._id' : vendorid}},  
        {
            $project :{
            _id         : 1,
              product     :1,
            // ProductName : '$product.ProductName',
             VendorName  : '$Vendor.name'
             ,totalPrice:1  ,
             quantity :1
            }
        }

    ]).toArray()
   console.log('order : '+JSON.stringify(orders));
    


   resolve(orders)









        })
    },
    changeOrderStatus : (orderId,status)=>{

        if(status != "Delivered")
        {
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: objectId(orderId)},
            {$set :{
                status : status
            }}
            )
        }
        else{//if delivered
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: objectId(orderId)},
            {$set :{
                status : status,
                isDelivered : true
            }}
            )
        }
    },
    getBestSellers :()=>{
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                // { $match: { user: objectId(userid)        } },
            {
                 $unwind : '$products'
                },
            {$project : {
                item : '$products.item', 
                quantity : '$products.quantity'}},
            { $lookup: {
                from : collection.PRODUCT_COLLECTION,localField : 'item',foreignField : '_id',
                as:'product'}},
            {$project : {
                _id :1,
                item :1,
                quantity : 1,
                product:{$arrayElemAt:['$product',0]}
                // {$project :{  itemtotal: {$multiply : [{ '$toInt': '$quantity'},{ '$toInt': '$product.Price'}]},
            }},
            {$group :{
                _id   : '$item',
               total :{$sum:'$quantity'}}
            },
         //   {$project :{ukkiuo9uihb total : ['$quantity',('$product.Price')]}}
           {$project :{_id :1,total:1}}
            ]).toArray()
           // console.log(total[0].total);

//            console.log('------------'+JSON.stringify(total));
// if(total[0]!=null)
// {
//     console.log('------------'+JSON.stringify(total));
//     resolve(total[0].total)
// }
// else{
//     total =0
//     resolve(total)
// }
          
        })
    }
    }
