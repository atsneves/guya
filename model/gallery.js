var database = require("./database.js");

var DbGallery = database.Gallery;



exports.findAll = function(req,res,next){
	
	var params = req.params;
	
	console.log(params);
	
	var retJson =req.query.json; 
	
	if(!req.query.p1)
	{
		res.redirect("/home");
		return;
	}
	var LocalId = req.query.p1;
	
	console.log("LocalId:"+LocalId);
	
	DbGallery.find({local_id : LocalId}).sort({order : 1}).execFind(function (err, listAllGallery) {
        console.log(err);
		console.log("lstGaller"+listAllGallery);
        if (listAllGallery && listAllGallery.length > 0 && retJson) 
        	res.json(listAllGallery);
        else 
        {
        	console.log(listAllGallery);
        	if(req.session.admin)
        	{
        		res.render('listGallery',{layout: 'home',idlocal:LocalId,qryGallery:listAllGallery,title:"Guya",username:req.session.admin.usuario,code:err});
        		
        	}
        	else
        	{
        		req.session.erro = {code:400,message:"Sem acesso"};
        		res.redirect("/");
        		
        	}
        	
        }
        
        
    });
	
};
