const express = require('express')
require('dotenv').config()//env files
const User = require('../modles/User')//getting schema
const router = express.Router(); //routing localhost:5000//api/auth/login
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs') //hashcode for passwords
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')
JWT_SECRET = process.env.JWT_SECRET

//ROUTE: 1 Creating a new user /api/auth/createuser
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('username','Enter a valid username').isLength({min:3}),
    body('password', 'password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    success = false
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }
    //check wheather the user exists already
    try {
        let user = await User.findOne({ username: req.body.username })
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this username already exists" })
        }
        const salt = await bcrypt.genSalt(10)//adding salt and pepper
        const secPass = await bcrypt.hash(req.body.password, salt)//final encryped password
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            username:req.body.username
        })

        //JWT auth--> 3 (parts: 1-headers.2-payload.3-signature)

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        success = true
        res.json({ success, authtoken })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error occured")
    }
})
// ROUTE 2: Authenticate a User using: POST "/api/auth/login". No create new user required
router.post('/login', [
    body('username', 'Enter a valid username').exists(),
    body('password', 'password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { username, password } = req.body  //destructuring of req.body
    try {
        let user = await User.findOne({ username })
        if (!user) {
            return res.status(400).json({ error: "please try to login with correct credentials" })
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET)
        success = true
        res.json({ success, authtoken })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server Error occured")
    }
})
//ROUTE 3: validating a existing and getting the user info
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id
        const user = await User.findById(userId).select("-password")
        res.send(user)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router