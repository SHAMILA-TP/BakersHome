/**
 * handlebars-helper-formatdate
 * Handlebars helper that format dates using moment.
 *
 * @author Antonio Hernandez <ahdiaz@gmail.com>
 * @license MIT
 */

var moment = require('moment');

function plugin(handlebars, options) {

    handlebars.registerHelper('formatDate', function (date, format) {
        var mmnt = moment(date);
        return mmnt.format(format);
    });
}

module.exports = plugin;
