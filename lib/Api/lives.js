const fs = require('fs');
const querystring = require('querystring');
const Live = require('../Model/live');

const Lives = function Lives(browser) {
  this.browser = browser;

  this.get = async function get(liveStreamId) {
    const that = this;
    const response = await this.browser.get(`/live-streams/${liveStreamId}`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const live = that.cast(response.body);
        resolve(live);
      }
    }));
  };

  this.create = async function create(name, properties = {}) {
    const that = this;
    const response = await this.browser.post(
      '/live-streams',
      {},
      Object.assign(properties, { name }),
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const live = that.cast(response.body);
        resolve(live);
      }
    }));
  };

  this.search = async function search(parameters = {}) {
    const that = this;
    const params = parameters;
    const currentPage = (typeof parameters.currentPage !== 'undefined')
      ? parameters.currentPage
      : 1;
    params.pageSize = (typeof parameters.pageSize !== 'undefined')
      ? parameters.pageSize
      : 100;
    params.currentPage = currentPage;
    const allLives = [];
    let pagination = {};

    /* eslint-disable no-await-in-loop */
    do {
      const response = await this.browser.get(
        `/live-streams?${querystring.stringify(parameters)}`,
      );

      if (that.browser.isSuccessfull(response)) {
        const results = response.body;
        const lives = results.data;
        allLives.push(that.castAll(lives));

        if (typeof parameters.currentPage !== 'undefined') {
          break;
        }

        ({ pagination } = results);
        pagination.currentPage += 1;
        params.currentPage = pagination.currentPage;
      }
    } while (pagination.pagesTotal > pagination.currentPage);

    return new Promise((async (resolve, reject) => {
      try {
        resolve(allLives.reduce((lives, livesPage) => lives.concat(livesPage)));
      } catch (e) {
        reject(e);
      }
    }));
  };

  this.uploadThumbnail = async function uploadThumbnail(source, liveStreamId) {
    const that = this;

    if (!fs.existsSync(source)) {
      throw new Error(`${source} must be a readable source file`);
    }

    const length = fs.statSync(source).size;

    if (length <= 0) {
      throw new Error(`${source}is empty`);
    }

    const response = await this.browser.submit(
      `/live-streams/${liveStreamId}/thumbnail`,
      source,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const live = that.cast(response.body);
        resolve(live);
      }
    }));
  };

  this.update = async function update(liveStreamId, properties = {}) {
    const that = this;
    const response = await this.browser.patch(
      `/live-streams/${liveStreamId}`,
      {},
      properties,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const live = that.cast(response.body);
        resolve(live);
      }
    }));
  };

  this.delete = async function remove(liveStreamId) {
    const that = this;

    const response = await this.browser.delete(`/live-streams/${liveStreamId}`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        resolve(response.statusCode);
      }
    }));
  };
};

Lives.prototype.castAll = function castAll(collection) {
  return collection.map((data) => {
    const live = new Live();
    live.liveStreamId = data.liveStreamId;
    live.name = data.name;
    live.streamKey = data.streamKey;
    live.record = data.record;
    live.broadcasting = data.broadcasting;
    live.assets = data.assets;

    return live;
  });
};

Lives.prototype.cast = function cast(data) {
  if (!data) {
    return null;
  }
  const live = new Live();
  live.liveStreamId = data.liveStreamId;
  live.name = data.name;
  live.streamKey = data.streamKey;
  live.record = data.record;
  live.broadcasting = data.broadcasting;
  live.assets = data.assets;

  return live;
};

module.exports = Lives;
