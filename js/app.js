import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
authDomain: "powderroot26.firebaseapp.com",
projectId: "powderroot26",
storageBucket: "powderroot26.firebasestorage.app",
messagingSenderId: "776300724322",
appId: "1:776300724322:web:44b8908b6ffe1f6596513b",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

emailjs.init("lxY_3luPFEJNp2_dO");

const products = [
{
id:1,
name:"Onion Powder",
price:349,
img:"assets/images/onion.jpg"
},

{
id:2,
name:"Garlic Powder",
price:299,
img:"assets/images/garlic.jpg"
},

{
id:3,
name:"Ginger Powder",
price:299,
img:"assets/images/ginger.jpg"
}
];

let cart = [];

let currentUser = null;

onAuthStateChanged(auth,(user)=>{

currentUser = user;

const loginBtn =
document.getElementById("login-btn");

const profile =
document.getElementById("user-profile");

const userImg =
document.getElementById("user-img");

if(user){

loginBtn.classList.add("hidden");

profile.classList.remove("hidden");

userImg.src = user.photoURL;

}else{

loginBtn.classList.remove("hidden");

profile.classList.add("hidden");

}

});

window.handleAuth = () => {

signInWithPopup(auth,provider)
.catch(err=>console.log(err));

};

window.handleLogout = () => {

signOut(auth);

};

window.toggleCart = () => {

document
.getElementById("cart-drawer")
.classList.toggle("active");

};

window.scrollToProducts = () => {

document
.getElementById("products")
.scrollIntoView({
behavior:"smooth"
});

};

window.addToCart = (id) => {

const existing =
cart.find(item=>item.id===id);

if(existing){

existing.qty++;

}else{

const product =
products.find(p=>p.id===id);

cart.push({
...product,
qty:1
});

}

renderCart();

};

window.updateQty = (id,change) => {

const item =
cart.find(i=>i.id===id);

if(!item) return;

item.qty += change;

if(item.qty <= 0){

cart = cart.filter(i=>i.id!==id);

}

renderCart();

};

function renderCart(){

const cartList =
document.getElementById("cart-items-list");

const totalText =
document.getElementById("cart-total");

const count =
document.getElementById("cart-count");

if(cart.length===0){

cartList.innerHTML =
`<p style="text-align:center;margin-top:40px;">
YOUR BAG IS EMPTY
</p>`;

totalText.innerText = "₹0";

count.innerText = "0";

return;

}

cartList.innerHTML = "";

let total = 0;
let qty = 0;

cart.forEach(item=>{

total += item.price * item.qty;

qty += item.qty;

cartList.innerHTML += `

<div style="
display:flex;
justify-content:space-between;
align-items:center;
background:white;
padding:15px;
margin-bottom:15px;
border-radius:18px;
">

<div style="
display:flex;
align-items:center;
gap:12px;
">

<img src="${item.img}"
style="
width:60px;
height:60px;
object-fit:cover;
border-radius:15px;
">

<div>

<h4>${item.name}</h4>

<p>₹${item.price}</p>

</div>

</div>

<div style="
display:flex;
align-items:center;
gap:10px;
">

<button onclick="updateQty(${item.id},-1)">
-
</button>

<span>${item.qty}</span>

<button onclick="updateQty(${item.id},1)">
+
</button>

</div>

</div>

`;

});

totalText.innerText = `₹${total}`;

count.innerText = qty;

}

window.checkoutViaWhatsApp = () => {

if(!currentUser){

alert("Please login first.");

return;

}

if(cart.length===0){

alert("Cart is empty.");

return;

}

const address =
document.getElementById("cust-address").value;

const city =
document.getElementById("cust-city").value;

const zip =
document.getElementById("cust-zip").value;

if(!address || !city || !zip){

alert("Please fill shipping details.");

return;

}

const fullAddress =
`${address}, ${city} - ${zip}`;

const total =
cart.reduce((sum,item)=>
sum + (item.price*item.qty),0);

const items =
cart.map(i=>
`${i.name} x${i.qty}`)
.join(", ");

emailjs.send(
"service_cs926jb",
"template_ojt95o7",
{
customer_name:currentUser.displayName,
customer_email:currentUser.email,
order_details:items,
total_price:`₹${total}`,
address:fullAddress
}
);

let msg =
`*POWDER ROOT ORDER*%0A%0A`;

msg += `Customer: ${currentUser.displayName}%0A`;

msg += `Items: ${items}%0A`;

msg += `Total: ₹${total}%0A`;

msg += `Address: ${fullAddress}`;

window.open(
`https://wa.me/919096999662?text=${msg}`,
'_blank'
);

};

const container =
document.getElementById("product-container");

products.forEach(product=>{

container.innerHTML += `

<div class="product-card reveal">

<img src="${product.img}">

<h3>${product.name}</h3>

<p class="gold">₹${product.price}</p>

<button onclick="addToCart(${product.id})">
ADD TO BAG
</button>

</div>

`;

});

const observer =
new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

});

document
.querySelectorAll(".reveal")
.forEach(el=>observer.observe(el));

renderCart();
