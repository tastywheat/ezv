var assert = require('assert');
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
                        return typeof value === 'string';
                    },
                    message: 'Name must be a string'
                }
            ]
        };

        var errors = ezv(input, validators);


        assert(errors.length > 0);
    });

    it('should not return errors for optional fields', function () {

        var input = {
            age: 123
        };

        var validators = {
            name: [
                {
                    validate: function (value) {
                        return value === undefined;
                    },
                    breakOnSuccess: true
                },
                {
                    validate: function (value) {
                        return typeof value === 'string';
                    },
                    message: 'Must be a string'
                }
            ]
        };

        var errors = ezv(input, validators);

        assert(errors.length === 0);
    });

    it('should bypass optional field', function () {

        var input = {
            name: 123
        };

        var validators = {
            name: [
                {
                    validate: function (value) {
                        return value === undefined;
                    },
                    breakOnSuccess: true
                },
                {
                    validate: function (value) {
                        return typeof value === 'string';
                    },
                    message: 'Must be a string'
                }
            ]
        };

        var errors = ezv(input, validators);

        assert(errors.length > 0);
    });

    it('should return errors for required fields', function () {

        var input = {
            age: 123
        };

        var validators = {
            name: [
                {
                    validate: function (value) {
                        return value !== undefined;
                    },
                    message: 'Field is required',
                    breakOnFail: true
                }
            ]
        };

        var errors = ezv(input, validators);

        assert(errors.length > 0);
    });



    it('should error when string is returned from validate', function () {

        var input = {
            name: 123
        };

        var validators = {
            name: [
                {
                    validate: function (value) {
                        if (typeof value !== 'string') {
                            return 'Must be a string';
                        }
                    }
                }
            ]
        };

        var errors = ezv(input, validators);

        assert(errors.length > 0);
        assert(errors[0].message === 'Must be a string');
    });
});