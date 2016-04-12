[v1 documentation](https://github.com/tastywheat/ezv/blob/master/docs/v1/README.md)


`ezv` is a minimal, but highly composable JSON validation library.


# Installation

`npm install ezv`



### Basic Usage

```
const ezv2 = require('ezv').v2;

var input = {
    name: 123
};

var schema = {
    name (value, sourceObject) {
        if (typeof value !== 'string') {
            return 'Must be a string';
        }
    }

};

var errors = ezv2(input, schema);

errors === [
    {
        field: 'name',
        message: 'Must be a string',
        value: 123
    }
]
```


`ezv(sourceObject, schema)`
- returns an array of `validation error` objects
- `sourceObject` the object you want to validate
- `schema` each property should match an associated field on the `sourceObject`, and provide a function which returns a string as an error message`

An error contains these fields:
- `field`
- `message`
- `value`

### validate function
- signature `(value, sourceObject)`
- `value` is the value being validated
- `sourceObject` is the object which was provided as ezv's first parameter
- returning a `string` will be a validation failure, and the string will be used as the error message.



### Example Schema:

#### Is string
```
var data = {
  name: 123
};

var schema = {
    name (value, sourceObject) {
        if (typeof value !== 'string') {
            return 'Must be a string';
        }
    }
};

errors = ezv(data, schema);

errors === [
  {
    "field": "name",
    "value": 123,
    "message": "Must be a string"
  }
]

```

#### Access source object
```
var data = {
    foo: 123
    bar: 9999
};

var schema = {
    foo (value, source) {             // Second argument is 'data'
        if (value < source.bar) {
            return 'foo must be more than bar'
        }
    }
}

errors = ezv(data, schema);

errors === [
  {
    "field": "foo",
    "value": 123,
    "message": "foo must be more than bar"
  }
]
```


#### Nested properties / nested schemas
```
var data = {
    name: 123,
    address: {
        postalCode: 123
    }
};

var addressSchema = {
    postalCode (value) {
        if (!_.isNumber(value)) {
            return 'postalCode must be a number';
        }
    }
}

var contactSchema = {
    address (value) {
        if (!_.isObject(value)) {
            return 'address must be an object';
        }

        return ezv2(value, addressSchema);       // <-------- Call ezv2 with a child schema
    }
}

errors = ezv2(data, contactSchema)

errors === [
  {
    "field": "address.postalCode",
    "value": "123",
    "message": "postalCode must be a number"
  }
]

```

#### Arrays of objects
If the `source object` is an array, each element will be validated against the schema.
```
var data = [
    { name: 'brian' },
    { name: 123 },
    { name: false },
];


var schema = {
    name (value) {
        if (!_.isString(value)) {
            return 'name must be a string';
        }
    }
}

errors = ezv2(data, schema)

errors === [
  {
    "field": "1.name",
    "value": 123,
    "message": "name must be a string"
  },
  {
    "field": "2.name",
    "value": false,
    "message": "name must be a string"
  }
]

```

#### Object nested with Array of Objects
```
var data = {
    friends: [
        { name: 'brian' },
        { name: 123 },
        { name: false },
    ]
}

var personSchema = {
    name (value) {
        if (!_.isString(value)) {
            return 'name must be a string';
        }
    }
}

var accountSchema = {
    friends (value) {
        if (!_.isArray(value)) {
            return 'name must be an array';
        }

        return ezv2(value, personSchema);      // <------ call ezv2 on another schema
    }
}


errors = ezv2(data, accountSchema)

errors === [
  {
    "field": "friends.1.name",
    "value": 123,
    "message": "name must be a string"
  },
  {
    "field": "friends.2.name",
    "value": false,
    "message": "name must be a string"
  }
]

```


#### Scalar values (strings, numbers)
```
var data = [1,2,3,4,'a','b'];


function schema (value) {               // <----- schema is a function now
    if (!_.isString(value)) {
        return 'name must be a string';
    }
}

errors = ezv2(data, schema)

errors === [
  {
    "field": 0,
    "value": 1,
    "message": "name must be a string"
  },
  {
    "field": 1,
    "value": 2,
    "message": "name must be a string"
  },
  {
    "field": 2,
    "value": 3,
    "message": "name must be a string"
  },
  {
    "field": 3,
    "value": 4,
    "message": "name must be a string"
  }
]
```