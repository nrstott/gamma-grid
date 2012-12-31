var bogart = require('bogart');
var path = require("path");
var router = bogart.router();

router.get("/", function(req){
	return bogart.file(path.join(__dirname, "index.html"));
})

router.get('/js/*', function(req) {
  var filePath = path.join(__dirname, 'js', req.params.splat[0]);
  return bogart.file(filePath);
});

router.get('/css/*' , function(req){
	var filePath = path.join(__dirname, 'css', req.params.splat[0]);
  return bogart.file(filePath);
})

router.get('/api/users', function(req) { 
  return bogart.json([{id:1, name:"Martin", createdAt: new Date()}, {id:2, name:"Susan", createdAt: new Date()}, {id:3, name:"Michael", createdAt:new Date()}]); 
});

var app = bogart.app();
app.use(bogart.batteries); // A batteries included JSGI stack including streaming request body parsing, session, flash, and much more.
app.use(router); // Our router

app.start();