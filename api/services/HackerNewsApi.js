/* global Item */
const request = require('request');

/**
 * Implements the interface for communication with the Hackernews API
 */
class HackerNewsApi {
  constructor() {
    this.API_URL = 'https://hacker-news.firebaseio.com/v0';
    this.API_TIMEOUT = 10 * 1000;
  }

  /**
   * Fetches the hacker news item by id
   * @param {number} id The item id
   * @returns {Promise}
   */
  getItem(id) {
    const url = `${this.API_URL}/item/${id}.json`;

    return this.request(url);
  }

  /**
   * Fetches the ask stories. Will skip the stories that are already stored based on notSyncedOnly flag
   * @param {boolean=} notSyncedOnly Fetches only the stories not stored in the local database
   * @returns {Promise}
   */
  askStories(notSyncedOnly = true) {
    const storiesUrl = `${this.API_URL}/askstories.json`;
    const maxItemPromise = notSyncedOnly ? Item.getLastAskItem() : null;

    return this.fetchAndFilterStoryIds(storiesUrl, maxItemPromise)
      .then(ids => Promise.all(_.map(ids, id => this.getItem(id))));
  }

  /**
   * Fetches the show stories. Will skip the stories that are already stored based on notSyncedOnly flag
   * @param {boolean=} notSyncedOnly Fetches only the stories not stored in the local database
   * @returns {Promise}
   */
  showStories(notSyncedOnly = true) {
    const storiesUrl = `${this.API_URL}/showstories.json`;
    const maxItemPromise = notSyncedOnly ? Item.getLastShowItem() : null;

    return this.fetchAndFilterStoryIds(storiesUrl, maxItemPromise)
      .then(ids => Promise.all(_.map(ids, id => this.getItem(id))));
  }

  /**
   * Fetches the job stories. Will skip the stories that are already stored based on notSyncedOnly flag
   * @param {boolean=} notSyncedOnly Fetches only the stories not stored in the local database
   * @returns {Promise}
   */
  jobStories(notSyncedOnly = true) {
    const storiesUrl = `${this.API_URL}/jobstories.json`;
    const maxItemPromise = notSyncedOnly ? Item.getLastJobItem() : null;

    return this.fetchAndFilterStoryIds(storiesUrl, maxItemPromise)
      .then(ids => Promise.all(_.map(ids, id => this.getItem(id))));
  }

  /**
   * Fetches the top stories. Will skip the stories that are already stored based on notSyncedOnly flag
   * @param {boolean=} notSyncedOnly Fetches only the stories not stored in the local database
   * @returns {Promise}
   */
  topStories(notSyncedOnly = true) {
    const storiesUrl = `${this.API_URL}/topstories.json`;
    const maxItemPromise = notSyncedOnly ? Item.getLastTopItem() : null;

    return this.fetchAndFilterStoryIds(storiesUrl, maxItemPromise)
      .then(ids => Promise.all(_.map(ids, id => this.getItem(id))));
  }

  /**
   * Fetches the best stories. Will skip the stories that are already stored based on notSyncedOnly flag
   * @param {boolean=} notSyncedOnly Fetches only the stories not stored in the local database
   * @returns {Promise}
   */
  bestStories(notSyncedOnly = true) {
    const storiesUrl = `${this.API_URL}/beststories.json`;
    const maxItemPromise = notSyncedOnly ? Item.getLastBestItem() : null;

    return this.fetchAndFilterStoryIds(storiesUrl, maxItemPromise)
      .then(ids => Promise.all(_.map(ids, id => this.getItem(id))));
  }

  /**
   * Fetches the new stories. Will skip the stories that are already stored based on notSyncedOnly flag
   * @param {boolean=} notSyncedOnly Fetches only the stories not stored in the local database
   * @returns {Promise}
   */
  newStories(notSyncedOnly = true) {
    const storiesUrl = `${this.API_URL}/newstories.json`;
    const maxItemPromise = notSyncedOnly ? Item.getLastNewItem() : null;

    return this.fetchAndFilterStoryIds(storiesUrl, maxItemPromise)
      .then(ids => Promise.all(_.map(ids, id => this.getItem(id))));
  }

  /**
   * Fetches the story ids and filters them based on the nonSyncedOnly flag.
   * @param {string} url The stories URL to fetch from
   * @param {Promise=} maxItemPromise The promise that resolves the max item from the database
   * @returns {Promise}
   */
  fetchAndFilterStoryIds(url, maxItemPromise = null) {
    return (maxItemPromise || Promise.resolve(null))

      .then(lastItemRow => {
        if (lastItemRow) {
          return lastItemRow;
        }

        return Promise.reject(`Failed to fetch the latest stored item`);
      })

      .catch(error => {
        return Promise.resolve({id: 0});
      })

      .then(lastItemRow => {
        return this.request(url)
          .then(ids => {
            // Filter all the stories that are already stored
            return _.filter(ids, id => id > lastItemRow.id);
          });
      });
  }

  /**
   * Performs a request to the hackernews API
   * @param {string} url The hackernews API URL
   * @param {string=} method The HTTP method. Defaults to GET
   * @param {Object=} payload The request payload if applicable
   * @returns {Promise}
   */
  request(url, method = 'GET', payload = {}) {
    return new Promise((resolve, reject) => {
      request({
        method,
        url,
        headers: {
          'User-Agent': 'request',
        },
        body: payload,
        json: true,
        encoding: 'utf8',
        timeout: this.API_TIMEOUT
      }, (error, response, body) => {
        if (error) {
          sails.log.error(`Request to ${url} failed with error ${error}`);
          return reject(error);
        }

        sails.log.debug(`Request to ${url} completed`);
        return resolve(body);
      });
    });
  }
}

module.exports = new HackerNewsApi();
