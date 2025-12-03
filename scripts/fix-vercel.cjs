// scripts/fix-vercel.js
// Ejecutar: node scripts/fix-vercel.js
const fs = require('fs');
const path = require('path');

function readBytes(filePath) {
  return fs.readFileSync(filePath);
}
function writeBytes(filePath, bytes) {
  fs.writeFileSync(filePath, bytes);
}
function writeTextUtf8NoBom(filePath, text) {
  // UTF-8 without BOM
  fs.writeFileSync(filePath, text, { encoding: 'utf8' });
}
function safeReadText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, { encoding: 'utf8' }) : null;
}
function isJsonString(s) {
  try { JSON.parse(s); return true; } catch (e) { return false; }
}

const root = process.cwd();
const vercelJsonPath = path.join(root, 'vercel.json');
const vercelIgnorePath = path.join(root, '.vercelignore');
const packageJsonPath = path.join(root, 'package.json');

console.log('--- Fix vercel helper (started) ---');

// 1) If .vercelignore contains JSON, extract it into vercel.json
let changed = false;
const vignoreText = safeReadText(vercelIgnorePath);
if (vignoreText) {
  // If .vercelignore starts with "{" or contains a JSON object: try to find JSON block
  const jsonMatch = vignoreText.match(/\{[\s\S]*\}/);
  if (jsonMatch && isJsonString(jsonMatch[0])) {
    console.log('Detected JSON inside .vercelignore -> moving to vercel.json');
    const jsonText = jsonMatch[0];
    writeTextUtf8NoBom(vercelJsonPath, JSON.stringify(JSON.parse(jsonText), null, 2));
    // Replace .vercelignore with sane defaults
    const defaultIgnore = [
      'node_modules',
      '.vercel',
      'dist',
      'build',
      'coverage'
    ].join('\n') + '\n';
    writeTextUtf8NoBom(vercelIgnorePath, defaultIgnore);
    changed = true;
  }
}

// 2) Ensure vercel.json exists and is parseable; if not, write canonical content
let vercelText = safeReadText(vercelJsonPath);
let vercelOk = false;
if (vercelText) {
  try {
    JSON.parse(vercelText);
    vercelOk = true;
    console.log('vercel.json is parseable JSON.');
  } catch (e) {
    console.log('vercel.json exists but is NOT parseable. Rewriting with safe content.');
  }
}
if (!vercelOk) {
  const canonical = {
    version: 2,
    builds: [
      { src: '*.html', use: '@vercel/static' },
      { src: 'api/**/*.js', use: '@vercel/node' }
    ],
    routes: [
      { src: '/api/(.*)', dest: '/api/$1' },
      { src: '/(.*)', dest: '/$1' }
    ],
    cleanUrls: true,
    trailingSlash: false
  };
  writeTextUtf8NoBom(vercelJsonPath, JSON.stringify(canonical, null, 2) + '\n');
  console.log('Wrote canonical vercel.json (UTF-8 no BOM).');
  changed = true;
}

// 3) Remove BOM if present (safety): re-save file without BOM
if (fs.existsSync(vercelJsonPath)) {
  const raw = fs.readFileSync(vercelJsonPath);
  // detect UTF-8 BOM (EF BB BF)
  if (raw.length >= 3 && raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF) {
    const newBytes = raw.slice(3);
    fs.writeFileSync(vercelJsonPath, newBytes);
    console.log('Removed BOM from vercel.json');
    changed = true;
  } else {
    // ensure saved as normalized utf8 with consistent formatting
    const txt = fs.readFileSync(vercelJsonPath, { encoding: 'utf8' });
    fs.writeFileSync(vercelJsonPath, txt, { encoding: 'utf8' });
  }
}

// 4) Ensure .vercelignore contains only patterns (not JSON)
if (fs.existsSync(vercelIgnorePath)) {
  const txt = fs.readFileSync(vercelIgnorePath, { encoding: 'utf8' }).trim();
  if (txt.startsWith('{') || txt.includes('"builds"') || txt.includes('"version"')) {
    // override with default ignore patterns
    const defaultIgnore = [
      'node_modules',
      '.vercel',
      'dist',
      'build',
      'coverage'
    ].join('\n') + '\n';
    fs.writeFileSync(vercelIgnorePath, defaultIgnore, { encoding: 'utf8' });
    console.log('Rewrote .vercelignore with default patterns.');
    changed = true;
  } else {
    console.log('.vercelignore looks valid.');
  }
} else {
  // create default .vercelignore
  const defaultIgnore = [
    'node_modules',
    '.vercel',
    'dist',
    'build',
    'coverage'
  ].join('\n') + '\n';
  fs.writeFileSync(vercelIgnorePath, defaultIgnore, { encoding: 'utf8' });
  console.log('Created .vercelignore with default patterns.');
  changed = true;
}

// 5) package.json: rename "build" / "vercel-build" to avoid Vercel auto-detection
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' }));
  if (pkg.scripts) {
    let pkgChanged = false;
    if (pkg.scripts['vercel-build']) {
      pkg.scripts['vercel-build-old'] = pkg.scripts['vercel-build'];
      delete pkg.scripts['vercel-build'];
      console.log('Renamed script vercel-build -> vercel-build-old');
      pkgChanged = true;
    }
    if (pkg.scripts['build']) {
      pkg.scripts['build-old'] = pkg.scripts['build'];
      delete pkg.scripts['build'];
      console.log('Renamed script build -> build-old');
      pkgChanged = true;
    }
    if (pkgChanged) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', { encoding: 'utf8' });
      console.log('Updated package.json (backup recommended).');
      changed = true;
    } else {
      console.log('package.json scripts OK (no build/vercel-build).');
    }
  } else {
    console.log('package.json has no scripts section.');
  }
} else {
  console.log('No package.json found (skipping).');
}

// Summary
console.log('--- Summary ---');
console.log('Any changes made:', changed ? 'YES' : 'NO');
console.log('');
console.log('Next recommended steps (run in terminal):');
console.log('  git add vercel.json .vercelignore package.json');
console.log('  git commit -m "fix(vercel): normalize vercel.json and .vercelignore; disable build scripts"');
console.log('  git push origin main');
console.log('');
console.log('After push: open Vercel Dashboard -> Deployments -> select recent deploy -> Build Logs');
console.log('If build still fails, copy the last ~100 lines of Build Logs and pegalo en el chat.');
