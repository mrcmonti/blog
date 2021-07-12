const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");


router.get("/admin/articles", adminAuth, (req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", { articles });
    });
})

router.get("/admin/articles/new", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", { categories });
    });
})

router.post("/admin/articles/save", (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    Article.create({
        title,
        slug: slugify(title),
        body,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles")
    })
})

router.get("/admin/articles/edit/:id", (req, res) => {
    var id = req.params.id;
    
    if(id != undefined) {
        if (!isNaN(id)) {
            console.log(id);
            Article.findByPk(id)
            .then(article => {
                Category.findAll().then(categories => {
                    res.render("admin/articles/edit",{ article, categories });
                });
            })
            .catch(error => {
                res.redirect("/admin/articles");
            });
        }
        else {
            res.redirect("/admin/articles");
        }
    }
})

router.post("/admin/articles/update", (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    Article.update({
        title,
        slug: slugify(title),
        body,
        categoryId: category
    },
    { where: { id } })
    .then(() => {
        res.redirect("/admin/articles")
    })
})


router.post("/admin/articles/delete", (req, res) => {
    var id = req.body.id;

    if (id != undefined) {
        if (!isNaN(id)) {
            Article.destroy({
                where: {
                    id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            })
        }
        else { //NÃO FOR NUMERO
            res.redirect("/admin/articles");
        }
    }
    else { //NULL
        res.redirect("/admin/articles");
    }
})

//Simples Exemplo de Paginação
router.get("/articles/page/:num", (req, res) => {
    var page = req.params.num;

    if(isNaN(page) || page == 1){
        offset = 0;
    }
    else{
        offset = (parseInt(page)-1) * 4;
    }

    Article.findAndCountAll({ 
        limit: 4,
        offset
    }).then(articles => {
        
        var next;
        if(offset + 4 >= articles.count){
            next = false;
        }else{
            next = true;
        }
        
        var result = {
            page: parseInt(page),
            articles,
            next
        }
        Category.findAll().then(categories => {
            res.render("admin/articles/page", { result, categories })
        });
    })
})

module.exports = router;