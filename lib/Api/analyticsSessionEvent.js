const querystring = require('querystring');
const AnalyticEvent = require('../Model/Analytic/analyticEvent');
const AnalyticSessionEvent = require('../Model/Analytic/analyticSessionEvent');

const AnalyticsSessionEvent = function AnalyticsSessionEvent(browser) {
  this.browser = browser;

  this.get = async function get(sessionId, parameters = {}) {
    const that = this;
    const params = parameters;
    const currentPage = (typeof parameters.currentPage !== 'undefined')
      ? parameters.currentPage
      : 1;
    params.pageSize = (typeof parameters.pageSize !== 'undefined')
      ? parameters.pageSize
      : 100;

    params.currentPage = currentPage;

    let analyticSessionEvent = null;
    const allSessionEvents = [];
    let pagination = {};

    /* eslint-disable no-await-in-loop */
    do {
      const response = await this.browser.get(
        `/analytics/sessions/${sessionId}/events?${querystring.stringify(parameters)}`,
      );

      if (!that.browser.isSuccessfull(response)) {
        return response;
      }
      const results = response.body;
      if (!analyticSessionEvent) {
        analyticSessionEvent = that.cast(results);
      }
      allSessionEvents.push(that.buildAnalyticEventsData(results.data));

      if (typeof parameters.currentPage !== 'undefined') {
        break;
      }

      ({ pagination } = results);
      pagination.currentPage += 1;
      params.currentPage = pagination.currentPage;
    } while (pagination.pagesTotal > pagination.currentPage);

    return new Promise((async (resolve, reject) => {
      try {
        analyticSessionEvent.events = allSessionEvents.reduce(
          (analyticsEvents, analyticsEventsPage) => analyticsEvents.concat(analyticsEventsPage),
        );
        resolve(analyticSessionEvent);
      } catch (e) {
        reject(e);
      }
    }));
  };
};

AnalyticsSessionEvent.prototype.cast = function cast(data) {
  if (!data) {
    return null;
  }
  const analyticSessionEvent = new AnalyticSessionEvent();

  // Build Analytic Session
  analyticSessionEvent.session.sessionId = data.session.sessionId;
  analyticSessionEvent.session.loadedAt = new Date(data.session.loadedAt);
  analyticSessionEvent.session.endedAt = new Date(data.session.endedAt);

  // Build Analytic Resource
  analyticSessionEvent.resource.type = data.resource.type;
  analyticSessionEvent.resource.id = data.resource.id;

  return analyticSessionEvent;
};

AnalyticsSessionEvent.prototype.buildAnalyticEventsData = function buildAnalyticEventsData(events) {
  const analyticEvents = [];

  Object.keys(events).forEach((key) => {
    const event = events[key];
    const analyticEvent = new AnalyticEvent();

    analyticEvent.type = event.type;
    analyticEvent.emittedAt = new Date(event.emittedAt);
    analyticEvent.at = (typeof event.at !== 'undefined') ? event.at : null;
    analyticEvent.from = (typeof event.from !== 'undefined') ? event.from : null;
    analyticEvent.to = (typeof event.to !== 'undefined') ? event.to : null;

    analyticEvents.push(analyticEvent);
  });

  return analyticEvents;
};

module.exports = AnalyticsSessionEvent;
