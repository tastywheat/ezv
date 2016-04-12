var assert = require('assert');
var isPlainObject = require('lodash.isplainobject');
var ezv2 = require('../src/v2');

describe('ezv2', function () {

    describe('object', function () {
        var schema = {
            age: function (value) {
                if (typeof value !== 'number') {
                    return 'age must be a number'
                }
            }
        }

        it('should pass when a valid number', function () {

            var input = {
                age: 123
            };

            errors = ezv2(input, schema);

            assert(errors.length === 0);
        });

        it('should fail when provided an invalid number', function () {

            var input = {
                age: '123'
            };

            errors = ezv2(input, schema);

            assert(errors.length === 1);
        });
    });

    describe('nested objects', function () {

        var addressSchema = {
            street: function (value) {
                if (typeof value !== 'string') {
                    return 'street must be a string'
                }
            }
        }

        var contactSchema = {
            address: function (value) {
                if (!isPlainObject(value)) {
                    return 'address must be an object'
                }

                return ezv2(value, addressSchema);
            }
        }

        it('should pass when street is a string', function () {

            var input = {
                address: {
                    street: '12 fake st'
                }
            };


            errors = ezv2(input, contactSchema);

            assert(errors.length === 0);
        });

        it('should fail when street is a number', function () {

            var input = {
                address: {
                    street: 123
                }
            };

            errors = ezv2(input, contactSchema);

            assert(errors.length === 1);
        });

    });

    describe('nested array of objects', function () {

        var personSchema = {
            friends: function (value) {
                return ezv2(value, friendSchema);
            }
        }

        var friendSchema = {
            name: function (value) {
                if (typeof value !== 'string') {
                    return 'name must be a string'
                }
            }
        }

        it('should fail when name is not a string', function () {

            var input = {
                friends: [
                    { name: 'brian' },
                    { name: 123 },
                    { name: false }
                ]
            }

            errors = ezv2(input, personSchema);
            assert(errors.length === 2);
        })
    })

    describe('array of objects', function () {
        it('should fail when name is not a string', function () {
            var input = [
                { name: 'brian' },
                { name: 123 },
                { name: true },
            ]

            var schema = {
                name: function (value) {
                    if (typeof value !== 'string') {
                        return 'name must be a string'
                    }
                }
            }

            errors = ezv2(input, schema);
            assert(errors.length === 2);
        });
    });

    describe('array of scalar', function () {

        function schema (value) {
            if (typeof value !== 'string') {
                return 'must be a string'
            }
        }

        it('should fail when provided non-strings', function () {
            var input = [1, 2, 'a', 'b'];

            errors = ezv2(input, schema);
            assert(errors.length === 2);
        });
    })
});