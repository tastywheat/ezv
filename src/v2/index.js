var reduce = require('lodash.reduce');
var isPlainObject = require('lodash.isPlainObject');
var virtualFieldRegex = /^__.*/;

function validate (source, schema, fieldPrefix) {
    var _fieldPrefix = fieldPrefix !== undefined ? (fieldPrefix + '.') : '';


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

        var isVirtualField = virtualFieldRegex.test(fieldName);
        var valueToValidate = isVirtualField ? source : source[fieldName];
        
        var result = processPipeline([].concat(validator), valueToValidate, source);
        
        switch (result.type) {
            case 'SCHEMA':
                var childErrors = validate(valueToValidate, result.value);
                return childErrors.map(function (error) {
                    return Object.assign({}, error, {
                        field: fieldName + '.' + error.field
                    });
                })
                .concat(errors);
            
            case 'ERROR_MESSAGE':
                return errors.concat({
                    field: fieldPrefix + fieldName,
                    value: valueToValidate,
                    message: result.value
                });
                
            default:
                return errors;
        }   
    }, []);
}

function processPipeline (validators, valueToValidate, source) {
    var breakEarly = false,
        resultType,
        resultValue;
        
    validators.forEach(function (validator) {
        if (breakEarly) {
            return;
        }
        
        var result = validator(valueToValidate, source);
        
        switch (true) {
            case isSchema(result):
                resultType = 'SCHEMA';
                resultValue = result;
                breakEarly = true;
                break;
                
            case typeof result === 'string':
                resultType = 'ERROR_MESSAGE';
                resultValue = result;
                breakEarly = true;
                break;
                
            case result === true:
                resultType = 'BREAK_EARLY'
                breakEarly = true;
                break;
        }
        
    });
    
    return {
        type: resultType,
        value: resultValue   
    };
}

function isSchema (value) {
    if (typeof value === 'function') {
        return true;
    }
    if (isPlainObject(value)) {
        return Object.keys(value)
            .reduce(function (acc, fieldName) {
                return acc && typeof value[fieldName] === 'function';
            }, true);
    }
}

module.exports = validate;