module.exports = (path, options) => {
  if (path.includes('node_modules')) {
    return options.defaultResolver(path, options);
  }

  if (path.endsWith('.js')) {
    const tsPath = path.replace(/\.js$/, '.ts');
    try {
      return options.defaultResolver(tsPath, options);
    } catch {
      return options.defaultResolver(path, options);
    }
  }

  return options.defaultResolver(path, options);
};
