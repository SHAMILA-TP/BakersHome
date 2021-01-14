var db = require('../Config/connection')
var collection = require('../Config/collections')
var objectId = require('mongodb').ObjectID
const RazorPay = require('razorpay');
const { promises } = require('fs');
const { resolve } = require('path');

var instance = new RazorPay({
    key_id: 'rzp_test_QQvxpqHuyrqGLM',
    key_secret: 'uXazrPpwb9Y4j5l5kNFXxcP4',
  });
module.exports = {
    customerSignUp: (customerData) => {
        return new Promise(async (resolve, reject) => {
            customerData.IsBlocked = false
           // customerData.Password = await bcrypt.hash(customerData.Password, 10);
            db.get().collection(collection.CUSTOMER_COLLECTION).insertOne(customerData).then((data) => {
                resolve(data.ops[0]);
            })
        })
    },
    customerDoLogin : (userEnteredData)=>{
        return new Promise(async(resolve)=>{
        let customerDataFromDb = await db.get().collection(collection.CUSTOMER_COLLECTION).
        findOne({ 'username': userEnteredData.username ,'password' : userEnteredData.Password , IsBlocked : false})
        resolve(customerDataFromDb)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async(resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            let count = 0
            if (cart) {
                count = cart.products.length
            }
            console.log('count '+count);
            resolve(count)
        })
    },
    placeOrder: (orderDetails,products,totalPrice)=>{

            return new Promise((resolve,reject)=>{
                 // console.log(orderDetails,products,totalPrice);
                 let status = orderDetails.PaymentMethod === 'COD'?'placed':'pending'

                 let orderObj = {
                     deliveryDetails :{
                         mobile : orderDetails.Mobile,
                         address :orderDetails.Address,
                         pincode :orderDetails.PinCode
                     },
                     userId : objectId(orderDetails.userid),
                     paymentMethod : orderDetails.PaymentMethod,
                     products : products,
                     status : status,
                     totalPrice : totalPrice,
                     date : new Date()
                 }
 
                 db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                     let orderid = response.ops[0]._id;
                     console.log('insert'+orderid);
                     //  db.get().collection(collection.CART_COLLECTION).removeOne({user:objectId(orderDetails.userid)})
                    
                    resolve(orderid)
                 })
            })
    },
    removeCart : (userId)=>{
        db.get().collection(collection.CART_COLLECTION).removeOne({user:objectId(userId)})
    },
    getCartProductList : (userId)=>{

        return new Promise(async(resolve,reject)=>{
            console.log('userId'+userId);
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            console.log(cart);
            resolve(cart.products)
        })
    },
    getCustomerOrders : (userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray();
       console.log('---orders: '+orders);
       resolve(orders)
       
        })
    },
    getOrderProdcuts : (orderId)=>{
                return new Promise(async(resolve,reject)=>{
                    let orderedProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                        $match: { _id: objectId(orderId) }
                    },{ $unwind : '$products'},
                    {$project : {item : '$products.item', quantity : '$products.quantity'}},
                    { $lookup: {from : collection.PRODUCT_COLLECTION,localField : 'item',foreignField : '_id',as:'products'}},
                    {$project : {item :1,quantity : 1,product:{$arrayElemAt:['$products',0]}}}
               
                    ]).toArray()
                   resolve(orderedProducts)
                })
    },
    //-----ONLINE PAYMENT
    generateRazorPay : (orderId,totalPrice)=>{
            return new Promise((resolve,reject)=>{
                var options = {
                    amount: totalPrice*100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: ""+orderId
                  };
                  instance.orders.create(options, function(err, order) {
                    console.log(order);
                    resolve(order)
                  });
            })
    },
    verifyPayment : (details)=>{
        console.log('----helper');
            return new Promise((resolve,reject)=>{
                const crypto = require('crypto')//Loading the crypto module in node.js
                let hmac = crypto.createHmac('sha256', 'uXazrPpwb9Y4j5l5kNFXxcP4');//creating hmac object 
                hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']); //passing the data to be hashed
                hmac=hmac.digest('hex');
               
                if(hmac == details['payment[razorpay_signature]']){
                    console.log('----match');
                        resolve()
                }
                else{
                    console.log('----,mismatch');
                    reject()
                }
            })
    },
    changePaymentStatus : (orderId)=>{
        db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: objectId(orderId)},
            {$set :{
                status : 'placed'
            }}
            )
            // return new promise((resolve,reject)=>{
            //     console.log('-----endhe');
            //     console.log("----------Orderid: ",orderId);
            //     db.get().collection(collection.ORDER_COLLECTION).updateOne({_id: objectId(orderId)},
            //     {$set :{
            //         status : 'placed'
            //     }}
            //     ).then(()=>{
            //         resolve(true)
            //     })
            // })
            
    },
    getCustomerDeliveryDetailsById :(userId)=>{
        return new Promise(async(resolve)=>{
            let addressDetails = await db.get().collection(collection.ORDER_COLLECTION).
            findOne({userId:objectId(userId)})
         //   find({userId:objectId(userId)}).sort({_id:-1}).limit(1);
            resolve(addressDetails)
            
            })
    },
    addAddress: (address, pincode,mobile,userid) => {
        let addressObj = {
            address: address,
            pincode: pincode,
            mobile : mobile
        }
        return new Promise(async (resolve, reject) => {
            console.log(userid);
            //let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userid) })
            let user = await db.get().collection(collection.CUSTOMER_COLLECTION).findOne({ _id: objectId(userid) })
           //let userm =  db.get().collection(collection.CUSTOMER_COLLECTION).find({_id: objectId(userid)}).project({ _id : 1}).toArray()
          //  let user =  db.get().collection(collection.CUSTOMER_COLLECTION).find({_id: objectId(userid)}).project({ addresses : 1}).toArray()
          //  let user =  db.get().collection(collection.CUSTOMER_COLLECTION).find({_id: objectId(userid)},{ "addresses": { $exists: true, $ne: null } })
           // console.log('user '+JSON.stringify(user)  );
           console.log('user : '+ JSON.stringify(user));
         console.log('addre '+user.addresses);
             if (user.addresses) {
                let addressExists =user.addresses.findIndex(address => address.address == address)
                let pincodeExists =user.addresses.findIndex(address => address.pincode == pincode)
                let mobileExists =user.addresses.findIndex(address => address.mobile == mobile)

                console.log('address existstance : '+addressExists);
                console.log('pin existstance : '+pincodeExists);
                console.log('mob existstance : '+mobileExists);
                // var output = user.addresses.filter(function(value){ return value.pincode==pincode})
                // console.log('output : '+output);
              //  let productExists = userCart.products.findIndex(product => product.item == productid)
               
                console.log('exi---:'+addressExists);
                // if (addressExists != -1) {
                //     db.get().collection(collection.CART_COLLECTION).updateOne({ user : objectId(userid),'products.item': objectId(productid) },
                //         { $inc: { 'products.$.quantity': 1 } }).then((response) => { resolve(false) })// As item is already there status sets to false so that cart count will not be updated

                // }
                if ( pincodeExists == -1 || mobileExists == -1) {
                    db.get().collection(collection.CUSTOMER_COLLECTION).updateOne({ _id: objectId(userid) },
                        { $push: { addresses: addressObj } }
                    ).then((response) => { resolve(true) })//itemInsertedStatus setting to true
                }

             }
            else {
console.log('else');
console.log(addressObj);
                db.get().collection(collection.CUSTOMER_COLLECTION)
                .updateOne({_id : objectId(userid)},
                    { $set :{
                        addresses :[addressObj]
                    }}
                    ).then((result) => {
                        console.log(result);
                        console.log(result.modifiedCount);
                    resolve(true)
                })
            }
        })
    },
    getUserDetails :(userId)=>{
         return new Promise(async(resolve,reject)=>{
            let userDetails = await db.get().collection(collection.CUSTOMER_COLLECTION).
            findOne({_id:objectId(userId)})
            resolve(userDetails)
         })
    }
    //----Vendor Request
    ,sendVendorRequest:(userEnteredData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.VENDOR_REQUEST_COLLECTION).insertOne(userEnteredData).then(async(data)=>{
                reqId=await data.ops[0]._id
                resolve(reqId)
            })
        })

      
    }

    }
