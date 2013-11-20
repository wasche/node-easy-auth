# Easy Authentication for Node Scripts [![Build Status](https://travis-ci.org/wasche/node-easy-auth.png)](https://travis-ci.org/wasche/node-easy-auth) [![Dependency Status](https://gemnasium.com/wasche/node-easy-auth.png)](https://gemnasium.com/wasche/node-easy-auth) [![Still Maintained](http://stillmaintained.com/wasche/node-easy-auth.png)](http://stillmaintained.com/wasche/node-easy-auth)

## Installation

```
npm install easy-auth
```

## Usage

```
#!/usr/bin/env node

var auth = require('easy-auth')();

auth.on('error', function(err){
  console.err(err);
});

auth.on('success', function(user, pass){
  console.log('Thanks for logging in %s!', user);
  // setup whatever app needs auth
});

// nothing actually happens until this is called
auth.require();
```

## Details

By default, easy-auth will not store credentials, and will use the default
``Username: `` and ``Password: `` prompts.

You can change any of the options by passing an options object:

```
var auth = require('easy-auth')({
  store: 'env'
, skipUser: true
});
```

## Options

```
{
  userPrompt  : 'Username: '
, passPrompt  : 'Password: '
, store       : null    // valid stores are: null, 'env', 'file'
, storeName   : null    // defaults to script name ``process.argv[1]`` for env, and ``~/tmp/{process.argv[1]}.auth`` for file
, storeFormat : '%u:%p' // user %u for username, and %p for pass
, encrypt     : 'md5'   // valid values are: null (for plaintext), 'md5', 'base64'
, skipUser    : false   // don't prompt for user, override storeFormat if you don't want blank username included
}
```

## License

