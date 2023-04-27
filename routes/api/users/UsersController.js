'use strict';

const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const { User } = require('../../../models');
const path = require("path");

class UsersController {
  async getUsers(req, res, next) {
    const response = await User.search();

    res.json({ data: response });
  }

  async postUser(req, res, next) {
    try {
      const user = req.body;

      let image = null;
      if (req.file) {
        const destination = req.file?.destination.split('public')[1];

        image = path.join(destination, req.file?.filename);
      }

      const newUser = {
        username: user.username,
        mail: user.mail,
        password: await User.hashPassword(user.password),
        image
      };

      const userResult = await User.create(newUser);

      res.status(201).json(userResult);
    } catch (error) {
        console.log(error.message)
        next(createError(400, 'Error'))
    }
        
  }
}

module.exports = UsersController;
