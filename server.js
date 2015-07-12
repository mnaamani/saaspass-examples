var express = require("express");
var partials = require('express-partials');
var bodyParser = require('body-parser');

var SaasPass = require("saaspass-client");

//configure API secrets
var secrets = require("./secret.json");
var sp = SaasPass({key: secrets.key});

var sp_applicationID = "1012";//SASSPASS application ID for widget

sp.authenticate(secrets.password, function(err, token) {
  if(err) return console.log(err);
  console.log("Received token from SAASPASS");
});

var app = new express();
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.send('SAASPASS Demo');
});

//display login widget
app.get('/login', function (req, res) {
  res.send('<iframe src="https://www.saaspass.com/sd/widget.html?otpSupported=true&ilSupported=true&applicationID='+sp_applicationID+'" \
        width="100%" height="500"></iframe>');
});

app.post('/auth/saaspass', function(req, res){
  sp.TRACKER.handleRequest(req, function(err, user){
    if(err) {
      console.log(err);
      return res.redirect("/login");
    }
    console.log("User Authenticated via Instant Login:", user.account);
    res.redirect('/welcome');
  });
});

app.get('/auth/saaspass/sso', function(req, res){
  sp.SSO.handleRequest(req, function(err, user){
    if(err) {
      console.log(err);
      return res.redirect("/login");
    }
    console.log("User Authenticated via SSO:", user.account);
    res.redirect('/welcome');
  });
});

app.get('/welcome', function (req, res) {
  res.send('Logged in Successfully.');
});

app.listen(3000, function () {
  console.log("server started");
});
