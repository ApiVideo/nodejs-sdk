const querystring = require('querystring');
const fs = require('fs');
const Player = require('../Model/player');

const Players = function Players(browser) {
  this.browser = browser;

  this.get = async function get(playerId) {
    const that = this;
    const response = await this.browser.get(`/players/${playerId}`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const player = that.cast(response.body);
        resolve(player);
      }
    }));
  };

  this.create = async function create(properties = {}) {
    const that = this;
    const response = await this.browser.post(
      '/players',
      {},
      properties,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const player = that.cast(response.body);
        resolve(player);
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
    const allPlayers = [];
    let pagination = {};

    /* eslint-disable no-await-in-loop */
    do {
      const response = await this.browser.get(
        `/players?${querystring.stringify(parameters)}`,
      );

      if (that.browser.isSuccessfull(response)) {
        const results = response.body;
        const players = results.data;
        allPlayers.push(that.castAll(players));

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
        resolve(allPlayers.reduce((players, payersPage) => players.concat(payersPage)));
      } catch (e) {
        reject(e);
      }
    }));
  };

  this.update = async function update(playerId, properties = {}) {
    const that = this;
    const response = await this.browser.patch(
      `/players/${playerId}`,
      {},
      properties,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const player = that.cast(response.body);
        resolve(player);
      }
    }));
  };

  this.uploadLogo = async function uploadLogo(source, playerId, link = null) {
    const that = this;

    if (!fs.existsSync(source)) {
      throw new Error(`${source} must be a readable source file`);
    }

    const length = fs.statSync(source).size;

    if (length <= 0) {
      throw new Error(`${source} is empty`);
    }

    const payload = {};
    if (link !== null) {
      payload.link = link;
    }

    const response = await this.browser.submitMultiPart(
      `/players/${playerId}/logo`,
      source,
      payload,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const player = that.cast(response.body);
        resolve(player);
      }
    }));
  };

  this.deleteLogo = async function remove(playerId) {
    const that = this;

    const response = await this.browser.delete(`/players/${playerId}/logo`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        resolve(response.statusCode);
      }
    }));
  };

  this.delete = async function remove(playerId) {
    const that = this;

    const response = await this.browser.delete(`/players/${playerId}`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        resolve(response.statusCode);
      }
    }));
  };
};

Players.prototype.castAll = function castAll(collection) {
  return collection.map((data) => {
    const player = new Player();
    player.playerId = data.playerId;
    player.shapeMargin = data.shapeMargin;
    player.shapeRadius = data.shapeRadius;
    player.shapeAspect = data.shapeAspect;
    player.shapeBackgroundTop = data.shapeBackgroundTop;
    player.shapeBackgroundBottom = data.shapeBackgroundBottom;
    player.text = data.text;
    player.link = data.link;
    player.linkHover = data.linkHover;
    player.linkActive = data.linkActive;
    player.trackPlayed = data.trackPlayed;
    player.trackUnplayed = data.trackUnplayed;
    player.trackBackground = data.trackBackground;
    player.backgroundTop = data.backgroundTop;
    player.backgroundBottom = data.backgroundBottom;
    player.backgroundText = data.backgroundText;
    player.enableApi = data.enableApi;
    player.enableControls = data.enableControls;
    player.forceAutoplay = data.forceAutoplay;
    player.hideTitle = data.hideTitle;
    player.forceLoop = data.forceLoop;
    return player;
  });
};

Players.prototype.cast = function cast(data) {
  if (!data) {
    return null;
  }

  const player = new Player();
  player.playerId = data.playerId;
  player.shapeMargin = data.shapeMargin;
  player.shapeRadius = data.shapeRadius;
  player.shapeAspect = data.shapeAspect;
  player.shapeBackgroundTop = data.shapeBackgroundTop;
  player.shapeBackgroundBottom = data.shapeBackgroundBottom;
  player.text = data.text;
  player.link = data.link;
  player.linkHover = data.linkHover;
  player.linkActive = data.linkActive;
  player.trackPlayed = data.trackPlayed;
  player.trackUnplayed = data.trackUnplayed;
  player.trackBackground = data.trackBackground;
  player.backgroundTop = data.backgroundTop;
  player.backgroundBottom = data.backgroundBottom;
  player.backgroundText = data.backgroundText;
  player.enableApi = data.enableApi;
  player.enableControls = data.enableControls;
  player.forceAutoplay = data.forceAutoplay;
  player.hideTitle = data.hideTitle;
  player.forceLoop = data.forceLoop;
  if (data.assets !== undefined) {
    player.logo = data.assets;
  }

  return player;
};

module.exports = Players;
