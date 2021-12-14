const router = require('express').Router();
const User = require('../models/User')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')

//TO REGISTER
router.post('/register', async(req, res) => {

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        //encrypt password using CryptoJS
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
    });
    
    try{
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    }catch(err){
        res.status(500).json(err);
    }
})

//TO LOGIN
router.post('/login', async(req, res) => {
    try{    
        const user = await User.findOne({username: req.body.username});

        !user && res.status(401).json("Wrong credentials!")
        const hashedPassword = CryptoJS.AES.decrypt(
            user.password, 
            process.env.PASS_SEC
            );
            //convert password to string
            const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

            const accessToken = jwt.sign(
                {
                    id : user._id,
                    isAdmin: user.isAdmin,
                },
            processs.env.JWT_SEC,
            //after 3days this access token will not be useful so login again
            {expiresIn:'3d'}
            )


            Originalpassword !==req.body.password && res.status(401).json("Wrong credentials!")

            const {password, ...others} = user._doc;

            res.status(200).json({others, accessToken});
    }catch(err){
        res.status(500).json(err);
    }
})

module.exports = router