// app.js semplice, SENZA import né Firebase

console.log("APP JS CARICATO");

const loginSection = document.getElementById("login-section");
const staffSection = document.getElementById("staff-section");
const adminSection = document.getElementById("admin-section");

const loginForm = document.getElementById("login-form");
const roleBtns = document.querySelectorAll(".role-btn");
const staffTableBody = document.getElementById("staff-table-body");
const staffInfo = document.getElementById("staff-info");

let currentRole = "admin";
let currentName = "";

roleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    roleBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentRole = btn.dataset.role;
  });
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = loginForm.elements["name"].value.trim();
  const password = loginForm.elements["password"].value;

  if (!name) {
    alert("Inserisci il tuo nome");
    return;
  }
  if (password !== "fondazione") {
    alert("Password errata. Usa: fondazione");
    return;
  }

  currentName = name;
  if (currentRole === "admin") {
    showSection("admin");
  } else {
    showSection("staff");
    loadFakeStudents();
  }
});

document.getElementById("logout-staff").addEventListener("click", () => {
  showSection("login");
});

document.getElementById("logout-admin").addEventListener("click", () => {
  showSection("login");
});

function showSection(which) {
  loginSection.classList.remove("active");
  staffSection.classList.remove("active");
  adminSection.classList.remove("active");

  if (which === "login") {
    loginSection.classList.add("active");
    loginForm.reset();
  } else if (which === "staff") {
    staffSection.classList.add("active");
    staffInfo.textContent = `Utente: ${currentName} (${currentRole})`;
  } else if (which === "admin") {
    adminSection.classList.add("active");
  }
}

function loadFakeStudents() {
  const students = [
    { id: 1, nome: "Mario Rossi" },
    { id: 2, nome: "Luca Bianchi" },
    { id: 3, nome: "Giulia Verdi" },
  ];

  staffTableBody.innerHTML = "";
  students.forEach((s) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.nome}</td>
      <td>
        <button class="presence-btn assente" data-status="assente">ASSENTE</button>
      </td>
    `;
    const btn = tr.querySelector("button");
    btn.addEventListener("click", () => {
      const newStatus =
        btn.dataset.status === "assente" ? "presente" : "assente";
      btn.dataset.status = newStatus;
      btn.textContent = newStatus.toUpperCase();
      btn.className = "presence-btn " + newStatus;
    });
    staffTableBody.appendChild(tr);
  });
}

// tab admin finte
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanes = {
  config: document.getElementById("config-tab"),
  labs: document.getElementById("labs-tab"),
  groups: document.getElementById("groups-tab"),
};

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const t = btn.dataset.tab;
    Object.keys(tabPanes).forEach((k) => {
      tabPanes[k].style.display = k === t ? "block" : "none";
    });
  });
});
