// app.js - VERSIONE SEMPLICE CON PASSWORD "fondazione"
import { db } from './firebase.js';
import { 
  doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { jsPDF } from 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
import 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.32/jspdf.plugin.autotable.min.js';

// DOM ELEMENTS
const loginForm = document.getElementById('login-form');
const roleBtns = document.querySelectorAll('.role-btn');
const staffSection = document.getElementById('staff-section');
const adminSection = document.getElementById('admin-section');
const loginSection = document.getElementById('login-section');
const staffDateInput = document.getElementById('staff-date');
const staffTableBody = document.getElementById('staff-table-body');
const currentLabSpan = document.getElementById('current-lab');

// ADMIN
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const labsList = document.getElementById('labs-list');
const groupsList = document.getElementById('groups-list');

// GLOBAL STATE
let currentUserRole = null;
let currentUserName = null;
let todaySchedule = null;

// INIT
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  setTodayDate();
});

function setupEventListeners() {
  // scelta ruolo
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // login semplice
  loginForm.addEventListener('submit', handleSimpleLogin);

  // nav data staff
  document.getElementById('prev-day').addEventListener('click', () => changeDate(-1));
  document.getElementById('next-day').addEventListener('click', () => changeDate(1));
  staffDateInput.addEventListener('change', () => loadStaffSchedule());

  // logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('admin-logout').addEventListener('click', handleLogout);

  // tab admin
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchTab(tab);
    });
  });

  // azioni admin
  document.getElementById('create-labs').addEventListener('click', createDefaultLabs);
  document.getElementById('create-groups').addEventListener('click', createDefaultGroups);
  document.getElementById('add-lab').addEventListener('click', addLab);
  document.getElementById('add-group').addEventListener('click', addGroup);
  document.getElementById('export-pdf').addEventListener('click', exportToPDF);
}

// LOGIN SEMPLICE
function handleSimpleLogin(e) {
  e.preventDefault();
  const name = loginForm.querySelector('input[name="name"]').value.trim();
  const password = loginForm.querySelector('input[name="password"]').value;

  if (!name) {
    alert('Inserisci il tuo nome!');
    return;
  }
  if (password !== 'fondazione') {
    alert('Password sbagliata. Usa: fondazione');
    return;
  }

  currentUserName = name;
  currentUserRole = document.querySelector('.role-btn.active').dataset.role;

  showUserSection();
}

function showUserSection() {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  if (currentUserRole === 'admin') {
    adminSection.classList.add('active');
    document.getElementById('admin-logout').textContent = `Esci (${currentUserName})`;
    loadLabs();
    loadGroups();
  } else {
    staffSection.classList.add('active');
    document.getElementById('logout-btn').textContent = `Esci (${currentUserName})`;
    loadStaffSchedule();
  }
}

function handleLogout() {
  currentUserRole = null;
  currentUserName = null;
  loginForm.reset();
  showSection('login-section');
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// DATE STAFF
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  staffDateInput.value = today;
}
function changeDate(delta) {
  const d = new Date(staffDateInput.value);
  d.setDate(d.getDate() + delta);
  staffDateInput.value = d.toISOString().split('T')[0];
  loadStaffSchedule();
}

// STAFF – dati fittizi per ora
async function loadStaffSchedule() {
  if (!currentUserRole || currentUserRole === 'admin') return;

  const date = staffDateInput.value;
  staffTableBody.innerHTML = '<tr><td colspan="3" class="loading">Caricamento laboratorio...</td></tr>';

  // schedule di prova
  const schedule = {
    id: 'sched1',
    labId: currentUserRole === 'docente' ? 'Lab1' : 'Lab2',
    groupId: 'Gruppo 1',
    date
  };
  todaySchedule = schedule;
  currentLabSpan.textContent = `📚 ${schedule.labId} - ${schedule.groupId}`;

  const students = [
    { id: 'stud1', firstName: 'Mario', lastName: 'Rossi' },
    { id: 'stud2', firstName: 'Luca', lastName: 'Bianchi' },
    { id: 'stud3', firstName: 'Giulia', lastName: 'Verdi' }
  ];

  staffTableBody.innerHTML = '';
  for (const s of students) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.firstName} ${s.lastName}</strong></td>
      <td>
        <button class="presence-btn assente" data-student="${s.id}" data-status="assente">
          ASSENTE
        </button>
      </td>
      <td>-</td>
    `;
    tr.querySelector('.presence-btn').addEventListener('click', (btnEv) => {
      togglePresence(btnEv.target, schedule.id, s.id, date);
    });
    staffTableBody.appendChild(tr);
  }
}

async function togglePresence(btn, scheduleId, studentId, date) {
  const newStatus = btn.dataset.status === 'presente' ? 'assente' : 'presente';
  btn.dataset.status = newStatus;
  btn.textContent = newStatus === 'presente' ? 'PRESENTE' : 'ASSENTE';
  btn.className = `presence-btn ${newStatus}`;

  const attendanceId = `${scheduleId}_${studentId}`;
  await setDoc(doc(db, 'attendance', attendanceId), {
    date,
    scheduleId,
    studentId,
    status: newStatus,
    recordedBy: `${currentUserRole}-${currentUserName}`,
    timestamp: serverTimestamp()
  });
}

// ADMIN – labs / groups semplici
async function createDefaultLabs() {
  const n = parseInt(document.getElementById('num-labs').value);
  for (let i = 1; i <= n; i++) {
    await addDoc(collection(db, 'labs'), { name: `Lab${i}`, createdAt: serverTimestamp() });
  }
  loadLabs();
  alert(`Creati ${n} laboratori`);
}
async function createDefaultGroups() {
  const n = parseInt(document.getElementById('num-groups').value);
  for (let i = 1; i <= n; i++) {
    await addDoc(collection(db, 'groups'), { name: `Gruppo ${i}`, studentsIds: [], createdAt: serverTimestamp() });
  }
  loadGroups();
  alert(`Creati ${n} gruppi`);
}
async function addLab() {
  const name = document.getElementById('lab-name').value.trim();
  if (!name) return;
  await addDoc(collection(db, 'labs'), { name, createdAt: serverTimestamp() });
  document.getElementById('lab-name').value = '';
  loadLabs();
}
async function loadLabs() {
  const snap = await getDocs(collection(db, 'labs'));
  labsList.innerHTML = '';
  snap.forEach(d => {
    const div = document.createElement('div');
    div.className = 'config-card';
    div.textContent = d.data().name + '  (' + d.id + ')';
    labsList.appendChild(div);
  });
}
async function addGroup() {
  const name = document.getElementById('group-name').value.trim();
  if (!name) return;
  await addDoc(collection(db, 'groups'), { name, studentsIds: [], createdAt: serverTimestamp() });
  document.getElementById('group-name').value = '';
  loadGroups();
}
async function loadGroups() {
  const snap = await getDocs(collection(db, 'groups'));
  groupsList.innerHTML = '';
  snap.forEach(d => {
    const g = d.data();
    const div = document.createElement('div');
    div.className = 'config-card';
    div.textContent = `${g.name} (${g.studentsIds?.length || 0} studenti)  (${d.id})`;
    groupsList.appendChild(div);
  });
}

// tab admin
function switchTab(tabId) {
  tabBtns.forEach(b => b.classList.remove('active'));
  tabContents.forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId + '-tab').classList.add('active');
}

// export PDF (semplice)
async function exportToPDF() {
  const date = document.getElementById('export-date').value;
  if (!date) { alert('Seleziona una data'); return; }

  const snap = await getDocs(query(collection(db, 'attendance'), where('date', '==', date)));
  if (snap.empty) { alert('Nessun dato per questa data'); return; }

  const { jsPDF } = window.jspdf;
  const docPdf = new jsPDF();
  docPdf.setFontSize(16);
  docPdf.text('LABORATORI POMERIDIANI - Registro presenze', 10, 15);
  docPdf.text(date, 10, 25);

  const rows = [];
  snap.forEach(d => {
    const a = d.data();
    rows.push([a.studentId, a.status.toUpperCase(), a.recordedBy]);
  });

  docPdf.autoTable({
    head: [['Studente', 'Stato', 'Registrato da']],
    body: rows,
    startY: 35
  });

  docPdf.save(`registro-${date}.pdf`);
}
