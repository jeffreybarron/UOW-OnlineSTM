echo Enter VERSION, Be precise, e.g. "2.2.7-master"
echo For Example data will be copied to "/srv/bin/VERSION/routes/ostm/"
read -p "Version Name: " version
cp /srv/www/routes/ostm/data/ /srv/bin/$version/routes/ostm/ -r
echo copied current data to /srv/bin/$version/routes/ostm/