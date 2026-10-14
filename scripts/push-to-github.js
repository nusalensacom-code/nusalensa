const fs = require('fs');
const path = require('path');

const STAGING_DIR = 'C:\\Users\\admin\\Desktop\\SIAP_UPLOAD_KE_GITHUB';
const OWNER = 'allrestaurants-hubs';
const REPO = 'updateyuk';
const BRANCH = 'main';

async function pushToGitHub(token) {
  if (!token) {
    console.error('Error: Token GitHub wajib diisi.');
    process.exit(1);
  }

  const cleanToken = token.trim();
  const headers = {
    'Authorization': `Bearer ${cleanToken}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'UpdateYuk-Deployer/1.0',
    'Content-Type': 'application/json',
  };

  async function api(endpoint, options = {}) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GitHub API Error [${res.status} ${res.statusText}] at ${endpoint}: ${errText}`);
    }
    return res.json();
  }

  console.log(`>>> Memulai push otomatis ke https://github.com/${OWNER}/${REPO} (branch: ${BRANCH})...`);

  // 1. Get latest commit SHA on main
  console.log('1. Mengambil referensi branch main...');
  const refData = await api(`/git/ref/heads/${BRANCH}`);
  const latestCommitSha = refData.object.sha;
  console.log(`   Latest commit SHA: ${latestCommitSha}`);

  // 2. Get base tree SHA
  console.log('2. Mengambil struktur tree saat ini...');
  const commitData = await api(`/git/commits/${latestCommitSha}`);
  const baseTreeSha = commitData.tree.sha;
  console.log(`   Base tree SHA: ${baseTreeSha}`);

  // 3. Scan staging folder
  console.log('3. Membaca file dari SIAP_UPLOAD_KE_GITHUB...');
  function getAllFiles(dir, rel = '') {
    const list = [];
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        list.push(...getAllFiles(full, path.join(rel, item)));
      } else {
        list.push(path.join(rel, item));
      }
    }
    return list;
  }

  const allFiles = getAllFiles(STAGING_DIR);

  // Separate workflow files from code files
  const treeEntries = [];
  let skippedWorkflows = 0;

  for (const f of allFiles) {
    const gitPath = f.split(path.sep).join('/');
    // Check if it's workflow file
    if (gitPath.startsWith('.github/workflows/')) {
      console.log(`   [INFO] Workflow file dilewati untuk push ini: ${gitPath}`);
      skippedWorkflows++;
      continue;
    }

    const content = fs.readFileSync(path.join(STAGING_DIR, f), 'utf8');
    treeEntries.push({
      path: gitPath,
      mode: '100644',
      type: 'blob',
      content: content,
    });
  }

  console.log(`   Mengunggah ${treeEntries.length} file utama (Sitemaps, Robots, Config, Code)...`);

  // 4. Create new tree
  console.log('4. Membuat Git tree baru di GitHub...');
  const newTreeData = await api('/git/trees', {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeEntries,
    }),
  });
  const newTreeSha = newTreeData.sha;
  console.log(`   New tree SHA: ${newTreeSha}`);

  // 5. Create new commit
  console.log('5. Membuat commit baru...');
  const commitMsg = 'feat: add Google-friendly sitemaps, robots.txt, and auto-update system';
  const newCommitData = await api('/git/commits', {
    method: 'POST',
    body: JSON.stringify({
      message: commitMsg,
      tree: newTreeSha,
      parents: [latestCommitSha],
    }),
  });
  const newCommitSha = newCommitData.sha;
  console.log(`   New commit SHA: ${newCommitSha}`);

  // 6. Update reference on main
  console.log('6. Mengupdate branch main di GitHub...');
  await api(`/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommitSha,
      force: false,
    }),
  });

  console.log(`\n=======================================================`);
  console.log(`>>> SUKSES BESAR! Berhasil push ${treeEntries.length} file ke GitHub!`);
  console.log(`>>> Commit: ${newCommitSha}`);
  console.log(`>>> URL Commit: https://github.com/${OWNER}/${REPO}/commit/${newCommitSha}`);
  console.log(`>>> Cloudflare Pages sekarang otomatis memulai build!`);
  console.log(`=======================================================\n`);
}

const tokenArg = process.argv[2] || process.env.GITHUB_TOKEN;
if (tokenArg) {
  pushToGitHub(tokenArg).catch((err) => {
    console.error('\nGAGAL PUSH:', err.message);
    process.exit(1);
  });
}

module.exports = { pushToGitHub };
