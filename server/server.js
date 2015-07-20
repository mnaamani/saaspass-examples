var express = require("express");
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');

var SaasPass = require("saaspass-client");

//configure API secrets
var secrets = require("./secret.json");
var sp = SaasPass({key: secrets.key});

var SP_APP_ID = process.env.SP_APP_ID || "1012";//SASSPASS application ID for widget

(function refreshToken(){
  sp.authenticate(secrets.password, function(err, token) {
    if(err) {
      return console.log(err);
    }
    console.log("Refreshed API token");
    //refresh the token after 30 minutes -
    //this only happens if we at least succesffuly got a token once
    setTimeout(refreshToken, 30 * 60 * 1000);
  });
})();

var app = new express();

app.use(session({
  secret: process.env.SESSION_SECRET || "239874sdsmnf,s1278z,aldfa;1"
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render("index", {
    user: req.session.user
  });
});

//display login widget
app.get('/login', function (req, res) {
  res.render("login", {
    SP_APP_ID: SP_APP_ID
  });
});

app.get('/logout', function(req, res){
  delete req.session.user;
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.post('/auth/saaspass', function(req, res){
  sp.TRACKER.handleRequest(req, function(err, user){
    if(err) {
      console.log(err);
      return res.redirect("/login");
    }
    console.log("User Authenticated via Instant Login:", user.account);
    req.session.regenerate(function(err) {
      req.session.user = user.account;
      res.redirect('/');
    });
  });
});

app.get('/auth/saaspass/sso', function(req, res){
  sp.SSO.handleRequest(req, function(err, user){
    if(err) {
      console.log(err);
      return res.redirect("/login");
    }
    console.log("User Authenticated via SSO:", user.account);
    req.session.regenerate(function(err) {
      req.session.user = user.account;
      res.redirect('/');
    });
  });
});

app.listen(3000, function () {
  console.log("server started");
});
