const express = require('express');
const exphbs = require('express-handlebars');   //front-end
const bodyParser = require('body-parser');      //to access at req.value
const flash = require('connect-flash');         //notification messages
const session = require('express-session');     //needs for flash
const mongoose = require('mongoose');           //database
const passport = require('passport');           //for authentication

const app = express();

//load user model
require('./models/User');

//Passport config
require('./config/passport')(passport);

//load routes
const index = require('./routes/index');
const events = require('./routes/events');
const auth = require('./routes/auth');

//load key
const keys = require('./config/keys.js');

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
//connect to mongoose
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true
})
  .then(() => console.log('MongoDb Connected..'))      //use promise instead of callbacks for cleaner code
  .catch(err => console.log(err));

//handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//espress session middleware
app.use(session({
  secret: 'ivagnescoretti',
  resave: true,
  saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//flash middleware
app.use(flash());

// Set global vars (for navbar and error messages)
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//use routes
app.use('/', index)
app.use('/events', events);
app.use('/auth', auth);

const port = process.env.port || 5000;
app.listen(port, ()=>{
  console.log(`Server started on port ${port}`);
} );
