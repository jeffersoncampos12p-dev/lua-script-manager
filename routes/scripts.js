const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.lua')) {
      return cb(new Error('Apenas arquivos .lua são permitidos'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload de arquivo
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
  }
  
  res.json({
    success: true,
    file: {
      name: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      uploadedAt: new Date().toISOString()
    }
  });
});

// Listar scripts
router.get('/list', (req, res) => {
  const uploadsPath = path.join(__dirname, '../uploads');
  
  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao listar arquivos' });
    }
    
    const scripts = files
      .filter(f => f.endsWith('.lua'))
      .map(f => ({
        name: f,
        path: `/uploads/${f}`,
        size: fs.statSync(path.join(uploadsPath, f)).size
      }));
    
    res.json({ scripts });
  });
});

// Obter conteúdo de um script
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../uploads', filename);
  
  if (!filepath.startsWith(path.join(__dirname, '../uploads'))) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    res.json({ content: data, filename });
  });
});

// Salvar script
router.post('/save', express.json(), (req, res) => {
  const { filename, content } = req.body;
  
  if (!filename || !content) {
    return res.status(400).json({ error: 'Filename e content são obrigatórios' });
  }
  
  if (!filename.endsWith('.lua')) {
    return res.status(400).json({ error: 'Arquivo deve ter extensão .lua' });
  }
  
  const filepath = path.join(__dirname, '../uploads', path.basename(filename));
  
  fs.writeFile(filepath, content, 'utf8', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao salvar arquivo' });
    }
    
    res.json({
      success: true,
      file: { name: filename, savedAt: new Date().toISOString() }
    });
  });
});

module.exports = router;
