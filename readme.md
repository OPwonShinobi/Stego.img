# ImgStego.js
A **simple** image steganography tool in VanillaJS.

0 imports, 0 installation, 0 dependencies

## What is it for
It hides images inside other (usually bigger) images using a password.

## How to use
Run `Source Code/dcstego.html` in a browser (firefox, chrome, edge, untested with IE).
Click the "Help Menu" button for instructions.

## Acknowledgements
Special thanks to https://www.peter-eigenschink.at/projects/steganographyjs/ for the inspiration. His implementation hides string messages in the alpha channel. I took the idea and hide encrypted image data in RGB channels (alpha is untouched).

The project used to be called steganosaurus, but turns out there are plenty of steganography repos on github under that name (some are even written in JavaScript, imagine that)