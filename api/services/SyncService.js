/* global sails, HackerNewsApi, Item */
const Rx = require('rxjs/Rx');
const _ = require('lodash');

/**
 * SyncService polls for hacker news updates and persists the delta into the database
 */
class SyncService {
  constructor() {
    /**
     * The Observable
     * @type {null}
     */
    this.sync$ = null;

    /**
     * The polling interval
     * @type {number}
     */
    this.interval = 20000;
  }

  /**
   * Getter of the status of the sync service
   * @returns {boolean}
   */
  get isRunning() {
    return Boolean(this.sync$);
  }

  /**
   * Starts pooling for hacker news
   * @returns {SyncService}
   */
  start() {
    if (this.sync$) {
      return this;
    }

    this.sync$ = Rx.Observable.interval(this.interval)
      .switchMap(() => {
        return this.syncCategory(
          HackerNewsApi.askStories().then(stories => this.persistItems(stories, {isAsk: true})),
          'ASK'
        );
      })
      .switchMap(() => {
        return this.syncCategory(
          HackerNewsApi.showStories().then(stories => this.persistItems(stories, {isShow: true})),
          'SHOW'
        );
      })
      .switchMap(() => {
        return this.syncCategory(
          HackerNewsApi.jobStories().then(stories => this.persistItems(stories, {isJob: true})),
          'JOB'
        );
      })
      .switchMap(() => {
        return this.syncCategory(
          HackerNewsApi.topStories().then(stories => this.persistItems(stories, {isTop: true})),
          'TOP'
        );
      })
      .switchMap(() => {
        return this.syncCategory(
          HackerNewsApi.bestStories().then(stories => this.persistItems(stories, {isBest: true})),
          'BEST'
        );
      })
      .switchMap(() => {
        return this.syncCategory(
          HackerNewsApi.newStories().then(stories => this.persistItems(stories, {isNew: true})),
          'NEW'
        );
      })

      .subscribe(() => {
        sails.log.debug(`Sync sequence complete`);
      });
  }

  /**
   * Stops the pooling
   * @returns {SyncService}
   */
  stop() {
    if (!this.sync$) {
      return this;
    }

    this.sync$.unsubscribe();
    this.sync$ = null;

    return this;
  }

  /**
   * Creates an observable that performs the error handling
   * @param {Promise} syncPromise The promise that resolves a hackernews items request (beststories, showstories, etc.)
   * @param category
   * @returns {Promise}
   */
  syncCategory(syncPromise, category = 'NO CATEGORY') {
    sails.log.debug(`Syncing category ${category} started`);
    return Rx.Observable.fromPromise(
      syncPromise
    ).catch(error => {
      sails.log.error(`Syncing category ${category} failed with error ${error.message}`);
      return Rx.Observable.empty();
    });
  }

  /**
   * Persists new items in the database
   * @param {Array} items Items to persist
   * @param {Object=} where The data to extend each item with
   * @returns {Promise}
   */
  persistItems(items, where = {}) {
    const records = [];
    const promises = _.map(items, item =>
      Item.upsert(_.assign(item, where))
        .then(record => {
          records.push(record);
          return record;
        })
        .catch(error => {
          // Ninja
          sails.log.error(`Failed to upsert an item with ${error.message}`);
          return null;
        })
    );

    return Promise.all(promises)
      .then(response => {
        sails.log.debug(`Persisted ${_.size(records)} out of ${_.size(promises)}`);
        return records;
      })
      .catch(error => {
        sails.log.debug(`Persisted ${_.size(records)} out of ${_.size(promises)}`);
        return records;
      });
  }
}

module.exports = new SyncService();
