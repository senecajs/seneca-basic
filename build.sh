./node_modules/.bin/eslint basic.js
./node_modules/.bin/docco basic.js -o doc
cp -r doc/* ../gh-pages/seneca-basic/doc
