var databaseURL = ("mongodb://localhost/guya");
var mongoose = require("mongoose");
mongoose.connect(databaseURL);
Schema = mongoose.Schema;

///Cria a tabela de administrador

var TABLE_ADMIN = "Administrator";
var TABLE_LOCAIS = "Locais";
var TABLE_GALLE = "Gallery";
var TABLE_PATROCINADOR = "Patrocinador";



var enumType = ["BAR", "CLUBE","FESTAS","HOT","ELAS","ELES","POINTS"];

var enumTypeGallery = ["VIDEO","IMAGE"];


var AdminSchema = new Schema({
	usuario: {type:String,required:true,unique: true},
	senha: {type:String,required:true}
});

var LocaisSchema = new Schema({
	url_logo: {type:String},
	name: {type:String,required:true},
	price:{type: String},
	description:{type:String,required:true},
	phone:{type:String},
	full_address:{type:String,required:true},
	address_location:{type: [Number], index: "2d"},
	date_event:{type:String},
	hour_event:{type:String},
	notify_text:{type:String},
	order:{type:Number,default:0},
	type:{type:String,required: true, enum:enumType}
});


var PatrocinadorSchema = new Schema({
	name:{type:String, required:true},
	description:{type:String, required:true},
	url_image:{type:String,required:true}
});

var GalerySchema = new Schema({
	url:{type:String,required:true},
	type:{type:String,required: true, enum:enumTypeGallery},
	local_id:{type:String,required:true}
});

mongoose.model(TABLE_ADMIN, AdminSchema);
exports.Admin = mongoose.model(TABLE_ADMIN);

mongoose.model(TABLE_LOCAIS, LocaisSchema);
exports.Local = mongoose.model(TABLE_LOCAIS);

mongoose.model(TABLE_GALLE, GalerySchema);
exports.Gallery = mongoose.model(TABLE_GALLE);

mongoose.model(TABLE_PATROCINADOR, PatrocinadorSchema);
exports.Patro = mongoose.model(TABLE_PATROCINADOR);
