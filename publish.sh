#!/bin/bash
rm -rf context-messenger/README.md context-messenger/graphics context-messenger/node_modules context-messenger/build context-messenger/package-lock.json
cp README.md context-messenger/README.md
cp -R graphics context-messenger/
cd context-messenger && npm run build && npm publish --scope=public && cd ../
rm -rf context-messenger/README.md context-messenger/graphics context-messenger/node_modules context-messenger/build context-messenger/package-lock.json