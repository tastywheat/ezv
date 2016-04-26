var assert = require('assert');
var isPlainObject = require('lodash.isplainobject');
var ezv2 = require('../index').v2;

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
    
    describe('validator pipeline', function () {
        
        var schema = {
            name: [
                function (value) {
                    if (value === undefined) {
                        return true;
                    }    
                },
                function (value) {
                    if (typeof value !== 'string') {
                        return 'name must be a string';
                    }
                }
            ],
            age: [
                function (value) {
                    if (typeof value !== 'number') {
                        return 'age must be a number'
                    }
                },
                function (value) {
                    if (value > 100) {
                        return 'age must be less than 100';
                    }
                }
            ]
        }
        
        it('should fail when age is over 100', function () {
            var input = {
                age: 123
            };

            errors = ezv2(input, schema);

            assert(errors.length === 1, JSON.stringify(errors));
        });
        
        it('should pass when name is not provided', function () {
            var input = {
                age: 90
            };

            errors = ezv2(input, schema);

            assert(errors.length === 0, JSON.stringify(errors));
        });
        
        it('should fail when name is a number', function () {
            var input = {
                name: 111,
                age: 90
            };

            errors = ezv2(input, schema);

            assert(errors.length === 1, JSON.stringify(errors));
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

                return addressSchema;
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

            assert(errors.length === 1, JSON.stringify(errors));
        });

    });

    describe('nested array of objects', function () {

        var personSchema = {
            friends: function (value) {
                return friendSchema;
            }
        }

        var friendSchema = {
            name: function (value) {
                if (typeof value !== 'string') {
                    return 'name must be a string'
                }
            }
        }

        it.only('should fail when name is not a string', function () {

            var input = {
                friends: [
                    { name: 'brian' },
                    { name: 123 },
                    { name: false }
                ]
            }

            errors = ezv2(input, personSchema);
            assert(errors.length === 2, JSON.stringify(errors));
        });
    });
    
    describe('nested array of objects - returning schema', function () {

        var personSchema = {
            friends: function (value) {
                return friendSchema;
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
            assert(errors.length === 2, JSON.stringify(errors));
        });
    });

    describe('array of objects', function () {
        it.only('should fail when name is not a string', function () {
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
            assert(errors.length === 0, JSON.stringify(errors));
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
        
        describe('validation pipeline', function () {
            
            var schema = [
                function (value) {
                    if (typeof value !== 'number') {
                        return 'must be a number'
                    }
                },
                function (value) {
                    if (value < 10) {
                        return 'must be more than 10'
                    }
                }
            ]
           
            it('should fail when value is 10 or more', function () {
                var input = [1, 12];
                
                errors = ezv2(input, schema);
                assert(errors.length === 1, JSON.stringify(errors));
            });
        });
    })
});