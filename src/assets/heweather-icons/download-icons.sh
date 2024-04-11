#!/bin/bash

curl https://cdn.heweather.com/condition-code.txt > condition-code.txt
for icon in `tail -n +3 condition-code.txt | awk -F '\t' '{print $4}'`
do
  echo "Download ${icon}"
  curl -O -q $icon
done
