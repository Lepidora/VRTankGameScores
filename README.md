# TankScores

A simple website for displaying the scores submitted by the VR Tank Game Android game.

It was developed for the University of Nottingham group project open day as a way to show everyone's score on a leaderboard.

## Usage

It's a normal Node.js program, so you can run it with 'node server.js' or with whatever service you want. On my server I use forever.

## Developing

It was developed using Node.js, Express, Socket.io and the Ceryx CSS framework

It's a basic site, so if you use it, you may want to make some modifications to stop things like XSS attacks.

### Bugs/Future Features

There is currently a bug where if two people submit a name for a score at the same time, it adds a second score with value 'undefined'.
