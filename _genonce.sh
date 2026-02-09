#!/bin/bash
export JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8
export PATH="$PWD/node_modules/.bin:$PATH"

# Sync generated JSON snippets in markdown from canonical script definitions
npm --prefix scripts run sync-spec-snippets

# Run SUSHI
sushi .

# Run Publisher
./_updatePublisher.sh
java -jar input-cache/publisher.jar -ig .
