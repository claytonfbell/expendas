# Install Notes

- Ubuntu 20.04 (LTS) x64

```bash
apt-get update && apt-get dist-upgrade

# install docker https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
apt-cache policy docker-ce
sudo apt install docker-ce
sudo systemctl status docker

# startup our app
git clone https://github.com/claytonfbell/expendas.git
cd expendas
./deploy.sh

# setup nginx as our web server proxy and SSL handler
apt install nginx-full
apt install certbot python3-certbot-nginx

vim /etc/nginx/sites-available/default
# CHANGE TO: server_name www.expendas.com expendas.com;
service nginx restart
sudo certbot --nginx -d www.expendas.com -d expendas.com

crontab -e
# ADD: 0 5 * * * /usr/bin/certbot renew --quiet

apt install net-tools
vim /etc/nginx/sites-available/default

        location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
        error_page 502 503 /503.html;
        location /503.html {}

cp /root/expendas/503.html /var/www/html

# https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-20-04
apt install postgresql postgresql-contrib
sudo -u postgres createuser --interactive
sudo -u postgres psql
ALTER USER app WITH PASSWORD 'hy8jmn3!';

vim /etc/postgresql/12/main/postgresql.conf
# ADD: listen_addresses = '*'

vim /etc/postgresql/12/main/pg_hba.conf
# ADD: host    all             app     0.0.0.0/0               md5

# ENABLE SWAP
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
sudo swapon --show
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo sysctl vm.swappiness=10
cat /proc/sys/vm/swappiness
vim /etc/sysctl.conf
# ADD: vm.swappiness=10

```
