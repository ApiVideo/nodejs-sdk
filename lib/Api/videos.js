const fs = require('fs');
const path = require('path');
const os = require('os');
const tempname = require('tempnam');
const querystring = require('querystring');
const Video = require('../Model/video');
const VideoStatus = require('../Model/videoStatus');
const IngestStatus = require('../Model/ingestStatus');
const EncodingStatus = require('../Model/encodingStatus');

const Videos = function Videos(browser) {
  this.browser = browser;
  this.chunkSize = 64 * 1024 * 1024;

  this.get = async function get(videoId) {
    const that = this;
    const response = await this.browser.get(`/videos/${videoId}`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const video = that.cast(response.body);
        resolve(video);
      }
    }));
  };

  this.getStatus = async function getStatus(videoId) {
    const that = this;
    const response = await this.browser.get(`/videos/${videoId}/status`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const videoStatus = that.castStatus(response.body);
        resolve(videoStatus);
      }
    }));
  };

  this.create = async function create(title, properties = {}) {
    const that = this;
    const response = await this.browser.post(
      '/videos',
      {},
      Object.assign(properties, { title }),
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const video = that.cast(response.body);
        resolve(video);
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
    const allVideos = [];
    let pagination = {};

    /* eslint-disable no-await-in-loop */
    do {
      const response = await this.browser.get(
        `/videos?${querystring.stringify(parameters)}`,
      );

      if (that.browser.isSuccessfull(response)) {
        const results = response.body;
        const videos = results.data;
        allVideos.push(that.castAll(videos));

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
        resolve(allVideos.reduce((videos, videosPage) => videos.concat(videosPage)));
      } catch (e) {
        reject(e);
      }
    }));
  };

  this.download = async function download(source, title, properties = {}) {
    const parameters = properties;
    parameters.source = source;

    return this.create(title, parameters);
  };

  this.upload = async function upload(source, properties = {}, videoId = null) {
    const that = this;
    let slug = videoId;
    const parameters = properties;
    if (!fs.existsSync(source)) {
      throw new Error(`${source} must be a readable source file`);
    }

    if (slug === null) {
      if (typeof parameters.title === 'undefined') {
        parameters.title = path.basename(source);
      }
      const video = await this.create(parameters.title, parameters);
      slug = video.videoId;
    }

    const length = fs.statSync(source).size;

    if (length <= 0) {
      throw new Error(`${source} is empty`);
    }

    // Upload in a single request when file is small enough
    if (this.chunkSize > length) {
      const response = await this.browser.submit(
        `/videos/${slug}/source`,
        source,
      );
      return new Promise(((resolve, reject) => {
        if (!that.browser.isSuccessfull(response)) {
          reject(response);
        } else {
          const video = that.cast(response.body);
          resolve(video);
        }
      }));
    }

    const readableStream = fs.createReadStream(source, {
      highWaterMark: this.chunkSize,
    });

    const chunks = [];
    readableStream.on('readable', async () => {
      const chunkPath = tempname.tempnamSync(os.tmpdir(), 'upload-chunk-');
      let chunk;
      while ((chunk = readableStream.read(that.chunkSize)) !== null) {
        fs.writeFileSync(chunkPath, chunk, {});
        chunks.push(chunkPath);
      }
    });

    let copiedBytes = 0;
    // eslint-disable-next-line no-unused-vars
    return new Promise((async (resolve, reject) => {
      let lastResponse = null;
      await readableStream.on('end', () => {
        Object.keys(chunks)
          .forEach(async (key) => {
            const chunk = chunks[key];
            const chunkFile = fs.readFileSync(chunk);
            const from = copiedBytes;
            copiedBytes += chunkFile.length;
            lastResponse = await that.browser.submit(
              `/videos/${slug}/source`,
              chunk,
              {
                'Content-Range': `bytes ${from}-${copiedBytes - 1}/${length}`,
              },
            )
              .catch((error) => {
                throw new Error(error.message);
              });
            fs.unlinkSync(chunk);
            if (that.browser.isSuccessfull(lastResponse)) {
              if (lastResponse.headers.lastchunkextension) {
                const video = that.cast(lastResponse.body);
                resolve(video);
              }
            }
          });
      });
    }));
  };

  this.uploadThumbnail = async function uploadThumbnail(source, videoId) {
    const that = this;

    if (!fs.existsSync(source)) {
      throw new Error(`${source} must be a readable source file`);
    }

    const length = fs.statSync(source).size;

    if (length <= 0) {
      throw new Error(`${source} is empty`);
    }

    const response = await this.browser.submit(
      `/videos/${videoId}/thumbnail`,
      source,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const video = that.cast(response.body);
        resolve(video);
      }
    })).catch((error) => {
      console.log(error);
    });
  };

  this.update = async function update(videoId, properties = {}) {
    const that = this;
    const response = await this.browser.patch(
      `/videos/${videoId}`,
      {},
      properties,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const video = that.cast(response.body);
        resolve(video);
      }
    }));
  };

  this.makePublic = async function makePublic(videoId) {
    const that = this;
    const response = await this.browser.patch(
      `/videos/${videoId}`,
      {},
      { public: true },
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const video = that.cast(response.body);
        resolve(video);
      }
    }));
  };

  this.makePrivate = async function makePrivate(videoId) {
    const that = this;
    const response = await this.browser.patch(
      `/videos/${videoId}`,
      {},
      { public: false },
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const video = that.cast(response.body);
        resolve(video);
      }
    }));
  };

  this.updateThumbnailWithTimecode = async function updateThumbnailWithTimecode(
    videoId, timecode,
  ) {
    const that = this;
    if (!timecode) {
      throw new Error('Timecode is empty');
    }
    const response = await this.browser.patch(
      `/videos/${videoId}/thumbnail`,
      {},
      { timecode },
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const video = that.cast(response.body);
        resolve(video);
      }
    }));
  };

  this.delete = async function remove(videoId) {
    const that = this;

    const response = await this.browser.delete(`/videos/${videoId}`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        resolve(response.statusCode);
      }
    }));
  };
};

Videos.prototype.castAll = function castAll(collection) {
  return collection.map((data) => {
    const video = new Video();
    video.videoId = data.videoId;
    video.title = data.title;
    video.description = data.description;
    video.public = data.public;
    video.panoramic = data.panoramic;
    video.mp4Support = data.mp4Support;
    video.tags = data.tags;
    video.metadata = data.metadata;
    video.source = data.source;
    video.publishedAt = data.publishedAt;
    video.assets = data.assets;

    return video;
  });
};

Videos.prototype.cast = function cast(data) {
  if (!data) {
    return null;
  }

  const video = new Video();
  video.videoId = data.videoId;
  video.title = data.title;
  video.description = data.description;
  video.public = data.public;
  video.panoramic = data.panoramic;
  video.mp4Support = data.mp4Support;
  video.tags = data.tags;
  video.metadata = data.metadata;
  video.source = data.source;
  video.publishedAt = data.publishedAt;
  video.assets = data.assets;

  return video;
};

Videos.prototype.castStatus = function cast(data) {
  if (!data) {
    return null;
  }

  const ingestStatus = new IngestStatus();
  ingestStatus.status = data.ingest.status;
  ingestStatus.filesize = data.ingest.filesize;
  ingestStatus.receivedBytes = data.ingest.receivedBytes;


  const encodingStatus = new EncodingStatus();
  encodingStatus.playable = data.encoding.playable;
  encodingStatus.qualities = data.encoding.qualities;
  encodingStatus.metadata = data.encoding.metadata;

  const videoStatus = new VideoStatus();
  videoStatus.ingest = ingestStatus;
  videoStatus.encoding = encodingStatus;

  return videoStatus;
};

module.exports = Videos;
