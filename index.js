const express = require('express');
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const fetch = require('node-fetch');
const app = express();
app.set('view engine', 'pug');
app.set('views', './views');
app.use(session({ secret: 'sonhn' }));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user);
  });

passport.deserializeUser(function(user, done) {
    done(null,user)
});

passport.use(new FacebookStrategy({
    clientID: process.env.facebookId,
    clientSecret: process.env.facebookSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, cb) {
      cb(null,profile)
  }
));
passport.use(new GoogleStrategy({
  clientID: process.env.googleId,
  clientSecret: process.env.googleSecret,
  callbackURL: "http://localhost:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, cb) {
  // User.findOrCreate({ googleId: profile.id }, function (err, user) {
  //   return cb(err, user);
  // });
  cb(null,profile)
}
));
//Route

//Facebook URL
app.get('/auth/facebook',
  passport.authenticate('facebook',{ authType: 'reauthenticate', scope: ['email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
// Google URL
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});
app.get('/login',(req,res) => {
  res.render('login')
})
const checkLogin = (req,res,next) => {
  if(req.isAuthenticated())
    next()
  else
    res.redirect('/login')
}
app.get('/',checkLogin,async (req, res) => {
    const apiKey = '473efef2a8205242cda8d2e7873a7392';
    const hcmCity = 'ho chi minh city';
    const hanoiCity = 'hanoi';
    const apiUrlHcm = `http://api.openweathermap.org/data/2.5/weather?q=${hcmCity}&appid=${apiKey}&units=metric`;
    const apiUrlHanoi = `http://api.openweathermap.org/data/2.5/weather?q=${hanoiCity}&appid=${apiKey}&units=metric`;
    const fetchHcm = await fetch(apiUrlHcm)
    const fetchHanoi = await fetch(apiUrlHanoi)
    const locations = await Promise.all([fetchHcm.json(),fetchHanoi.json()])
    res.render('index',{locations,user:req.user})
});

app.listen(3000, () => console.log('App listening on port 3000'));
