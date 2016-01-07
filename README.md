# TODO

`npm install ezv`

## Examples

```
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

// errors = [{ message: 'Name must be a string', field: 'name', value: 123 }]
```