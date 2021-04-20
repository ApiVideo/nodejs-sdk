const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const Live = require('../Model/live');

const Lives = function Lives(browser) {
  this.browser = browser;

  this.get = function get(liveStreamId) {
    return this.browser.get(`live-streams/${liveStreamId}`).then(this.cast);
  };

  this.create = function create(name, properties = {}) {
    return this.browser.post(
      'live-streams',
      {},
      Object.assign(properties, { name }),
    ).then(this.cast);
  };

  this.search = async function search(parameters = {}) {
    const params = Object.assign({}, parameters);
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
      const body = await this.browser.get(
        `live-streams?${querystring.stringify(params)}`,
      );

      const lives = body.data;
      allLives.push(this.castAll(lives));

      if (typeof parameters.currentPage !== 'undefined') {
        break;
      }

      ({ pagination } = body);
      pagination.currentPage += 1;
      params.currentPage = pagination.currentPage;
    } while (pagination.pagesTotal >= pagination.currentPage);

    return allLives.reduce((lives, livesPage) => lives.concat(livesPage));
  };

  this.uploadThumbnail = function uploadThumbnail(source, liveStreamId) {
    if (!fs.existsSync(source)) {
      throw new Error(`${source} must be a readable source file`);
    }

    const length = fs.statSync(source).size;

    if (length <= 0) {
      throw new Error(`${source} is empty`);
    }

    return this.browser.submit(
      `live-streams/${liveStreamId}/thumbnail`,
      source,
      path.basename(source),
    ).then(this.cast);
  };

  this.update = function update(liveStreamId, properties = {}) {
    return this.browser.patch(
      `live-streams/${liveStreamId}`,
      {},
      properties,
    ).then(this.cast);
  };

  this.delete = function remove(liveStreamId) {
    return this.browser.delete(`live-streams/${liveStreamId}`).then(({ statusCode }) => statusCode);
  };
};

Lives.prototype.castAll = function castAll(collection) {
  return collection.map(Lives.prototype.cast);
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
  live.public = data.public;
  live.assets = data.assets;

  return live;
};

module.exports = Lives;
