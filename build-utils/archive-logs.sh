mkdir /srv/www/log-archive/
mkdir /srv/www/log-archive/pm2/
mkdir /srv/www/log-archive/nginx/
mkdir /srv/www/log-archive/logs/
mkdir /srv/www/log-archive/ostm/

cp /srv/www/routes/logs/ /srv/www/log-archive/logs/ -r
cp /srv/www/routes/ostm/logs/ /srv/www/llog-archive/ostm/ -r
cp /srv/www/routes/ostm/manage/logs/ /srv/www/log-archive/ostm/ -r
cp /root/.pm2/logs/ /srv/www/log-archive/pm2/ -r
cp /var/log/nginx/ /srv/www/log-archive/nginx/ -r

rm -rf /srv/www/routes/logs/*
rm -rf /srv/www/routes/ostm/logs/*
rm -rf /srv/www/routes/ostm/manage/logs/*
rm -rf /root/.pm2/logs/*
rm -rf /var/log/nginx/*

