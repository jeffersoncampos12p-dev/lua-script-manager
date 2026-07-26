const express = require('express');
const router = express.Router();

// Simulação de obfuscação de código Lua
function obfuscateLua(code) {
  let obfuscated = code;
  
  // Remover comentários
  obfuscated = obfuscated.replace(/--\[\[.*?\]\]/gs, '');
  obfuscated = obfuscated.replace(/--.*$/gm, '');
  
  // Minificar espaços em branco
  obfuscated = obfuscated.replace(/\s+/g, ' ').trim();
  
  // Renomear variáveis
  const varMap = {};
  let varCounter = 0;
  obfuscated = obfuscated.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match) => {
    // Preservar palavras-chave do Lua
    const keywords = ['if', 'then', 'else', 'elseif', 'end', 'while', 'for', 'do', 'function', 'return', 'local', 'and', 'or', 'not', 'nil', 'true', 'false', 'in', 'repeat', 'until', 'break'];
    
    if (keywords.includes(match)) return match;
    
    if (!varMap[match]) {
      varMap[match] = '_' + String.fromCharCode(97 + (varCounter % 26)) + Math.floor(varCounter / 26);
      varCounter++;
    }
    return varMap[match];
  });
  
  return obfuscated;
}

// Obfuscar código
router.post('/obfuscate', express.json(), (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Código não fornecido' });
  }
  
  try {
    const obfuscated = obfuscateLua(code);
    
    res.json({
      success: true,
      original: { length: code.length, lines: code.split('\n').length },
      obfuscated: { code: obfuscated, length: obfuscated.length, reduction: Math.round(((code.length - obfuscated.length) / code.length) * 100) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obfuscar código', details: error.message });
  }
});

// Análise de complexidade
router.post('/analyze', express.json(), (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Código não fornecido' });
  }
  
  const functions = (code.match(/function\s+/g) || []).length;
  const loops = (code.match(/\b(while|for)\b/g) || []).length;
  const conditionals = (code.match(/\b(if|elseif)\b/g) || []).length;
  const variables = (code.match(/\blocal\s+/g) || []).length;
  
  res.json({
    metrics: {
      lines: code.split('\n').length,
      characters: code.length,
      functions,
      loops,
      conditionals,
      variables,
      complexity: 'Média'
    }
  });
});

module.module.exports = router;
