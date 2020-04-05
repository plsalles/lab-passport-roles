const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const passport = require('passport');
const Course = require('../models/Course.model');

//Bcrypt parameters


/* GET home page */
router.get('/login', (req, res) => {
    res.render('public/login', { message: req.flash('error')});
});

router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/intranet',
      failureRedirect: '/login',
      failureFlash: true,
      passReqToCallback: true
    })
  );



//Authenticated user routes


router.use((req, res, next) => {
    if (req.isAuthenticated()) {
      next();
      return;
    }
  
    res.redirect('/login');
  });

router.get('/intranet', (req, res) => {
    res.render('private/intranet');
});


router.get('/list-users', async (req, res) => {
    const users = await User.find({username: {$not: {$eq: req.user.username}}});
    users.unshift(req.user);
    console.log(users);
    const loggedUser = req.user;
    users.forEach((user,index) => {
        if(loggedUser.role === 'BOSS' || loggedUser.role === 'TA' || loggedUser.role === 'DEV' ){
            user.editable = true;
        }

        if(user.username === loggedUser.username){
            user.editable = true;
        }
    });

    res.render('private/list-users', {users});
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({_id: id});
    console.log(user)
    res.render('private/edit-user', user);
});

router.post('/edit', async (req, res) => {

    try {
        let hashPassword;
        const user = req.body;
        
        if (user.password) {
            const saltRouds = 10;
            const salt = bcrypt.genSaltSync(saltRouds);
            hashPassword = bcrypt.hashSync(user.password, salt);
            user.password = hashPassword;
        }

        await User.findOneAndUpdate({username: user.username}, user);
        res.redirect('/list-users');
    } catch (error) {
        console.log(error);
        res.render('private/list-users', {errorMessage: "ERROR"});
    }

});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


router.get('/create-course', async (req, res) => {
    const ta = await User.find({role: 'TA'});
    const users = await User.find({role: 'STUDENT'});
    const teachers = await User.find({role: 'DEV'});
    console.log(ta);
    console.log(users);
    console.log(teachers);
    res.render('private/create-course', {users,ta,teachers});
  });

  router.post('/create-course', async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        console.log('Creating new course',newCourse);
        await Course.create(newCourse);
        res.redirect('/intranet');
    } catch (error) {
        console.log(error);
        res.redirect('/create-course');

    }
  });


// Admin Routes

router.use((req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'BOSS') {
      next();
      return;
    }
  
    res.redirect('/login');
  });

router.get('/admin', (req, res) => res.render('private/admin'));

router.get('/admin/create', (req, res) => res.render('private/create-user'));

router.post('/admin/create', async (req, res) => {
    try {
        let hashPassword;
        const {name, username, password, email, profileImg, facebookId, role} = req.body;

        if (password) {
            const saltRouds = 10;
            const salt = bcrypt.genSaltSync(saltRouds);
            hashPassword = bcrypt.hashSync(password, salt);
        }

        const newUser = new User({ name, username, password: hashPassword, email, profileImg, facebookId, role});
        await newUser.save();
        res.render('private/admin');
    } catch (error) {
        console.log(error);
        res.render('private/create-user', {errorMessage: "Please provide a valid user and password"});
    }

});

module.exports = router;
