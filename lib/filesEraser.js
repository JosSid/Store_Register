'use strict';

const path = require('path');
const fs = require('fs');
const createHttpError = require('http-errors');

const eraser = (file) => {
  fs.unlink(file, (err) => {
    if (err) throw createHttpError(500, err);
  });
};

const filesEraserFromReq = (reqFile) => {
  const fileName = reqFile?.destination + '/' + reqFile?.filename;
  eraser(fileName);
};

const filesEraserFromName = (fileName) => {
  if (!fileName) return;
  const file = __dirname + '/../public' + fileName;
  eraser(file);
};

module.exports = { filesEraserFromReq, filesEraserFromName };
