#!/bin/bash
export JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8
export PATH="$PWD/node_modules/.bin:$PATH"

# Run SUSHI
sushi .

# Run Publisher
./_updatePublisher.sh
java -jar input-cache/publisher.jar -ig .
