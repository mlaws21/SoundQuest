#!/bin/bash

# Game Loader

# Get the directory of the script
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# Change to the script directory
cd "$SCRIPT_DIR" || exit

git fetch

# Check if there are changes to pull
if [ $(git rev-list HEAD...origin/main --count) -gt 0 ]; then
    # Pull changes if there are any
    git pull
else
    echo "Already up to date."
fi

# Change to the .backend directory
cd .backend || exit

# Run npm install if node_modules directory doesn't exist
if [ ! -d "node_modules" ]; then
    npm i
fi


npm run start

# Wait for the server to start (you can adjust the sleep time if needed)
# sleep 3

# # Open the website in the default browser
# open "http://localhost:3000"
# Start the npm process
# echo "If website doesn't appear check http://localhost:3000"
# npm start


# Close the terminal window
osascript -e 'tell application "Terminal" to close first window' &>/dev/null
