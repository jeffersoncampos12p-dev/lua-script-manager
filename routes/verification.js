const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Gerar chave de verificação
function generateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Verificar chave
router.post('/verify-key', express.json(), (req, res) => {
  const { content, key } = req.body;
  
  if (!content || !key) {
    return res.status(400).json({ error: 'Content e key são obrigatórios' });
  }
  
  const expectedKey = generateChecksum(content);
  const isValid = expectedKey === key;
  
  res.json({
    valid: isValid,
    provided: key,
    expected: expectedKey
  });
});

// Gerar chave para código
router.post('/generate-key', express.json(), (req, res) => {
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content não fornecido' });
  }
  
  const key = generateChecksum(content);
  
  res.json({
    key,
    algorithm: 'SHA256',
    length: key.length
  });
});

// Verificar integridade de arquivo
router.post('/integrity-check', express.json(), (req, res) => {
  const { content, name } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content não fornecido' });
  }
  
  const checksum = generateChecksum(content);
  const integrity = {
    file: name || 'unknown',
    size: content.length,
    checksum,
    timestamp: new Date().toISOString(),
    valid: true
  };
  
  res.json({ integrity });
});

module.exports = router;
