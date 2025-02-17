const express = require("express");
const router = express.Router();
const Post = require('../models/post')
const localVar = {
    title : "NodeJS Blog Project",
    description :"blog made with nod, express and mongoDB"
}

// Get Home
router.get('', async (req,res) =>
{

    let perPage = 10;
    let page = req.query.page|| 1;
    const data = await Post.aggregate([{ $sort:{createdAt: -1} }])
    .skip(perPage * page -perPage)
    .limit(perPage)
    .exec();
    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) +1;
    const hasNextPage = nextPage <= Math.ceil(count/perPage);


    try {
        res.render('index' , {
            data, 
            localVar,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.log('error ar router.get(homepage)');
    }
});


// Get Post:id
router.get('/post/:id',async (req,res) =>{

    let slug = req.params.id;
    const data = await Post.findById({_id: slug});
    res.render('post',{localVar, data, currentRoute: '/post/'+slug});
    try {
        
    } catch (error) {
        console.log('error ar router.get(post)');
    }
});


router.get('/about',(req,res) =>
    {
        res.render('about' , {localVar,currentRoute:'/about'});
    });

module.exports = router;

//Get Post:id through searchBar
router.post('/search', async (req,res) =>{
    try {
        // res.render('search',{localVar, data});

        let searchTerm =  req.body.searchTerm;
        // const searchNoSpecialChar = searchTerm.replace(/[^a-Za-Z0-9]/g, "");
        const data = await Post.find({
            $or:[
                {title: {$regex: new RegExp(searchTerm,'i')}},
                {body: {$regex: new RegExp(searchTerm,'i')}}
            ]
        });

        console.log(searchTerm);
        res.render('search',{
            data,
            localVar,
            currentRoute: '/search'
        });
    } catch (error) {
        console.log('error ar router.get(search)')
    }
})