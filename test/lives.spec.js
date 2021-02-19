const path = require('path');
const { expect } = require('chai');
const apiVideo = require('../lib');
const { ITEMS_TOTAL } = require('./api');

describe('Lives ressource', () => {
  describe('create', () => {
    it('Does not throw', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const name = 'Live test';
      const properties = {
        record: false,
      };
      await client.lives.create(name, properties);
    });
  });

  describe('update', () => {
    it('Does not throw', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const properties = {
        record: true,
      };
      await client.lives.update('lix1x1x1x1x1x1x1x1x1x', properties);
    });
  });

  describe('get', async () => {
    it('Returns a live-stream', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const live = await client.lives.get('lix1x1x1x1x1x1x1x1x1x');
      expect(live).to.have.property('liveStreamId');
    });
  });

  describe('Search first page', () => {
    it('Returns an array', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const parameters = {
        currentPage: 1,
        pageSize: 25,
      };
      const liveStreams = await client.lives.search(parameters);
      expect(liveStreams).to.be.an.instanceOf(Array);
    });

    it('Returns only one page', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const parameters = {
        currentPage: 1,
        pageSize: 25,
      };
      const liveStreams = await client.lives.search(parameters);
      expect(liveStreams).to.be.of.length(parameters.pageSize);
    });
  });

  describe('Search without parameters', () => {
    it('Returns an array', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const parameters = {};
      const liveStreams = await client.lives.search(parameters);
      expect(liveStreams).to.be.an.instanceOf(Array);
    });

    it('Returns all pages', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const parameters = {};
      const liveStreams = await client.lives.search(parameters);
      expect(liveStreams).to.be.of.length(ITEMS_TOTAL); // default pageSize is 100
    });
  });

  describe('Upload thumbnail', () => {
    it('Does not throw', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const source = path.join(__dirname, 'data/test.png');
      const liveId = 'lix1x1x1x1x1x1x1x1x1x';
      await client.lives.uploadThumbnail(source, liveId);
    });
  });

  describe('delete', () => {
    it('Does not throw', async () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      await client.lives.delete('lix1x1x1x1x1x1x1x1x1x');
    });
  });

  describe('cast', () => {
    it('Should return live object', () => {
      const client = new apiVideo.Client({ apiKey: 'test' });
      const data = {
        liveStreamId: 'lix1x1x1x1x1x1x1x1x1x',
        streamKey: '6xx3x5x2-2x2x-468x-906x-xx3xx9xx79x7',
        name: 'Live test',
        record: true,
        broadcasting: false,
        assets: {
          iframe: '<iframe src="https://embed.api.video/live/lix1x1x1x1x1x1x1x1x1x" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen=""></iframe>',
          player: 'https://embed.api.video/live/lix1x1x1x1x1x1x1x1x1x',
          hls: 'https://live.api.video/live/lix1x1x1x1x1x1x1x1x1x.m3u8',
          thumbnail: 'https://cdn.api.video/live/lix1x1x1x1x1x1x1x1x1x/thumbnail.jpg',
        },
        public: undefined,
      };
      const live = client.lives.cast(data);
      expect(live).to.deep.equal(data);
    });
  });
});
