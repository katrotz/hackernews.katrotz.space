module.exports = {
  news(req, res) {
    HackerNewsApi.getItem(req.params.id)
      .then(data => res.ok({data}))
      .catch(error => res.serverError({error}));
  },

  askStories(req, res) {
    HackerNewsApi.askStories(false)
      .then(data => res.ok({data}))
      .catch(error => res.serverError({error}));
  },

  showStories(req, res) {
    HackerNewsApi.showStories(false)
      .then(data => res.ok({data}))
      .catch(error => res.serverError({error}));
  },

  jobStories(req, res) {
    HackerNewsApi.jobStories(false)
      .then(data => res.ok({data}))
      .catch(error => res.serverError({error}));
  },

  topStories(req, res) {
    HackerNewsApi.topStories(false)
      .then(data => res.ok({data}))
      .catch(error => res.serverError({error}));
  },

  bestStories(req, res) {
    HackerNewsApi.bestStories()
      .then(data => res.ok({data}))
      .catch(error => res.serverError({error}));
  },

  newStories(req, res) {
    HackerNewsApi.newStories()
      .then(data => res.ok({data}))
      .catch(error => res.serverError({error}));
  }
};
