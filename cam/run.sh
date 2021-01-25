#!/bin/bash

gcc -o tcp tcp.c
./tcp &
node ./cam_test.js
