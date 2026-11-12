const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store
let items = [
  { id: 1, title: 'Design landing page', description: 'Create a modern landing page with hero section', completed: false, createdAt: new Date().toISOString() },
  { id: 2, title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing', completed: true, createdAt: new Date().toISOString() },
  { id: 3, title: 'Write API documentation', description: 'Document all REST endpoints with examples', completed: false, createdAt: new Date().toISOString() }
];
let nextId = 4;

// API Routes
app.get('/api/items', (req, res) => {
  const { status } = req.query;
  let result = items;
  if (status === 'completed') result = items.filter(i => i.completed);
  if (status === 'pending') result = items.filter(i => !i.completed);
  res.json({ success: true, data: result, count: result.length });
});

app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, data: item });
});

app.post('/api/items', (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  const newItem = {
    id: nextId++,
    title: title.trim(),
    description: (description || '').trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };
  items.push(newItem);
  res.status(201).json({ success: true, data: newItem });
});

app.put('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  const { title, description, completed } = req.body;
  if (title !== undefined) item.title = title.trim();
  if (description !== undefined) item.description = description.trim();
  if (completed !== undefined) item.completed = completed;
  res.json({ success: true, data: item });
});

app.delete('/api/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: 'Item not found' });
  const [deleted] = items.splice(index, 1);
  res.json({ success: true, data: deleted });
});

app.patch('/api/items/:id/toggle', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  item.completed = !item.completed;
  res.json({ success: true, data: item });
});

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
// CI/CD live test
