var express = require('express');
var messages = require('../Config/messages')
const vendor_helpers = require('../Helpers/vendor_helpers');
const category_helpers = require('../Helpers/category_helpers');
const product_helpers = require('../Helpers/product_helpers');

var router = express.Router();

/*------- Common : verify login ---*/
const verifyLogin = (req, res, next) => {
  req.session.admin = null;
  req.session.customer = null;
    if (req.session.vendor) {
      next()
    } else {
     res.redirect('vendor/login')
    }
  }

 //----------------------- LOGIN, LOGOUT-------------------
/*Get Login page*/
router.get('/login', (req, res) => {
    if (req.session.vendor) {
      res.redirect('/')
    }
    else {
      res.render('Vendor/vendor-Login', { vendorloginErr: req.session.vendorloginErr, vendorloginErrCaption: req.session.vendorloginErrCaption })
    }
    req.session.vendorloginErr = null
    req.session.vendorloginErrCaption = null
  })

router.post('/login', (req, res) => {
    vendor_helpers.vendorDoLogin(req.body).then((vendorData)=>{
    if(vendorData!= null)
      {
      //  console.log('vendor : '+vendorData._id);
        req.session.vendor = vendorData;
      // req.session.vendorloggedIn = true
       res.redirect('/vendor')
     }
     else{
         req.session.vendorloginErrCaption = messages.LoginErrMsg_Caption// "Login Failed!"
         req.session.vendorloginErr = messages.LoginErrMsg//"Incorrect EmailId or Password"
         res.render('Vendor/vendor-Login', { vendorloginErr: req.session.vendorloginErr, vendorloginErrCaption: req.session.vendorloginErrCaption })
         req.session.vendorloginErr = null
         req.session.vendorloginErrCaption = null
         req.session.vendor = null
     }
    })
})

router.get('/logout', (req, res) => {
   req.session.vendor = null// req.session.destroy()
    res.redirect('/vendor')
   // res.redirect('/')
  })

//------------HOME--------------------------------------------
router.get('/',verifyLogin, function(req, res, next) {
  req.session.admin = null;
  req.session.customer = null;
   if (req.session.vendor) {
      vendorlog = true
      res.render('Vendor/vendor-home',{vendorlog})
     } else {
        res.redirect('vendor/login')
       }
  })

//---------------PRODUCT-----------------------------------------
router.get('/products',verifyLogin,(req,res)=>{
  let vendorid = req.session.vendor._id
  console.log(vendorid);
  product_helpers.getProductsByVendorId(vendorid).then((products)=>{
    console.log("prodcuts : "+products);
  res.render('Vendor/vendor-products',{vendorlog:true,products})
  })
})

router.get('/addproduct',verifyLogin,(req,res)=>{
  category_helpers.getAllCategories().then(async(categories)=>{
    categories = await categories
    res.render('Vendor/vendor-AddProduct',{vendorlog:true,categories})
 //  res.render('Admin/admin-AddVendor',{admin:true,categories})
 })
})

router.post('/addproduct',verifyLogin,(req,res)=>{
req.body.VendorId = req.session.vendor._id
product_helpers.addProduct(req.body).then((productInsertedId)=>{
   if(productInsertedId != null)
    {
      if(req.files != null){
        let image = req.files.Image
        image.mv   ('./public/productImages/'+productInsertedId+'.jpg',(err,done)=> // mv comes from the middleware 'fileupload'
        {
        if(err)  console.log(err)
        }  ) 
      }
   res.render('Vendor/vendor-AddProduct',{vendorlog:true,SuccessMsg_Caption: messages.productAddSuccessMsg_Caption,SuccessMsg:messages.productAddSuccessMsg})
 }
})
})

router.get('/delete-product/:id',verifyLogin,(req,res)=>{
  let productid = req.params.id
  product_helpers.deleteProductByProductId(productid).then((deletedDocumentCount)=>{
    //res.render('Admin/admin-category',{admin:true,SuccessMsg_Caption: messages.CategoryDeletionSuccessMsg_Caption,SuccessMsg:messages.CategoryDeletionSuccessMsg})
   res.redirect('/vendor/products')
  })
})


//--------------ORDER--------------

router.get('/orders',verifyLogin,async(req,res)=>{
  let orders = await vendor_helpers.getOrdersByVendorID(req.session.vendor._id)
  console.log("order "+orders);
  res.render('Vendor/Vendor_Orders',{vendorlog:true,orders})
  
})


router.get('/Vendor_OrderSummary',verifyLogin,async(req,res)=>{
  let orders = await vendor_helpers.getAllOrdersByVendorID(req.session.vendor._id)
  console.log("order "+orders);
  res.render('Vendor/Vendor_OrderSummary',{vendorlog:true,orders})
  
})

router.get('/changeOrderStatus/:id/:status',verifyLogin,async(req,res)=>{
  console.log(req.params.id);
  status = req.params.status;
  let orderId = req.params.id
  vendor_helpers.changeOrderStatus(orderId,status)

  let orders = await vendor_helpers.getOrdersByVendorID(req.session.vendor._id)
 res.render('Vendor/Vendor_Orders',{vendorlog:true,orders})

})

router.get('/salesReport',verifyLogin,async(req,res)=>{
let orders = await vendor_helpers.salesReport(req.session.vendor._id);
let no_of_Orders = orders.length
res.render('Vendor/SalesReport',{vendorlog:true,orders,no_of_Orders})
//console.log(orders);
})

module.exports = router;