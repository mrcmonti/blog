const Sequelize = require("sequelize");
const connection = require("../database/database");
const Category = require("../categories/Category");

const Article = connection.define('articles',{
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },slug:{
        type:Sequelize.STRING,
        allowNUll: false
    },
    body: {
        type: Sequelize.TEXT,
        allowNUll: false
    }
})

//Relacionamentos
Category.hasMany(Article);   //Categoria tem muitos artigos
Article.belongsTo(Category); //Artigo pertence a uma categoria

//Article.sync({force: true});

module.exports = Article;