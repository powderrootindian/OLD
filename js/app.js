import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth(app);
// Add this line below auth initialization
setPersistence(auth, browserLocalPersistence);

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
    { id: 1, name: "Artisanal Onion", price: 349, img: "assets/images/onion.jpg" },
    { id: 2, name: "Roasted Garlic", price: 199, img: "assets/images/garlic.jpg" },
    { id: 3, name: "Infused Ginger", price: 199, img: "assets/images/ginger.jpg" }
];

let cart = [];
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    document.getElementById('login-btn').classList.toggle('hidden', !!user);
    document.getElementById('user-profile').classList.toggle('hidden', !user);
    if(user) document.getElementById('user-img').src = user.photoURL;
});

window.handleAuth = () => signInWithPopup(auth, provider);
window.handleLogout = () => signOut(auth).then(() => location.reload());

window.toggleCart = () => document.getElementById('cart-drawer').classList.toggle('active');

window.addToCart = (id) => {
    const existing = cart.find(i => i.id === id);
    if(existing) existing.qty++;
    else cart.push({...products.find(p => p.id === id), qty: 1});
    renderCart();
};

window.updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if(item) {
        item.qty += delta;
        if(item.qty < 1) cart = cart.filter(i => i.id !== id);
        renderCart();
    }
};

function renderCart() {
    const list = document.getElementById('cart-items-list');
    list.innerHTML = cart.map(item => `
        <div class="cart-item-row">
            <div>
                <p style="font-size:0.9rem;">${item.name}</p>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
            </div>
            <p class="gold-text">₹${item.price * item.qty}</p>
        </div>`).join('');
    
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    document.getElementById('cart-total').innerText = `₹${total}`;
    document.getElementById('cart-count').innerText = cart.length;
}

window.nextStep = (n) => {
    if(n === 2 && !currentUser) return alert("Please Login First");
    if(n === 3) {
        const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
        const upi = `upi://pay?pa=8788855688-2@ybl&pn=PowderRoot&am=${total}&cu=INR`;
        document.getElementById('qr-container').innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upi)}">`;
    }
    document.querySelectorAll('.cart-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step-${n}`).classList.remove('hidden');
};

window.checkoutViaWhatsApp = () => {
    const addr = `${document.getElementById('cust-address').value}, ${document.getElementById('cust-city').value}`;
    const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    
    emailjs.send("service_cs926jb", "template_ojt95o7", {
        customer_name: currentUser.displayName,
        order_details: cart.map(i => `${i.name} x${i.qty}`).join(", "),
        total_price: `₹${total}`,
        address: addr
    });

    const msg = `*NEW ORDER - POWDER ROOT*%0AItems: ${cart.map(i => i.name + ' x' + i.qty).join(', ')}%0A*Total: ₹${total}*%0A*Ship To:* ${addr}`;
    window.open(`https://wa.me/919096999662?text=${msg}`, '_blank');
};

// Initial Product Render
const container = document.getElementById('product-container');
products.forEach(p => {
    container.innerHTML += `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>₹${p.price}</p>
            <button class="btn-gold-outline" onclick="addToCart(${p.id})">ADD TO BAG</button>
        </div>`;
});
