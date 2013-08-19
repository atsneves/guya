var database = require("./database.js");

var DbLocais = database.Local;



exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	console.log(params);
	
	var retJson =req.query.json; 
	
	DbLocais.find().sort({order : 1,date_start: 1}).execFind(function (err, listAllLocal) {
        
		
		
        if (listAllLocal && listAllLocal.length > 0 && retJson) 
        	res.json(listAllLocal);
        else 
        {
        	if(req.session.admin)
        	{
        		res.render('listLocais',{layout: 'home',qryLocais:listAllLocal,title:"Guya",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
};
