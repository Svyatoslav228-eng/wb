async function signUp(){ //авторизация
  let form = document.querySelector("#form");
  const response = await fetch("/user/sign-up", {
    method: "POST",
    body: new FormData(form)
  })
  if(response.ok){
    document.location = "/user/personal-cabinet";
  }
 

}
async function signIn(){ //регистрация
    const login = document.querySelector("#login").value;
    const password = document.querySelector("#password").value;
    const response = await fetch(`/user/sign-in?login=${login}&password=${password}`);
    if(response.ok){
      document.location = "/user/personal-cabinet";
      return;
    }
    alert(await response.text());
}
async function backToMainPage(){ //функция для возврата на начальную страницу
    document.location = "/";
}

async function addItem(){ //добавление товара для продавца
  let form = document.querySelector("#form-item");
  const response = await fetch("/retailer/add/item", {
    method: "POST",
    body: new FormData(form)
  })
  if(response.ok){
    document.location = "/";
  }
}

async function userModify(){ //удалить пользователя для админа
  document.location = "/user/moderate";
}
async function deleteUser(id){
  const response = await fetch(`/user/moderate/delete?id=${id}`, {
    method: "DELETE",
  });
  if(response.ok){
    alert("Пользователь удален!");
    
  }
  location.reload();
}
async function banUser(id){ //баним пользователя как админ
  const data = {id: id};
  const response = await fetch("/user/moderate/ban", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)});
    if(response.ok){
      alert("Пользователь забанен!");
    }
    location.reload();
}
async function unbanUser(id){ //отменяем бан как админ
  const data = {id: id};
  const response = await fetch("/user/moderate/unban", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)});
    if(response.ok){
      alert("Пользователь разбанен!");
    }
    location.reload();
}

async function addToCart(id){ //добавляем товар в корзину(только для покупателей!)
  const itemId = {id: id};
  const response = await fetch("/user/add/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemId)});
    if(response.ok){
      alert(await response.text());
      return;
    }
    alert(await response.text());
}

async function deleteFromCart(id){//удаляем товар из корзины
  const response = await fetch(`/user/delete/cart?id=${id}`, {
    method: "DELETE"
    });
    if(response.ok){
      alert(await response.text());
      location.reload();
    }
}

async function payForItem(id){//оплачиваем товар в корзине
  const response = await fetch(`/user/pay/cart?id=${id}`, {
    method: "DELETE"
    });
    if(response.ok){
      alert(await response.text());
      location.reload();
    }
}

async function filterItems(){//делаем фильтры для товаров на главной
  const category = document.querySelector("#filters").value;
  const response = await fetch(`/filter?category=${category}`);
  if(response.ok){
    document.location = "/";
    location.reload();
    document.querySelector("#search").value = category;
  }
}

async function resetFilters(){//сбрасываем фильтры
  const category = "";
  const response = await fetch(`/filter?category=${category}`);
  if(response.ok){
    document.location = "/";
    location.reload();
    document.querySelector("#search").value = category;
  }
}

async function search(e){ //функция для поисковой строки
  if(e.keyCode == 13){//по нажатию на Enter запрос отправляется на сервер
    const searchBar = document.querySelector("#search").value;
    console.log(searchBar);
    const response = await fetch(`/search?str=${searchBar}`);
    if(response.ok){
      document.location = "/";
      location.reload();
    }
  }
}

document.querySelector("#search").addEventListener('keydown', search);//добавляем прослушиватель для Enter

async function viewListOfPurchases(){//переход на страницу с покупочками для покупателя
  document.location = "/customer/purchases";
}
async function writeReview(id){//функция для написания отзыва на купленный товар
  const review = document.querySelector(`#review${id}`).value;
  let data = {
    id: +id,
    review: review
  }
  const response = await fetch("/item/add/review", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  alert(await response.text());
  location.reload();
}
async function setRating(id){//поставить отметку "Нравится"
  const data = {
    id: +id
  }
  console.log(data.id);
  const response = await fetch("/item/set/rating", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  alert(await response.text());
  location.reload();
}
async function deleteRating(id){//отменить отметочку "Нравится"
  const data = {
    id: +id
  }
  const response = await fetch("/item/delete/rating", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  alert(await response.text());
  location.reload();
}

async function showReviews(id){//посмотреть отзывы
  const response = await fetch(`/item/show/reviews?id=${id}`);
  alert(await response.text());
}

async function itemModify(){//перенаправочка на конструктор товаров для продавца
  document.location = "/item/modify";
}

async function changeItem(id){//изменить товар в конструкторе для продавца
  const data = {
    id: +id,
    price: document.querySelector(`.price${id}`).value
  }
  const response = await fetch("/change/item", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  alert(await response.text());
  location.reload();
}

async function deleteItem(id){//удалить товар у продавца
  const response = await fetch(`/delete/item?id=${id}`, {
    method: "DELETE"
  })
  alert(await response.text());
  location.reload();
}

async function toCart(){//перейти в корзину для пользователя
  const response = await fetch("/user/cart");
  if(!response.ok){
    alert(await response.text());
    return;
  }
  document.location = "/user/cart";
}

async function signOut(){//войти в гостевой режим
  const response = await fetch("/user/sign-out");
  if(response.ok){
    alert(await response.text());
    location.reload();
  }
}
async function complain(retailer, id){//плохой продавец, нужно пожаловаться на него!
  const data = JSON.stringify ( {
    retailer: retailer,
    id: +id
  });

  console.log(data);
  const response = await fetch("/retailer/complain",{
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: data
  });
  alert(await response.text());
  location.reload();
}