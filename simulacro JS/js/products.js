// ===============================
// API ENDPOINTS
// ===============================
const API_PRODUCTS = "http://localhost:3000/products";
const API_ORDERS = "http://localhost:3000/orders";

// ===============================
// DOM ELEMENTS
// ===============================
const menuContainer = document.getElementById("menuContainer");
const searchInput = document.getElementById("searchInput");

const cartCountEl = document.getElementById("cartCount");
const cartItemsEl = document.getElementById("cartItems");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const checkoutBtn = document.getElementById("checkoutBtn");

// ===============================
// CART STATE
// ===============================
const CART_KEY = "cart";
let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

// ===============================
// PRODUCTS STATE
// ===============================
let allProducts = [];

// ===============================
// FETCH PRODUCTS
// ===============================
async function getProducts() {
    try {
        const res = await fetch(API_PRODUCTS);
        const data = await res.json();

        // Solo productos activos
        allProducts = data.filter(p => p.status === "active");

        renderProducts(allProducts);
    } catch (error) {
        console.error("Error cargando productos", error);
    }
}

// ===============================
// RENDER PRODUCTS
// ===============================
function renderProducts(products) {
    menuContainer.innerHTML = "";

    if (products.length === 0) {
        menuContainer.innerHTML = `
            <p class="text-muted text-center">
                No hay productos disponibles
            </p>
        `;
        return;
    }

    products.forEach(product => {
        const col = document.createElement("div");
        col.className = "col";

        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm p-3" style="border-radius: 15px;">
                <div class="d-flex align-items-center">
                    <img src="${product.image}" class="rounded-3 me-3" width="70" />
                    <div class="w-100">
                        <h6 class="fw-bold mb-1">${product.name}</h6>
                        <p class="text-muted small mb-2">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-bold text-success">$${product.price}</span>
                            <button 
                                class="btn btn-success-custom btn-sm rounded-pill px-3"
                                data-id="${product.id}">
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        col.querySelector("button").addEventListener("click", () => {
            addToCart(product);
        });

        menuContainer.appendChild(col);
    });
}

// ===============================
// SEARCH FILTER
// ===============================
searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();

    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(value)
    );

    renderProducts(filteredProducts);
});

// ===============================
// ADD TO CART
// ===============================
function addToCart(product) {
    const existingItem = cart.find(
        item => item.productId === product.id
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
}

// ===============================
// SAVE CART
// ===============================
function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ===============================
// RENDER CART
// ===============================
function renderCart() {
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <p class="text-center text-muted small py-4">
                Tu carrito está vacío
            </p>
        `;
        updateTotals(0);
        cartCountEl.textContent = 0;
        return;
    }

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const div = document.createElement("div");
        div.className = "d-flex justify-content-between align-items-center mb-3";

        div.innerHTML = `
            <div>
                <p class="mb-0 fw-semibold">${item.name}</p>
                <small class="text-muted">
                    $${item.price} x ${item.quantity}
                </small>
            </div>
            <span class="fw-bold">$${itemTotal}</span>
        `;

        cartItemsEl.appendChild(div);
    });

    cartCountEl.textContent = cart.length;
    updateTotals(subtotal);
}

// ===============================
// UPDATE TOTALS
// ===============================
function updateTotals(amount) {
    subtotalEl.textContent = `$${amount.toFixed(2)}`;
    totalEl.textContent = `$${amount.toFixed(2)}`;
}

// ===============================
// CHECKOUT
// ===============================
checkoutBtn.addEventListener("click", async () => {
    const session = JSON.parse(localStorage.getItem("session"));

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const order = {
        userId: session.id,
        items: cart,
        total: cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        ),
        status: "pending",
        createdAt: new Date().toISOString()
    };

    try {
        await fetch(API_ORDERS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });

        cart = [];
        saveCart();
        renderCart();

        alert("Pedido realizado correctamente");
    } catch (error) {
        console.error("Error creando pedido", error);
    }
});

// ===============================
// INIT
// ===============================
getProducts();
renderCart();
