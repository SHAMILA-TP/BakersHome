var db = require('../Config/connection')
var collection = require('../Config/collections')
var objectId = require('mongodb').ObjectID

module.exports = {

    getProductsByVendorId : (vendorid) =>{
        return new Promise(async(resolve,reject)=>{
            let products =await db.get().collection(collection.PRODUCT_COLLECTION).
            find({ "VendorId": objectId(vendorid) }).toArray()
            resolve(products)
            
            // let products =await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            //     {  $match: { "VendorId" : objectId(vendorid)} },
            //     {$lookup:
            //         {
            //           from: collection.VENDOR_COLLECTION, 
            //           localField: 'VendorId',
            //           foreignField: '_id',
            //            as: 'vendor'
            //         }
            //     },
            //    { $match:{  'vendor.IsDeleted' : "false",'vendor.IsBlocked' : "false"}}
                    
            // ]).toArray()
         
            // console.log('BBB '+JSON.stringify(products));
        })
    },
    getProductsByCategory : (categoryname) =>{
        return new Promise(async(resolve,reject)=>{
            // let products =await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()

            let products =await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {  $match: { "Category" : categoryname} },
                {$lookup:
                    {
                      from: collection.VENDOR_COLLECTION, 
                      localField: 'VendorId',
                      foreignField: '_id',
                       as: 'vendor'
                    }
                },
               { $match:{  'vendor.IsDeleted' : "false",'vendor.IsBlocked' : "false"}}
                    
            ]).toArray()
         
            console.log('BBB '+JSON.stringify(products));
         resolve(products)
        })


        // return new Promise(async(resolve,reject)=>{
        //     let products =await db.get().collection(collection.PRODUCT_COLLECTION).
        //     find({ "Category" : categoryname}).toArray()
        //     resolve(products)
        // })
    },
    addProduct : (product) => {
        return new Promise((resolve,reject)=>{
            product.VendorId = objectId(product.VendorId)
                        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then(async(data)=>{
                           productId = await data.ops[0]._id
                            resolve(productId)
                           // resolve(data.ops[0])
                        })
                    })
    },
    deleteProductByProductId : (productid) =>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).
            deleteOne( {  "_id": objectId(productid)}).then(async(result, err) => {
                let deletedCount = await result.deletedCount
               if (deletedCount != null)
                    resolve(deletedCount)

            })
        })
    },
    getAllProducts :()=>{
        return new Promise(async(resolve,reject)=>{
            // let products =await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()

            let products =await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {  $match: { IsBlocked:"false",IsDeleted : "false"} },
                {$lookup:
                    {
                      from: collection.PRODUCT_COLLECTION,
                      localField: '_id',
                      foreignField: 'VendorId',
                       as: 'productdetails'
                    }
                },
                { $unwind : '$productdetails'},
                {   $project : {
                _id :'$productdetails._id',
                // name :1,
                ProductName :'$productdetails.ProductName',
                Category :'$productdetails.Category',
                Description :'$productdetails.Description',
                Price : '$productdetails.Price'}}
                    
            ]).toArray()
             
        // $lookup: {
        //         from: collection.VENDOR_COLLECTION,
        //         let: { vendor: '$VendorId' ,status : '$IsBlocked'},
        //         // pipeline: [{
        //         //     $match: {
        //         //         $expr: { $eq: ["$_id", "$$vendor"] }
        //         //     }
        //         // }],
        //         pipeline: [
        //             { $match: {
        //                $expr: {
        //                       $cond: [ 
        //                           { $and : [ 
        //                              { $eq: ["$_id", "$$vendor"] },
        //                              { $eq: [ "$$status","true" ] }
        //                               ]},
        //                              1,0]
        //               }
        //             }
        //             }
        //         ]
        //         , as: 'products'
        //     }
       
            // ,
            // $project : {
            //     _id :1,
            //     ProductName :1,
            //     Category :1,
            //     Description :1,
            //     Price : 1}
               

            // $lookup: {
            //     from: collection.VENDOR_COLLECTION,
            //     let: { vendor: '$VendorId' },
            //     pipeline: [{
            //         $match: {
            //             $expr: { $eq: ["$_id", "$$vendor"] }
            //         }
            //     }],
            //     as: 'products'
            // }
            // $project : {
            //     _id :1,
            //     ProductName :1,
            //     Category :1,
            //     Description :1,
            //     Price : 1}
       

            // let products =await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([{
            //     // $lookup: {
            //     //     from: collection.VENDOR_COLLECTION,
            //     //    pipeline: [{
            //     //         $match: {
            //     //             $expr: { $eq: ['$IsBlocked', 'true'] } 
            //     //         }
            //     //     }],
            //     //     as: 'vendor'
            //     // }
            //     $lookup:
            //     {
            //       from: collection.VENDOR_COLLECTION,
            //       localField: 'VendorId',
            //       foreignField: '_id',
            //        as: 'vendordetails',
            //     //   "$match": {
            //     //     "IsBlocked": 'true'
            //     },
            //     $match : { IsBlocked : 'true' }

                
            // }]).toArray()
            console.log(products);
        //  console.log('yo'+products[0].productdetails[0]);
            resolve(products)
        })
    },
    addToCart: (productid, userid) => {
        let prodObj = {
            item: objectId(productid),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userid) })

            if (userCart) {
                let productExists = userCart.products.findIndex(product => product.item == productid)

                if (productExists != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user : objectId(userid),'products.item': objectId(productid) },
                        { $inc: { 'products.$.quantity': 1 } }).then((response) => { resolve(false) })// As item is already there status sets to false so that cart count will not be updated

                }
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userid) },
                        { $push: { products: prodObj } }
                    ).then((response) => { resolve(true) })//itemInsertedStatus setting to true
                }

            }
            else {
                let cartObj = {
                    user: objectId(userid),
                    products: [prodObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((result) => {
                    resolve(true)
                })
            }
        })
    },
    getCartProducts: (userid) => {
        return new Promise(async (resolve, reject) => {
            let CartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                $match: { user: objectId(userid) }
            },{ $unwind : '$products'},
            {$project : {item : '$products.item', quantity : '$products.quantity'}},
            { $lookup: {from : collection.PRODUCT_COLLECTION,localField : 'item',foreignField : '_id',as:'products'}},
            //  { $project :{  itemtotal: {$multiply : [{ '$toInt': '$quantity'},{ '$toInt': '$product.Price'}]}}},
            {$project : {item :1,quantity : 1,product:{$arrayElemAt:['$products',0]},category:'$products.Category',vendorId:'$products.VendorId'}},
         
            { $lookup:
               {
                 from: collection.VENDOR_COLLECTION,
                 localField: 'vendorId',
                 foreignField: '_id',
                 as: 'Vendor'
               }}
               ,{
                   $project :{
                    item :1,//productid
                    quantity : 1,
                    _id         : 1,//cartid
                    product     :1,
                   // ProductName : '$product.ProductName',
                    VendorName  : '$Vendor.name'
                    // itemtotal :1
        
                   }
               }
        /*     {//join
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    let: { productList: '$products' },
                    pipeline: [{
                        $match: {
                            $expr: { $in: ['$_id', "$$productList"] }
                        }
                    }],
                    as: 'cartItems'
                }
            } */
            ]).toArray()
        console.log("cartitems:----"+JSON.stringify (CartItems[0]));
            resolve(CartItems)
        })
    },
    getTotalAmount :(userid)=>{
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                $match: { user: objectId(userid) 
                }
            },{
                 $unwind : '$products'
                },
            {$project : {
                item : '$products.item', 
                quantity : '$products.quantity'}},
            { $lookup: {
                from : collection.PRODUCT_COLLECTION,localField : 'item',foreignField : '_id',
                as:'product'}},
            {$project : {
                item :1,
                quantity : 1,
                product:{$arrayElemAt:['$product',0]}
                // {$project :{  itemtotal: {$multiply : [{ '$toInt': '$quantity'},{ '$toInt': '$product.Price'}]},
            }},
            {$group :{
                _id   : null,
               total :{$sum:{$multiply : [{ '$toInt': '$quantity'},{ '$toInt': '$product.Price'}]}}}
            },
         //   {$project :{ukkiuo9uihb total : ['$quantity',('$product.Price')]}}
           
            ]).toArray()
           // console.log(total[0].total);
if(total[0]!=null)
{
    console.log('------------'+JSON.stringify(total[0]));
    resolve(total[0].total)
}
else{
    total =0
    resolve(total)
}
          
        })
    },
    changeProductQuantity : (details)=>{
        details.countValue = parseInt(details.countValue)//{cartId,productId,count}
        details.quantity = parseInt(details.quantity)
console.log('------------COUNTVALUE = '+details.countValue+'-----Quantity = '+ details.quantity);

        return new Promise((resolve,reject)=>{
            if(details.countValue == -1 && details.quantity == 1){
console.log('if case');


                db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id : objectId(details.cartID)},
                {
                    $pull:{products:{item:objectId(details.proID)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
            }
            else{

                console.log('else case');
     db.get().collection(collection.CART_COLLECTION).updateOne({ _id : objectId(details.cartID),'products.item': objectId(details.proID) },
     { $inc: { 'products.$.quantity': details.countValue } }).then(()=>{
        resolve(true)
      })
    }
 })
     },
     removeProductFromCart : (details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({ _id : objectId(details.cartID)},
            {
                $pull:{products:{item:objectId(details.proID)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        })
     },
     getProductByProductId : (productid) =>{
        return new Promise(async(resolve,reject)=>{
            let p =await db.get().collection(collection.PRODUCT_COLLECTION).
            find({ "_id": objectId(productid) }).toArray()

let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
   { $match: {
        "_id": objectId(productid)
    }},
    { $lookup:
       {
         from: collection.VENDOR_COLLECTION,
         localField: 'VendorId',
         foreignField: '_id',
         as: 'Vendor'
       }},
       {
           $project :{
            _id         : 1,
            ProductName : 1,
            Category    : 1,
            Description : 1,
            Price       : 1,
            VendorId    : 1,
            VendorName  : '$Vendor.name'

           }
       }
    
]
).toArray()
       resolve(product)
        })
    },
    getLatest3Products : () =>{ //for home page
        return new Promise(async(resolve,reject)=>{
         //   let products =await db.get().collection(collection.PRODUCT_COLLECTION). find().limit(3).toArray()
            let products =await db.get().collection(collection.VENDOR_COLLECTION).aggregate([
                {  $match: { IsBlocked:"false",IsDeleted : "false"} },
                {$lookup:
                    {
                      from: collection.PRODUCT_COLLECTION,
                      localField: '_id',
                      foreignField: 'VendorId',
                       as: 'productdetails'
                    }
                },
                { $unwind : '$productdetails'},
                {   $project : {
                _id :'$productdetails._id',
                // name :1,
                ProductName :'$productdetails.ProductName',
                Category :'$productdetails.Category',
                Description :'$productdetails.Description',
                Price : '$productdetails.Price'}}
                    
            ]).limit(3).toArray()
            resolve(products)
        })
    }


}