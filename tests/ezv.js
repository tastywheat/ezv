var assert = require('assert');
var _ = require('lodash');
var ezv = require('../index');

describe('ezv', function () {

    it('should return errors', function () {

        var input = {
            name: 123
        };

        var validators = {
            name: [
                {
                    validate: function (value) {
                        return _.isString(value);
                    },
                    message: 'Name must be a string'
                }
            ]
        };

        var errors = ezv(input, validators);


        assert(errors.length > 0);
    });
});