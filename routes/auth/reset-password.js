const path = require('path');
const express = require('express');
const User = require('../../models/User-model')
const router = express.Router()
const crypto = require('crypto')
const rootDir = require('../../util/path')
const mongoDB = require('../../util/mongoDBconnect').getDB
const bcrypt = require('bcrypt')

require('dotenv').config()
const sendEmail = require('../../util/nodemailer')

router.post('/reset-password', (req, res, next) =>{
  crypto.randomBytes(32, (err, buffer)=>{
    if(err){
      console.log(err)
      return res.redirect('/reset-password')
    }
    const token = buffer.toString('hex')
    User.findOne({email:req.body.email})
    .then(user => {
      if(!user){
        req.flash('noUserError', "No account with this email exists")
        return res.redirect('/reset-password')
      }
      //user exists - give him token:
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000 //expires in one hour.
      return user.save()
    })
    //user has token - send it in the email
    .then(result => {
      res.redirect('/index')
      sendEmail(req.body.email, `change password for ${req.body.email}`, "sometext",
      `<p>you requested a password reset, click this link to set a new password</p>
      <p>click this link:</p> 
       http://localhost:5000/set-new-password/${token}
      `
      )
    })
    .catch(err => console.log(err))
  })
})

router.get('/reset-password', (req, res, next) =>{
  console.log('current logged user:' + req.session.user);
  res.render(path.join(rootDir, 'views', 'reset-password.ejs'),{
      errorMessage: req.flash('noUserError')
  })
})
//the latter part - setting new password after user has a token:
router.get('/set-new-password/:token', (req, res, next) =>{
  const token = req.params.token
  User.findOne({resetToken:token, resetTokenExpiration: {$gt:Date.now()}})
  .then(user =>{
    res.render(path.join(rootDir, 'views', 'new-password-form.ejs'),{
     
      userId: user._id.toString()
  })
  })
  .catch(err => console.log(err))

  
})


module.exports = router