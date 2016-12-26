const bcrypt = require('bcrypt-nodejs')

const token = require('../services/token');
const User = require('../models/user');

exports.signup = function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res
            .status(422)
            .send({error: 'You must provide email and password.'});
    }
    User
        .findOne({
            email: email
        }, function (err, existingUser) {
            if (err) {
                return next(err)
            }
            if (existingUser) {
                return res
                    .status(422)
                    .send({error: 'Email is in use'});
            }
            const user = new User({email: email, password: password})

            user.save(function (err, savedUser) {
                if (err) {
                    return next(err)
                }

                res.json({
                    success: true,
                    token: token.generateToken(savedUser)
                })
            })
        })
}

exports.signin = function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        return res
            .status(422)
            .send({error: 'You must provide email and password.'});
    }
    User
        .findOne({email: email})
        .select('+password')
        .exec(function (err, existingUser) {
            if (err) {
                return next(err)
            }
            if (existingUser) {
                bcrypt
                    .compare(password, existingUser.password, function (err, good) {
                        if (err || !good) {
                            return res.send(err || 'User not found')
                        }
                        res.send({
                            token: token.generateToken(existingUser)
                        })
                    })
            }
        })
}