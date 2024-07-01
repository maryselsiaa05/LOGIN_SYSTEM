const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {promisify} = require("util");

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
});

db.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log('MySQL Connection Success');
    }
});

exports.login=async(req,res)=>{
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).render('index',{msg:'Please Enter your Email and Password',msg_type:'error'});
        }

        db.query("Select * from users where email=?",[email],async(error,result)=>{
            if(result.length<=0 || !(await bcrypt.compare(password,result[0].PASS))){
                return res.status(401).render("index",{msg:"Email or Password Incorrect...",msg_type:'error'});
            }
            else{
                res.status(200).redirect("/two_step");
            }
        });
    }catch(error){
        console.log(error);
    }
}

exports.two_step=(req,res)=>{
    console.log("working");
    const {email,secret} = req.body;
    if(!secret || !email){
        return res.status(400).render('two_step',{msg:'Please Enter Anything',msg_type:'error'});
    }
    db.query("Select * from users where email=?",[email],async(error,result)=>{
        if(result.length<=0 || !(await bcrypt.compare(secret,result[0].SECRET))){
            return res.status(401).render("two_step",{msg:"Email or Secret Incorrect...",msg_type:'error'});
        }
        else{
            const id = result[0].ID;
                const token = jwt.sign({id:id},process.env.JWT_SECRET,{
                    expiresIn:process.env.JWT_EXPIRES_IN,
                });
                console.log("Id is "+id);
                console.log("The Token is "+token);
                const cookieOptions={
                    expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES*60*60*1000),
                    httpOnly: true,
                };
                res.cookie("json",token,cookieOptions);
                res.status(200).redirect("/home");
        }
    });
}

exports.recovery=(req,res)=>{
    const {email,password,confirm_password} = req.body;
    db.query('select email from users where email=?',[email],async(error,result)=>{
        if(error){
            console.log("error");
        }
        if(result.length<=0){
            return res.render('recovery',{msg:'Invalid Email id...',msg_type:'error'});
        }
        else{
            console.log("email verified")
            if(password==confirm_password){
                let hashedPassword = await bcrypt.hash(password,8);
                db.query('Update users Set ? where ?',[{pass:hashedPassword},{email:email}],async(error,result)=>{
                    if(error){
                        console.log("error");
                    }
                    if(result){
                        console.log("Password updated");
                    }
                })
                res.redirect('/');
            }else{
                return res.render('recovery',{msg:'Password & Confirm Password should be same...',msg_type:'error'});
            }
        }
    });
}

exports.register=(req,res)=>{
    console.log(req.body);
    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const confirm_password = req.body.confirm_password;
    const {name,email,password,confirm_password,secret} = req.body;
    db.query('select email from users where email=?',[email],async(error,result)=>{
        if(error){
            console.log("error");
        }
        if(result.length>0){
            return res.render('register',{msg:'Email id already Exists...',msg_type:'error'});
        }else if(password!==confirm_password){
            return res.render('register',{msg:'Password & Confirm Password should be same...',msg_type:'error'});
        }
        let hashedPassword = await bcrypt.hash(password,8);
        let hashedSecret = await bcrypt.hash(secret,8);

        db.query('Insert into users set ?',{name:name,email:email,pass:hashedPassword,secret:hashedSecret},(error,result)=>{
            if(error){
                console.log(error);
            }
            else{
                console.log(result);
                return res.render('register',{msg:'User Registeration Success...',msg_type:'good'});
            }
        });
    });
    // res.send("Form Submitted");
};

exports.isLoggedIn = async(req,res,next)=>{
    // req.name="Check Login...";
    // console.log(req.cookies);
    if(req.cookies.json){
        try{
            const decode = await promisify(jwt.verify)(
                req.cookies.json,
                process.env.JWT_SECRET
            );
            // console.log(decode);
            db.query("select * from users where id=?",[decode.id],(err,results)=>{
                // console.log(results);
                if(!results){
                    return next();
                }
                req.user = results[0];
                return next();
            });
        }catch(error){
            console.log(error);
        }
    }else{
        next();
    }

}

exports.logout = async (req,res)=>{
    res.cookie('json','logout',{
        expires: new Date(Date.now() + 2*1000),
        httpOnly: true,
    });
    res.status(200).redirect('/');

};