const express = require('express');
const { Octokit } = require('octokit');
const router = express.Router();
require('dotenv').config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Fazer push para repositório
router.post('/push', async (req, res) => {
  const { filename, content, message, branch } = req.body;
  
  if (!filename || !content || !message) {
    return res.status(400).json({ error: 'Parâmetros obrigatórios: filename, content, message' });
  }
  
  try {
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    const targetBranch = branch || process.env.GITHUB_BRANCH || 'main';
    
    // Obter SHA do commit anterior
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${targetBranch}`
    });
    
    const commitSha = refData.object.sha;
    
    // Obter conteúdo da árvore anterior
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: commitSha
    });
    
    // Criar blob
    const { data: blobData } = await octokit.rest.git.createBlob({
      owner,
      repo,
      content: content,
      encoding: 'utf-8'
    });
    
    // Criar árvore
    const { data: treeData } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: commitData.tree.sha,
      tree: [
        {
          path: filename,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        }
      ]
    });
    
    // Criar novo commit
    const { data: newCommitData } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: message,
      tree: treeData.sha,
      parents: [commitSha]
    });
    
    // Atualizar referência
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${targetBranch}`,
      sha: newCommitData.sha
    });
    
    res.json({
      success: true,
      commit: {
        sha: newCommitData.sha,
        message: message,
        url: `https://github.com/${owner}/${repo}/commit/${newCommitData.sha}`
      }
    });
  } catch (error) {
    console.error('GitHub API Error:', error);
    res.status(500).json({ error: 'Erro ao fazer push para GitHub', details: error.message });
  }
});

// Obter repositório
router.get('/repo', async (req, res) => {
  try {
    const [owner, repo] = process.env.GITHUB_REPO.split('/');
    
    const { data } = await octokit.rest.repos.get({
      owner,
      repo
    });
    
    res.json({
      name: data.name,
      owner: data.owner.login,
      url: data.html_url,
      description: data.description,
      private: data.private
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar repositório', details: error.message });
  }
});

module.exports = router;
