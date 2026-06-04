// =========================
// FIREBASE IMPORTS
// =========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged,
setPersistence,
browserLocalPersistence
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// =========================
// FIREBASE CONFIG
// =========================

const firebaseConfig = {

apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",

authDomain: "powderroot26.firebaseapp.com",

projectId: "powderroot26",

storageBucket: "powderroot26.firebasestorage.app",

messagingSenderId: "776300724322",

appId: "1:776300724322:web:44b8908b6ffe1f6596513b"

};


// =========================
// SETTINGS
// =========================

const PHONE_NUMBER = "919096999662";

const UPI_ID = "8788855688-2@ybl";

const EMAIL_SERVICE = "service_cs926jb";

const EMAIL_TEMPLATE = "template_ojt95o7";

const EMAIL_PUBLIC_KEY = "lxY_3luPFEJNp2_dO";


// =========================
// INITIALIZE
// =========================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

emailjs.init(EMAIL_PUBLIC_KEY);

setPersistence(auth, browserLocalPersistence);


// =========================
// PRODUCTS
// =========================

const products = [

{
id:1,
name:"Onion Powder",
price:299,
img:"assets/images/onion.jpg",
desc:"Premium dehydrated onion powder."
},

{
id:2,
name:"Garlic Powder",
price:189,
img:"assets/images/garlic.jpg",
desc:"Slow dried garlic powder."
},

{
id:3,
name:"Ginger Powder",
price:189,
img:"assets/images/ginger.jpg",
desc:"Natural ginger powder."
}

];


// =========================
// STATE
// =========================

let cart = [];

let currentUser = null;


// =========================
// AUTH
// =========================

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

window.handleAuth = async()=>{

try{

await signInWithPopup(auth,provider);

}catch(error){

console.log(error);

}

};

window.handleLogout = async()=>{

try{

await signOut(auth);

}catch(error){

console.log(error);

}

};


// =========================
// RENDER PRODUCTS
// =========================

const productContainer =
document.getElementById("product-container");

function renderProducts(){

if(!productContainer) return;

productContainer.innerHTML = "";

products.forEach(product=>{

productContainer.innerHTML += `

<div class="product-card reveal">

<img src="${product.img}" alt="${product.name}">

<h3>${product.name}</h3>

<p>${product.desc}</p>

<p class="gold">₹${product.price}</p>

<button
class="btn-gold-outline"
onclick="addToCart(${product.id})">

ADD TO BAG

</button>

</div>

`;

});

}

renderProducts();


// =========================
// CART
// =========================

window.toggleCart = ()=>{

document
.getElementById("cart-drawer")
.classList
.toggle("active");

};


window.addToCart = (id)=>{

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


window.updateQty = (id,change)=>{

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

const list =
document.getElementById("cart-items-list");

const totalText =
document.getElementById("cart-total");

const count =
document.getElementById("cart-count");

if(!list) return;

if(cart.length===0){

list.innerHTML = `
<p style="text-align:center">
Your bag is empty.
</p>
`;

totalText.innerText = "₹0";

count.innerText = "0";

return;

}

list.innerHTML = "";

let total = 0;

let quantity = 0;

cart.forEach(item=>{

total += item.price * item.qty;

quantity += item.qty;

list.innerHTML += `

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:15px;
padding-bottom:10px;
border-bottom:1px solid #ddd;
">

<div>

<strong>${item.name}</strong>

<div>

<button onclick="updateQty(${item.id},-1)">-</button>

<span>${item.qty}</span>

<button onclick="updateQty(${item.id},1)">+</button>

</div>

</div>

<div>

₹${item.price * item.qty}

</div>

</div>

`;

});

totalText.innerText =
`₹${total}`;

count.innerText =
quantity;

}

renderCart();


// =========================
// WHATSAPP CHECKOUT
// =========================

window.checkoutViaWhatsApp = ()=>{

if(!currentUser){

alert("Please login first.");

return;

}

if(cart.length===0){

alert("Your bag is empty.");

return;

}

const address =
document.getElementById("cust-address").value;

const city =
document.getElementById("cust-city").value;

const pin =
document.getElementById("cust-zip").value;

if(!address || !city || !pin){

alert("Please fill shipping details.");

return;

}

const fullAddress =
`${address}, ${city} - ${pin}`;

const total =
cart.reduce(
(sum,item)=>
sum + item.price*item.qty,
0
);

const items =
cart.map(item=>

`${item.name} x${item.qty}`

).join(", ");


// EMAIL BACKUP

emailjs.send(

EMAIL_SERVICE,

EMAIL_TEMPLATE,

{

customer_name:
currentUser.displayName,

customer_email:
currentUser.email,

order_details:
items,

total_price:
`₹${total}`,

address:
fullAddress

}

);


// WHATSAPP

let message =

`🌿 POWDER ROOT ORDER

Customer:
${currentUser.displayName}

Email:
${currentUser.email}

Items:
${items}

Total:
₹${total}

Address:
${fullAddress}`;

window.open(

`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`,

"_blank"

);

};


// =========================
// COUNTER ANIMATION
// =========================

const counters =
document.querySelectorAll(".counter");

const counterObserver =
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

const counter =
entry.target;

const target =
Number(counter.dataset.target);

let current = 0;

const step =
target / 50;

const interval =
setInterval(()=>{

current += step;

if(current >= target){

counter.innerText = target;

clearInterval(interval);

}else{

counter.innerText =
Math.floor(current);

}

},20);

counterObserver.unobserve(counter);

}

});

});

counters.forEach(counter=>
counterObserver.observe(counter)
);


// =========================
// REVEAL ANIMATION
// =========================

const reveals =
document.querySelectorAll(".reveal");

const revealObserver =
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},{
threshold:0.15
});

reveals.forEach(item=>
revealObserver.observe(item)
);


// =========================
// NAV SHRINK
// =========================

const nav =
document.querySelector(".glass-nav");

window.addEventListener("scroll",()=>{

if(window.scrollY > 80){

nav.style.padding =
"15px 6%";

}else{

nav.style.padding =
"25px 6%";

}

});


// =========================
// HERO PARALLAX
// =========================

window.addEventListener("scroll",()=>{

const hero =
document.querySelector(".hero-left");

if(hero){

hero.style.transform =
`translateY(${window.scrollY*0.12}px)`;

}

});


// =========================
// FLOATING CART ICON
// =========================

setInterval(()=>{

const cartIcon =
document.querySelector(".cart-trigger");

if(cartIcon){

cartIcon.animate(

[
{transform:"translateY(0px)"},
{transform:"translateY(-4px)"},
{transform:"translateY(0px)"}
],

{
duration:2000
}

);

}

},2500);
