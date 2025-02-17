const express = require("express");
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;



//check login
const authMiddleware = (req, res, next ) => {
    const token = req.cookies.token;
  
    if(!token) {
      return res.status(401).json( { message: 'Unauthorized'} );
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch(error) {
      res.status(401).json( { message: 'Unauthorized'} );
    }
  }
  

//get admin, admin-login page

router.get('/admin', async (req, res) => {
    try {
      const localVar = {
        title: "Admin",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
      res.render('admin/index', { localVar, layout: adminLayout });
    } catch (error) {
      console.log(error);
    }
  });

//Post admin, check login
router.post('/admin', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.status(401).json({message:'invalid credentials'});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:'invalid credentials'});
        }
        const token = jwt.sign({userId : user._id},jwtSecret)
        res.cookie('token',token,{httpOnly:true});
        res.redirect('dashboard');

       
    } catch (error) {
      console.log(error);
    }
  });

  //Post admin, register
router.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password,10);
        try {
            const user = await User.create({username, password: hashedPassword});
            res.status(201).json({message: 'user created',user });
        } catch (error) {
            if(error.code===11000){
                res.status(409).json({message: 'user already in use'});
            }
            res.status(500).json({message: 'internal server error'});
        }
        
    } catch (error) {
      console.log(error);
    }
  });


module.exports = router;

//Post admin, check login
router.get('/dashboard', async (req, res) => {
    const localVar = {
        title: "Admin",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }

      try {
        const data  = await Post.find();
        res.render('admin/dashboard',{localVar, data, layout: adminLayout});
      } catch (error) {
        console.log(error);
      }

});

//Get admin-Create new Post
router.get('/add-post', async (req, res) => {
    const localVar = {
        title: "Add Post",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }

      try {
        res.render('admin/add-post',{localVar, layout: adminLayout});
      } catch (error) {
        console.log(error);
      }

});

//post admin-create post
router.post('/add-post', async (req, res) => {

    try {
        console.log(req.body);
        try {
            const newPost = new Post({
                title :req.body.title,
                body: req.body.body
            });
        await Post.create(newPost);
        res.redirect('/dashboard');

        } catch (error) {
            console.log(error);

        }
      } catch (error) {
        console.log(error);
      }

});

//update post

router.put('/edit-post/:id', async (req, res) => {


    try {
      await Post.findByIdAndUpdate(req.params.id,{
        title:req.body.title, 
        body:req.body.body,
        updateddAt:Date.now()
      });

      res.redirect(''+ req.params.id);
    } catch (error) {
      console.log(error);
    }

});


//get edit page
router.get('/edit-post/:id', async (req, res) => {
  const localVar = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    try {
      const data = await Post.findOne({_id: req.params.id});

      res.render('admin/edit-post',{
        data,
        layout: adminLayout,
        localVar
      });
    } catch (error) {
      console.log(error);
    }

});



//delete post
router.delete('/delete-post/:id', async (req, res) => {
  try {
    await Post.deleteOne({
      _id: req.params.id
    });
    res.redirect('/dashboard');
  } catch (error) {
          console.log(error);
  }

})


//get admin logout
router.get('/logout',(req,res)=>{
  res.clearCookie('token');
  // res.json({message: 'logout successful'});
  res.redirect('/');
})