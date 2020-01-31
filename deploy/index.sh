#!/usr/bin/env sh

set -e

npm run example

cd examples

git init
git config user.name 'pengyajun'
git config user.email 'pyj92055@163.com'
git add -A
git commit -m 'deploy'

git push -f git@github.com:peng92055/smart-table.git master:gh-pages

cd -