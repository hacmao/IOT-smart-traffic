#!/bin/bash

sudo netstat -lp | grep -i 8888 | cut -d "N" -f 2 | cut -d " " -f 7 | cut -d "/" -f 1 | xargs kill -9

