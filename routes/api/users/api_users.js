const express = require('express');
const router = express.Router();
const UsersController = require('./UsersController');
const upload = require('../../../lib/uploadConfig');

const usersController = new UsersController();

/* GET home page. */
router.get('/', usersController.getUsers);

router.post(
  '/',
  upload.single('image'),
  usersController.validation(),
  usersController.postUser
);

router.delete('/:id', usersController.deleteUser);

module.exports = router;
