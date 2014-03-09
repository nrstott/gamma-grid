var bogart = require('bogart');
var path = require("path");
var router = bogart.router();

var data = [
	{id:1, name:"Martin", position: "Employee", createdAt: new Date()}, 
	{id:2, name:"Susan", position: "Employee", createdAt: new Date("2010-05-01")}, 
	{id:3, name:"Michael", position: "Employee", createdAt:new Date("1981-10-16")},
	{id:4, name:"John", position: "Employee", createdAt: new Date()}, 
	{id:5, name:"Davis", position: "Employee", createdAt: new Date("2010-05-01")}, 
	{id:6, name:"Zach", position: "Employee", createdAt: new Date()}, 
	{id:7, name:"Valerie", position: "Employee", createdAt: new Date("2010-05-01")}, 
	{id:8, name:"Nathan", position: "Employee", createdAt: new Date()}, 
	{id:9, name:"Lewis", position: "Employee", createdAt: new Date("2010-05-01")}, 
	{id:10, name:"Justin", position: "Employee", createdAt: new Date()}, 
	{id:11, name:"Daniel", position: "Employee", createdAt: new Date("2010-05-01")}
	];

router.get("/", function(req){
	return bogart.file(path.join(__dirname, "index.html"));
});

router.get('/public/*' , function(req){
  var filePath = path.join(__dirname, 'public', req.params.splat[0]);
  return bogart.file(filePath);
});

router.get('/api/users', function(req) { 
  var sortBy = req.params.sort || "name";
  var skip = parseInt(req.params.skip) || 0;
  var take = parseInt(req.params.take) || 5;  
  var search = req.params.search;

  var returnData= data.sort (function(a,b ){ 
  	return a[sortBy] <  b[sortBy] ? -1 : 1;
  });


  if (search){
  	returnData = returnData.filter(function(item){
  	 	return item.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
  	});	
  }
  
  var count = returnData.length;
  returnData= returnData.slice(skip, skip + take);

  return bogart.json({sort:sortBy, pageSize:take, start:skip+1, end: skip + returnData.length, count:count, results:returnData}); 
});

router.post("/api/users", function(req) {
	var ids = (req.params.ids || "").split(",");	
	if(ids.length === 1 && ids[0] === "*") {
		data = [];
	} else {
		ids.forEach(function(id) {
			data = data.filter(function(a) {
				return a.id !== parseInt(id, 10);
			})
		});
	}

	return bogart.json({status:"ok"});
});

var app = bogart.app();
app.use(bogart.batteries({secret:"ASDFLKJASDF"})); // A batteries included JSGI stack including streaming request body parsing, session, flash, and much more.
app.use(router); // Our router

app.start({port:1337});
