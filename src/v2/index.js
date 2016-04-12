var isPlainObject = require('lodash.isplainobject');
var reduce = require('lodash.reduce');


function validate (source, schema, fieldPrefix) {
    var _fieldPrefix = (fieldPrefix + '.') || '';


    if (typeof schema === 'function') {
        return processScalar(source, schema);
    }

    if (Array.isArray(source)) {
        return processNested(source, schema);
    }

    return processTop(source, schema, _fieldPrefix)
}

function processScalar (source, schema) {
    return reduce(source, function (errors, item, index) {

        var result = schema(item, source);

        if (typeof result === 'string') {
            return errors.concat({
                field: index,
                value: item,
                message: result
            });
        }

        return errors;
    }, []);
}

function processNested (source, schema) {
    return reduce(source, function (errors, item, index) {
        var itemErrors = validate(item, schema, index);
        return errors.concat(itemErrors);
    }, []);
}

function processTop (source, schema, fieldPrefix) {
    return reduce(schema, function (errors, validator, fieldName) {

        var valueToValidate = source[fieldName];

        var result = validator(valueToValidate, source);


        // result is an array when doing nested validation
        if (Array.isArray(result)) {

            // prefix child error field with the parent's field name
            return result.map(function (error) {
                return Object.assign({}, error, {
                    field: fieldName + '.' + error.field
                });
            })
            .concat(errors);
        }

        if (typeof result === 'string') {
            return errors.concat({
                field: fieldPrefix + fieldName,
                value: valueToValidate,
                message: result
            });
        }

        return errors;

    }, []);
}


/*

list = [1,2,3]
function schema (n) {
    if (typeof n !== 'number') {
        return 'must be a number'
    }
}

ezv(list, schema)



var data = {
    fruit: {  // validate this is object
        apples: [1,2,3,4],
        bannanas: ["1", "2", "3"]
    },
    friends: [
        { name: 'wheat' },
        { namez: 'tasty' },
        { name: 'brian' },
        123
    ],


}

var personValidator = {
    name: [
        isString()
    ]
}

var fruitValidator = {
    apples: [
        isArray()
    ],
    banannas: [
        isArray()
    ]
}


// change message based on value, without duplicating logic
// friends.0.name
// friends.4.address.1.street

var validators = {

    foo (value) {
        if (!isNumber(value)) {
            return 'must be an array'
        }
    }
    friends (value) {

        if (!isArray(value)) {
            return 'must be an array'
        }

        return ezv(thing, schema) // thing as array
    }

    friends (value) {
        return ezv(thing, schema) // thing as object
    }

    friends: [
        function () {

        }
    ],
    bar: [
        function (value) {

            return ezv(value, otherschema) // array

            return {
                pass: false,
                message:
                break:
            }
        }
    ],
    fruit: [
        isObject(),
        function (value) {
            return ezv(value, fruitValidator);
        },
        {
            validate () {

            }
        }
    ],
    friends: [
        isArray(),
        function (value) {
            return _.map(friend => ezv(friend, personSchmea))
        }
    ]
}

field: 'friends.3'
message: 'must be a person'
*/
module.exports = validate;