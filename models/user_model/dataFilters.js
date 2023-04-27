'use strict';

/**
 * Static method
 * Take from the request the necessary data for prepare filters,
 * function of the model.
 * @param {object} req Web Request
 * @returns objetc containing the results to apply for searching in DB.
 */
module.exports = function assignSearchParameters(req) {
    let data = {};

    let filters = {};
    if( req.query.username) {
        filters.username = { $regex: req.query.username.toLowerCase(), $options: 'i' };
    };

    if( req.query.mail) {
        filters.mail = { $regex: req.query.mail, $options: 'i' };
    };

    if( req.query.subscriptions) {
        filters.subscriptions = req.query.subscriptions;
    }

    data.filters = filters;
    

    return data;
};