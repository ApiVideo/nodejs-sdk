const expect = require('chai').expect;
const Videos = require('../lib/Api/videos');
const Lives = require('../lib/Api/lives');
const Players = require('../lib/Api/players');
const Captions = require('../lib/Api/captions');
const Chapters = require('../lib/Api/chapters');
const Tokens = require('../lib/Api/tokens');
const AnalyticsVideo = require('../lib/Api/analyticsVideo');
const AnalyticsLive = require('../lib/Api/analyticsLive');
const apiVideo = require('../lib');

describe('apiVideo.Client', () => {
  it('should use the Browser class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.browser).instanceOf(apiVideo.Browser);
  });
  it('should use the Videos class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.videos).instanceOf(Videos);
  });
  it('should use the Lives class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.lives).instanceOf(Lives);
  });
  it('should use the Players class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.players).instanceOf(Players);
  });
  it('should use the Captions class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.captions).instanceOf(Captions);
  });
  it('should use the Chapters class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.chapters).instanceOf(Chapters);
  });
  it('should use the Tokens class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.tokens).instanceOf(Tokens);
  });
  it('should use the AnalyticsVideo class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.analyticsVideo).instanceOf(AnalyticsVideo);
  });
  it('should use the AnalyticsLive class', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.analyticsLive).instanceOf(AnalyticsLive);
  });
  it('should set apiKey', () => {
    const client = new apiVideo.Client({ apiKey: 'test' });
    expect(client.apiKey).eq('test');
  });
  it('should set baseUri', () => {
    const client = new apiVideo.Client({ apiKey: 'test', baseUri: 'https://test.api.video' });
    expect(client.baseUri).eq('https://test.api.video');
  });
});
