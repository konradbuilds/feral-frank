#!/bin/sh
cd -- "$(dirname -- "$0")" || exit 1
node bridge/server.mjs
