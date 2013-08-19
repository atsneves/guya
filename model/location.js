var database = require("./database.js");

var DbLocation = database.Location;



exports.findAll = function(req,res,next){
	DbLocation.find().sort({name : 1}).execFind(function (err, listAllEstab) {
        
		console.log(listAllEstab);
		
        if (listAllEstab && listAllEstab.length > 0) res.json(listAllEstab);
        
        
    });
	
};

exports.create = function(req,res,next){
	
	
	var location = new DbLocation();
	location.nome = req.body.name;
	location.address = req.body.address;
	location.phone = req.body.phone;
	location.location = [req.body.location.lat,req.body.location.lng];
	
	location.save(function(err,saveLocal){
		if(!err)
		{
			res.send(saveLocal);
		}
		else
		{
			res.send(err);
			console.log(err);
		}
		
		
	});
	
	
	
};