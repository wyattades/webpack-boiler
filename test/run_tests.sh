set -e

cd test

echo " > Building webpack..."
NODE_ENV=production webpack

cd ..

echo " > Running production tests..."
NODE_ENV=test JEST_SERVER_NODE_ENV=production jest --testPathIgnorePatterns test/development.test.js

echo ""

echo " > Running development tests..."
NODE_ENV=test JEST_SERVER_NODE_ENV=development jest --testPathIgnorePatterns test/production.test.js
