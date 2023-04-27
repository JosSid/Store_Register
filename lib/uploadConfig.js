'use strict';

const createHttpError = require('http-errors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exitCode } = require('process');
const MAX_FILES_SIZE_MB = process.env.MAX_FILES_SIZE_MB || 5;
const MAX_FILES_SIZE = MAX_FILES_SIZE_MB * Math.pow(1024, 2);

// Configuración de Upload
const authUserAction = async function (req, file, cb) {
    const root = path.join(__dirname, '..', 'public', 'uploads');
  
    try {
      await fs.promises.access(root, fs.constants.F_OK);
    } catch (error) {
      console.log('Creating uploads path...');
      try {
        await fs.promises.mkdir(root, { recursive: false });
        console.log(`Directory ${root} has been well created`);
      } catch (error2) {
        console.log(`Impossible create ${root} directory`);
        exitCode(1);
      }
    }
  
    if (req.baseUrl === '/api/users') {
      return cb(null, root);
    }
};

//Pasamos directamente el string a destination para que nos cree la carpeta si no existe
const storage = multer.diskStorage({
    //  destination: root,
    destination: authUserAction,
    filename: function (req, file, cb) {
      const filename =
        file.fieldname + '-' + Date.now() + '-' + file.originalname;
      cb(null, filename);
    },
  });

  const fileFilter = (req, file, cb) => {
    const typeFile = file.mimetype.split('/', 1);
    const type = typeFile[0];
    if (type != 'image') {
      cb(new createHttpError(415, 'The file must be an image'));
      return;
    }
    cb(null, true);
  };
  
  const multerConfig = multer({
    storage,
    limits: { fileSize: MAX_FILES_SIZE },
    fileFilter,
  });
  const multerError = multer.MulterError;
  
  module.exports = multer({
    storage,
    limits: { fileSize: MAX_FILES_SIZE },
    fileFilter,
  });