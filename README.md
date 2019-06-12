# Zendesk Coding Challenge
**Ticket Viewer by Lucia Bubniakova**

Ticket Viewer is a simple CLI app built on Node.js to display tickets fetched from Zendesk API as a list or as a ticket detail. App includes pagination.

## Pre-Requisites

node.js version 10

follow [these steps](https://tecadmin.net/upgrade-nodejs-via-npm/) to upgrade to a current version of node 

## Install

Use npm to install the Ticket Viewer

```
$ npm install
```

## Tests

All tests included in this app test errors in API and if the code handles these errors accordingly.

Run the following command to execute tests:

```
$ npm test
```

*Note*: At the moment of writing this program, including tests for user input was beyond my capabilities.

## Usage

Run the app by executing

```
$ node app.js
```

1. A welcome screen will ask for login details. Credentials to access lucibu.zendesk.com are prepopulated by the program - hit ENTER to confirm username and ENTER again to confirm password.

2. Assuming you are connected to internet and there were no issues when connecting to the API, the first page with 25 tickets will be loaded.*

3. A few options will be displayed below the list
	- use keyboard arrow up and arrow down to navigate through the options
	- hit ENTER to confirm chosen option
	- type in number input or letter B when prompted

4. Enjoy

\* In case of a problem with API or internet connection, a short error message will be displayed and the program will terminate.

## My journey

This was my very first coding challenge I have ever participated.

Feel free to watch a summary of my journey in [this short video.](https://www.dropbox.com/s/bav434bhzf1oma8/Lucia%20Bubniakova%20Journey.mov?dl=0)

Thank you.
