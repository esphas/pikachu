
'use strict';

const pkg = require('../package.json');
const secret = require('../secret.json');

const Pikachu = require('../lib/pikachu');
const pikachu = new Pikachu();
const program = require('commander');
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

/**
 * Argument Parsing
 */
program
.version(pkg.version);

// Command Serve
program
.command('serve')
.alias('s')
.description('start a web server')
.option('-p, --port [PORT]', 'specify the port to listen')
.action(function (options) {
  let port = options.port || 1551;
  app.listen(port, () => console.log(`Currently listening port ${port}, press Ctrl+C to abort...`));
});

/**
 * REST APIs
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// post image
app.post('/v1', upload.single('image'), function (req, res) {
  let token = secret.token;
  let image = req.file;
  let { owner, repo, issue } = req.body;
  // console.log(image, user, repo);
  pikachu.postImage({ token, image, owner, repo, issue });
  res.json({ status: 'OK' });
});

program.parse(process.argv);
