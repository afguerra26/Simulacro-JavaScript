// ===============================
// CONFIG
// ===============================
const API_USERS = "http://localhost:3000/users";

// ===============================
// ELEMENTOS DOM
// ===============================
const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Inputs LOGIN
const loginEmail = loginForm.querySelector("input[type='email']");
const loginPassword = loginForm.querySelector("input[type='password']");
const loginRole = loginForm.querySelector("select");

// Inputs REGISTER
const registerName = registerForm.querySelector("input[type='text']");
const registerEmail = registerForm.querySelector("input[type='email']");
const registerPassword = registerForm.querySelector("input[type='password']");

// ===============================
// SPA NAVIGATION
// ===============================
window.toggleAuth = function (sectionId) {
    document.querySelectorAll(".auth-section").forEach(sec => {
        sec.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");
};

// ===============================
// LOGIN
// ===============================
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    const role = loginRole.value;

    if (!email || !password || !role) {
        alert("Completa todos los campos");
        return;
    }

    const res = await fetch(API_USERS);
    const users = await res.json();

    const user = users.find(
        u => u.email === email && u.password === password && u.role === role
    );

    if (!user) {
        alert("Credenciales incorrectas");
        return;
    }

    //  Guardar sesión
    localStorage.setItem("session", JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role
    }));

    //  Redirección por rol
    if (user.role === "admin") {
        window.location.href = "/html/dashboard.html";
    } else {
        window.location.href = "/html/menu.html";
    }
});

// ===============================
// REGISTER
// ===============================
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();

    if (!name || !email || !password) {
        alert("Completa todos los campos");
        return;
    }

    const newUser = {
        name,
        email,
        password,
        role: "user"
    };

    await fetch(API_USERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
    });

    alert("Registro exitoso. Ahora inicia sesión");
    toggleAuth("loginSection");
});
