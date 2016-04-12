var assert = require('assert');
var isPlainObject = require('lodash.isplainobject');
var ezv2 = require('../src/v2');

describe('ezv2', function () {
    
    describe('scalar properties', function () {
        it('should pass when a valid number', function () {
        
            var input = {
                age: 123
            };
            
            var schema = {
                age: function (value) {
                    if (typeof value !== 'number') {
                        return 'age must be a number'
                    }
                }
            }
            
            errors = ezv2(input, schema);
            
            assert(errors.length === 0);
        });
        
        it('should fail when provided an invalid number', function () {
        
            var input = {
                age: '123'
            };
            
            var schema = {
                age: function (value) {
                    if (typeof value !== 'number') {
                        return 'age must be a number'
                    }
                }
            }
            
            errors = ezv2(input, schema);
            
            assert(errors.length === 1);
        });
    });
    
    describe('nested objects', function () {
        
        it('should pass when street is a string', function () {
        
            var input = {
                address: {
                    street: '12 fake st'
                }
            };
            
            var addressSchema = {
                street: function (value) {
                    if (typeof value !== 'string') {
                        return 'street must be a string'
                    }
                }
            }
            
            var schema = {
                address: function (value) {
                    if (!isPlainObject(value)) {
                        return 'address must be an object'
                    }
                    
                    return ezv2(value, addressSchema);
                }
            }
            
            errors = ezv2(input, schema);
            
            assert(errors.length === 0);
        });
        
        it('should fail when street is a number', function () {
        
            var input = {
                address: {
                    street: 123
                }
            };
            
            var addressSchema = {
                street: function (value) {
                    if (typeof value !== 'string') {
                        return 'street must be a string'
                    }
                }
            }
            
            var schema = {
                address: function (value) {
                    if (!isPlainObject(value)) {
                        return 'address must be an object'
                    }
                    
                    return ezv2(value, addressSchema);
                }
            }
            
            errors = ezv2(input, schema);
            
            assert(errors.length === 1);
        });
        
        
        
    });

});