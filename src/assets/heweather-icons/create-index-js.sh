#!/bin/bash

echo -n "" > index.js

for code in `tail -n +3 condition-code.txt | awk -F '\t' '{print $1}'`
do
  echo "import icon_${code} from './${code}.png'" >> index.js
done

echo "" >> index.js
echo "export default {" >> index.js
for code in `tail -n +3 condition-code.txt | awk -F '\t' '{print $1}'`
do
  echo "  icon_${code}," >> index.js
done
echo "}" >> index.js
