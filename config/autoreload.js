module.exports.autoreload = {
  active: true,
  usePolling: false,
  dirs: [
    "api/controllers",
    "api/models",
    "api/services",
    "config/locales"
  ],
  ignored: [
    // Ignore all files with .ts extension
    "**.ts"
  ]
};