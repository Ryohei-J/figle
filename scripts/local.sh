#!/bin/bash

# 1. CSVをダウンロード
echo "Downloading..."
curl -L -o themes.csv.gz https://cdn.rebrickable.com/media/downloads/themes.csv.gz
curl -L -o sets.csv.gz https://cdn.rebrickable.com/media/downloads/sets.csv.gz
curl -L -o inventories.csv.gz https://cdn.rebrickable.com/media/downloads/inventories.csv.gz
curl -L -o inventory_minifigs.csv.gz https://cdn.rebrickable.com/media/downloads/inventory_minifigs.csv.gz
curl -L -o minifigs.csv.gz https://cdn.rebrickable.com/media/downloads/minifigs.csv.gz

# 2. Goを実行
echo "Running Go processor..."
go run main.go

# 3. 結果確認
if [ -f "../public/data/minifigs.json" ]; then
  echo "Success! minifigs.json created."
else
  echo "Failed..."
fi