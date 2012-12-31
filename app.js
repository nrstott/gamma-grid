var bogart = require('bogart');
var path = require("path");
var router = bogart.router();

var data = [
	{id:1, name:"Martin", createdAt: new Date()}, 
	{id:2, name:"Susan", createdAt: new Date("2010-05-01")}, 
	{id:3, name:"Michael", createdAt:new Date("1981-10-16")},
	{id:4, name:"John", createdAt: new Date()}, 
	{id:5, name:"Davis", createdAt: new Date("2010-05-01")}, 
	{id:6, name:"Zach", createdAt: new Date()}, 
	{id:7, name:"Valerie", createdAt: new Date("2010-05-01")}, 
	{id:8, name:"Nathan", createdAt: new Date()}, 
	{id:9, name:"Lewis", createdAt: new Date("2010-05-01")}, 
	{id:10, name:"Justin", createdAt: new Date()}, 
	{id:11, name:"Daniel", createdAt: new Date("2010-05-01")}
	];

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
  var sortBy = req.params.sort || "name";
  var skip = req.params.skip || 0;
  var take = req.params.take || 5;
  

  data  = data.sort (function(a,b ){ 
  	return a[sortBy] > b[sortBy];
  });

  var count = data.length;
  data = data.slice(skip, skip + take);

  return bogart.json({sort:sortBy, results:data, start:skip+1, end: take, count:count}); 
});

var app = bogart.app();
app.use(bogart.batteries); // A batteries included JSGI stack including streaming request body parsing, session, flash, and much more.
app.use(router); // Our router

app.start();