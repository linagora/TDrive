const fs = require('fs');
const Path = require('path');
const _ = require('lodash');

const appUrl = '../src/app';
const componentsUrl = `${appUrl}/components`;
const modelsUrl = `${appUrl}/models`;
const scenesUrl = `${appUrl}/scenes`;
const servicesUrl = `${appUrl}/services`;

const routes = new Map();

const isDirectory = path => fs.lstatSync(path).isDirectory();

// pwd must start with 'src/...'
const getAbsolutePath = (path, pwd = appUrl) => {
  if (path[0] === '.') {
    const mergePath = Path.resolve(pwd, path);

    console.log({ pwd, path, resolve: mergePath });
    return mergePath;
  }

  path = path.replace(/^app\//, appUrl + '/');
  path = path.replace(/^environment\//, appUrl + '/environment/');
  path = path.replace(/^common\//, appUrl + '/common/');
  path = path.replace(/^components\//, appUrl + '/components/');
  path = path.replace(/^services\//, appUrl + '/services/');
  path = path.replace(/^scenes\//, appUrl + '/scenes/');
  path = path.replace(/^apps\//, appUrl + '/apps/');

  return Path.resolve(path);
};
const renameItem = item => {
  // Keywords that should be skipped
  const toSkip = [
    '.',
    '..',
    'feather',
    'README.md',
    'react-feather',
    'unicons.eot',
    'unicons.svg',
    'unicons.ttf',
    'unicons.woff',
    'unicons.woff2',
  ];

  const name = item.split('.')[0];
  const extension = item.split('.')[1] ? `.${item.split('.')[1]}` : undefined;

  return toSkip.includes(item)
    ? item
    : `${_.lowerCase(name).replace(/ /g, '-')}${extension ? extension : ''}`;
};

const updateMap = (rootUrl, fileOrFolderPath = false) => {
  let newFileOrFolderPath = rootUrl;
  if (fileOrFolderPath) {
    const oldFileOrFolderPath = `${rootUrl}/${fileOrFolderPath}`;
    newFileOrFolderPath = `${rootUrl}/${fileOrFolderPath}`;
    routes.set(getAbsolutePath(oldFileOrFolderPath, '.'), true);
  }

  if (isDirectory(newFileOrFolderPath)) {
    const files = fs.readdirSync(newFileOrFolderPath);
    files.forEach(fileOrFolderPath => {
      updateMap(newFileOrFolderPath, fileOrFolderPath);
    });
  }
};

const processRename = (rootUrl, fileOrFolderPath = false) => {
  let newFileOrFolderPath = rootUrl;

  if (fileOrFolderPath) {
    const newFileOrFolderName = renameItem(fileOrFolderPath);
    const oldFileOrFolderPath = `${rootUrl}/${fileOrFolderPath}`;
    newFileOrFolderPath = `${rootUrl}/${newFileOrFolderName}`;

    fs.renameSync(oldFileOrFolderPath, newFileOrFolderPath);
  }

  if (isDirectory(newFileOrFolderPath)) {
    const files = fs.readdirSync(newFileOrFolderPath);
    files.forEach(fileOrFolderPath => {
      processRename(newFileOrFolderPath, fileOrFolderPath);
    });
  }
};

const recursiveWatchingImports = (rootPath, fileOrFolderPath = false) => {
  const nextPath = fileOrFolderPath ? `${rootPath}/${fileOrFolderPath}` : rootPath;
  if (!isDirectory(nextPath)) {
    let content = fs.readFileSync(nextPath, { encoding: 'utf-8' });

    if (nextPath.includes('/environment/')) {
      return;
    }

    const importedPaths = Array.from(
      content.matchAll(/^(import|export .*?from) .*?('|")(.*?)('|").*?$/gm),
    ).map(s => s[3]);

    importedPaths.forEach(path => {
      const absolutePath = getAbsolutePath(path, rootPath);

      //Test if absolutePath is in map
      if (
        routes.has(absolutePath) ||
        routes.has(absolutePath + '.js') ||
        routes.has(absolutePath + '.jsx') ||
        routes.has(absolutePath + '.ts') ||
        routes.has(absolutePath + '.tsx') ||
        routes.has(absolutePath + '.scss') ||
        routes.has(absolutePath + '.less')
      ) {
        const newPath = path.split('/').map(renameItem).join('/');
        content = content.replace(path, newPath);
      }
    });

    fs.writeFileSync(nextPath, content);
  } else {
    const files = fs.readdirSync(nextPath);
    files.forEach(fileOrFolderPath => {
      recursiveWatchingImports(nextPath, fileOrFolderPath);
    });
  }
};

const cleanFiles = async () => {
  //Fill up map with all the files we gonna rename
  updateMap(componentsUrl);

  // Now we should look at each files to see if there is a match with the previous changes and modify the related imports
  recursiveWatchingImports(appUrl);

  //Rename files and folders recursivelly
  processRename(componentsUrl);
};

cleanFiles();
