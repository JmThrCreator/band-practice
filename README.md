# Band Practice
Kanban board for bands and musicians to keep track of songs, progress and keep any useful images such as amp or instrument settings in one place.

## How to Use
Begin by creating a code by entering any email into the box. Copy and paste it into the 'enter code box' and you can then bookmark and share the url.
Create a song (you can choose a template from the menu) and name it. 
Click on the song, add an instrument and add the details (you can use the progress bar and images for whatever you need).
You can then move a song to the appropriate box.

## Setup (Linux)

1. Install Node.js binary distribution: 
https://github.com/nodesource/distributions/blob/master/README.md#debinstall](https://github.com/nodesource/distributions/blob/master/README.md#debinstall
`curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
`sudo apt-get install -y nodejs`

2. Install Yarn
`sudo npm install -g yarn`

3. Install Node Packages
`npm i`

4. Set up mongodb server and whitelist your server IP (example: https://www.mongodb.com/atlas/database)

5. Create .env file and add:
`MONGODB_URI=[uri]`

6. Install React dependencies
`cd client`
`yarn install`
`yarn build`

7. Start
`cd ..`
`export NODE_ENV=production`
`npm start`
