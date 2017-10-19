
var path = require('path');

// Cargar ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite:
//    DATABASE_URL = sqlite:///
//    DATABASE_STORAGE = quiz.sqlite
// Usar BBDD Postgres:
//    DATABASE_URL = postgres://user:passwd@host:port/database

var url, storage;

if (!process.env.DATABASE_URL) {
    url = "sqlite:///";
    storage = "crm.sqlite";
} else {
    url = process.env.DATABASE_URL;
    storage = process.env.DATABASE_STORAGE || "";
}

var sequelize = new Sequelize(url, 
	 						  { storage: storage
				              });



// Importar la definicion de Company de company.js
var Company = sequelize.import(path.join(__dirname,'company'));

// Importar la definicion de Customer de customer.js
var Customer = sequelize.import(path.join(__dirname,'customer'));

/*
// Importar la definicion de Salesman de user.js
// var Salesman = sequelize.import(path.join(__dirname,'salesman'));
*/

// Importar la definicion de TargetType de target_type.js
var TargetType = sequelize.import(path.join(__dirname,'targettype'));

// Importar la definicion de Target de target.js
var Target = sequelize.import(path.join(__dirname,'target'));

// Importar la definicion de Visit de visit.js
var Visit = sequelize.import(path.join(__dirname,'visit'));

// Importar la definicion de User de user.js
var User = sequelize.import(path.join(__dirname,'user'));

// Importar la definicion de Attachments de attachment.js
var Attachment = sequelize.import(path.join(__dirname,'attachment'));

// Importar la definicion de Posts de post.js
var Post = sequelize.import(path.join(__dirname,'post'));

// Importar la definicion de Comments de coment.js
var Comment = sequelize.import(path.join(__dirname,'comment'));

//-------------------------------------------------

// Relaciones entre modelos

Visit.belongsTo(Customer);
Customer.hasMany(Visit);

Visit.belongsTo(User, {as: "Salesman", foreignKey: 'SalesmanId'});
User.hasMany(Visit, {as: "Visits", foreignKey: 'SalesmanId'});

Target.belongsTo(Company);
Company.hasMany(Target);

Target.belongsTo(Visit);
Visit.hasMany(Target);

Target.belongsTo(TargetType);
TargetType.hasMany(Target);

// Salesman.belongsTo(User);
// User.hasOne(Salesman);

// Salesman.belongsTo(Attachment, {as: "Photo", foreignKey: 'PhotoId'});
// Attachment.hasOne(Salesman, {foreignKey: 'PhotoId'});


User.belongsTo(Attachment, {as: "Photo", foreignKey: 'PhotoId'});
Attachment.hasOne(User, {foreignKey: 'PhotoId'});



// Favoritos:
//   Un Usuario tiene muchas visitas favoritas.
//   Una visita tiene muchos fans (los usuarios que la han marcado como favorita)
User.belongsToMany(Visit, { as: 'Favourites', through: 'Favourites'});
Visit.belongsToMany(User, { as: 'Fans', through: 'Favourites'});

// Clientes principales de las fabricas.
//   Un cliente tiene varias fabricas a las que compra.
//   Una fabrica tiene varios clientes que compran sus productos.
Customer.belongsToMany(Company, { as: 'MainCompanies', through: 'CompanyCustomer', foreignKey: 'CustomerId'});
Company.belongsToMany(Customer, { as: 'AllCustomers', through: 'CompanyCustomer', foreignKey: 'CompanyId'});

Post.hasMany(Comment);
Comment.belongsTo(Post);
User.hasMany(Post, {foreignKey: 'AuthorId'});
Post.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});
User.hasMany(Comment, {foreignKey: 'AuthorId'});
Comment.belongsTo(User, {as: 'Author', foreignKey: 'AuthorId'});

Post.belongsToMany(Attachment, {through: 'PostAttachments'});

//-------------------------------------------------

// Exportar:

exports.Company		= Company;
exports.Customer    = Customer;
// exports.Salesman	= Salesman;
exports.TargetType	= TargetType;
exports.Target 		= Target;
exports.Visit		= Visit;
exports.User 		= User;
exports.Attachment 	= Attachment;
exports.Post        = Post;
exports.Comment     = Comment;

