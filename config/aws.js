const AWS = require('aws-sdk');
const config = require('./s3');

module.exports = new AWS.S3(config.s3);