const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'sachetisgoodboy'


// Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
    // Validate the input fields for email and password are not empty or null
    body('name', 'Enter a valid Name').isLength({ min: 3, max: 20 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be atleaast 5 characters').isLength({ min: 5 })
], async (req, res) => {
     // If there are erroer, return Bad request and the errors
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
    //  Check whether the user with this email exist already
    try {
      let user = await User.findOne({email: req.body.email})

      if (user) {
        return res.status(400).json({error: "Sorry a user with this email already exists"})
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      // Create a new User
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      })

      const data = {
        user: {
          id: user.id
        }
      }

      const authtoken = jwt.sign(data, JWT_SECRET);

      
      // .then(user => res.json(user))
      // .catch(err=> {console.log(err)
      // res.json({error: "Plese enter a unique value for email", message: err.message})});
      
      // res.json(user)
      res.json({authtoken})
      
      // Catch Errors
    } catch (error) {
      console.error(error.message)
      res.status(500).send("Some error occured")
    }
})

module.exports = router;