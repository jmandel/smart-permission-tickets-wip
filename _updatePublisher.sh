#!/bin/bash
export JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8

if [ ! -f input-cache/publisher.jar ]; then
    mkdir -p input-cache
    curl -L https://github.com/HL7/fhir-ig-publisher/releases/latest/download/publisher.jar -o input-cache/publisher.jar
fi
