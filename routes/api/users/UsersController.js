'use strict';

const createError = require('http-errors');
const { body, validationResult } = require('express-validator');
const { User } = require('../../../models');
const path = require('path');
const {
  filesEraserFromReq,
  filesEraserFromName,
} = require('../../../lib/filesEraser');

class UsersController {
  validation() {
    return [
      body('username')
        .isAlphanumeric()
        .withMessage('Username must be alphanumeric'),
      body('mail').isEmail().withMessage('Insert a valid mail please'),
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password min length 8 characters'),
    ];
  }

  updateValidation() {
    return [
      body("username")
        .if(body("username").exists())
        .isAlphanumeric()
        .withMessage("Username must be alphanumeric"),
      body("mail")
        .if(body("mail").exists())
        .isEmail()
        .withMessage("Insert a valid mail please"),
      body("password")
        .if(body("password").exists())
        .isLength({ min: 8 })
        .withMessage("Password min length 8 characters"),
    ];
  }

  async getUsers(req, res, next) {
    try {
      const users = await User.search();
      // El user[0] no se muestra por que es el administrador
      const data = users.slice(1);

      res.status(200).json({ data });
    } catch (error) {
      next(createError(400, 'Error in DB'));
    }
  }

  async postUser(req, res, next) {
    try {
      validationResult(req).throw();
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
        image,
      };

      const data = await User.create(newUser);

      res.status(201).json({ data });
    } catch (error) {
      if (req.file) {
        filesEraserFromReq(req.file);
      }
      // Errores de validación;
      if (error.errors) {
        next(createError(422, error.errors[0].msg));
        return;
      }
      // Errores de duplicado en la BD;
      if (error.keyValue) {
        const notAvailable = error.keyValue; // Capturo el campo del error
        const key = Object.keys(notAvailable)[0];

        let message;

        if (key === 'username') {
          message = 'This username is not available';
        }

        if (key === 'mail') {
          message = 'This email is already registered';
        }

        next(createError(409, message));
        return;
      }

      next(createError(400, 'Bad request'));
    }
  }

  async updateUser(req, res, next) {
    try {
      validationResult(req).throw();

      const _id = req.params.id;
      const body = req.body;

      let image = null;
      if (req.file) {
        const destination = req.file?.destination.split("public")[1];

        image = path.join(destination, req.file?.filename);
        body.image = image;

        const user = await User.findOne({ _id: _id });
        const oldImage = user.image;
        filesEraserFromName(oldImage);
      }

      if (body.password) {
        body.password = await User.hashPassword(body.password);
      }

      if (body.subscriptions) {
        const user = await User.find({ _id: _id });
        const subscriptions = user[0].subscriptions;
        if (subscriptions.includes(body.subscriptions)) {
          const subscription = subscriptions.filter(
            (e) => e !== body.subscriptions
          );
          body.subscriptions = subscription;
        } else {
          subscriptions.unshift(body.subscriptions);
          body.subscriptions = subscriptions;
        }
      }

      body.update = Date.now();

      const data = await User.findOneAndUpdate({ _id: _id }, body, {
        new: true, // esto hace que nos devuelva el documento actualizado
      });

      res.status(200).json({ data });
    } catch (error) {
      if (req.file) {
        filesEraserFromReq(req.file);
      }
      // Errores de validación;
      if (error.errors) {
        next(createError(422, error.errors[0].msg));
        return;
      }
      // Errores de duplicado en la BD;
      if (error.keyValue) {
        const notAvailable = error.keyValue; // Capturo el campo del error
        const key = Object.keys(notAvailable)[0];

        let message;

        if (key === 'username') {
          message = 'This username is not available';
        }

        if (key === 'mail') {
          message = 'This email is already registered';
        }

        next(createError(409, message));
        return;
      }

      next(createError(400, 'Bad request'));
    }
  }

  async deleteUser(req, res, next) {
    try {
      const id = req.params.id;
      const user = await User.findOne({ _id: id });
      const userDeleted = await User.deleteOne({ _id: id });
      const { username, _id, mail, image, subscriptions } = user;

      filesEraserFromName(image);
      const data = {
        ...userDeleted,
        username,
        _id,
        mail,
      };

      res.status(200).json({ data });
    } catch (error) {
      next(createError(400, 'User not in DB'));
    }
  }
}

module.exports = UsersController;
