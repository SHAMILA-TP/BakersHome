
//for test commit ncmv mm

var express = require('express');
var messages = require('../Config/messages')
const admin_helpers = require('../Helpers/admin_helpers');
const category_helpers = require('../Helpers/category_helpers');
const vendor_helpers = require('../Helpers/vendor_helpers');

const Noty = require('noty');

var router = express.Router();

/*------- Common : verify login ---*/
const verifyLogin = (req, res, next) => {
  req.session.vendor = null;
  req.session.customer = null;
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin')
  //  res.redirect('Admin/login')
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.vendor = null;
  req.session.customer = null;
  if (req.session.admin) {
    // admin_helpers.getCountsForDashboard().then(async(result)=>{
    //   count = await result;
    //   console.log(JSON.stringify(count));
    // })

   res.render('Admin/admin-home',{admin:true})
//  res.redirect('/admin-home')
  } else {
   res.redirect('Admin/login')
  //res.redirect('/admin')
  }
//   if(req.session.loggedIn == null)
//  { res.redirect('/Admin/login')}
//  else{
 
  
  });
  
// -----------------DASHBOARD------------------------

router.get('admin-home',(req,res)=>{
  res.render('Admin/admin-home')
})

// -----------------LOGIN , LOGOUT------------------------

  router.get('/login', (req, res) => {
   res.render('Admin/login')
  })

  router.post('/login', (req, res)=> {
  // console.log("body: %j", req.body)
   admin_helpers.doLogin(req.body).then(async(adminData)=>{
   let isAdmin =false
   if(adminData!= null)
   {
    isAdmin = await  adminData.isSuperUser
   }
 if(isAdmin)
  {
    req.session.admin = adminData
    // req.session.admin.loggedIn = true
    res.redirect('/admin')
  }
  else{
    req.session.adminLoginErrCaption = messages.LoginErrMsg_Caption// "Login Failed!"
      req.session.adminLoginErr = messages.LoginErrMsg//"Incorrect EmailId or Password"
      
      res.render('Admin/login', { adminLoginErr: req.session.adminLoginErr, adminLoginErrCaption: req.session.adminLoginErrCaption })
      
      req.session.adminLoginErr = null
      req.session.adminLoginErrCaption = nll
      req.session.admin = null
  }
    })
  
  });

  router.get('/logout', (req, res) => {
    req.session.admin = null
    //req.session.destroy()
    res.redirect('/Admin/login')
   // res.redirect('/')
  })
  
// -----------------VENDOR------------------------

router.get('/vendors',verifyLogin,(req,res)=>{
 SuccessMsg_Caption = null
  SuccessMsg = null
    vendor_helpers.getAllVendors().then((vendors)=>{
      res.render('Admin/admin-vendors',{admin:true,vendors})
      })
   // res.render('Admin/admin-vendors',{admin:true})
})
  
router.get('/blockedVendors',verifyLogin,(req,res)=>{
  SuccessMsg_Caption = null
  SuccessMsg = null
    vendor_helpers.getBlockedVendors().then((vendors)=>{
      res.render('Admin/BlockedVendors',{admin:true,vendors})
      })
   // res.render('Admin/admin-vendors',{admin:true})
})

router.get('/addVendor',verifyLogin,(req,res)=>{


  SuccessMsg_Caption = null
  SuccessMsg = null
  res.render('Admin/admin-AddVendor',{admin:true})
//   category_helpers.getAllCategories().then(async(categories)=>{
//     categories = await categories
//    res.render('Admin/admin-AddVendor',{admin:true,categories})
//  })
 // res.render('Admin/admin-AddVendor',{admin:true})
})

router.post('/addVendor',verifyLogin,(req,res)=>{
  SuccessMsg_Caption = null
  SuccessMsg = null
vendor_helpers.CreateVendor(req.body).then((vendorInsertedId)=>
{
  if(req.files != null){
  let image = req.files.Image
  image.mv   ('./public/vendor-logos/'+vendorInsertedId+'.jpg',(err,done)=> // mv comes from the middleware 'fileupload'
  {
  if(err)  console.log(err)
  }  ) 
}

if(vendorInsertedId)
{
  res.render('Admin/admin-AddVendor',{admin:true,SuccessMsg_Caption: messages.VendorCreationSuccessMsg_Caption,SuccessMsg:messages.VendorCreationSuccessMsg})
}

})
})

/*Edit Vendor: populate controls on edit click*/
router.get('/edit-vendor/:id',verifyLogin,async (req,res)=>{
  SuccessMsgCaption =null
  VendorUpdateSuccessMsg = null
  let vendorid = req.params.id
  let vendor =await vendor_helpers.getVendorByVendorId(vendorid)
  category_helpers.getAllCategories().then(async(categories)=>{
    categories = await categories
   res.render('admin/edit-vendor',{vendor,categories,admin:true})
 })
 })

router.post('/edit-vendor/:id',verifyLogin,(req,res)=>{
  let vendorid = req.params.id
  vendor_helpers.updateVendorByVendorId(req.body,vendorid).then((modifiedDocumentCount)=>{
    if(req.files != null)
     {
      if(req.files.Image)
      {
      let image = req.files.Image
      image.mv('./public/vendor-logos/'+vendorid+'.jpg')
    }
     }
  
    if(modifiedDocumentCount!=null)
    {
    // res.redirect('/admin/edit-vendor/'+vendorid)
   res.redirect('/admin/vendors')
    // res.render('Admin/edit-vendor',{admin:true,SuccessMsgCaption: messages.SuccessMsgCaption,VendorUpdateSuccessMsg:messages.VendorUpdateMsg})
    }
  })
  
})

//-----------DELETE VENDOR--------------------(not deleting from DB, but setting isdeleted status to true)
router.get('/delete-vendor/:id',verifyLogin,(req,res)=>{
  let vendorid = req.params.id
  vendor_helpers.deleteVendorByVendorId(vendorid).then((modifiedDocumentCount)=>{
  
    vendor_helpers.getAllVendors().then((vendors)=>{
      res.render('Admin/admin-vendors',{admin:true,vendors,SuccessMsg_Caption: messages.VendorDeletionSuccessMsg_Caption,SuccessMsg:messages.VendorDeletionSuccessMsg})
      })
  
   // res.redirect('/admin/vendors')
  })
})

//------------- BLOCK-UNBLOCK VENDOR-----------------------
router.get('/block-vendor/:id',verifyLogin,(req,res)=>{
  SuccessMsg_Caption = null
  SuccessMsg = null
  let vendorid = req.params.id
  vendor_helpers.blockVendorByVendorId(vendorid).then((modifiedDocumentCount)=>{
    if(modifiedDocumentCount!= null)
    {
      vendor_helpers.getAllVendors().then((vendors)=>{
        res.render('Admin/admin-vendors',{admin:true,vendors,SuccessMsg_Caption: messages.BlockVendorSuccessMsg_Caption,SuccessMsg:messages.BlockVendorSuccessMsg})
        })
    
   // res.redirect('/admin/vendors')
  }
  })
})

router.get('/unblock-vendor/:id',verifyLogin,(req,res)=>{
  SuccessMsg_Caption = null
  SuccessMsg = null
  let vendorid = req.params.id
  vendor_helpers.unblockVendorByVendorId(vendorid).then((modifiedDocumentCount)=>{
    if(modifiedDocumentCount != null)
    {
      vendor_helpers.getBlockedVendors().then((vendors)=>{
        res.render('Admin/BlockedVendors',{admin:true,vendors,SuccessMsg_Caption: messages.UnBlockVendorSuccessMsg_Caption,SuccessMsg:messages.UnBlockVendorSuccessMsg})
        })
   
  //  res.redirect('/admin/vendors')
    }
  })
})

// -----------------CATEGORY------------------------
router.get('/category',verifyLogin,(req,res)=>{
  category_helpers.getAllCategories().then((categories)=>{
  res.render('Admin/admin-category',{admin:true,categories})
  })
 
})

router.get('/addCategory',verifyLogin,(req,res)=>{
  CategorySuccessMsg_Caption = null;
  CategorySuccessMsg = null;
res.render('Admin/admin-AddCategory',{admin:true})
})

router.post('/addCategory',verifyLogin,(req,res)=>{
  category_helpers.CreateCategory(req.body).then((response)=>{
 if(response != null)
 {
  res.render('Admin/admin-AddCategory',{admin:true,CategorySuccessMsg_Caption: messages.CategoryCreationSuccessMsg_Caption,CategorySuccessMsg:messages.CategoryCreationSuccessMsg})
}
 })
  })

/*Edit Vendor: populate controls on edit click*/
router.get('/edit-category/:id',verifyLogin,async (req,res)=>{
  let categoryid = req.params.id
  let category =await category_helpers.getCategoryByCategoryId(categoryid)
  res.render('admin/edit-category',{category,admin:true})
})

router.post('/edit-category/:id',verifyLogin,(req,res)=>{
    let categoryid = req.params.id
     category_helpers.updateCategoryByCategoryId(req.body,categoryid).then((modifiedDocumentCount)=>{
      res.redirect('/admin/category')
    })
  })
//-----------DELETE CATEGORY--------------------
router.get('/delete-category/:id',verifyLogin,(req,res)=>{
 let categoryid = req.params.id
  category_helpers.deleteCategoryByCategoryId(categoryid).then((deletedDocumentCount)=>{
    //res.render('Admin/admin-category',{admin:true,SuccessMsg_Caption: messages.CategoryDeletionSuccessMsg_Caption,SuccessMsg:messages.CategoryDeletionSuccessMsg})
   res.redirect('/admin/category')
  })
})

//-----------------ORDER---------
router.get('/orders',verifyLogin,async(req,res)=>{
  let orders = await admin_helpers.getAllOrders()
  res.render('Admin/Orders',{admin:true,orders})
  
})

//-----------------USERS---------
router.get('/users',verifyLogin,async(req,res)=>{
let users = await admin_helpers.getAllUsers()
res.render('Admin/admin-Users',{admin:true,users})
})

router.get('/blockedUsers',verifyLogin,async(req,res)=>{
  let users = await admin_helpers.getBlockedUsers()
  res.render('Admin/admin-BlockedUsers',{admin:true,users})
})

router.get('/block-user/:id',verifyLogin,(req,res)=>{
  SuccessMsg_Caption = null
  SuccessMsg = null
  let userid = req.params.id
  admin_helpers.blockUserByUserId(userid).then(async(modifiedDocumentCount)=>{
    if(modifiedDocumentCount!= null)
    {
      let users = await admin_helpers.getAllUsers()
      res.render('Admin/admin-Users',
      {admin:true,users,
      SuccessMsg_Caption: messages.BlockUserSuccessMsg_Caption,SuccessMsg:messages.BlockUserSuccessMsg})
       // res.redirect('/admin/vendors')
  }
  })
})

router.get('/unblock-user/:id',verifyLogin,(req,res)=>{
  SuccessMsg_Caption = null
  SuccessMsg = null
  let userid = req.params.id
  admin_helpers.unblockUserByUserId(userid).then(async(modifiedDocumentCount)=>{
    if(modifiedDocumentCount != null)
    {
      let users = await admin_helpers.getBlockedUsers()
      res.render('Admin/admin-BlockedUsers',
      {admin:true,users,
      SuccessMsg_Caption: messages.UnBlockUserSuccessMsg_Caption,SuccessMsg:messages.UnBlockUserSuccessMsg})
     }
  })
})


//-----------CHART--------------

router.get('/collectionByMonth',verifyLogin,(req,res)=>{
  let sum = admin_helpers.getCollectionByMonth()
  console.log(sum);
})

  module.exports = router;
  