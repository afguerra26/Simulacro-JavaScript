// ===============================
// API
// ===============================
const API_ORDERS = "http://localhost:3000/orders";
const API_USERS = "http://localhost:3000/users";

// ===============================
// DOM
// ===============================
const ordersTableBody = document.querySelector("table tbody");
const cardsValues = document.querySelectorAll(".card h2");

const statusSelect = document.querySelector("select");
const updateOrderBtn = document.querySelector(".btn-dark");
const detailBox = document.getElementById("orderDetailBox");

// ===============================
// STATE
// ===============================
let allOrders = [];
let allUsers = [];
let selectedOrder = null;

// ===============================
// INIT
// ===============================
init();

async function init() {
    await Promise.all([getUsers(), getOrders()]);
}

// ===============================
// OBTENER USUARIOS
// ===============================
async function getUsers() {
    const res = await fetch(API_USERS);
    allUsers = await res.json();
}

// ===============================
// OBTENER PEDIDOS
// ===============================
async function getOrders() {
    const res = await fetch(API_ORDERS);
    allOrders = await res.json();

    renderStats();
    renderOrdersTable();

    // Mostrar primer pedido automáticamente
    if (allOrders.length > 0) {
        loadOrderDetail(allOrders[0]);
    }
}

// ===============================
// RENDER ESTADÍSTICAS
// ===============================
function renderStats() {
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === "pendiente").length;
    const todayRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);

    cardsValues[0].textContent = totalOrders;
    cardsValues[1].textContent = pendingOrders;
    cardsValues[2].textContent = `$${todayRevenue.toFixed(2)}`;
}

// ===============================
// RENDER TABLA DE PEDIDOS
// ===============================
function renderOrdersTable() {
    ordersTableBody.innerHTML = "";

    allOrders.forEach(order => {
        const user = getUserById(order.userId);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="ps-4 fw-bold">#ORD-${order.id}</td>
            <td>
                ${user?.name || "Usuario desconocido"}
                <br>
                <small class="text-muted">${user?.email || ""}</small>
            </td>
            <td class="fw-bold">$${order.total.toFixed(2)}</td>
            <td>
                <span class="badge ${getStatusBadge(order.status)} rounded-pill px-3">
                    ${formatStatus(order.status)}
                </span>
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-light btn-sm rounded-pill px-3">
                    Ver
                </button>
            </td>
        `;

        tr.querySelector("button").addEventListener("click", () => {
            loadOrderDetail(order);
        });

        ordersTableBody.appendChild(tr);
    });
}

// ===============================
// DETALLE DEL PEDIDO (TARJETA DERECHA)
// ===============================
function loadOrderDetail(order) {
    selectedOrder = order;

    const user = getUserById(order.userId);
    statusSelect.value = formatStatus(order.status);

    detailBox.innerHTML = `
        <div class="mb-3">
            <p class="mb-1"><strong>Pedido:</strong> #ORD-${order.id}</p>
            <p class="mb-1"><strong>Cliente:</strong> ${user?.name || "—"}</p>
            <p class="mb-1"><strong>Email:</strong> ${user?.email || "—"}</p>
            <p class="mb-1"><strong>Rol:</strong> ${user?.role || "—"}</p>
            <p class="mb-1"><strong>Fecha:</strong> ${formatDate(order.createdAt)}</p>
        </div>
        <hr>
    `;

    order.products.forEach(p => {
        detailBox.innerHTML += `
            <div class="d-flex justify-content-between mb-2">
                <span>${p.quantity}x ${p.name}</span>
                <span class="fw-bold">$${(p.price * p.quantity).toFixed(2)}</span>
            </div>
        `;
    });

    detailBox.innerHTML += `
        <hr>
        <div class="d-flex justify-content-between">
            <span class="fw-bold fs-5">Total</span>
            <span class="fw-bold fs-5 text-success">$${order.total.toFixed(2)}</span>
        </div>
    `;
}

// ===============================
// ACTUALIZAR ESTADO
// ===============================
updateOrderBtn.addEventListener("click", async () => {
    if (!selectedOrder) return;

    const newStatus = statusSelect.value.toLowerCase();

    await fetch(`${API_ORDERS}/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
    });

    selectedOrder.status = newStatus;

    renderStats();
    renderOrdersTable();

    alert("Pedido actualizado correctamente");
});

// ===============================
// HELPERS
// ===============================
function getUserById(id) {
    return allUsers.find(u => String(u.id) === String(id));
}

function formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusBadge(status) {
    if (status === "pendiente") return "bg-warning-subtle text-warning";
    if (status === "entregado") return "bg-success-subtle text-success";
    if (status === "cancelado") return "bg-danger-subtle text-danger";
    return "bg-secondary-subtle text-secondary";
}

function formatDate(date) {
    if (!date) return "—";

    const d = new Date(date);
    return d.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
