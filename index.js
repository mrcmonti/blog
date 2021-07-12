const express = require("express");
const app = express();
const session = require("express-session");
const connection = require("./database/database");
const adminAuth = require("./middlewares/adminAuth");

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const UsersController = require("./user/UsersController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./user/User");


//EJS
app.set('view engine','ejs');
app.use(express.static('public'));

//Sessions
app.use(session({
    secret: 'fish',
    cookie: {
        maxAge: 3000000
    }
}));

//Body Parser
app.use (express.urlencoded ({ extended: false }));
app.use (express.json());

//Database
connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com sucesso!");
    }).catch((error) => {
        console.log(error);
    });

//Rotas

app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", UsersController);

app.get("/", (req, res) => {
    Article.findAll({
        include: [{model: Category}],
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", { articles, categories });
        });
    });
})

app.get("/admin", adminAuth, (req, res) => {
    res.render("admin/index");
})

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("article", { article, categories });
            });
        }
        else{
            res.redirect("/");
        }
    }).catch(error => {
        console.log(error);
        res.redirect("/");
    })
})

app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then(category => {
     if(category != undefined){
         Category.findAll().then(categories => {
             res.render("index", { articles: category.articles, categories })
         })
     }
    });
})

app.listen(8080, () => {
    console.log("Running...");
});