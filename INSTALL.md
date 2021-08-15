# Install Notes

- Ubuntu 20.04 (LTS) x64

```bash
apt-get update && apt-get dist-upgrade

curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -

## Run `sudo apt-get install -y nodejs` to install Node.js 14.x and npm
## You may also need development tools to build native addons:
     sudo apt-get install gcc g++ make
## To install the Yarn package manager, run:
     curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
     echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
     sudo apt-get update && sudo apt-get install yarn


git clone https://github.com/claytonfbell/expendas3.git
cd expendas3
yarn install
yarn build
yarn start

# with pm2
yarn global add pm2
pm2 start yarn --name "nextjs" --interpreter bash -- start
pm2 show nextjs

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

cp /root/expendas3/503.html /var/www/html

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
