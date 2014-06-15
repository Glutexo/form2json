# Submit a HTML form as a single JSON #

## The code is not functional yet! ##

This library’s purpose is to serialize a whole HTML form to a single variable containing a JSON object. Upon decoding this object, the obtained variables should have the same structure and values as if the from was submitted normally. Using this library it is possible to transparently submit forms with many fields that would normally exceed a limit (e.g. 1,000 which is a default for some PHP installations). This is particularly useful if the limit can’t be set to infinite and you don’t know how many fields your form would have.

It consists of two parts:

1. The encoding client part (JavaScript) which binds to the submit event of a form, serializes its variables and submits them instead of the original part.
2. The decoding server part (PHP) which captures the serialized object and unserializes it to the superglobals.
