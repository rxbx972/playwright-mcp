const fs = require('fs');
const path = require('path');

const PROJECT_SUFFIX_PATTERN = /-(chromium|firefox|webkit)(?:-retry(\d+))?$/;

function formatFolderName(slug, projectName, retry) {
  let name = `${slug}-${projectName}`;
  if (retry) {
    name += `-retry${retry}`;
  }
  return name;
}

function extractScenarioSlug(base) {
  const explicitMatch = base.match(/(?:users-|sers-)(\d{2})-(\d{2})/);
  if (explicitMatch) {
    return `users-${explicitMatch[1]}-${explicitMatch[2]}`;
  }

  for (const match of base.matchAll(/(?<!\d)(\d{2})-(\d{2})/g)) {
    const [, major, minor] = match;
    if (major === '01' && (minor === '01' || minor === '02')) {
      return `users-${major}-${minor}`;
    }
    if (major === '02' && Number(minor) >= 1 && Number(minor) <= 7) {
      return `users-${major}-${minor}`;
    }
  }

  const truncatedMatch = base.match(/-(\d)-(\d{2})-/);
  if (truncatedMatch) {
    return `users-0${truncatedMatch[1]}-${truncatedMatch[2]}`;
  }

  const minorOnlyMatch = base.match(/--(\d{2})-(?:이름|아이디)/);
  if (minorOnlyMatch) {
    return `users-02-${minorOnlyMatch[1]}`;
  }

  return null;
}

function extractSlugFromDir(dirName) {
  const projectMatch = dirName.match(PROJECT_SUFFIX_PATTERN);
  if (!projectMatch) {
    return null;
  }

  const projectName = projectMatch[1];
  const retry = projectMatch[2];
  const base = dirName.slice(0, dirName.length - projectMatch[0].length);

  const scenarioSlug = extractScenarioSlug(base);
  if (scenarioSlug) {
    return formatFolderName(scenarioSlug, projectName, retry);
  }

  if (base.includes('users-lifecycle')) {
    return formatFolderName('users-lifecycle', projectName, retry);
  }

  return null;
}

function renameArtifactsInside(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const files = fs.readdirSync(dirPath);
  const failedScreenshots = files
    .filter((file) => /^test-failed-\d+\.png$/.test(file))
    .sort();

  if (failedScreenshots.length === 0) {
    return;
  }

  const latestScreenshot = failedScreenshots[failedScreenshots.length - 1];
  const targetPath = path.join(dirPath, 'failed.png');

  if (latestScreenshot !== 'failed.png') {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.renameSync(path.join(dirPath, latestScreenshot), targetPath);
  }

  for (const file of failedScreenshots) {
    if (file === latestScreenshot || file === 'failed.png') {
      continue;
    }
    fs.unlinkSync(path.join(dirPath, file));
  }
}

function normalizeTestResults(outputDir) {
  if (!fs.existsSync(outputDir)) {
    return;
  }

  for (const entry of fs.readdirSync(outputDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const sourcePath = path.join(outputDir, entry.name);
    const targetName = extractSlugFromDir(entry.name);

    if (!targetName) {
      renameArtifactsInside(sourcePath);
      continue;
    }

    renameArtifactsInside(sourcePath);

    if (targetName === entry.name) {
      continue;
    }

    const targetPath = path.join(outputDir, targetName);
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }

    fs.renameSync(sourcePath, targetPath);
  }
}

module.exports = async function globalTeardown() {
  const outputDir = path.join(__dirname, '../../test-results');
  normalizeTestResults(outputDir);
};

module.exports.normalizeTestResults = normalizeTestResults;
module.exports.extractSlugFromDir = extractSlugFromDir;
