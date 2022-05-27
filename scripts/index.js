#!/usr/bin/env node
"use strict";

const currentNodeVersion = process.versions.node;
const major = process.versions.node.split('.')[0];

if (major < 15) {
    console.error(
        "You are running Node " +
        currentNodeVersion +
        ".\n" +
        "Create Snackabra requires Node 15 or higher. \n" +
        "Please update your version of Node."
    );
    process.exit(1);
}

const Channel = require(`./install-channelserver`);
Channel.init(process.argv[2],process.argv[3], process.argv[4]);

const Storage = require(`./install-storageserver`);
Storage.init(process.argv[2],process.argv[3], process.argv[4]);

const Webclient = require(`./install-webclient`);
Webclient.init(process.argv[2],process.argv[3], process.argv[4]);
