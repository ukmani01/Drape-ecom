import fs from 'fs/promises';
import fileSystemService from './fileSystemService.js';

export const getVersions = async (storeSlug) => {
  try {
    const storeDir = fileSystemService.getStoreDir(storeSlug);
    const versionsDir = `${storeDir}/versions`;
    
    try {
      const entries = await fs.readdir(versionsDir, { withFileTypes: true });
      const versions = entries
        .filter(entry => entry.isDirectory() && entry.name.startsWith('v'))
        .map(entry => {
          const version = parseInt(entry.name.substring(1));
          return {
            version,
            folder: entry.name,
            path: `${versionsDir}/${entry.name}`,
          };
        })
        .sort((a, b) => b.version - a.version);
      
      return versions;
    } catch {
      return [];
    }
  } catch (err) {
    console.error('Failed to get versions:', err);
    return [];
  }
};

export const getLatestVersion = async (storeSlug) => {
  const versions = await getVersions(storeSlug);
  return versions.length > 0 ? versions[0].version : 0;
};

export const deleteVersion = async (storeSlug, version) => {
  try {
    const versionDir = fileSystemService.getVersionDir(storeSlug, version);
    await fileSystemService.deleteFolder(versionDir);
    return true;
  } catch (err) {
    console.error(`Failed to delete version ${version}:`, err);
    return false;
  }
};

export const cleanOldVersions = async (storeSlug, keepCount = 5) => {
  const versions = await getVersions(storeSlug);
  if (versions.length <= keepCount) return;

  const toDelete = versions.slice(keepCount);
  for (const v of toDelete) {
    await deleteVersion(storeSlug, v.version);
  }
  
  return toDelete.map(v => v.version);
};

export default {
  getVersions,
  getLatestVersion,
  deleteVersion,
  cleanOldVersions,
};
