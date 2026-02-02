// ================================
// ADMIN MENU MANAGEMENT
// ================================

const API_PRODUCTS = "http://localhost:3000/products";

// ================================
// DOM ELEMENTS
// ================================

const productForm = document.getElementById("productForm");
const adminMenuContainer = document.getElementById("adminMenuContainer");
const totalProductsBadge = document.getElementById("totalProductsBadge");
const logoutBtn = document.getElementById("logoutBtn");

// Inputs
const nameInput = productForm.querySelector('input[type="text"]');
const categorySelect = productForm.querySelector("select");
const priceInput = productForm.querySelector('input[type="number"]');
const descriptionInput = productForm.querySelector("textarea");
const iconInput = productForm.querySelectorAll('input[type="text"]')[1];

// ================================
// LOAD PRODUCTS
// ================================

async function loadProducts() {
    const res = await fetch(API_PRODUCTS);
    const products = await res.json();

    renderProducts(products);
    updateCounter(products.length);
}

// ================================
// UPDATE COUNTER
// ================================

function updateCounter(total) {
    totalProductsBadge.textContent = `Total: ${total} platos`;
}

// ================================
// RENDER TABLE
// ================================

function renderProducts(products) {
    adminMenuContainer.innerHTML = "";

    products.forEach(product => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="ps-4 d-flex align-items-center">
                <div class="bg-light rounded-3 p-2 me-3 fs-4">${product.icon || "🍽️"}</div>
                <div>
                    <span class="fw-bold d-block">${product.name}</span>
                    <small class="text-muted">${product.description || ""}</small>
                </div>
            </td>

            <td>
                <span class="badge bg-light text-dark border rounded-pill">
                    ${product.category}
                </span>
            </td>

            <td class="fw-bold text-success">$${product.price}</td>

            <td class="text-end pe-4">
                <button 
                    class="btn btn-outline-${product.status === "active" ? "secondary" : "success"} btn-sm me-1 toggle-status"
                    data-id="${product.id}"
                    data-status="${product.status}">
                    <i class="bi ${product.status === "active" ? "bi-eye-slash" : "bi-eye"}"></i>
                </button>

                <button class="btn btn-outline-primary btn-sm" data-action="edit">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;

        adminMenuContainer.appendChild(tr);
    });

    attachToggleEvents();
}

// ================================
// TOGGLE STATUS
// ================================

function attachToggleEvents() {
    document.querySelectorAll(".toggle-status").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const newStatus = btn.dataset.status === "active" ? "inactive" : "active";

            await fetch(`${API_PRODUCTS}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            loadProducts();
        });
    });
}

// ================================
// ADD PRODUCT
// ================================

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newProduct = {
        name: nameInput.value.trim(),
        category: categorySelect.value,
        price: Number(priceInput.value),
        description: descriptionInput.value.trim(),
        icon: iconInput.value || "🍽️",
        status: "active"
    };

    await fetch(API_PRODUCTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
    });

    productForm.reset();
    loadProducts();
});




// ================================
// INIT
// ================================

loadProducts();
