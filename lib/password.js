/* 
 * Password Hashing With PBKDF2 (http://crackstation.net/hashing-security.htm).
 * Copyright (c) 2013, Taylor Hornby
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, 
 * this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation 
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * -----------------------------------------------------------------------------
 * This is a JavaScript implementation of the above. This was ported by Kyle
 * Wagner for use in the Snoozle API. Feel free to use and modifiy in any way
 * the is compatiable with the license.
 * -----------------------------------------------------------------------------
 */

var secureRandom = require('secure-random');
var crypto = require('crypto');

/*
 * PBKDF2 salted password hashing.
 * Author: havoc AT defuse.ca
 * www: http://crackstation.net/hashing-security.htm
 */
var PasswordHash = {
    pbkdf2_algorithm: "PBKDF2WithHmacSHA1",
    salt_byte_size: 24,
    hash_byte_size: 24,
    pbkdf2_iterations: 1000,
    iteration_index: 0,
    salt_index: 1,
    pbkdf2_index: 2,
}

/**
 * Returns a salted PBKDF2 hash of the password.
 *
 * @param   password    the password to hash
 * @return              a salted PBKDF2 hash of the password
 */
PasswordHash.createHash = function(password, callback) {
    // Generate a random salt
    var salt = secureRandom(this.salt_byte_size, {type: 'Buffer'});
    
    if (password === "" || password == null) {
        return null;
    }
    crypto.pbkdf2(new Buffer(password), salt, PasswordHash.pbkdf2_iterations, this.hash_byte_size,
        function(err, hash) {
            // Return a null if we have an error
            if (err) {
                if (typeof callback === 'function') {
                    callback(err, null);
                }
            }
            var saltBuf = new Buffer(salt);
            var fullHash = PasswordHash.pbkdf2_iterations + ":" + saltBuf.toString('hex') + ":" + hash.toString('hex');
            console.log(typeof callback);
            if(typeof callback === 'function'){
                callback(null, fullHash);
            }
            return fullHash;
        });
};

/**
 * Validates a password using a hash.
 *
 * @param   password        the password to check
 * @param   correctHash     the hash of the valid password
 * @return                  true if the password is correct, false if not
 */
PasswordHash.validatePassword = function(password, correctHash, callback) {
    // Decode the hash into its parameters
    var params = correctHash.split(":");

    var iterations = parseInt(params[PasswordHash.iteration_index]);

    var salt = new Buffer(params[PasswordHash.salt_index], 'hex');
    var hash = new Buffer(params[PasswordHash.pbkdf2_index], 'hex');

    // Compute the hash of the provided password, using the same salt, 
    // iteration count, and hash length
    crypto.pbkdf2(password, salt, PasswordHash.pbkdf2_iterations, PasswordHash.hash_byte_size,
        function(err, testHash) {
            // Return a null if we have an error
            console.log(testHash.toString('hex'));
            if (err) {
                if (typeof callback === 'function') {
                    callback(err, false);
                }
                return false;
            }
            
            var valid = PasswordHash.slowEquals(hash, testHash);
            
            if (typeof callback === 'function') {
                callback(null, valid);
            }
            return valid;
        });
}

/**
 * Compares two byte arrays in length-constant time. This comparison method
 * is used so that password hashes cannot be extracted from an on-line 
 * system using a timing attack and then attacked off-line.
 * 
 * @param   a       the first byte array
 * @param   b       the second byte array 
 * @return          true if both byte arrays are the same, false if not
 */
PasswordHash.slowEquals = function(a, b) {
    var diff = a.length ^ b.length;
    for (var i = 0; i < a.length && i < b.length; i++)
        diff |= a[i] ^ b[i];
    console.log(diff);
    return diff == 0;
}

module.exports = PasswordHash;