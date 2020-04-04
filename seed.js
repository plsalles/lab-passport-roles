const mongoose = require('mongoose');
const User = require('./models/User.model');
const bcrypt = require('bcrypt');

mongoose
  .connect('mongodb://localhost/passport-roles', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
  .catch(err => console.error('Error connecting to mongo', err));


  const newUser = {
    name: 'Caio',
    username: 'caio',
    password: '12345',
    email: 'caio@gmail.com',
    role: 'BOSS',
  };


  let hashPassword;
  if (newUser.password) {
            const saltRouds = 10;
            const salt = bcrypt.genSaltSync(saltRouds);
            hashPassword = bcrypt.hashSync(newUser.password, salt);
                    }
  newUser.password = hashPassword;

 User.create(new User(newUser))
  .then(user => console.log(user))
  .catch(err => {
    throw new Error(err);
  })