mkdir /srv/www/logs-temp/
mkdir /srv/www/logs-temp/pm2/
mkdir /srv/www/logs-temp/nginx/
mkdir /srv/www/logs-temp/logs/
mkdir /srv/www/logs-temp/ostm/

cp /root/.pm2/logs/ /srv/www/logs-temp/pm2/ -r

cp /var/log/nginx/ /srv/www/logs-temp/nginx/ -r

cp /srv/www/routes/logs/ /srv/www/logs-temp/logs/ -r
cp /srv/www/routes/ostm/logs/ /srv/www/logs-temp/ostm/ -r
cp /srv/www/routes/ostm/manage/logs/ /srv/www/logs-temp/ostm/ -r