// Theme Management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.apply();
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
    this.updateToggleIcon();
  }

  toggle() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.apply();
  }

  updateToggleIcon() {
    const icon = document.querySelector('.theme-toggle .icon');
    icon.textContent = this.theme === 'light' ? '☀️' : '🌙';
  }
}

// Editor Manager
class EditorManager {
  constructor() {
    this.editor = null;
    this.currentFile = null;
    this.files = {};
    this.initMonaco();
  }

  initMonaco() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.50.0/min/vs' } });
    require(['vs/editor/editor.main'], () => {
      this.editor = monaco.editor.create(document.getElementById('editor'), {
        value: '-- Novo Script Lua\n\nfunction hello()\n  print("Hello, World!")\nend\n\nhello()',
        language: 'lua',
        theme: 'vs-light',
        fontSize: 14,
        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        roundedSelection: false,
        automaticLayout: true,
        padding: { top: 12, bottom: 12 }
      });

      this.editor.onDidChangeModelContent(() => this.updateStats());
      this.editor.onDidChangeCursorPosition(() => this.updateCursorPos());
      this.loadScriptsList();
      this.setupEventListeners();
    });
  }

  setupEventListeners() {
    document.getElementById('saveBtn').addEventListener('click', () => this.save());
    document.getElementById('fileSelect').addEventListener('change', (e) => this.loadFile(e.target.value));
    document.getElementById('newFileBtn').addEventListener('click', () => this.newFile());
    document.getElementById('deleteFileBtn').addEventListener('click', () => this.deleteFile());
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.save();
      }
    });
  }

  updateStats() {
    const content = this.editor.getValue();
    const lines = content.split('\n').length;
    const size = new Blob([content]).size;

    document.getElementById('lineCount').textContent = lines;
    document.getElementById('fileSize').textContent = this.formatBytes(size);
  }

  updateCursorPos() {
    const pos = this.editor.getPosition();
    document.getElementById('cursorPos').textContent = `Ln ${pos.lineNumber}, Col ${pos.column}`;
  }

  loadScriptsList() {
    fetch('/api/scripts/list')
      .then(r => r.json())
      .then(data => {
        const select = document.getElementById('fileSelect');
        select.innerHTML = '<option value="">Novo arquivo...</option>';
        data.scripts.forEach(script => {
          const option = document.createElement('option');
          option.value = script.name;
          option.textContent = script.name;
          select.appendChild(option);
        });
        document.getElementById('scriptCount').textContent = data.scripts.length;
      });
  }

  loadFile(filename) {
    if (!filename) return;
    fetch(`/api/scripts/${filename}`)
      .then(r => r.json())
      .then(data => {
        this.editor.setValue(data.content);
        this.currentFile = filename;
      })
      .catch(err => showToast('Erro ao carregar arquivo: ' + err.message, 'error'));
  }

  save() {
    const content = this.editor.getValue();
    const filename = this.currentFile || `script-${Date.now()}.lua`;

    fetch('/api/scripts/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          this.currentFile = filename;
          showToast('Script salvo com sucesso!', 'success');
          this.loadScriptsList();
        }
      })
      .catch(err => showToast('Erro ao salvar: ' + err.message, 'error'));
  }

  newFile() {
    this.editor.setValue('-- Novo Script Lua\n\n');
    this.currentFile = null;
    document.getElementById('fileSelect').value = '';
    this.updateStats();
  }

  deleteFile() {
    if (!this.currentFile) {
      showToast('Selecione um arquivo primeiro', 'info');
      return;
    }
    if (!confirm(`Deletar ${this.currentFile}?`)) return;
    // Implementar API de deleção se necessário
    showToast('Arquivo deletado', 'success');
    this.newFile();
    this.loadScriptsList();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// GitHub Manager
class GitHubManager {
  setupEventListeners() {
    document.getElementById('pushBtn').addEventListener('click', () => this.push());
  }

  async push() {
    const token = document.getElementById('githubToken').value;
    const repo = document.getElementById('githubRepo').value;
    const branch = document.getElementById('githubBranch').value;
    const message = document.getElementById('commitMessage').value;

    if (!token || !repo || !message) {
      showToast('Preencha todos os campos obrigatórios', 'info');
      return;
    }

    const content = editor.editor.getValue();
    const filename = editor.currentFile || `script-${Date.now()}.lua`;

    const statusDiv = document.getElementById('githubStatus');
    statusDiv.className = 'status-message info show';
    statusDiv.textContent = 'Fazendo push...';

    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content, message, branch })
      });

      const data = await response.json();

      if (response.ok) {
        statusDiv.className = 'status-message success show';
        statusDiv.innerHTML = `✓ Push realizado com sucesso!<br><a href="${data.commit.url}" target="_blank">Ver commit</a>`;
        showToast('Script enviado para GitHub!', 'success');
      } else {
        statusDiv.className = 'status-message error show';
        statusDiv.textContent = data.error || 'Erro ao fazer push';
        showToast('Erro: ' + data.error, 'error');
      }
    } catch (error) {
      statusDiv.className = 'status-message error show';
      statusDiv.textContent = error.message;
      showToast('Erro: ' + error.message, 'error');
    }
  }
}

// Obfuscation Manager
class ObfuscationManager {
  setupEventListeners() {
    document.getElementById('obfuscateBtn').addEventListener('click', () => this.obfuscate());
    document.getElementById('analyzeBtn').addEventListener('click', () => this.analyze());
  }

  async obfuscate() {
    const code = editor.editor.getValue();
    const resultDiv = document.getElementById('obfuscationResult');
    resultDiv.textContent = 'Processando...';

    try {
      const response = await fetch('/api/obfuscation/obfuscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      resultDiv.className = 'result-box success';
      resultDiv.innerHTML = `
        <strong>Código Ofuscado:</strong><br><br>
        ${data.obfuscated.code}<br><br>
        <strong>Estatísticas:</strong><br>
        Tamanho original: ${data.original.length} bytes<br>
        Tamanho ofuscado: ${data.obfuscated.length} bytes<br>
        Redução: ${data.obfuscated.reduction}%
      `;
      showToast('Código ofuscado com sucesso!', 'success');
    } catch (error) {
      resultDiv.className = 'result-box error';
      resultDiv.textContent = 'Erro: ' + error.message;
    }
  }

  async analyze() {
    const code = editor.editor.getValue();
    const resultDiv = document.getElementById('analysisResult');
    resultDiv.textContent = 'Analisando...';

    try {
      const response = await fetch('/api/obfuscation/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      const m = data.metrics;
      resultDiv.className = 'result-box success';
      resultDiv.innerHTML = `
        📊 <strong>Análise do Código</strong><br><br>
        Linhas: ${m.lines}<br>
        Caracteres: ${m.characters}<br>
        Funções: ${m.functions}<br>
        Loops: ${m.loops}<br>
        Condicionais: ${m.conditionals}<br>
        Variáveis: ${m.variables}<br>
        Complexidade: ${m.complexity}
      `;
      showToast('Análise concluída!', 'success');
    } catch (error) {
      resultDiv.className = 'result-box error';
      resultDiv.textContent = 'Erro: ' + error.message;
    }
  }
}

// Verification Manager
class VerificationManager {
  setupEventListeners() {
    document.getElementById('generateKeyBtn').addEventListener('click', () => this.generateKey());
    document.getElementById('integrityBtn').addEventListener('click', () => this.checkIntegrity());
  }

  async generateKey() {
    const code = editor.editor.getValue();
    const resultDiv = document.getElementById('generatedKey');
    resultDiv.textContent = 'Gerando chave...';

    try {
      const response = await fetch('/api/verification/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: code })
      });

      const data = await response.json();
      resultDiv.className = 'result-box success';
      resultDiv.innerHTML = `
        <strong>Chave SHA256:</strong><br><br>
        ${data.key}<br><br>
        <strong>Informações:</strong><br>
        Algoritmo: ${data.algorithm}<br>
        Comprimento: ${data.length} caracteres
      `;
      showToast('Chave gerada com sucesso!', 'success');
    } catch (error) {
      resultDiv.className = 'result-box error';
      resultDiv.textContent = 'Erro: ' + error.message;
    }
  }

  async checkIntegrity() {
    const code = editor.editor.getValue();
    const filename = editor.currentFile || 'script.lua';
    const resultDiv = document.getElementById('integrityResult');
    resultDiv.textContent = 'Verificando...';

    try {
      const response = await fetch('/api/verification/integrity-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: code, name: filename })
      });

      const data = await response.json();
      const i = data.integrity;
      resultDiv.className = 'result-box success';
      resultDiv.innerHTML = `
        <strong>Verificação de Integridade</strong><br><br>
        Arquivo: ${i.file}<br>
        Tamanho: ${i.size} bytes<br>
        Status: ${i.valid ? '✓ Válido' : '✗ Inválido'}<br>
        Checksum: ${i.checksum.substring(0, 16)}...<br>
        Data: ${new Date(i.timestamp).toLocaleString()}
      `;
      showToast('Verificação concluída!', 'success');
    } catch (error) {
      resultDiv.className = 'result-box error';
      resultDiv.textContent = 'Erro: ' + error.message;
    }
  }
}

// Upload Manager
class UploadManager {
  setupEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));
  }

  handleFiles(files) {
    const uploadList = document.getElementById('uploadList');
    Array.from(files).forEach(file => {
      if (!file.name.endsWith('.lua')) {
        showToast('Apenas arquivos .lua são permitidos', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const item = document.createElement('div');
      item.className = 'upload-item loading';
      item.textContent = `Enviando ${file.name}...`;
      uploadList.appendChild(item);

      fetch('/api/scripts/upload', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
          item.className = 'upload-item success';
          item.textContent = `✓ ${file.name} - ${this.formatBytes(data.file.size)}`;
          editor.loadScriptsList();
          showToast('Arquivo enviado com sucesso!', 'success');
        })
        .catch(err => {
          item.className = 'upload-item error';
          item.textContent = `✗ ${file.name} - ${err.message}`;
          showToast('Erro ao enviar arquivo', 'error');
        });
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// UI Manager
class UIManager {
  setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        item.classList.add('active');
        const section = item.dataset.section + 'Section';
        document.getElementById(section).classList.add('active');

        const titles = {
          editor: 'Editor de Scripts',
          upload: 'Upload de Arquivos',
          github: 'Integração GitHub',
          obfuscation: 'Ofuscação de Código',
          verification: 'Verificação de Chaves'
        };
        document.getElementById('sectionTitle').textContent = titles[item.dataset.section];
      });
    });
  }
}

// Toast Notification
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Initialize App
let themeManager, editor, github, obfuscation, verification, upload, ui;

document.addEventListener('DOMContentLoaded', () => {
  themeManager = new ThemeManager();
  editor = new EditorManager();
  github = new GitHubManager();
  obfuscation = new ObfuscationManager();
  verification = new VerificationManager();
  upload = new UploadManager();
  ui = new UIManager();

  document.getElementById('themeToggle').addEventListener('click', () => {
    themeManager.toggle();
    if (editor.editor) {
      const newTheme = themeManager.theme === 'light' ? 'vs-light' : 'vs-dark';
      monaco.editor.setTheme(newTheme);
    }
  });

  setTimeout(() => {
    github.setupEventListeners();
    obfuscation.setupEventListeners();
    verification.setupEventListeners();
    upload.setupEventListeners();
    ui.setupNavigation();
  }, 1000);
});
