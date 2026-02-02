// ===============================
// SESSION MANAGEMENT
// ===============================

// Obtener sesión
function getSession() {
    const session = localStorage.getItem("session");
    return session ? JSON.parse(session) : null;
}

// ===============================
// ROUTE GUARDS
// ===============================

// Requiere sesión
function requireAuth() {
    const session = getSession();
    if (!session) {
        window.location.href = "index.html";
    }
}

// Requiere ADMIN
function requireAdmin() {
    const session = getSession();

    if (!session || session.role !== "admin") {
        window.location.href = "index.html";
    }
}

// Requiere USER
function requireUser() {
    const session = getSession();

    if (!session || session.role !== "user") {
        window.location.href = "index.html";
    }
}

// ===============================
// LOGOUT GLOBAL
// ===============================

function logout() {
    localStorage.removeItem("session");
    localStorage.removeItem("cart");
    window.location.href = "index.html";
}
