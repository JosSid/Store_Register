'use strict';

const createError = require('http-errors');

/**
 *
 * @param {http-error} err Error message created with createHttpError
 * @return {object} object containing keys status and error message
 */
function errorResponseConfigure(err) {
  return {
    status: err?.status || 500,
    message: err?.message || 'Internal Server Error',
  };
}

module.exports = errorResponseConfigure;