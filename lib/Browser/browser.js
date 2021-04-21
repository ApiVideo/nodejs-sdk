const got = require('got');
const FormData = require('form-data');
const fs = require('fs');
const ApiVideoError = require('../ApiVideoError');

const { RequestError } = got;

const Browser = function Browser(apiKey, baseUri, version) {
  this.apiKey = apiKey;
  this.baseUri = baseUri;
  this.tokenType = 'Bearer';
  this.accessToken = null;
  this.refreshToken = null;
  this.headers = {
    'User-Agent': `api.video SDK (nodejs; v:${version})`,
  };

  this.getAccessToken = async function getAccessToken() {
    const { statusCode, body } = await got.post(`${this.baseUri}/auth/api-key`, {
      json: { apiKey: this.apiKey },
      responseType: 'json',
    });

    if (statusCode >= 400) {
      throw new Error('Authentication Failed');
    }

    return this.setAccessToken.call(this, body.token_type, body.access_token, body.refresh_token);
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

  this.isStillAuthenticated = async function isStillAuthenticated(response, retry) {
    if (response.statusCode === 401) {
      const { tokenType, accessToken } = await this.getAccessToken.call(this);
      const updatedOptions = {
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
      };

      // Save for further requests
      this.baseRequest.defaults.options = got.mergeOptions(
        this.baseRequest.defaults.options,
        updatedOptions,
      );

      // Make a new retry
      return retry(updatedOptions);
    }

    // No changes otherwise
    return response;
  };

  this.baseRequest = got.extend({
    prefixUrl: this.baseUri,
    responseType: 'json',
    resolveBodyOnly: true,
    headers: this.headers,
    hooks: {
      afterResponse: [
        this.isStillAuthenticated.bind(this),
      ],
      beforeRequest: [
        async (options) => {
          if (!options.headers.Authorization) {
            if (!this.accessToken) {
              await this.getAccessToken.call(this);
            }
            // eslint-disable-next-line no-param-reassign
            options.headers.Authorization = `${this.tokenType} ${this.accessToken}`;
          }
        },
      ],
    },
    handlers: [
      (options, next) => {
        if (options.isStream) {
          return next(options);
        }

        return next(options)
          .catch((error) => {
            if (error instanceof RequestError) {
              const { response } = error;
              const contentType = response.headers['content-type'];
              if (contentType === 'application/problem+json') {
                throw new ApiVideoError(response);
              }
            }

            throw error;
          });
      },
    ],
    mutableDefaults: true,
  });
};

Browser.prototype.get = function get(path, headers = {}) {
  return this.baseRequest.extend({ headers })(path);
};

Browser.prototype.post = function post(path, headers = {}, content = {}) {
  return this.baseRequest.extend({ headers }).post(path, { json: content });
};

Browser.prototype.patch = function patch(path, headers = {}, content = {}) {
  return this.baseRequest.extend({ headers }).patch(path, { json: content });
};

Browser.prototype.submit = async function submit(path, source, filename, headers = {}) {
  const form = new FormData();
  form.append(
    filename,
    Buffer.isBuffer(source) ? source : fs.createReadStream(source),
    filename,
  );

  return this.baseRequest.extend(Object.assign({}, { headers })).post(path, { body: form });
};

// eslint-disable-next-line max-len
Browser.prototype.submitMultiPart = async function submitMultiPart(path, source, data = {}, headers = {}) {
  const form = new FormData();
  form.append('file', fs.createReadStream(source));

  const entries = Object.entries(data);
  for (const [key, value] of entries) {
    form.append(key, value);
  }

  return this.baseRequest.extend({ headers }).post(path, { body: form });
};

Browser.prototype.delete = function remove(path, headers = {}) {
  return this.baseRequest.extend({ headers, resolveBodyOnly: false }).delete(path);
};

Browser.prototype.isSuccessfull = function isSuccessfull(response) {
  return response.statusCode >= 200 && response.statusCode < 300;
};

module.exports = Browser;
