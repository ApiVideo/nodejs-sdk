const querystring = require('querystring');
const AnalyticVideo = require('../Model/Analytic/analyticVideo');
const AnalyticData = require('../Model/Analytic/analyticData');

const AnalyticsVideo = function AnalyticsVideo(browser) {
  this.browser = browser;

  this.get = async function get(videoId, period = null) {
    const that = this;
    const parameters = {};
    if (period) {
      parameters.period = period;
    }
    const response = await this.browser.get(
      `/analytics/videos/${videoId}?${querystring.stringify(parameters)}`,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const analyticVideo = that.cast(response.body);
        resolve(analyticVideo);
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
        `/analytics/videos?${querystring.stringify(parameters)}`,
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
        resolve(allAnalytics.reduce((analytics, analyticsPage) => analytics.concat(analyticsPage)));
      } catch (e) {
        reject(e);
      }
    }));
  };
};

AnalyticsVideo.prototype.castAll = function castAll(collection) {
  return collection.map((data) => {
    const analyticVideo = new AnalyticVideo();
    analyticVideo.videoId = data.video ? data.video.videoId : null;
    analyticVideo.videoTitle = data.video ? data.video.title : null;
    analyticVideo.period = data.period;
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

      analyticVideo.data.push(analyticData);
    });
    return analyticVideo;
  });
};

AnalyticsVideo.prototype.cast = function cast(data) {
  if (!data) {
    return null;
  }
  const analyticVideo = new AnalyticVideo();
  analyticVideo.videoId = data.video ? data.video.videoId : null;
  analyticVideo.videoTitle = data.video ? data.video.title : null;
  analyticVideo.period = data.period;
  // Build Analytic Data
  Object.keys(data.data).forEach((key) => {
    const playerSession = data.data[key];
    const analyticData = new AnalyticData();

    // Build Analytic Session
    analyticData.session.sessionId = playerSession.session.sessionId;
    analyticData.session.loadedAt = new Date(playerSession.session.loadedAt);
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

    analyticVideo.data.push(analyticData);
  });

  return analyticVideo;
};

module.exports = AnalyticsVideo;
