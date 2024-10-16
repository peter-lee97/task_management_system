#!/bin/bash

echo "Current DIR: $(pwd)"
echo

echo '[Fetch Image]'

docker image pull node:20-alpine

echo 

echo '[Saving Image]'

mkdir base_image
NJS_IMAGE="njs-image.tar.gz"

docker save node:20-alpine | gzip > base_image/$NJS_IMAGE

echo '[Base Image Saved]'

echo 

# Current directory should be airgap-internet/
echo '[Preparing Node Modules]'

rm -rf my_packages
mkdir my_packages
cp ../package.json my_packages
cd my_packages/

echo '[Dependencies]'

npm install
TARBALL=$(npm pack)
echo "Production Tarball: $TARBALL"

echo '[devDependencies]'
# Explictly insert the content
devDependencies=(
  "@types/bcryptjs"
  "@types/cookie-parser"
  "@types/cors"
  "@types/jsonwebtoken"
  "@types/mysql"
  "@types/node@22.5.4"
  "@types/nodemailer"
  "@types/express-serve-static-core@4.19.0"
  "@types/express@4.17.21"
  # "nodemon"
  "ts-node@10.9.2"
  "typescript@5.6.2"
)

for dep in "${devDependencies[@]}"; do
  echo "Packing $dep..."
  tarbar=$(npm pack $dep)
  if [ $? -eq 0 ]; then
    echo "Successfully packed: $dep"
  else
    echo "Failed to pack: $dep"
  fi
done
echo '[Done Packing DevDependencies]'

find . -type f ! -name "*.tgz" -exec rm {} \;
rm -rf node_modules/
ls -al

cd ..

echo "[Zipping Docker Image and Packages]"

ARCHIVE_NAME="protected_my_files.zip"


echo "Enter password for ZIP archive: "
read -s PASSWORD

zip -r -P "$PASSWORD" "$ARCHIVE_NAME" base_image my_packages

rm -rf base_image my_packages

echo "base image and node_modules are compressed into $ARCHIVE_NAME"

echo 'Script Completed'
