const express = require("express");
require("dotenv").config();
const expressEjsLayouts = require("express-ejs-layouts");
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const methodOverride = require('method-override');



const connectDB = require('./server/config/db');
const { urlencoded } = require("body-parser");
const app = express();
const expressLayout = expressEjsLayouts;
const PORT = process.env.PORT || 3000;

//connect to DB
connectDB();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
const {isActiveRoute} = require('./server/helpers/routeHelpers');
// app.use(cookieParser);
// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     store: MongoStore.create({
//       mongoUrl: process.env.MONGODB_URI
//     })
//     //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
//   }));  
app.use(express.static('public'));
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => {
    console.log("App listening on port: " + PORT);
});