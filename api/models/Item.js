module.exports = {

  attributes: {
    //The item's unique id.
    id: {
      type: 'integer',
      primaryKey: true,
      autoIncrement: false,
      required: true,
      unique: true
    },

    //true if the item is deleted.
    deleted: {
      type: 'boolean',
      defaultsTo: false
    },

    //The type of item. One of "job", "story", "comment", "poll", or "pollopt".
    type: {
      type: 'string',
      enum: ['job', 'story', 'comment', 'poll', 'pollopt'],
      // required: true
    },

    //The username of the item's author.
    by: {
      type: 'string'
    },

    //Creation date of the item, in Unix Time.
    time: {
      type: 'integer'
    },

    //The comment, story or poll text. HTML.
    text: {
      type: 'string'
    },

    //true if the item is dead.
    dead: {
      type: 'boolean',
      defaultsTo: false
    },

    //The item's parent. For comments, either another comment or the relevant story. For pollopts, the relevant poll.
    parent: {
      type: 'integer'
    },

    //The ids of the item's comments, in ranked display order.
    kids: {
      type: 'array'
    },

    //The URL of the story.
    url: {
      type: 'string',
      // required: true
    },

    //The story's score, or the votes for a pollopt.
    score: {
      type: 'integer'
    },

    //The title of the story, poll or job.
    title: {
      type: 'string',
      // required: true
    },

    //A list of related pollopts, in display order.
    parts: {
      type: 'array'
    },

    //In the case of stories or polls, the total comment count.
    descendants: {
      type: 'integer'
    },

    //Flag indicating the item is a top stories item
    isTop: {
      type: 'boolean',
      defaultsTo: false
    },

    //Flag indicating the item is a best stories item
    isBest: {
      type: 'boolean',
      defaultsTo: false
    },

    //Flag indicating the item is a new item
    isNew: {
      type: 'boolean',
      defaultsTo: false
    },

    //Flag indicating the item is an ask stories item
    isAsk: {
      type: 'boolean',
      defaultsTo: false
    },

    //Flag indicating the item is a show story item
    isShow: {
      type: 'boolean',
      defaultsTo: false
    },

    //Flag indicating the item is a job story item
    isJob: {
      type: 'boolean',
      defaultsTo: false
    }
  },

  /**
   * Verifies if the item type is a valid one
   * @param {string} type The item type
   * @returns {boolean}
   */
  isValidType(type) {
    return _.includes(this.attributes.type.enum, type);
  },

  /**
   * Retrieves from db the last item of type ask
   * @param {string=} type The type of item. Defaults to story
   * @returns {Promise}
   */
  getLastAskItem(type = 'story') {
    return this.getLastItem(type, {isAsk: true});
  },

  /**
   * Retrieves from db the last item of type show
   * @param {string=} type The type of item. Defaults to story
   * @returns {Promise}
   */
  getLastShowItem(type = 'story') {
    return this.getLastItem(type, {isShow: true});
  },

  /**
   * Retrieves from db the last item of type job
   * @param {string=} type The type of item. Defaults to story
   * @returns {Promise}
   */
  getLastJobItem(type = 'story') {
    return this.getLastItem(type, {isJob: true});
  },

  /**
   * Retrieves from db the last item of type best story
   * @param {string=} type The type of item. Defaults to story
   * @returns {Promise}
   */
  getLastBestItem(type = 'story') {
    return this.getLastItem(type, {isBest: true});
  },

  /**
   * Retrieves from db the last item of type top story
   * @param {string=} type The type of item. Defaults to story
   * @returns {Promise}
   */
  getLastTopItem(type = 'story') {
    return this.getLastItem(type, {isTop: true});
  },

  /**
   * Retrieves from db the last item of type new story
   * @param {string=} type The type of item. Defaults to story
   * @returns {Promise}
   */
  getLastNewItem(type = 'story') {
    return this.getLastItem(type, {isNew: true});
  },

  /**
   * Retrieves the last item from the database
   * @param {string=} type The type of the item. Defaults to story
   * @param {Object=} where The waterline query where modifier
   * @returns {Promise}
   */
  getLastItem(type = 'story', where = {}) {
    if (type && !this.isValidType(type)) {
      return Promise.reject(`Failed to get last item due to invalid type ${type}`);
    }

    const query = {
      where: where,
      limit: 1,
      sort: 'id DESC'
    };

    return new Promise((resolve, reject) => {
      this.findOne(query)
        .exec((error, record) => {
          if (error) {
            return reject(error);
          }

          if (!record) {
            return reject(Error(`No item found`));
          }

          return resolve(record);
        });
    });
  },

  /**
   * Creates or updates a record in the item table
   * @param {Object} item The item to update or create
   * @returns {Promise}
   */
  upsert(item){
    return this.findOne({id: item.id})
      .then(record => {
        if(record){
          return this.update(record.id, _.assign(record, item));
        }

        return this.create(item);
      });
  }
};

