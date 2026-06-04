// ======================
// FIREBASE IMPORTS
// ======================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged,
browserLocalPersistence,
setPersistence
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// ======================
// CONFIG
// ======================

const firebaseConfig = {

apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",

authDomain: "powderroot26.firebaseapp.com",

projectId: "powderroot26",

storageBucket: "powderroot26.firebasestorage.app",

messagingSenderId: "776300724322",

appId: "1:776300724322:web:44b8908b6ffe1f6596513b"

};

const PHONE_NUMBER = "919096999662";

const UPI_ID = "8788855688-2@ybl";

const EMAIL_SERVICE = "service_cs926jb";

const EMAIL_TEMPLATE = "template_ojt95o7";

const EMAIL_PUBLIC = "lxY_3luPFEJNp2_dO";


// ======================
// INITIALIZE
// ======================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

emailjs.init(EMAIL_PUBLIC);

setPersistence(auth, browserLocalPersistence);


// ======================
// PRODUCTS
// ======================

const products = [

{
id:1,
name:"Onion Powder",
price:45,
img:"assets/images/onion.jpg",
desc:"Premium dehydrated onion powder."
},

{
id:2,
name:"Garlic Powder",
price:55,
img:"assets/images/garlic.jpg",
desc:"Natural garlic powder."
},

{
id:3,
name:"Ginger Powder",
price:50,
img:"assets/images/ginger.jpg",
desc:"Fresh aromatic ginger powder."
}

];


// ======================
// STATE
// ======================

let cart = [];

let currentUser = null;


// ======================
// AUTH
// ======================

onAuthStateChanged(auth,(user)=>{

currentUser = user;

const loginBtn =
document.getElementById("login-btn");

const profile =
document.getElementById("user-profile");

const img =
document.getElementById("user-img");

if(user){

loginBtn.classList.add("hidden");

profile.classList.remove("hidden");

img.src = user.photoURL;

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

await signOut(auth);

};


// ======================
// PRODUCTS
// ======================

const productContainer =
document.getElementById("product-container");

function renderProducts(){

if(!productContainer) return;

productContainer.innerHTML = "";

products.forEach(product=>{

productContainer.innerHTML += `

<div class="product-card reveal">

<img src="${product.img}" alt="${product.name}">

<div>

<h3>${product.name}</h3>

<p>${product.desc}</p>

<p class="gold">₹${product.price}</p>

<button
class="btn-gold-outline"
onclick="addToCart(${product.id})">

ADD TO BAG

</button>

</div>

</div>

`;

});

}

renderProducts();


// ======================
// CART
// ======================

window.toggleCart = ()=>{

document
.getElementById("cart-drawer")
.classList
.toggle("active");

};


window.addToCart = (id)=>{

const item =
cart.find(i=>i.id===id);

if(item){

item.qty++;

}else{

const product =
products.find(p=>p.id===id);

cart.push({

...product,
qty:1

});

}

renderCart();

animateCart();

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


// ======================
// CART RENDER
// ======================

function renderCart(){

const list =
document.getElementById("cart-items-list");

const totalText =
document.getElementById("cart-total");

const count =
document.getElementById("cart-count");

const qrContainer =
document.getElementById("qr-container");

const payBtn =
document.getElementById("upi-pay-btn");

if(!list) return;

if(cart.length===0){

list.innerHTML =
"<p>Your bag is empty.</p>";

totalText.innerText = "₹0";

count.innerText = "0";

if(qrContainer)
qrContainer.innerHTML = "";

return;

}

let total = 0;

let quantity = 0;

list.innerHTML = "";

cart.forEach(item=>{

total += item.price * item.qty;

quantity += item.qty;

list.innerHTML += `

<div class="cart-item">

<div>

<strong>${item.name}</strong>

<br>

<button onclick="updateQty(${item.id},-1)">−</button>

<span>${item.qty}</span>

<button onclick="updateQty(${item.id},1)">+</button>

</div>

<div>

₹${item.price * item.qty}

</div>

</div>

`;

});

totalText.innerText = `₹${total}`;

count.innerText = quantity;


// ======================
// QR GENERATION
// ======================

const upiUrl =
`upi://pay?pa=${UPI_ID}&pn=Powder Root&am=${total}&cu=INR`;

if(qrContainer){

qrContainer.innerHTML = `

<img
src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}"
alt="QR">

`;

}

if(payBtn){

payBtn.href = upiUrl;

}

}

renderCart();


// ======================
// WHATSAPP CHECKOUT
// ======================

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

alert("Please complete address.");

return;

}

const fullAddress =
`${address}, ${city} - ${pin}`;

const total =
cart.reduce(
(sum,item)=>sum+(item.price*item.qty),
0
);

const items =
cart.map(
item=>`${item.name} x${item.qty}`
).join(", ");


// EMAILJS

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

const message =

`🌿 POWDER ROOT ORDER

Customer: ${currentUser.displayName}

Email: ${currentUser.email}

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


// ======================
// COUNTERS
// ======================

document
.querySelectorAll(".counter")
.forEach(counter=>{

const observer =
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

const target =
+counter.dataset.target;

let current = 0;

const step =
target / 60;

const timer =
setInterval(()=>{

current += step;

if(current >= target){

counter.innerText =
target;

clearInterval(timer);

}else{

counter.innerText =
Math.floor(current);

}

},20);

observer.disconnect();

}

});

});

observer.observe(counter);

});


// ======================
// REVEAL
// ======================

const revealObserver =
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},{
threshold:.15
});

document
.querySelectorAll(".reveal")
.forEach(el=>revealObserver.observe(el));


// ======================
// NAVBAR SHRINK
// ======================

const nav =
document.querySelector(".glass-nav");

window.addEventListener("scroll",()=>{

if(window.scrollY > 100){

nav.style.padding = "15px 6%";

}else{

nav.style.padding = "25px 6%";

}

});


// ======================
// HERO PARALLAX
// ======================

window.addEventListener("scroll",()=>{

const hero =
document.querySelector(".hero-left");

if(hero){

hero.style.transform =
`translateY(${window.scrollY*0.12}px)`;

}

});


// ======================
// CART ANIMATION
// ======================

function animateCart(){

const cartIcon =
document.querySelector(".cart-trigger");

if(!cartIcon) return;

cartIcon.animate(

[
{transform:"scale(1)"},
{transform:"scale(1.3)"},
{transform:"scale(1)"}
],

{
duration:500
}

);

}


// ======================
// FLOATING EFFECT
// ======================

setInterval(()=>{

const cart =
document.querySelector(".cart-trigger");

if(cart){

cart.animate(

[
{transform:"translateY(0px)"},
{transform:"translateY(-3px)"},
{transform:"translateY(0px)"}
],

{
duration:2000
}

);

}

},2500);
