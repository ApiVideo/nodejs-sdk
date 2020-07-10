const querystring = require('querystring');
const AnalyticLive = require('../Model/Analytic/analyticLive');
const AnalyticData = require('../Model/Analytic/analyticData');

const AnalyticsLive = function AnalyticsLive(browser) {
  this.browser = browser;

  this.get = async function get(liveStreamId, period = null) {
    const that = this;
    const parameters = {};
    if (period) {
      parameters.period = period;
    }
    const response = await this.browser.get(
      `/analytics/live-streams/${liveStreamId}?${querystring.stringify(parameters)}`,
    );
    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const analyticLive = that.cast(response.body);
        resolve(analyticLive);
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

    const allAnalytics = [];
    let pagination = {};

    /* eslint-disable no-await-in-loop */
    do {
      const response = await this.browser.get(
        `/analytics/live-streams?${querystring.stringify(parameters)}`,
      );

      if (that.browser.isSuccessfull(response)) {
        const results = response.body;
        const analytics = results.data;
        allAnalytics.push(that.castAll(analytics));

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
        resolve(allAnalytics.reduce(
          (analytics, analyticsPage) => analytics.concat(analyticsPage),
        ));
      } catch (e) {
        reject(e);
      }
    }));
  };
};

AnalyticsLive.prototype.castAll = function castAll(collection) {
  return collection.map((data) => {
    const analyticLive = new AnalyticLive();
    analyticLive.liveStreamId = data.live ? data.live.liveStreamId : null;
    analyticLive.liveName = data.live ? data.live.name : null;
    analyticLive.period = data.period;
    // Build Analytic Data
    Object.keys(data.data).forEach((key) => {
      const playerSession = data.data[key];
      const analyticData = new AnalyticData();

      // Build Analytic Session
      analyticData.session.sessionId = playerSession.session.sessionId;
      analyticData.session.loadedAt = new Date(
        playerSession.session.loadedAt,
      );
      analyticData.session.endedAt = new Date(playerSession.session.endedAt);

      // Build Analytic Location
      analyticData.location.country = playerSession.location.country;
      analyticData.location.city = playerSession.location.city;

      // Build Analytic Referer
      analyticData.referer.url = playerSession.referrer.url;
      analyticData.referer.medium = playerSession.referrer.medium;
      analyticData.referer.source = playerSession.referrer.source;
      analyticData.referer.search_term = playerSession.referrer.searchTerm;

      // Build Analytic Device
      analyticData.device.type = playerSession.device.type;
      analyticData.device.vendor = playerSession.device.vendor;
      analyticData.device.model = playerSession.device.model;

      // Build Analytic Os
      analyticData.os.name = playerSession.os.name;
      analyticData.os.shortname = playerSession.os.shortname;
      analyticData.os.version = playerSession.os.version;

      // Build Analytic Client
      analyticData.client.type = playerSession.client.type;
      analyticData.client.name = playerSession.client.name;
      analyticData.client.version = playerSession.client.version;

      analyticLive.data.push(analyticData);
    });

    return analyticLive;
  });
};

AnalyticsLive.prototype.cast = function cast(data) {
  if (!data) {
    return null;
  }

  const analyticLive = new AnalyticLive();
  analyticLive.liveStreamId = data.live ? data.live.liveStreamId : null;
  analyticLive.liveName = data.live ? data.live.name : null;
  analyticLive.period = data.period;
  // Build Analytic Data
  Object.keys(data.data).forEach((key) => {
    const playerSession = data.data[key];
    const analyticData = new AnalyticData();

    // Build Analytic Session
    analyticData.session.sessionId = playerSession.session.sessionId;
    analyticData.session.loadedAt = new Date(
      playerSession.session.loadedAt,
    );
    analyticData.session.endedAt = new Date(playerSession.session.endedAt);

    // Build Analytic Location
    analyticData.location.country = playerSession.location.country;
    analyticData.location.city = playerSession.location.city;

    // Build Analytic Referer
    analyticData.referer.url = playerSession.referrer.url;
    analyticData.referer.medium = playerSession.referrer.medium;
    analyticData.referer.source = playerSession.referrer.source;
    analyticData.referer.search_term = playerSession.referrer.searchTerm;

    // Build Analytic Device
    analyticData.device.type = playerSession.device.type;
    analyticData.device.vendor = playerSession.device.vendor;
    analyticData.device.model = playerSession.device.model;

    // Build Analytic Os
    analyticData.os.name = playerSession.os.name;
    analyticData.os.shortname = playerSession.os.shortname;
    analyticData.os.version = playerSession.os.version;

    // Build Analytic Client
    analyticData.client.type = playerSession.client.type;
    analyticData.client.name = playerSession.client.name;
    analyticData.client.version = playerSession.client.version;

    analyticLive.data.push(analyticData);
  });

  return analyticLive;
};

module.exports = AnalyticsLive;
