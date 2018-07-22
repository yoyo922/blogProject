var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override"); 
var expressSanitizer = require("express-sanitizer");
var app = express();

mongoose.connect('mongodb://localhost:27017/restful_blog', { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now}
});

var blogDB = mongoose.model("Blog",blogSchema);

/*
blogDB.create({
   title : "Test Blog",
   image: "https://icdn6.digitaltrends.com/image/photographer-ted-hesser-viral-eclipse-photo-of-the-century-1200x0.jpg",
   body: "I recently went climbing and it was fun."
});
*/

//REST ROUTES
app.get("/", function(req, res) {
    res.redirect("/blogs");
});
//INDEX ROUTE
app.get("/blogs", function(req,res){
    blogDB.find({},function(err,blogs){
       if(err){
           console.log(err);
       }else{
           res.render("index",{blogs: blogs}); 
       }
    });
});

app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//NEW ROUTE
app.post("/blogs",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blogDB.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});

//SHOW ROOUTE
app.get("/blogs/:id", function(req, res) {
    blogDB.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show",{blog: foundBlog});
        }
    });   
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
   blogDB.findById(req.params.id,function(err,foundBlog){
       if(err){
           res.redirect("/blogs");
       }else{
           res.render("edit", {blog:foundBlog});
       }
   });
});

//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    blogDB.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req,res){
    blogDB.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log("IT DIDENT WORK" + err);
            res.redirect("/blogs");            
        }else{
            res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("blog server started");
});