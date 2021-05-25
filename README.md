qldarch-frontend
==================

Running the Front End locally (pointing at qldarch server)
-----

# Setting up
## 1. Getting the Global Tools 
* Install NPM
* Install the dev tools you need - yo, bower, grunt `npm install -g yo bower grunt-cli`
* Install generator for angular (does angular scaffolding) `npm install -g generator-angular`

## 2. Installing Project Dependencies 
* Run `npm install`
* Run `npx bower install`

## 3. Running it Locally 
* Run `npx grunt server`

## 4. Build
* Run `npx grunt build --force`

## 5. Clean up existing build
* Run `npx grunt clean`
* Run `npx bower clean`
