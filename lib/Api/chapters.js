const fs = require('fs');
const Chapter = require('../Model/chapter');

const Chapters = function Chapters(browser) {
  this.browser = browser;

  this.get = async function get(videoId, language) {
    const that = this;
    const response = await this.browser.get(
      `/videos/${videoId}/chapters/${language}`,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const chapter = that.cast(response.body);
        resolve(chapter);
      }
    }));
  };

  this.getAll = async function getAll(videoId) {
    const that = this;
    const response = await this.browser.get(`/videos/${videoId}/chapters`);

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const chapters = that.castAll(response.body);
        resolve(chapters);
      }
    }));
  };

  this.upload = async function upload(source, properties = {}) {
    const that = this;

    if (!fs.existsSync(source)) {
      throw new Error(`${source} must be a readable source file`);
    }

    if (typeof properties.videoId === 'undefined') {
      throw new Error('"videoId" property must be set for upload chapter.');
    }

    if (typeof properties.language === 'undefined') {
      throw new Error('"language" property must be set for upload chapter.');
    }

    const { videoId } = properties;
    const { language } = properties;

    const length = fs.statSync(source).size;

    if (length <= 0) {
      throw new Error(`${source} is empty`);
    }

    const response = await this.browser.submit(
      `/videos/${videoId}/chapters/${language}`,
      source,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        const chapter = that.cast(response.body);
        resolve(chapter);
      }
    }));
  };

  this.delete = async function remove(videoId, language) {
    const that = this;

    const response = await this.browser.delete(
      `/videos/${videoId}/chapters/${language}`,
    );

    return new Promise(((resolve, reject) => {
      if (!that.browser.isSuccessfull(response)) {
        reject(response);
      } else {
        resolve(response.statusCode);
      }
    }));
  };
};

Chapters.prototype.castAll = function castAll(collection) {
  return collection.map((data) => {
    const chapter = new Chapter();
    chapter.uri = data.uri;
    chapter.src = data.src;
    chapter.language = data.language;

    return chapter;
  });
};

Chapters.prototype.cast = function cast(data) {
  if (!data) {
    return null;
  }
  const chapter = new Chapter();
  chapter.uri = data.uri;
  chapter.src = data.src;
  chapter.language = data.language;

  return chapter;
};

module.exports = Chapters;
