const request = require('request');
const fs = require('fs');

const Browser = function Browser(apiKey, baseUri) {
  this.apiKey = apiKey;
  this.baseUri = baseUri;
  this.tokenType = 'Bearer';
  this.accessToken = null;
  this.refreshToken = null;
  this.headers = {};
  this.baseRequest = request.defaults();
  this.lastRequest = null;

  this.getAccessToken = function getAccessToken() {
    const that = this;
    return new Promise(((resolve, reject) => {
      let token = {};
      this.lastRequest = {
        url: `${that.baseUri}/auth/api-key`,
        body: {
          apiKey: that.apiKey,
        },
        json: true,
      };
      request.post(this.lastRequest, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          if (response.statusCode >= 400) {
            console.log(response);
            throw new Error('Authentication Failed');
          }
          token = that.setAccessToken(body.token_type, body.access_token, body.refresh_token);

          resolve(token);
        }
      });
    }));
  };

  this.setAccessToken = function setAccessToken(tokenType, accessToken, refreshToken) {
    this.tokenType = tokenType;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    return {
      tokenType: this.tokenType,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  };

  this.isStillAuthenticated = async function isStillAuthenticated(response) {
    const that = this;
    let result = null;
    if (response.statusCode === 401 && response.headers['content-type']
        === 'application/problem+json') {
      const { lastRequest } = this;
      // noinspection JSIgnoredPromiseFromCall
      const token = await this.getAccessToken().catch((error) => {
        throw new Error(error);
      });
      const { headers } = lastRequest;
      Object.keys(headers).forEach((key) => {
        if (key === 'Authorization') {
          delete headers.key;
        }
      });
      headers.Authorization = `${token.tokenType} ${token.accessToken}`;
      this.headers.Authorization = `${token.tokenType} ${
        token.accessToken}`;
      lastRequest.headers = headers;
      if ((typeof lastRequest.formData !== 'undefined')) {
        lastRequest.formData.file = fs.createReadStream(
          lastRequest.formData.file.path,
        );
      }
      this.lastRequest = lastRequest;
      result = new Promise((resolve, reject) => {
        that.baseRequest(lastRequest, (error, resp) => {
          if (error) {
            reject(error);
          } else {
            resolve(resp);
          }
        });
      });
    }

    if (result) {
      return result;
    }

    return response;
  };
};

Browser.prototype.get = function get(path, headers = {}) {
  const self = this;

  this.lastRequest = {
    url: this.baseUri + path,
    method: 'GET',
    headers: Object.assign(this.headers, headers),
    json: true,
  };

  return new Promise(((resolve, reject) => {
    self.baseRequest(self.lastRequest, async (error, response) => {
      if (error) {
        reject(error);
      } else {
        const result = await self.isStillAuthenticated(response);
        resolve(result);
      }
    });
  }));
};

Browser.prototype.post = function post(path, headers = {}, content = {}) {
  const self = this;

  this.lastRequest = {
    url: this.baseUri + path,
    method: 'POST',
    headers: Object.assign(this.headers, headers),
    body: content,
    json: true,
  };

  return new Promise(((resolve, reject) => {
    self.baseRequest(self.lastRequest, async (error, response) => {
      if (error) {
        reject(error);
      } else {
        const result = await self.isStillAuthenticated(response);
        resolve(result);
      }
    });
  }));
};

Browser.prototype.patch = function patch(path, headers = {}, content = {}) {
  const self = this;

  this.lastRequest = {
    url: this.baseUri + path,
    method: 'PATCH',
    headers: Object.assign(this.headers, headers),
    body: content,
    json: true,
  };

  return new Promise(((resolve, reject) => {
    self.baseRequest(self.lastRequest, async (error, response) => {
      if (error) {
        reject(error);
      } else {
        const result = await self.isStillAuthenticated(response);
        resolve(result);
      }
    });
  }));
};

Browser.prototype.submit = async function submit(path, source, headers = {}) {
  const self = this;
  this.lastRequest = {
    url: this.baseUri + path,
    method: 'POST',
    headers: Object.assign(this.headers, headers),
    formData: {
      file: fs.createReadStream(source),
    },
    json: true,
  };

  return new Promise(((resolve, reject) => {
    self.baseRequest(self.lastRequest, async (error, response) => {
      if (error) {
        reject(error);
      } else {
        const result = await self.isStillAuthenticated(response);
        resolve(result);
      }
    });
  }));
};

// eslint-disable-next-line max-len
Browser.prototype.submitMultiPart = async function submitMultiPart(path, source, data = {}, headers = {}) {
  const self = this;
  const form = {
    file: fs.createReadStream(source),
  };

  const entries = Object.entries(data);
  for (const [key, value] of entries) {
    form[key] = value;
  }

  this.lastRequest = {
    url: this.baseUri + path,
    method: 'POST',
    headers: Object.assign(this.headers, headers),
    formData: form,
    json: true,
  };

  return new Promise(((resolve, reject) => {
    self.baseRequest(self.lastRequest, async (error, response) => {
      if (error) {
        reject(error);
      } else {
        const result = await self.isStillAuthenticated(response);
        resolve(result);
      }
    });
  }));
};

Browser.prototype.delete = function remove(path, headers = {}) {
  const self = this;

  this.lastRequest = {
    url: this.baseUri + path,
    method: 'DELETE',
    headers: Object.assign(this.headers, headers),
    json: true,
  };

  return new Promise(((resolve, reject) => {
    self.baseRequest(self.lastRequest, async (error, response) => {
      if (error) {
        reject(error);
      } else {
        const result = await self.isStillAuthenticated(response);
        resolve(result);
      }
    });
  }));
};

Browser.prototype.isSuccessfull = function isSuccessfull(response) {
  return response.statusCode >= 200 && response.statusCode < 300;
};

module.exports = Browser;
