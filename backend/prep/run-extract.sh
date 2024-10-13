#! /bin/bash
# Clear files
rm -rf base_image
rm -rf my_packages
echo '[Extract zip files]'
echo

echo "Enter zip password: "
read -s PASSWORD
unzip -P "$PASSWORD" protected_my_files.zip
echo 

# Attempt to unzip with the provided password
unzip -P "$PASSWORD" protected_my_files.zip

# Check if unzip was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to unzip. Incorrect password or corrupt file."
    exit 1
fi

echo "[Zip Extraction Successful]"
echo 

echo "[Load Image]"
docker load < ./base_image/njs-image.tar.gz
echo "[DONE]"
