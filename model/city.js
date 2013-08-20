var database = require("./database.js");

var DbCity = database.City;



exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	var retJson =req.query.json; 
	
	DbCity.find().sort({name : 1}).execFind(function (err, listAllCity) {
        
		
		
        if (listAllCity && listAllCity.length > 0 && retJson) 
        	res.json(listAllCity);
        else 
        {
        	if(req.session.admin)
        	{
        		res.render('listCity',{layout: 'home',qryCity:listAllCity,title:"Guiya",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
};
