const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        if(favorites != null) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);   
        }
        else {
            err = new Error('Favorites not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { 
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites === null) {
            Favorites.create({"user": req.user._id, "dishes": req.body})
            .then((favorites) => {
                console.log('Favorites added ', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err));
        }
        else if(favorites != null) {
            for (var i=0; i<req.body.length; i++) {
                if (favorites.dishes.indexOf(req.body[i]._id) === -1) {
                    favorites.dishes.push(req.body[i]._id);
                }
            }
            favorites.save()
            .then((favorites) => {
                console.log('Favorites added', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err)); 
        }
        else {
            err = new Error('Error while adding favorites');
            err.status = 404;
            return next(err);
        }

    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites != null) {
            if (favorites.dishes.indexOf(req.params.dishId) === -1) {
                favorites.dishes.push(req.params.dishId);
            }
            favorites.save()
            .then((favorites) => {
                console.log('Favorites added', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err)); 
        }
        else {
            err = new Error('Error while adding favorites');
            err.status = 404;
            return next(err);
        }

    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites != null) {
            index = favorites.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorites.dishes.splice(index, 1);
            }
            favorites.save()
            .then((favorites) => {
                console.log('Favorite removed', favorites);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err)); 
        }
        else {
            err = new Error('Error while removing favorites');
            err.status = 404;
            return next(err);
        }

    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = favoriteRouter;