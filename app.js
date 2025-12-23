// app.js - gestione locale (localStorage) senza Firebase

console.log("APP JS CARICATO");

// Stato principale
const defaultState = {
  labs: [
    { id: "lab1", name: "Lab1" },
    { id: "lab2", name: "Lab2" }
  ],
  students: [
    { id: "s1", name: "Mario Rossi" },
    { id: "s2", name: "Luca Bianchi" },
    { id: "s3", name: "Giulia Verdi" },
    { id: "s4", name: "Anna Neri" }
  ],
  groups: [
    { id: "g1", name: "Gruppo 1", studentIds: ["s1", "s2"] },
    { id: "g2", name: "Gruppo 2", studentIds: ["s3", "s4"] }
  ],
  schedule: [
    // {id,date,labId,groupId,docenteName,educatoreName,orario}
  ],
  attendance: [
    // {sessionId, studentId, date, status}
  ]
};

let state = loadState();

// Utente corrente
let currentRole = "admin";
let currentName = "";

// DOM comuni
const loginSection = document.getElementById("login-section");
const staffSection = document.getElementById("staff-section");
const adminSection = document.getElementById("admin-section");
const loginForm = document.getElementById("login-form");
const roleBtns = document.querySelectorAll(".role-btn");

// STAFF DOM
const staffDateInput = document.getElementById("staff-date");
const staffTableBody = document.getElementById("staff-table-body");
const staffInfo = document.getElementById("staff-info");
const staffLabTitle = document.getElementById("staff-lab-title");
const staffNoSession = document.getElementById("staff-no-session");

// ADMIN DOM - tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const labsTab = document.getElementById("labs-tab");
const studentsTab = document.getElementById("students-tab");
const groupsTab = document.getElementById("groups-tab");
const calendarTab = document.getElementById("calendar-tab");

// ADMIN DOM - labs
const labNameInput = document.getElementById("lab-name-input");
const addLabBtn = document.getElementById("add-lab-btn");
const labsListDiv = document.getElementById("labs-list");

// ADMIN DOM - students
const studentNameInput = document.getElementById("student-name-input");
const addStudentBtn = document.getElementById("add-student-btn");
const studentsListDiv = document.getElementById("students-list");

// ADMIN DOM - groups
const groupNameInput = document.getElementById("group-name-input");
const addGroupBtn = document.getElementById("add-group-btn");
const groupSelect = document.getElementById("group-select");
const groupStudentSelect = document.getElementById("group-student-select");
const addStudentToGroupBtn = document.getElementById("add-student-to-group-btn");
const groupDetailDiv = document.getElementById("group-detail");

// ADMIN DOM - calendar
const calDateInput = document.getElementById("cal-date-input");
const calLabSelect = document.getElementById("cal-lab-select");
const calGroupSelect = document.getElementById("cal-group-select");
const calDocenteInput = document.getElementById("cal-docente-input");
const calEducatoreInput = document.getElementById("cal-educatore-input");
const calOrarioInput = document.getElementById("cal-orario-input");
const addSessionBtn = document.getElementById("add-session-btn");
const sessionsListDiv = document.getElementById("sessions-list");

// inizializzazione
init();

function init() {
  // ruolo
  roleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      roleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentRole = btn.dataset.role;
    });
  });

  // login
  loginForm.addEventListener("submit", handleLogin);

  document.getElementById("logout-staff").addEventListener("click", () => {
    showSection("login");
  });
  document.getElementById("logout-admin").addEventListener("click", () => {
    showSection("login");
  });

  // data oggi staff
  const today = new Date().toISOString().slice(0, 10);
  staffDateInput.value = today;
  staffDateInput.addEventListener("change", () => {
    if (currentRole === "docente" || currentRole === "educatore") {
      loadStaffView();
    }
  });

  // tabs admin
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      showAdminTab(tab);
    });
  });

  // labs
  addLabBtn.addEventListener("click", () => {
    const name = labNameInput.value.trim();
    if (!name) return;
    state.labs.push({ id: `lab${Date.now()}`, name });
    labNameInput.value = "";
    saveState();
    renderLabs();
    renderCalendarSelectors();
  });

  // students
  addStudentBtn.addEventListener("click", () => {
    const name = studentNameInput.value.trim();
    if (!name) return;
    state.students.push({ id: `s${Date.now()}`, name });
    studentNameInput.value = "";
    saveState();
    renderStudents();
    renderGroupSelectors();
  });

  // groups
  addGroupBtn.addEventListener("click", () => {
    const name = groupNameInput.value.trim();
    if (!name) return;
    state.groups.push({ id: `g${Date.now()}`, name, studentIds: [] });
    groupNameInput.value = "";
    saveState();
    renderGroups();
    renderGroupSelectors();
    renderCalendarSelectors();
  });

  groupSelect.addEventListener("change", renderGroupDetail);
  addStudentToGroupBtn.addEventListener("click", () => {
    const gid = groupSelect.value;
    const sid = groupStudentSelect.value;
    if (!gid || !sid) return;
    const g = state.groups.find((gr) => gr.id === gid);
    if (!g.studentIds.includes(sid)) g.studentIds.push(sid);
    saveState();
    renderGroupDetail();
    renderGroups();
  });

  // calendar
  addSessionBtn.addEventListener("click", () => {
    const date = calDateInput.value;
    const labId = calLabSelect.value;
    const groupId = calGroupSelect.value;
    const docenteName = calDocenteInput.value.trim();
    const educatoreName = calEducatoreInput.value.trim();
    const orario = calOrarioInput.value.trim();

    if (!date || !labId || !groupId) {
      alert("Compila almeno data, laboratorio e gruppo.");
      return;
    }

    state.schedule.push({
      id: `sess${Date.now()}`,
      date,
      labId,
      groupId,
      docenteName,
      educatoreName,
      orario
    });
    saveState();
    renderSessions();
    alert("Sessione aggiunta.");
  });

  // render iniziale admin
  renderLabs();
  renderStudents();
  renderGroups();
  renderGroupSelectors();
  renderCalendarSelectors();
  renderSessions();
}

// login semplice
function handleLogin(e) {
  e.preventDefault();
  const name = loginForm.elements["name"].value.trim();
  const password = loginForm.elements["password"].value;

  if (!name) {
    alert("Inserisci il tuo nome.");
    return;
  }
  if (password !== "fondazione") {
    alert("Password errata.");
    return;
  }

  currentName = name;

  if (currentRole === "admin") {
    showSection("admin");
    showAdminTab("labs");
  } else {
    showSection("staff");
    staffInfo.textContent = `Utente: ${currentName} (${currentRole})`;
    loadStaffView();
  }
}

// sezioni
function showSection(which) {
  loginSection.classList.remove("active");
  staffSection.classList.remove("active");
  adminSection.classList.remove("active");

  if (which === "login") {
    loginSection.classList.add("active");
    loginForm.reset();
  } else if (which === "staff") {
    staffSection.classList.add("active");
  } else if (which === "admin") {
    adminSection.classList.add("active");
  }
}

// admin tab
function showAdminTab(tab) {
  labsTab.classList.remove("active");
  studentsTab.classList.remove("active");
  groupsTab.classList.remove("active");
  calendarTab.classList.remove("active");

  if (tab === "labs") labsTab.classList.add("active");
  if (tab === "students") studentsTab.classList.add("active");
  if (tab === "groups") groupsTab.classList.add("active");
  if (tab === "calendar") calendarTab.classList.add("active");
}

// render labs
function renderLabs() {
  labsListDiv.innerHTML = "";
  if (!state.labs.length) {
    labsListDiv.innerHTML = '<p class="small">Nessun laboratorio.</p>';
    return;
  }
  state.labs.forEach((lab) => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${lab.name} (${lab.id})`;
    labsListDiv.appendChild(div);
  });
}

// render students
function renderStudents() {
  studentsListDiv.innerHTML = "";
  if (!state.students.length) {
    studentsListDiv.innerHTML = '<p class="small">Nessun alunno.</p>';
    return;
  }
  state.students.forEach((st) => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = `${st.name} (${st.id})`;
    studentsListDiv.appendChild(div);
  });
}

// render groups
function renderGroups() {
  // solo lista riepilogo nel tab
  const list = state.groups
    .map((g) => {
      const count = g.studentIds.length;
      return `<div class="card"><strong>${g.name}</strong> (${count} alunni)</div>`;
    })
    .join("");
  // append al groupsTab sotto il resto
  // per semplicità non facciamo lista separata qui, usiamo solo groupDetail
}

// selectors per gruppi
function renderGroupSelectors() {
  // select gruppi
  groupSelect.innerHTML = "";
  state.groups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g.id;
    opt.textContent = g.name;
    groupSelect.appendChild(opt);
  });

  // select alunni
  groupStudentSelect.innerHTML = "";
  state.students.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    groupStudentSelect.appendChild(opt);
  });

  renderGroupDetail();
}

function renderGroupDetail() {
  const gid = groupSelect.value;
  if (!gid) {
    groupDetailDiv.innerHTML = '<p class="small">Nessun gruppo selezionato.</p>';
    return;
  }
  const g = state.groups.find((gr) => gr.id === gid);
  if (!g) {
    groupDetailDiv.innerHTML = '<p class="small">Gruppo non trovato.</p>';
    return;
  }
  const members = g.studentIds
    .map((sid) => {
      const st = state.students.find((s) => s.id === sid);
      return st ? `<span class="badge">${st.name}</span>` : "";
    })
    .join(" ");
  groupDetailDiv.innerHTML = `
    <strong>${g.name}</strong><br/>
    <span class="small">ID: ${g.id}</span><br/>
    <div style="margin-top:.35rem;">${members || '<span class="small">Nessun alunno nel gruppo.</span>'}</div>
  `;
}

// calendar selectors
function renderCalendarSelectors() {
  calLabSelect.innerHTML = "";
  state.labs.forEach((lab) => {
    const opt = document.createElement("option");
    opt.value = lab.id;
    opt.textContent = lab.name;
    calLabSelect.appendChild(opt);
  });

  calGroupSelect.innerHTML = "";
  state.groups.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g.id;
    opt.textContent = g.name;
    calGroupSelect.appendChild(opt);
  });
}

// render sessions
function renderSessions() {
  if (!state.schedule.length) {
    sessionsListDiv.innerHTML = '<p class="small">Nessuna sessione programmata.</p>';
    return;
  }
  const rows = state.schedule
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => {
      const lab = state.labs.find((l) => l.id === s.labId);
      const group = state.groups.find((g) => g.id === s.groupId);
      return `
        <div class="card">
          <strong>${s.date}</strong> ${s.orario ? ` - ${s.orario}` : ""}<br/>
          Lab: ${lab ? lab.name : s.labId} • Gruppo: ${group ? group.name : s.groupId}<br/>
          <span class="small">Docente: ${s.docenteName || '-'}</span> • 
          <span class="small">Educatore: ${s.educatoreName || '-'}</span>
        </div>
      `;
    })
    .join("");
  sessionsListDiv.innerHTML = rows;
}

// vista staff (docente/educatore)
function loadStaffView() {
  const date = staffDateInput.value;
  staffTableBody.innerHTML = "";
  staffLabTitle.textContent = "";
  staffNoSession.style.display = "none";

  const todaysSessions = state.schedule.filter((s) => s.date === date);
  if (!todaysSessions.length) {
    staffNoSession.style.display = "block";
    return;
  }

  // trova la sessione dove il nome coincide
  let mySession = null;
  if (currentRole === "docente") {
    mySession = todaysSessions.find(
      (s) => s.docenteName && s.docenteName.toLowerCase() === currentName.toLowerCase()
    );
  } else if (currentRole === "educatore") {
    mySession = todaysSessions.find(
      (s) => s.educatoreName && s.educatoreName.toLowerCase() === currentName.toLowerCase()
    );
  }

  if (!mySession) {
    staffNoSession.textContent =
      "Nessun laboratorio assegnato per questa data al tuo nome.";
    staffNoSession.style.display = "block";
    return;
  }

  const lab = state.labs.find((l) => l.id === mySession.labId);
  const group = state.groups.find((g) => g.id === mySession.groupId);
  staffLabTitle.textContent = `Laboratorio: ${
    lab ? lab.name : mySession.labId
  } • Gruppo: ${group ? group.name : mySession.groupId} ${
    mySession.orario ? " • Orario: " + mySession.orario : ""
  }`;

  const groupStudents = (group?.studentIds || []).map((sid) =>
    state.students.find((s) => s.id === sid)
  );

  if (!groupStudents.length) {
    staffTableBody.innerHTML =
      '<tr><td colspan="2" class="small">Nessun alunno assegnato al gruppo.</td></tr>';
    return;
  }

  groupStudents.forEach((st) => {
    if (!st) return;
    const tr = document.createElement("tr");
    const status = getAttendanceStatus(mySession.id, st.id, date) || "assente";
    tr.innerHTML = `
      <td>${st.name}</td>
      <td><button class="presence-btn ${status}" data-status="${status}">${status.toUpperCase()}</button></td>
    `;
    const btn = tr.querySelector("button");
    btn.addEventListener("click", () => {
      const newStatus = btn.dataset.status === "presente" ? "assente" : "presente";
      btn.dataset.status = newStatus;
      btn.textContent = newStatus.toUpperCase();
      btn.className = "presence-btn " + newStatus;
      setAttendanceStatus(mySession.id, st.id, date, newStatus);
    });
    staffTableBody.appendChild(tr);
  });
}

// attendance in state
function getAttendanceStatus(sessionId, studentId, date) {
  const rec = state.attendance.find(
    (a) => a.sessionId === sessionId && a.studentId === studentId && a.date === date
  );
  return rec ? rec.status : null;
}

function setAttendanceStatus(sessionId, studentId, date, status) {
  let rec = state.attendance.find(
    (a) => a.sessionId === sessionId && a.studentId === studentId && a.date === date
  );
  if (!rec) {
    state.attendance.push({ sessionId, studentId, date, status });
  } else {
    rec.status = status;
  }
  saveState();
}

// localStorage
function saveState() {
  localStorage.setItem("laboratori_state", JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem("laboratori_state");
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
    };
  } catch (e) {
    console.warn("Errore loadState, uso default", e);
    return structuredClone(defaultState);
  }
}
