KiwiCrypto
==========

Purpose
--------

KiwiCrypto provides pure Javascript cryptographic modules for web applications. It is best suited for
Single Page Applications, AngularJS integration, and client-side security focused apps. It is designed
from ground up to be modular, grunt-based and bower-enabled. It is written in CoffeeScript.

**NOTE**:

This library is currently in development. It is not finished yet. 
Version *0.0.x* should be considered development only.
Nothing should be considered stable or working.
If something works, it is by pure coincidence.



Why new JS crypto library?
--------------------------

The main focus was to create a single modular project,
with ability to generate a single dependency that can be easily maintained and extended when needed.

KiwiCrypto offers the perks of a modern, CoffeeScript based module:

  * **grunt**-based
  * **bower**-enabled
  * **npm**-enabled
  * documentation, using **docco** and **codo**
  * **lint**-checked codebase
  * in **CoffeScript**, with classes and modular design, and
  * unit tests, using **Jasmine**
  * compiles to a single **minified** and **uglified** dependency

At the time of writing, there were many libraries providing various crypto functionality in pure JavaScript 
on the client side (pidCrypt, jsCrypto, SJCL, and so on). The problem was that to use them, all the commonly 
required functionality would be spread over multiple dependencies and projects. This makes it difficult for 
security-centric solution to have a single consistent dependency. 
Moreover, none of the libraries was taking adventage of the modern Javascript stack. None was grunt-based, 
bower-enabled, client-side/server-side crypto library with tests and good documentation that could be used 
for single-page AngularJS/Javascript applications. 




Features
---------



The library currently supports:

   * base64 (done)
   * RC4 and random number generation
   * Big Integers (almost done)
   * RSA public/private keys (work in progress)
   


How to use it
--------------


To install it, use bower:

    bower install kiwicrypto --save


To use it, import the main module:

    var crypto = require("KiwiCrypto");
    var encodedString = crypto.Base64.stringToBase64("hello world");

See [API documentation](docs/index.html) for more details.




Building the library
--------------------

In the root folder of the library:

    grunt test          builds and tests the current codebase
    grunt build         builds and browserifies the modules
    grunt dist          prepares the distribution, minified/uglified version, with docs




More info
---------

[KiwiCrypto](http://coinkiwi.github.io/kiwicrypto)


Contributions
-------------

Any contribution and suggestions welcome and appreciated. Leave issues in the issue tracker.
Contributions and patches assume BSD-style or public domain attribution.


Original JS code and ideas
--------------------------

This library is based on work of multiple people that contributed their time and efforts.
Many of those people remain anonymous. All of the original code has been released under public domain
or BSD-style licencing scheme. All of the original code has been originally developed in Javascript.
See AUTHORS and LICENSE files for details.





Related work
============

* [SJCL](http://bitwiseshiftleft.github.io/sjcl/) - SHA, AES, HMAC
* [crypto-js](https://code.google.com/p/crypto-js/) - MD5, SHA-1, SHA-2, SHA-3, AES, DES, RC4
* [jscrypto](https://code.google.com/p/jscryptolib/) - AES, SHA-1, HMAC, base64, RSA
* [Tom's Wu](http://www-cs-students.stanford.edu/~tjw/jsbn/) - jsbn, rsa, base64
* [pidCrypt](https://www.pidder.com/pidcrypt/) - jsbn, rsa, base64, md5, sha
* [crypto benchmarks](http://dominictarr.github.io/crypto-bench/)

