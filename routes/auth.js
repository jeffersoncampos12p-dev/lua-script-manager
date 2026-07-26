const express = require('express');
const router = express.Router();

// Verificar token de acesso
router.post('/verify', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token não fornecido' });
  }
  
  // Simples validação do token
  if (token.length < 20) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  res.json({
    valid: true,
    user: { id: 1, username: 'user' },
    permissions: ['read', 'write', 'delete']
  });
});

// Gerar novo token
router.post('/token', (req, res) => {
  const token = 'tok_' + Math.random().toString(36).substr(2, 32);
  res.json({ token, expires_in: 86400 });
});

module.exports = router;
