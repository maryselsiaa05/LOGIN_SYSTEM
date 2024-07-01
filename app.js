const express = require("express");
const mysql = require("mysql");
const doenv = require("dotenv");
const path = require('path');
const hbs = require("hbs");
const cookieParser = require("cookie-parser");
const app = express();

doenv.config({
    path:'./.env',
});

app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

// console.log(__dirname);
const location = path.join(__dirname,"./public");
app.use(express.static(location));
app.set("view engine","hbs");

const partialPath = path.join(__dirname,"./views/partials");
hbs.registerPartials(partialPath);

app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));

app.listen(5000,()=>{
    console.log("SERVER started @ port 5000");
});