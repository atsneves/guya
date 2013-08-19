var database = require("./database.js");

var DbPatrocinador = database.Patro;

exports.findLastBySystem = function(req,res,next){
	var params = req.params;
	
	var retJson =req.query.json; 
	
	var pSystem = req.query.sys;
	
	DbPatrocinador.find({system:pSystem}).sort({date : 1}).limit(1).execFind(function (err, listPatrocinador) {
		if (listPatrocinador && listPatrocinador.length > 0)
			res.json(listPatrocinador);
		else
			res.json({code:400,message:"Sem registro"});
		
	});
	
};

exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	var retJson =req.query.json; 
	
	DbPatrocinador.find().sort({date : -1}).execFind(function (err, listAllPatrocinador) {
        
		
		
        if (listAllPatrocinador && listAllPatrocinador.length > 0 && retJson) 
        	res.json(listAllPatrocinador);
        else 
        {
        	if(req.session.admin)
        	{
        		res.render('listPatrocinador',{layout: 'home',qryPatrocinador:listAllPatrocinador,title:"Guya",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
};
