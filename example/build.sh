rm -R ./build/
mkdir ./build/
cp ./index.html ./build/index.html
cp ./node_modules/json-view/devtools.css ./build/devtools.css
./node_modules/.bin/browserify -d -e ./index.js -o ./build/index.js