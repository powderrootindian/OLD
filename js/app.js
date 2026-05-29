// ================================
// POWDER ROOT PREMIUM APP.JS
// ================================

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


// ================================
// FIREBASE CONFIG
// ================================

const firebaseConfig = {

apiKey: "AIzaSyC-VwmmnGZBPGctP8bWp_ozBBTw45-eYds",
authDomain: "powderroot26.firebaseapp.com",
projectId: "powderroot26",
storageBucket: "powderroot26.firebasestorage.app",
messagingSenderId: "776300724322",
appId: "1:776300724322:web:44b8908b6ffe1f6596513b"

};


// ================================
// BUSINESS CONFIG
// ================================

const PHONE_NUMBER = "919096999662";
const UPI_ID = "8788855688-2@ybl";


// ================================
// EMAILJS
// ================================

emailjs.init("lxY_3luPFEJNp2_dO");


// ================================
// FIREBASE INIT
// ================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

setPersistence(
auth,
browserLocalPersistence
);


// ================================
// PRODUCTS
// ================================

const products = [

{
id:1,
name:"Onion Powder",
price:349,
img:"assets/images/onion.jpg",
desc:"Premium dehydrated onion powder."
},

{
id:2,
name:"Garlic Powder",
price:299,
img:"assets/images/garlic.jpg",
desc:"Fresh aromatic garlic powder."
},

{
id:3,
name:"Ginger Powder",
price:299,
img:"assets/images/ginger.jpg",
desc:"Finely ground ginger powder."
}

];


// ================================
// STATE
// ================================

let cart = [];

let currentUser = null;


// ================================
// AUTH
// ================================

onAuthStateChanged(auth,(user)=>{

const loginBtn =
document.getElementById("login-btn");

const profile =
document.getElementById("user-profile");

const img =
document.getElementById("user-img");

currentUser = user;

if(user){

loginBtn.classList.add("hidden");

profile.classList.remove("hidden");

img.src = user.photoURL;

}else{

loginBtn.classList.remove("hidden");

profile.classList.add("hidden");

}

});


window.handleAuth = async ()=>{

try{

await signInWithPopup(auth,provider);

}catch(error){

console.error(error);

}

};


window.handleLogout = async ()=>{

await signOut(auth);

};


// ================================
// PRODUCT RENDER
// ================================

const container =
document.getElementById("product-container");

function renderProducts(){

if(!container) return;

container.innerHTML = "";

products.forEach((product,index)=>{

container.innerHTML += `

<div class="product-card reveal">

<img src="${product.img}" alt="${product.name}">

<div class="product-info">

<h3>${product.name}</h3>

<p class="desc">
${product.desc}
</p>

<div class="product-bottom">

<span class="price">
₹${product.price}
</span>

<button
class="btn-add"
onclick="addToCart(${product.id})">

ADD

<i class="fa-solid fa-arrow-right"></i>

</button>

</div>

</div>

</div>

`;

});

observeReveal();

}

renderProducts();


// ================================
// CART
// ================================

window.addToCart = (id)=>{

const found =
cart.find(item=>item.id===id);

if(found){

found.qty++;

}else{

const product =
products.find(p=>p.id===id);

cart.push({
...product,
qty:1
});

}

renderCart();

toggleCart(true);

};


window.updateQty = (id,change)=>{

const item =
cart.find(i=>i.id===id);

if(!item) return;

item.qty += change;

if(item.qty <= 0){

cart =
cart.filter(i=>i.id !== id);

}

renderCart();

};


function renderCart(){

const list =
document.getElementById("cart-items-list");

const total =
document.getElementById("cart-total");

const count =
document.getElementById("cart-count");

if(!list) return;

if(cart.length === 0){

list.innerHTML =
`
<p style="text-align:center;padding-top:40px;">
Your bag is empty.
</p>
`;

count.innerText = 0;
total.innerText = "₹0";

return;

}

let totalAmount = 0;
let totalQty = 0;

list.innerHTML = "";

cart.forEach(item=>{

totalAmount += item.price * item.qty;

totalQty += item.qty;

list.innerHTML += `

<div class="cart-item-row">

<div class="item-meta">

<span class="item-name">
${item.name}
</span>

<div class="qty-controls">

<button
class="qty-btn"
onclick="updateQty(${item.id},-1)">
-
</button>

<span>${item.qty}</span>

<button
class="qty-btn"
onclick="updateQty(${item.id},1)">
+
</button>

</div>

</div>

<span>
₹${item.price * item.qty}
</span>

</div>

`;

});

count.innerText = totalQty;

total.innerText = `₹${totalAmount}`;

}


// ================================
// DRAWER
// ================================

window.toggleCart = (forceOpen = false)=>{

const drawer =
document.getElementById("cart-drawer");

if(forceOpen){

drawer.classList.add("active");

}else{

drawer.classList.toggle("active");

}

};


// ================================
// STEPS
// ================================

window.nextStep = (step)=>{

if(step === 2){

if(cart.length === 0){

alert("Add products first");

return;

}

if(!currentUser){

alert("Login first");

return;

}

}

if(step === 3){

const address =
document.getElementById("cust-address").value;

const city =
document.getElementById("cust-city").value;

const zip =
document.getElementById("cust-zip").value;

if(!address || !city || !zip){

alert("Fill shipping details");

return;

}

generateQR();

}

document
.querySelectorAll(".cart-step")
.forEach(el=>el.classList.add("hidden"));

document
.getElementById(`step-${step}`)
.classList.remove("hidden");

};


// ================================
// QR
// ================================

function generateQR(){

const total =
cart.reduce(
(sum,item)=>
sum + item.price * item.qty,
0
);

const upiURL =

`upi://pay?pa=${UPI_ID}&pn=PowderRoot&am=${total}&cu=INR`;

document
.getElementById("qr-container")
.innerHTML =

`
<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiURL)}">
`;

}


// ================================
// CHECKOUT
// ================================

window.checkoutViaWhatsApp = ()=>{

const address =
document.getElementById("cust-address").value;

const city =
document.getElementById("cust-city").value;

const zip =
document.getElementById("cust-zip").value;

const fullAddress =
`${address}, ${city}, ${zip}`;

const total =
cart.reduce(
(sum,item)=>
sum + item.price * item.qty,
0
);

const items =
cart
.map(i=>`${i.name} x${i.qty}`)
.join(", ");

emailjs.send(
"service_cs926jb",
"template_ojt95o7",
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

let msg =

`*POWDER ROOT ORDER*%0A%0A`;

msg +=
`Customer: ${currentUser.displayName}%0A`;

msg +=
`Items: ${items}%0A`;

msg +=
`Total: ₹${total}%0A`;

msg +=
`Address: ${fullAddress}`;

window.open(
`https://wa.me/${PHONE_NUMBER}?text=${msg}`,
"_blank"
);

};


// ================================
// REVEAL ANIMATIONS
// ================================

function observeReveal(){

const reveals =
document.querySelectorAll(".reveal");

const observer =
new IntersectionObserver(

(entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},

{
threshold:0.15
}

);

reveals.forEach(el=>
observer.observe(el)
);

}


// ================================
// PARALLAX HERO
// ================================

window.addEventListener(
"scroll",
()=>{

const hero =
document.querySelector(".hero-content");

if(hero){

hero.style.transform =
`translateY(${window.scrollY*0.15}px)`;

}

}
);


// ================================
// NAVBAR SHRINK
// ================================

const nav =
document.querySelector(".glass-nav");

window.addEventListener(
"scroll",
()=>{

if(window.scrollY > 80){

nav.style.padding =
"18px 6%";

}else{

nav.style.padding =
"25px 6%";

}

}
);


// ================================
// START
// ================================

renderCart();
