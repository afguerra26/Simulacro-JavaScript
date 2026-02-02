const API_USERS = "http://localhost:3000/users";
const API_ORDERS = "http://localhost:3000/orders";

// DOM
const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const totalOrdersEl = document.getElementById("totalOrders");
const loyaltyPointsEl = document.getElementById("loyaltyPoints");
const ordersContainer = document.getElementById("ordersContainer");

// ===============================
// CARGAR USUARIO
// ===============================
async function loadUser() {
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session) return;

    const res = await fetch(`${API_USERS}/${session.id}`);
    const user = await res.json();

    userNameEl.textContent = user.name || user.names;
    userEmailEl.textContent = user.email;
    loyaltyPointsEl.textContent = user.points || 0;
}

// ===============================
// CARGAR ÓRDENES
// ===============================
async function loadOrders() {
    const session = JSON.parse(localStorage.getItem("session"));
    if (!session) return;

    const res = await fetch(API_ORDERS);
    const allOrders = await res.json();

    // 🔥 FILTRO FLEXIBLE
    const userOrders = allOrders.filter(
        o => String(o.userId) === String(session.id)
    );

    totalOrdersEl.textContent = userOrders.length;
    renderOrders(userOrders);
}

// ===============================
// RENDER ÓRDENES
// ===============================
function renderOrders(orders) {
    ordersContainer.innerHTML = "";

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <p class="text-muted text-center">
                No tienes pedidos aún
            </p>
        `;
        return;
    }

    orders.forEach(order => {
        const items = order.items || [];
        const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

        const status = normalizeStatus(order.status);

        const card = document.createElement("div");
        card.className = `card border-0 shadow-sm p-3 rounded-4 ${
            status === "cancelado" ? "opacity-75" : ""
        }`;

        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <div class="bg-light rounded-circle p-3 me-3">
                        <i class="bi ${getIcon(status)}"></i>
                    </div>
                    <div>
                        <h6 class="fw-bold mb-0">#ORD-${order.id}</h6>
                        <small class="text-muted">
                            ${formatDate(order.createdAt)} • ${itemsCount} items
                        </small>
                    </div>
                </div>

                <div class="text-end">
                    <h6 class="fw-bold mb-1">$${order.total.toLocaleString("es-CO")}</h6>
                    <span class="badge ${getBadge(status)} rounded-pill px-3">
                        ${formatStatus(status)}
                    </span>
                </div>
            </div>
        `;

        ordersContainer.appendChild(card);
    });
}

// ===============================
// HELPERS
// ===============================
function normalizeStatus(status) {
    if (status === "pending") return "pendiente";
    return status;
}

function formatStatus(status) {
    const map = {
        pendiente: "Pendiente",
        entregado: "Entregado",
        cancelado: "Cancelado",
        en_cocina: "En cocina"
    };
    return map[status] || status;
}

function getBadge(status) {
    if (status === "pendiente") return "bg-warning-subtle text-warning";
    if (status === "entregado") return "bg-success-subtle text-success";
    if (status === "cancelado") return "bg-danger-subtle text-danger";
    return "bg-secondary-subtle text-secondary";
}

function getIcon(status) {
    if (status === "pendiente") return "bi-clock";
    if (status === "entregado") return "bi-truck";
    if (status === "cancelado") return "bi-x-circle";
    return "bi-question-circle";
}

function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

// ===============================
// INIT
// ===============================
async function init() {
    await loadUser();
    await loadOrders();
}

init();
