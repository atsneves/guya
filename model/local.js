var database = require("./database.js");

var DbLocais = database.Local;

function distanceByLat(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var radlon1 = Math.PI * lon1/180
	var radlon2 = Math.PI * lon2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist;
}  

exports.findAllByDistance = function(req,res,next){
	
	var params = req.query;
	
	console.log(params);
	
	var retJson =req.query.json; 
	
	var latitudeBusca = req.query.lat;
    var longitudeBusca = req.query.lng;
	
	var raio = req.query.radio; 
	console.log(raio);
	DbLocais.find().sort({order : 1}).execFind(function (err, listAllLocal) {
		
        if (listAllLocal && listAllLocal.length > 0 && retJson){
        	var locaisJSON = [];	
        	
        	
        	for(i = 0; i < listAllLocal.length;i++)
        	{
        		var local = listAllLocal[i];
        		var distance = distanceByLat(latitudeBusca,longitudeBusca,local.address_location[1],local.address_location[0],"K");
        		console.log(distance);
        		if (distance <= raio)
        		locaisJSON.push(local);
        	}
        	res.json(locaisJSON);
        }
        	
        else 
        {
        	if(req.session.admin)
        	{
        		res.render('listLocais',{layout: 'home',qryLocais:listAllLocal,title:"Guiya",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
};


                                                                         

exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	console.log(params);
	
	var retJson =req.query.json; 
	
	DbLocais.find().sort({order : 1}).execFind(function (err, listAllLocal) {
        
		
		
        if (listAllLocal && listAllLocal.length > 0 && retJson) 
        	res.json(listAllLocal);
        else 
        {
        	if(req.session.admin)
        	{
        		res.render('listLocais',{layout: 'home',qryLocais:listAllLocal,title:"Guiya",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
	
};

