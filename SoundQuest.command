#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/.backend
npm start
osascript -e 'tell application "Terminal" to close first window' &>/dev/null