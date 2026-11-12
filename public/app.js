// Vanilla JS client for the Express Full‑Stack Demo
// Handles fetching, rendering, creating, updating, and deleting items.

const API_BASE = '/api/items';
const itemsList = document.getElementById('itemsList');
const addForm = document.getElementById('addForm');
const filterSelect = document.getElementById('filterSelect');
const themeToggle = document.getElementById('themeToggle');

// ---------- Theme ----------
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// Initialize theme based on prefers‑color‑scheme
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  setTheme('dark');
}

// ---------- API Helpers ----------
async function api(path = '', options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data.data;
}

// ---------- Rendering ----------
function createItemCard(item) {
  const li = document.createElement('li');
  li.className = 'item-card';
  li.dataset.id = item.id;

  const header = document.createElement('div');
  header.className = 'item-header';

  const title = document.createElement('span');
  title.className = 'item-title';
  title.textContent = item.title;

  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.title = item.completed ? 'Mark as pending' : 'Mark as completed';
  toggleBtn.textContent = item.completed ? '✅' : '⬜';
  toggleBtn.addEventListener('click', () => toggleComplete(item.id));

  const editBtn = document.createElement('button');
  editBtn.title = 'Edit';
  editBtn.textContent = '✏️';
  editBtn.addEventListener('click', () => editItem(item));

  const delBtn = document.createElement('button');
  delBtn.title = 'Delete';
  delBtn.textContent = '🗑️';
  delBtn.addEventListener('click', () => deleteItem(item.id));

  actions.append(toggleBtn, editBtn, delBtn);
  header.append(title, actions);

  const desc = document.createElement('p');
  desc.className = 'item-description';
  desc.textContent = item.description || '(No description)';

  const meta = document.createElement('small');
  meta.className = 'item-meta';
  const date = new Date(item.createdAt).toLocaleString();
  meta.textContent = `Created: ${date}`;

  li.append(header, desc, meta);
  return li;
}

async function loadItems() {
  try {
    const status = filterSelect.value;
    const query = status === 'all' ? '' : `?status=${status}`;
    const data = await api(query);
    itemsList.innerHTML = '';
    data.forEach(item => itemsList.appendChild(createItemCard(item)));
  } catch (err) {
    alert(err.message);
  }
}

// ---------- CRUD Operations ----------
addForm.addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  if (!title) return alert('Title cannot be empty');
  try {
    await api('', { method: 'POST', body: JSON.stringify({ title, description }) });
    addForm.reset();
    await loadItems();
  } catch (err) {
    alert(err.message);
  }
});

filterSelect.addEventListener('change', loadItems);

async function toggleComplete(id) {
  try {
    await api(`/${id}/toggle`, { method: 'PATCH' });
    await loadItems();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return;
  try {
    await api(`/${id}`, { method: 'DELETE' });
    await loadItems();
  } catch (err) {
    alert(err.message);
  }
}

function editItem(item) {
  const newTitle = prompt('Edit title', item.title);
  if (newTitle === null) return; // cancelled
  const newDesc = prompt('Edit description', item.description);
  if (newDesc === null) return;
  api(`/${item.id}`, {
    method: 'PUT',
    body: JSON.stringify({ title: newTitle, description: newDesc })
  })
    .then(() => loadItems())
    .catch(err => alert(err.message));
}

// Initial load
loadItems();
