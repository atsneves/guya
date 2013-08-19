var express = require('express')
  , partials = require('express-partials')
  , app = express();
var request = require('needle');
var database = require("./model/database.js");
var AWS = require('aws-sdk');
var mime = require('mime');
AWS.config.loadFromPath('./config.json');

var DbAdmin = database.Admin;
var DbPatro = database.Patro;
var DbLocal = database.Local;
var DbGallery = database.Gallery;


//LoadModules
var adminModule = require("./model/administrator.js");
var localModule = require("./model/local.js");
var galleryModule = require("./model/gallery.js");
var patrocinadorModule = require("./model/patrocinador.js");

var mongoose = require("mongoose");

app.configure(function(){
	app.set("views","views");
	app.use(partials());
	app.use(express.favicon());
	app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use('/', express.static('public'));
	app.use(express.session({secret: 'atsneves2013SessionLogin'}));
	app.engine('.html', require('ejs').renderFile);
	app.set("view engine","html");
	app.set("view options",{
		layout: 'login'
	});
	
});



app.get("/",function(req,res,next){
	err = "";
	if(req.session.admin)
	{
		res.redirect("/home");
	}
	else
	{
		res.render('index',{layout: 'login',title:"Guya",erro:req.session.erro,code:err});
		req.session.destroy();
		console.log(err);
	}

});



app.post("/",function(req,res,next){
	
	DbAdmin.findOne({usuario : req.body.login,senha:req.body.senha}, function(err, retDatabase) {
        
        if (retDatabase) 
        {
			console.log(retDatabase);
			
			req.session.admin = retDatabase;
			
			res.redirect("/home");
        }	
        else
        {
        	req.session.erro = {code:500,message:"Usu&aacute;rio ou senha inv&aacute;lidos"};
        	res.redirect("/");
        }
    });
});

app.get("/home",function(req,res,next){
	
	console.log(req.session.admin);
	
	if(req.session.admin)
	{
		console.log(req.session.admin);
		err = "";
		res.render('boasvindas',{layout: 'home',title:"Guya",username:req.session.admin.usuario,code:req.session.erro});
		
		req.session.erro = "";
		
		console.log(err);
	}
	else
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		
	}
	
	
	//res.end();
});


app.get("/logout",function(req,res,next){
	req.session.destroy();
	res.redirect("/");
});

app.get("/userNew/:nome/:senha",function(req,res,next){
	
	console.log(req.params);
	request.post("http://localhost:2400/createAdmin",{login:req.params.nome,senha:req.params.senha},function(error, response, body){
		console.log(error);
		//console.log(response);
		console.log(body);
	});
	res.end();
});


app.post("/createAdmin",function(req,res,next){
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	
	if(req.body.identificador)
	{
		DbAdmin.findOne({_id:req.body.identificador},function(err,ret){
			ret.usuario = req.body.login;
			ret.senha = req.body.senha;
			ret.save(function(err,saveAdmin){
				console.log(err);
				console.log(saveAdmin);
				if(!err)
				{
					req.session.erro = {code:666,message:"Usuário alterado com sucesso!"};
					res.redirect("/home");
				}
				else
				{
					req.session.erro = {code:666,message:err.message};
					res.redirect("/home");
				}
				
			});
		});
		
	}
	else
	{
		var admin = new DbAdmin();
		admin.usuario = req.body.login;
		admin.senha = req.body.senha;
		
		admin.save(function(err,saveAdmin){
			console.log(err);
			if(!err)
			{
				req.session.erro = {code:666,message:"Usuário incluído com sucesso!"};
				res.redirect("/home");
			}
			else
			{
				req.session.erro = {code:666,message:err.message};
				res.redirect("/home");
			}
		});
	}
});

app.get("/lastpatrocinador",patrocinadorModule.findLastBySystem);

app.post("/createpatrocinador",function(req,res,next){
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	
	if(req.body.identificador)
	{
		DbPatro.findOne({_id:req.body.identificador},function(err,ret){
			ret.name = req.body.name;
			ret.description = req.body.description;
			ret.save(function(err,savepatrocinador){
				console.log(err);
				console.log(savepatrocinador);
				if(!err)
				{
					req.session.erro = {code:666,message:"Usuário alterado com sucesso!"};
					res.redirect("/home");
				}
				else
				{
					req.session.erro = {code:666,message:err.message};
					res.redirect("/home");
				}
				
			});
		});
		
	}
	else
	{
		
		require('crypto').randomBytes(32, function(ex, buf) {
		    var token = buf.toString('hex');
		    var spt = req.files.logo.name.split(".");
			var imageName = token +"."+spt[spt.length-1]; 
			
			fs.readFile(req.files.logo.path, function (err, data) {
			  // ...
			  var newPath = __dirname + "/tmp";
			  fs.writeFile(newPath, data, function (err) {
				  var newImage = newPath+"/"+req.files.logo.name;
				  
				  var s3 = new AWS.S3();
					console.log(imageName);
					console.log(mime.lookup(newImage));
					var d = {
				            Bucket: 'guya',
				            Key: "/logo/"+imageName,
				            Body: data,
				            ACL:"public-read-write",
				            ContentType: mime.lookup(newImage)
				            };
			       s3.client.putObject(d, function(err, resp) {
			            if (err) {
			            	req.session.erro = {code:400,message:"Error Bucket"+err};
							res.redirect("/home");
			            } else {
			                console.log("Successfully uploaded data to myBucket/myKey ret");
			                
			                var ret = new DbPatro();
			        		ret.name = req.body.name;
			        		ret.description = req.body.description;
			        		ret.url_image =  "https://s3-sa-east-1.amazonaws.com/guya//logo/"+imageName;
			        		ret.save(function(err,savepatrocinador){
			        			console.log(err);
			        			if(!err)
			        			{
			        				req.session.erro = {code:666,message:"Patrocinador incluído com sucesso!"};
			        				res.redirect("/home");
			        			}
			        			else
			        			{
			        				req.session.erro = {code:666,message:err.message};
			        				res.redirect("/home");
			        			}
			        		});
			                
			                
			                
			                
			            }
			        });
			  });
			});
			
		    
		});
		
		
	}
});


app.configure("development",function(){
	app.use(express.errorHandler({dumpExceptions:true,showStack:true}));
	app.set("db-uri","mongodb://localhost/backend");
	
});

app.configure("production",function(){
	app.use(express.errorHandler());
	app.set("db-uri","mongodb://localhost/backend");	
});


app.get("/admin/form",function(req,res,next){
	
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	console.log(req.query);
	
	if(req.query.p1)
	{
		DbAdmin.findOne({_id:req.query.p1},function(err,ret){
			res.render('formAdmin',{layout: 'home',param:ret,title:"Guya",username:req.session.admin.usuario,code:err});
		});
	}
	else
	{
		res.render('formAdmin',{layout: 'home',title:"Guya",username:req.session.admin.usuario,code:err});
	}
	
	
});


app.get("/patrocinador/form",function(req,res,next){
	
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	console.log(req.query);
	
	if(req.query.p1)
	{
		DbPatro.findOne({_id:req.query.p1},function(err,ret){
			res.render('formpatrocinador',{layout: 'home',param:ret,title:"Guya",username:req.session.admin.usuario,code:err});
		});
	}
	else
	{
		res.render('formpatrocinador',{layout: 'home',title:"Guya",username:req.session.admin.usuario,code:err});
	}
	
	
});



app.get("/location/listgallery",galleryModule.findAll);

app.get("/location/listgallery/form",function(req,res,next){
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	console.log(req.query);
	
	if(req.query.p1)
	{
		res.render('formGallery',{layout: 'home',idlocal:req.query.p1,title:"Guya",username:req.session.admin.usuario,code:err});
	}
	else
	{
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	
});

app.post("/location/createGallery",function(req,res,next){
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	
	if(req.body.tipo == "IMAGE")
	{
		require('crypto').randomBytes(32, function(ex, buf) {
		    var token = buf.toString('hex');
		    var spt = req.files.imagem.name.split(".");
			var imageName = token +"."+spt[spt.length-1]; 
			
			fs.readFile(req.files.imagem.path, function (err, data) {
			  // ...
			  var newPath = __dirname + "/tmp";
			  fs.writeFile(newPath, data, function (err) {
				  var newImage = newPath+"/"+req.files.imagem.name;
				  
				  var s3 = new AWS.S3();
					console.log(imageName);
					console.log(mime.lookup(newImage));
					var d = {
				            Bucket: 'guya',
				            Key: "/gallery/"+imageName,
				            Body: data,
				            ACL:"public-read-write",
				            ContentType: mime.lookup(newImage)
				            };
			       s3.client.putObject(d, function(err, resp) {
			            if (err) {
			            	req.session.erro = {code:400,message:"Error Bucket"+err};
							res.redirect("/home");
			            } else {
			                
			                var gallery = new DbGallery();
			                
			                gallery.url = "https://s3-sa-east-1.amazonaws.com/guya//gallery/"+imageName;
			                gallery.location_id = req.body.id_location;
			                gallery.type = req.body.tipo;
			                
			                gallery.save(function(erra,saveAdmin){
			       				console.log(erra);
			       				if(!erra)
			       				{
			       					req.session.erro = {code:666,message:"Galeria incluído com sucesso!"};
			       					res.redirect("/home");
			       				}
			       				else
			       				{
			       					req.session.erro = {code:666,message:err.message};
			       					res.redirect("/home");
			       				}
			       			});
			                
			                
			                
			            }
			        });
			  });
			});
			
		    
		});
		
	}
	else
	{
		 var gallery = new DbGallery();
         
         gallery.url = req.body.url;
         gallery.local_id = req.body.id_location;
         gallery.type = req.body.tipo;
         
         gallery.save(function(erra,saveAdmin){
				console.log(erra);
				if(!erra)
				{
					req.session.erro = {code:666,message:"Galeria incluído com sucesso!"};
					res.redirect("/home");
				}
				else
				{
					req.session.erro = {code:666,message:err.message};
					res.redirect("/home");
				}
			});
	}	
		
	
	
	
	
});
app.get("/location/list",localModule.findAll);

app.get("/location/form",function(req,res,next){
	
	console.log(req.query);
	var retJson =req.query.json;
	
	
	if(req.query.p1)
	{
		
		
		DbLocal.findOne({_id:req.query.p1},function(err,ret){
			if(retJson)
			{
				res.json(ret);
			}
			else
			{
				if(!req.session.admin)
				{	
					req.session.erro = {code:400,message:"Sem acesso"};
					res.redirect("/");
					return;
				}
				
				res.render('formlocation',{layout: 'home',param:ret,title:"Guya",username:req.session.admin.usuario,code:err});
			}
			
		});
	}
	else
	{
		res.render('formlocation',{layout: 'home',title:"Guya",username:req.session.admin.usuario,code:err});
	}
	
});

app.get("/admin/list",adminModule.findAll);

app.get("/patrocinador/list",patrocinadorModule.findAll);


app.post("/removeGallery",function(req,res,next){
	
	if(req.body.id)
	{
		DbGallery.remove( {"_id": req.body.id},function(err,ret){
			if(!err)
			{
				req.session.erro = {code:001,message:"Galeria removido com sucesso!"};
			}
			else
			{
				req.session.erro = err;
			}
			res.end();
		});
		
		
	}
});

app.post("/removelocation",function(req,res,next){
	
	if(req.body.id)
	{
		DbLocal.remove( {"_id": req.body.id},function(err,ret){
			if(!err)
			{
				req.session.erro = {code:001,message:"Galeria removido com sucesso!"};
			}
			else
			{
				req.session.erro = err;
			}
			DbGallery.remove( {"location_id": req.body.id},function(err,ret){
				res.end();
			});
		});
		
		
	}
});


app.post("/removeAdmin",function(req,res,next){
	
	if(req.body.id)
	{
		DbAdmin.remove( {"_id": req.body.id},function(err,ret){
			if(!err)
			{
				req.session.erro = {code:001,message:"Usuário removido com sucesso!"};
			}
			else
			{
				req.session.erro = err;
			}
			res.end();
		});
		
		
	}
});

app.post("/removePatrocinador",function(req,res,next){
	
	if(req.body.id)
	{
		DbPatro.remove( {"_id": req.body.id},function(err,ret){
			if(!err)
			{
				req.session.erro = {code:001,message:"Usuário removido com sucesso!"};
			}
			else
			{
				req.session.erro = err;
			}
			res.end();
		});
		
		
	}
});

var fs = require('fs');


//Create Local
app.post("/location/create",function(req,res,next){
	if(!req.session.admin)
	{	
		req.session.erro = {code:400,message:"Sem acesso"};
		res.redirect("/");
		return;
	}
	
	if(req.body.identificador)
	{
		DbLocal.findOne({_id:req.body.identificador},function(err,local){
			local.name = req.body.nome;
            
            local.price = req.body.price;
            
            local.description = req.body.descricao;
            
            local.phone = req.body.phone;
            
            local.address_location = [req.body.longitude,req.body.latitude];
            
            local.full_address = req.body.endereco;
            
            local.date_event = req.body.dia;
            
            local.hour_event = req.body.horario;
            
            local.order = req.body.prioridade;
            
            local.notify_text = req.body.notify_text;
            
            local.type = req.body.type;
            
			ret.save(function(err,saveAdmin){
				console.log(err);
				console.log(saveAdmin);
				if(!err)
				{
					req.session.erro = {code:666,message:"Local alterado com sucesso!"};
					res.redirect("/home");
				}
				else
				{
					req.session.erro = {code:666,message:err.message};
					res.redirect("/home");
				}
				
			});
		});
		
	}
	else
	{
		require('crypto').randomBytes(32, function(ex, buf) {
		    var token = buf.toString('hex');
		    var spt = req.files.logo.name.split(".");
			var imageName = token +"."+spt[spt.length-1]; 
			
			fs.readFile(req.files.logo.path, function (err, data) {
			  // ...
			  var newPath = __dirname + "/tmp";
			  fs.writeFile(newPath, data, function (err) {
				  var newImage = newPath+"/"+req.files.logo.name;
				  
				  var s3 = new AWS.S3();
					console.log(imageName);
					console.log(mime.lookup(newImage));
					var d = {
				            Bucket: 'guya',
				            Key: "/logo/"+imageName,
				            Body: data,
				            ACL:"public-read-write",
				            ContentType: mime.lookup(newImage)
				            };
			       s3.client.putObject(d, function(err, resp) {
			            if (err) {
			            	req.session.erro = {code:400,message:"Error Bucket"+err};
							res.redirect("/home");
			            } else {
			                console.log("Successfully uploaded data to myBucket/myKey ret");
			                
			                var local = new DbLocal();
			                
			                local.url_logo = "https://s3-sa-east-1.amazonaws.com/logo/"+imageName;
			                
			                local.name = req.body.nome;
			                
			                local.price = req.body.price;
			                
			                local.description = req.body.descricao;
			                
			                local.phone = req.body.phone;
			                
			                local.address_location = [req.body.longitude,req.body.latitude];
			                
			                local.full_address = req.body.endereco;
			                
			                local.date_event = req.body.dia;
			                
			                local.hour_event = req.body.horario;
			                
			                local.order = req.body.prioridade;
			                
			                local.notify_text = req.body.notify_text;
			                
			                local.type = req.body.type;
			                
			                local.save(function(erra,saveAdmin){
			    				console.log(erra);
			    				if(!erra)
			    				{
			    					req.session.erro = {code:666,message:"Local incluído com sucesso!"};
			    					res.redirect("/home");
			    				}
			    				else
			    				{
			    					req.session.erro = {code:666,message:err.message};
			    					res.redirect("/home");
			    				}
			    			});
			                
			                
			                
			                
			            }
			        });
			  });
			});
			
		    
		});
	}
});

app.post("/notifylocation",function(req,res,next){
	console.log(req.body.id);
	if(req.body.id)
	{
		DbLocal.findOne({"_id": req.body.id},function(err,ret){
			
			console.log(ret);
			
			console.log(err);
			
			if(ret)
			{
				var Push = require('node_apns').Push;
				var push = Push({
				    cert: require('fs').readFileSync('./apnlivetaxi.pem'), 
				    key: require('fs').readFileSync('./apnlivetaxi_key_noenc.pem')}, {
				        host: require('node_apns').APNS.development.host
				    });


				push.on('sent', function (notification) {

				    // The notification has been sent to the socket (it may be buffered if the network is slow...)
				    console.log('Sent', notification);

				});

				push.on('notificationError', function (errorCode, uid) {

				    // Apple has returned an error:
				    console.log('Notification with uid', uid, 'triggered an error:', require('node_apns').APNS.errors[errorCode]);

				});

				push.on('error', function (error) { console.log('Error!', error); });
				
				request.get("http://livetaxi.herokuapp.com/clients",function(error, response, body){
					for (i =0;i < body.length;i++)
					{
					
						if(body[i].devices && body[i].devices.length > 0)
						{
							if(body[i].devices[0].plataform == "IOS" && body[i].devices[0].registrationID != "(null)" && body[i].acceptsAdvertising)
								{
									
									var deviceId = body[i].devices[0].registrationID;
																
									var Notification = require('node_apns').Notification
									,    n = Notification(deviceId, {foo:"WORKFLOW_location_"+ret.icon_image,idlocation:req.body.id,aps:{"alert":ret.notify_text, "sound":"disco_voador.mp3"}});
									
									
									
									if (n.isValid()) { 
										push.sendNotification(n); 
										
										
									
									} 
									else {
										console.log("Malformed notification", n);
									}
									
								}
						}
						
					}
				});
				
			}
			
			/*
			*/
			
			
		});
		
	}
});



//app.db = mongoose.createConnection(app.set("db-uri"));
var port = (process.env.PORT || 2400);
//app.helpers(helpers.static);

app.listen(port);





console.log("Executando na porta http://localhost:2400");

