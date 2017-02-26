const packageJson = require('./../../package.json');

module.exports = {
  index(req, res) {
    res.ok({
      name: packageJson.name,
      description: packageJson.description,
      author: packageJson.author
    })
  }
};
