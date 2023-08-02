//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const  _ = require("lodash")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")
const itemsschema =  new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item",itemsschema)

 
const first = new Item({
   name:"Drink Water"

});
const second = new Item({
  name:"Hit the + button to add a new item"

});
const third = new Item({
  name:"Hit this to delete an item"

});
const itemlistschema = new mongoose.Schema({
  name :String,
  items:[itemsschema]

})
const List = mongoose.model("List",itemlistschema)

const defaultItems = [first,second,third];


app.get("/", function(req, res) { 

  Item.find({}).then((data)=>{
    const today = new Date();
    const options = {
      weekday: 'long',
      
      month: 'long',
      day: 'numeric',
    };
    let date = today.toLocaleDateString("en-US",options)

    if(data.length=== 0){
    Item.insertMany(defaultItems);
    res.redirect("/")
    }
    else{
    res.render("list", {listTitle:date , newListItems:data });
    }

  })

 
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName == "Today"){
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name:listName}).then((data)=>{
    console.log(data)
    data.items.push(item);
    data.save();
    console.log(data.items)
    res.redirect("/" + listName);
})
  }

  
});
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName
 if(listName  === "Today"){

  Item.findByIdAndRemove(checkedItemId).then((err)=>{
   res.redirect("/")
   console.log(listName)
  });
}
else{
    List.findOneAndUpdate({ name:listName},{$pull:{items:{_id :checkedItemId}}}).then((data)=>{
    res.redirect("/" + listName);
    console.log(listName)
  })
}

  
})

app.get("/:topic", function(req,res){
  
  const a = _.capitalize(req.params.topic)
  List.findOne({name:a}).then((data)=>{
    if(!data){
      const list = new List({
        name : a,
        items :defaultItems 
   
     })
     list.save();
     res.redirect("/" + a)
    // res.render("list",{listTitle:data.name,newListItems:data.items})
   
    }
    else{
    console.log("List already exists")
    res.render("list",{listTitle:data.name,newListItems:data.items})
   
    }
  });
 
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
