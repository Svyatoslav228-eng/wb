const path = require("path");
const express = require("express");
const formidable = require("formidable")
const {complainOnRetailer, changeItem, deleteItem, listOfRetailersItems, returnReviews, deleteRating, returnListOfPurchases, addReview, addRating, getListOfItemsBySubname, returnListOfFilteredItems, addPurchase, deleteItemFromCartById, returnListOfItems, addNewUser, checkUser, addNewItem, returnModifyingListOfUsers, deleteUserById, banUser, unbanUser, addItemToCartById, returnListOfObjectsByNames} = require("./data/data");

const app = express();

app.use(express.json());

app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));

let currentUser;
let items = returnListOfItems();
    

app
    .get("/", (_, res) =>{

        res.render("items.hbs", {items: items, currentUser});
    })
    .post("/user/sign-up", (req, res) =>{//для создания аккаунта
        let user = {};
        let form = new formidable.IncomingForm({//ненавижу формы, но без них не загрузить аватарку! 
            multiples: true,
            keepExtensions: true,
            maxFileSize: 1 * 1024 * 1024,
            uploadDir: "./public/uploads",
            allowEmptyFiles: true,
            minFileSize: 0
          });

          form.on("fileBegin", (_, file) => {
            file.filepath = path.join(form.uploadDir, file.originalFilename);
          });
          form.parse(req, (err, fields, files) => {
            if (err) {
              res.status(400).send(err);
              return;
            }
            if (files && fields) {
              user = {
                login: fields.login[0],
                password: fields.password[0],
                role: fields.role[0],
                image: files.avatarImgName[0].originalFilename
              };
            }
            const ans = addNewUser(user);
            if(ans != "Аккаунт создан!"){
                res.status(500).send(ans);
                return;
            }
            currentUser = checkUser(user.login, user.password);
            
            res.status(200).send("ok");
          });
          
    })
    .get("/user/sign-in", (req, res) =>{//войти в аккаунт
        const login = req.query.login;
        const password = req.query.password;
        const user = checkUser(login, password);
        if(!user){
            res.status(500).send("Пользователь не найден либо забанен");
            return;
        }
        currentUser = user;
        res.status(200).render("items.hbs", {items: items, currentUser});
    })
    .get("/user/personal-cabinet", (_, res) =>{//открывает страницу с личным кабинетом
        res.render("personal-info.hbs", {currentUser});
    })
    .post("/retailer/add/item", (req, res) =>{//добавить товар
        let item = {};
        let form = new formidable.IncomingForm({
            multiples: true,
            keepExtensions: true,
            maxFileSize: 1 * 1024 * 1024,
            uploadDir: "./public/uploads",
          });

          form.on("fileBegin", (_, file) => {
            file.filepath = path.join(form.uploadDir, file.originalFilename);
          });
          form.parse(req, (err, fields, files) => {
            if (err) {
              res.status(400).send(err);
              return;
            }
            if (files && fields) {
              item = {
                name: fields.name[0],
                price: fields.price[0],
                category: fields.category[0],
                image: files.itemImgName[0].originalFilename,
              };
            }
            item.retailer = currentUser.login;
            const response = addNewItem(item);
            if(response !== "Товар добавлен!"){
                res.status(500).send(response);
                return;
            }
            items = returnListOfItems();
            res.status(200).send(response);
          });
    })
    .get("/user/moderate", (_, res) =>{//открывает страницу с списком юзеров
        let users = returnModifyingListOfUsers();
        res.status(200).render("moderate-users.hbs", {users: users});
    })
    .delete("/user/moderate/delete", (req, res) =>{//удалить юзера
        const id = req.query.id;
        const array = returnModifyingListOfUsers();
        deleteUserById(id, array);
        const listOfUsers = returnModifyingListOfUsers();
        res.status(200).render("moderate-users.hbs", {listOfUsers: listOfUsers});
    })
    .put("/user/moderate/ban", (req, res)=>{//забанить
        const id = req.body.id;
        const array = returnModifyingListOfUsers();
        banUser(id, array);
        const listOfUsers = returnModifyingListOfUsers();
        res.status(200).render("moderate-users.hbs", {listOfUsers: listOfUsers});
    })
    .put("/user/moderate/unban", (req, res)=>{//отменить бан
        const id = req.body.id;
        const array = returnModifyingListOfUsers();
        unbanUser(id, array);
        const listOfUsers = returnModifyingListOfUsers();
        res.status(200).render("moderate-users.hbs", {listOfUsers: listOfUsers});
    })
    .post("/user/add/cart", (req, res)=>{//добавить товар в корзину
        const id = req.body.id;
        const arrayOfItems = returnListOfItems();
        if(!currentUser){
          res.status(500).send("Сначала зарегистрируйтесь!");
          return;
        }
        const login = currentUser.login;
        const response = addItemToCartById(id, arrayOfItems, login);
        res.status(200).send(response);
    })
    .get("/user/cart", (_, res)=>{//открыть вкладку с корзиной
        if(!currentUser || currentUser.role !== "customer"){
            res.status(500).send("Вам туда не надо :)");
        }
        const cart_items = returnListOfObjectsByNames(currentUser.cart_items);
        res.status(200).render("cart.hbs", {cart_items: cart_items});
    })
    .delete("/user/delete/cart", (req, res) =>{//удалить товар из корзины
        const id = req.query.id;
        const login = currentUser.login;
        const response = deleteItemFromCartById(id, login);
        res.status(200).send(response);

    })
    .delete("/user/pay/cart", (req, res) =>{//оплатить товар в корзине
        const id = req.query.id;
        const login = currentUser.login;
        const name = currentUser.cart_items[id];
        deleteItemFromCartById(id, login);
        addPurchase(name, login);
        res.status(200).send("Поздравляем с покупкой!");

    })
    .get("/filter", (req, res)=>{//фильтр
        const category = req.query.category;
        items = returnListOfFilteredItems(category);
        res.render("items.hbs", {items: items, currentUser});
    })
    .get("/search", (req, res)=>{//поиск товара
        const searchBar = req.query.str;
        items = getListOfItemsBySubname(searchBar);
        res.render("items.hbs", {items: items, currentUser});
    })
    .get("/customer/purchases", (_, res) =>{//просто для hbs, отображение покупок
      let purchases = returnListOfPurchases(currentUser.items);
      res.status(200).render("purchases.hbs", {items: purchases});
    })
    .put("/item/add/review", (req, res)=>{//добавить отзыв на товар
      const reviewInfo = req.body;
      const id = reviewInfo.id;
      const review = reviewInfo.review;
      if(!addReview(currentUser.items[id].name, review, currentUser.login)){
        res.status(404).send("Введите отзыв!");
        return;
      }
      currentUser.items[id].isReviewed = true;
      items = returnListOfItems();
      res.status(200).send("Отзыв добавлен!");
    })
    .put("/item/set/rating", (req, res) =>{//поставить лайк товару
      const id = req.body.id;
      addRating(currentUser.items[id].name);
      currentUser.items[id].isRated = true;
      items = returnListOfItems();
      res.status(200).send("Мы рады, что вам понравился товар!");
    })
    .put("/item/delete/rating", (req, res) =>{//отменить отметку "Нравится"
      const id = req.body.id;
      deleteRating(currentUser.items[id].name);
      currentUser.items[id].isRated = false;
      items = returnListOfItems();
      res.status(200).send("Жалко:(");
    })
    .get("/item/show/reviews", (req, res) =>{//показать отзывы на товар
      const id = req.query.id;
      const response = returnReviews(items[id].itemName);
      res.status(200).send(response);
    })
    .get("/item/modify", (_, res) =>{//изменить инфу о товаре
      const retailerItems = listOfRetailersItems(currentUser.login);
      res.status(200).render("put-item.hbs", {items: retailerItems});
    })
    .delete("/delete/item", (req, res) =>{//удалить товар
      const id = +req.query.id;
      const response = deleteItem(currentUser.items[id], currentUser.login);
      items = returnListOfItems();
      res.status(200).send(response);
    })
    .put("/change/item", (req, res) =>{//изменить данные о товаре
      const id = req.body.id;
      const price = req.body.price;
      const response = changeItem(currentUser.items[id], price);
      items = returnListOfItems();
      res.status(200).send(response);
    })
    .get("/user/sign-out", (_, res)=>{//выйти из аккаунта
      currentUser = {};
      res.status(200).send("Вы вышли!");
    })
    .put("/retailer/complain", (req, res)=>{//жалоба на продавца
      const retailer = req.body.retailer;
      const id = req.body.id;
      const response = complainOnRetailer(retailer);
      currentUser.items[id].isComplained = true;
      res.status(200).send(response);
    })
    .use((_, res)=>{
        res.status(404).send("<h1>Not found</h1>");
    })
    .listen(3000, ()=>{
        console.log("Слушаем порт 3000");
    });