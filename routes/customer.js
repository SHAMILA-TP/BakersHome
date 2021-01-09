var express = require('express');
var messages = require('../Config/messages')
const customerHelpers = require('../Helpers/customer_helpers');
const vendor_helpers = require('../Helpers/vendor_helpers');
const product_helpers = require('../Helpers/product_helpers');
const customer_helpers = require('../Helpers/customer_helpers');


var otpGenerator = require('otp-generator');
const category_helpers = require('../Helpers/category_helpers');
var OTP = null;

// const Noty = require('noty');
//import swal from 'sweetalert';


var router = express.Router();

var cartCount = null;

//var springedge = require('springedge');

// const SendOtp = require('sendotp');
// const sendOtp = new SendOtp('AuthKey');
/*------- Common : verify login ---*/
const verifyLogin = (req, res, next) => {
  req.session.admin = null;
  req.session.vendor = null;
    if (req.session.customer) {
      next()
    } else {
     res.redirect('/login')
    }
  }

 //----------------------- LOGIN, LOGOUT-------------------
/*Get Login page*/
router.get('/login', (req, res) => {

//OTP = otpGenerator.generate(6, { upperCase: false, specialChars: false });
                 
   if (req.session.customer) {
      res.redirect('/')
    }
    else {
      res.render('Customer/customer-Login', { customerloginErr: req.session.customerloginErr, customerloginErrCaption: req.session.customerloginErrCaption })
    }
    req.session.customerloginErr = null
    req.session.customerloginErrCaption = null
  })

router.post('/login', (req, res) => {
   customerHelpers.customerDoLogin(req.body).then((customerData)=>{
      if(customerData!= null)
      {
        req.session.customer = customerData
        res.redirect('/')
      }
   
     else{
        req.session.customerloginErrCaption = messages.LoginErrMsg_Caption// "Login Failed!"
         req.session.customerloginErr = messages.LoginErrMsg//"Incorrect EmailId or Password"
         res.render('Customer/customer-Login', { customerloginErr: req.session.customerloginErr, customerloginErrCaption: req.session.customerloginErrCaption })
         req.session.customerloginErr = null
         req.session.customerloginErrCaption = null
     }
    })
})

router.get('/logout', (req, res) => {
    req.session.customer = null// req.session.destroy()
    res.redirect('/login')
  })

//------------HOME--------------------------------------------
router.get('/',verifyLogin,async function(req, res, next) {
  req.session.admin = null;
  req.session.vendor = null;
    if (req.session.customer) {
      req.session.loginErr = false
      req.session.loginErrCaption = false
      // vendor_helpers.getAllVendors().then((vendors)=>{
      //   res.render('Customer/customer-home',{vendors,customerlog:true})
      //  })
     // let cartCount = null
      if (req.session.customer) {
       cartCount = await customerHelpers.getCartCount(req.session.customer._id)
      }

      res.render('Customer/customer-home',{customerlog:true,cartCount})
     } else {
        res.redirect('/login')
       }
  })

  router.get('/bakers',verifyLogin,(req,res)=>{
    vendor_helpers.getAllVendors().then(async(vendors)=>{

      if (req.session.customer) {
        cartCount = await customerHelpers.getCartCount(req.session.customer._id)
       }
        res.render('Customer/Bakers',{vendors,customerlog:true,cartCount})
       })
   // res.render('Customer/customer-home',{vendors,customerlog:true})
  })

  router.get('/products',verifyLogin,async(req,res)=>{
    
    product_helpers.getAllProducts().then(async(products)=>{
      if (req.session.customer) {
        cartCount = await customerHelpers.getCartCount(req.session.customer._id)
       }
       let categories = await category_helpers.getAllCategories();
       res.render('Customer/Products',{products,customerlog:true,cartCount,categories})
       })
   // res.render('Customer/customer-home',{vendors,customerlog:true})
  })

//------------------CART--------------------

/*Get cart page*/
router.get('/cart', verifyLogin, async (req, res) => {
 let products = await product_helpers.getCartProducts(req.session.customer._id)
  let No_of_products = products.length

  if(No_of_products == 0){
    res.render('Customer/EmptyCart',{customerlog:true})
  }
else{
  let total = await product_helpers.getTotalAmount(req.session.customer._id)
  res.render('Customer/cart', { products, user: req.session.customer._id,customerlog:true,total,No_of_products })
}
})

/*Add to cart*/
router.get('/AddToCart/:id', verifyLogin, (req, res) => {
  let productId = req.params.id
  product_helpers.addToCart(productId, req.session.customer._id).then((itemInsertedStatus) => {
   res.json({status:itemInsertedStatus}) // res.redirect('/')
   })
 })

 router.post('/changeProductQuantity',(req,res,next)=>{
  product_helpers.changeProductQuantity(req.body).then((response)=>{
   // response = await product_helpers.getTotalAmount(req.body.user)
 // res.render('Customer/customer-home',{customerlog:true,cartCount:8})
   res.json(response)
   })
  })

  router.post('/removeProduct',(req,res,next)=>{
 product_helpers.removeProductFromCart(req.body).then((response)=>{
   res.json(response)
     })
    })
// -------------------ORDER----------------------
router.post('/verify_Payment',verifyLogin,(req,res)=>{
 
customerHelpers.verifyPayment(req.body).then(()=>{
 
  customerHelpers.changePaymentStatus(req.body['order[receipt]'])
  res.json({status:true})
  // customerHelpers.changePaymentStatus(req.body['order[receipt]']).then((response)=>{
  //   console.log('change starts : '+response);
  //   res.json({status:true})
  // })
}).catch((err)=>{
  res.json({status:false})//'Payment failed'
})
})

router.post('/place_Order',async(req,res)=>{
let userid = req.body.userid
let products = await customerHelpers.getCartProductList(req.body.userid)
let totalPrice = await product_helpers.getTotalAmount(req.body.userid)

console.log('products : ',products);
console.log('totalPrice : ',totalPrice);
customerHelpers.placeOrder(req.body,products,totalPrice).then((orderid)=>{
console.log(req.body);
console.log(req.body['PaymentMethod']);
console.log('orderid'+orderid);
  if(req.body['PaymentMethod'] === 'COD')
  {
customerHelpers.removeCart(userid)
    res.json({cod_success:true})//status
  }
 else //Online payment
 {
  customerHelpers.generateRazorPay(orderid,totalPrice).then((order)=>{
    customerHelpers.removeCart(userid)
      res.json(order)
  })
 }
customer_helpers.addAddress(req.body.Address,req.body.PinCode,req.body.Mobile,req.session.customer._id)

})
 
})

router.get('/placeOrder',verifyLogin,async(req,res)=>{
    console.log('order place called');
    console.log(req.session.customer._id);
  let total = await product_helpers.getTotalAmount(req.session.customer._id)
  let customer = req.session.customer;
//let addressDetails = await  customer_helpers.getCustomerDeliveryDetailsById(req.session.customer._id)
let userDetails = await customerHelpers.getUserDetails(req.session.customer._id)

let addresses = null;
if(userDetails.addresses != null)
{
  addresses = reverseArray(userDetails.addresses)
   console.log('size = '+userDetails.addresses.length );
  if(userDetails.addresses.length >1)
  {
    res.render('Customer/PlaceOrder',{customerlog:true,total,customer,addressDetails:addresses[0],addresses:addresses})
  
  }
  if(userDetails.addresses.length ==1)  {
    res.render('Customer/PlaceOrder',{customerlog:true,total,customer,addressDetails:addresses[0]})
  }
 }
 else{
  res.render('Customer/PlaceOrder',{customerlog:true,total,customer})
 }



 })

 function reverseArray(arr) {
  var newArray = [];
  for (var i = arr.length - 1; i >= 0; i--) {
    newArray.push(arr[i]);
  }
  return newArray;
}

 router.get('/orderSuccess',verifyLogin,(req,res)=>{
  res.render('Customer/SuccessfullOrder',{customerlog:true})
})

router.get('/orders',verifyLogin,async(req,res)=>{
  console.log('customer id = '+req.session.customer._id);
  let orders = await customer_helpers.getCustomerOrders(req.session.customer._id)
  res.render('Customer/Orders',{customerlog:true,user:req.session.customer,orders})
})

router.get('/ViewOrderProducts/:id',verifyLogin,async(req,res)=>{
        let products = await customerHelpers.getOrderProdcuts(req.params.id)
        console.log(products);
        res.render('Customer/OrderProducts',{customerlog:true,user:req.session.customer,products})
})


//---------SIGNUP------------
router.get('/customerSignUp',(req,res)=>{
          res.render('Customer/customer-SignUp')
})

router.post('/customerSignUp',(req,res)=>{
  customerHelpers.customerSignUp(req.body).then((response)=>{
   // req.session.loggedIn = true//res.send('User added successfully')
    req.session.customer = response
    res.redirect('/')
  })
 

})

router.get('/GetOTP/:PhoneNo',(req,res)=>{
  let phoneNo = req.params.PhoneNo
  console.log(phoneNo);
  
var params = {
  'apikey': '', // API Key
  'sender': 'SEDEMO', // Sender Name
  'to': [
    phoneNo  //Moblie Number
  ],
  'message': 'hello',
  'format': 'json'
};
 
// springedge.messages.send(params, 5000, function (err, response) {
//   if (err) {
//     return console.log(err);
//   }
//   console.log(response);
// });
  
})

router.post('/OTPlogin',(req,res)=>{
  console.log('body : '+req.body);
  
})

//-----------------------PRODUCT

router.get('/getProductDetails/:id',verifyLogin,async(req,res)=>{
  cartCount = null;
   customerHelpers.getCartCount(req.session.customer._id).then((response)=>{
    console.log('response'+response);
    cartCount = response
    })

    // console.log('cartCount'+cartCount);
  let product = await product_helpers.getProductByProductId(req.params.id)
  res.render('Customer/ProductDetails',{customerlog:true,user:req.session.customer,product:product[0],cartCount})
})

router.get('/getProductsByCategory/:category',verifyLogin,(async(req,res)=>{
    let selectedCategory =   req.params.category
    let products = await product_helpers.getProductsByCategory(selectedCategory)
    if (req.session.customer) {
      cartCount = await customerHelpers.getCartCount(req.session.customer._id)
     }
     let categories = await category_helpers.getAllCategories();
     res.render('Customer/categorizedProducts',{products,customerlog:true,cartCount,categories,selectedCategory})
    
}))


router.get('/getProductsByVendor/:id',verifyLogin,(async(req,res)=>{
  let vendorId =   req.params.id
  let vendor =await vendor_helpers.getVendorByVendorId(vendorId)
  let SelectedVendor = vendor.name;
  let products = await product_helpers.getProductsByVendorId(vendorId)
  if (req.session.customer) {
    cartCount = await customerHelpers.getCartCount(req.session.customer._id)
   }
  res.render('Customer/vendorizedProducts',{products,customerlog:true,cartCount,SelectedVendor})
}))

module.exports = router;
//---------------------------------------------------
// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;
