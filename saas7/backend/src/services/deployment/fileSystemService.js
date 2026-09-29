
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../../../public');
const STORES_DIR = path.join(PUBLIC_DIR, 'stores');
const ASSETS_DIR = path.join(STORES_DIR, 'assets');

export const ensureDirectories = async () => {
  try {
    console.log('📁 Ensuring directories exist...');
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    await fs.mkdir(STORES_DIR, { recursive: true });
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    console.log('✅ Directories ready');
    return true;
  } catch (err) {
    console.error('❌ ensureDirectories error:', err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export const getStoreDir = (slug) => {
  return path.join(STORES_DIR, slug);
};

export const writeFile = async (filePath, content) => {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (err) {
    console.error(`❌ writeFile error for ${filePath}:`, err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export const readFile = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    console.error(`❌ readFile error for ${filePath}:`, err.message);
    return null;
  }
};

export const deleteFolder = async (folderPath) => {
  try {
    console.log(`🗑️ Deleting folder: ${folderPath}`);
    await fs.rm(folderPath, { recursive: true, force: true });
    return true;
  } catch (err) {
    console.error(`❌ deleteFolder error for ${folderPath}:`, err.message);
    return false;
  }
};

export const copyAssets = async (slug) => {
  try {
    const storeDir = getStoreDir(slug);
    const assetsTarget = path.join(storeDir, 'assets');
    await fs.mkdir(assetsTarget, { recursive: true });
    
    const cssSource = path.join(ASSETS_DIR, 'global.css');
    const cssTarget = path.join(assetsTarget, 'global.css');
    const cssExists = await fs.access(cssSource).then(() => true).catch(() => false);
    if (cssExists) {
      await fs.copyFile(cssSource, cssTarget);
      console.log(`✅ Copied global.css to ${cssTarget}`);
    }
    
    const jsSource = path.join(ASSETS_DIR, 'app.js');
    const jsTarget = path.join(assetsTarget, 'app.js');
    const jsExists = await fs.access(jsSource).then(() => true).catch(() => false);
    if (jsExists) {
      await fs.copyFile(jsSource, jsTarget);
      console.log(`✅ Copied app.js to ${jsTarget}`);
    }
    
    return true;
  } catch (err) {
    console.error('❌ copyAssets error:', err.message);
    console.error('❌ Stack:', err.stack);
    return false;
  }
};

export default {
  ensureDirectories,
  getStoreDir,
  writeFile,
  readFile,
  deleteFolder,
  copyAssets,
};
