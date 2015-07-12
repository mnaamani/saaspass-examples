var SaasPass = require("saaspass-client");

//configure API secrets
var app = require("./secret.json");

var sp = SaasPass({key: app.key});

sp.authenticate(app.password, function(err, token) {
  if(err) return console.log(err);
  console.log("authentication success. token:", token);
  console.log("checking OTP:", process.argv[2]);

  sp.OTP.verify(process.argv[2], process.argv[3], function(err){
    if(err) return console.log(err);
    console.log("OTP accepted.");
  });
});
