#!/usr/bin/env node
'use strict';
const args = require('yargs').argv;
const path = require('path');
const cp = require('child_process');
const {execSync} = require("child_process");
const fs = require("fs");

const rootDir = path.join(__dirname, '..');

const execDir = path.join(process.env.PWD);

const cleanup = () => {
    console.log('Cleaning up.');
};

const cleanupError = () => {
    channelServerCleanUp();
    storageServerCleanUp();
    webclientCleanUp();
};

const channelServerCleanUp = () => {
    console.log('Cleaning up.');
    const wrangler = fs.readFileSync(`${path.join(rootDir, args.dir, 'servers', 'channel-server', 'wrangler.toml')}`).toString();
    let out = wrangler.split('\n')
    out = out.splice(0, out.length - 4)
    fs.writeFileSync(`${path.join(rootDir, args.dir, 'servers', 'channel-server', 'wrangler.toml')}`, out.join('\n'))
    cp.execSync(
        `wrangler publish --delete-class ChatRoomAPI`,
        {
            cwd: path.join(args.dir, 'servers', 'channel-server'),
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding MESSAGES_NAMESPACE`,
        {
            cwd: `${args.dir}/servers/channel-server`,
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding KEYS_NAMESPACE`,
        {
            cwd: `${args.dir}/servers/channel-server`,
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding LEDGER_NAMESPACE`,
        {
            cwd: path.join(args.dir, 'servers', 'channel-server'),
            stdio: 'inherit',
        })

    /*cp.execSync(
        'rm -rf ' + args.dir,
        {
            cwd: rootDir,
            stdio: 'inherit',
        })

     */
}

const storageServerCleanUp = () => {
    console.log('Cleaning up.');

    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding RECOVERY_NAMESPACE`,
        {
            cwd: `${args.dir}/servers/storage-server`,
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding IMAGES_NAMESPACE`,
        {
            cwd: `${args.dir}/servers/storage-server`,
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding KEYS_NAMESPACE`,
        {
            cwd: `${args.dir}/servers/storage-server`,
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding LEDGER_NAMESPACE`,
        {
            cwd: path.join(args.dir, 'servers', 'storage-server'),
            stdio: 'inherit',
        })
    /*cp.execSync(
        'rm -rf ' + args.dir,
        {
            cwd: rootDir,
            stdio: 'inherit',
        })

     */
}

const webclientCleanUp  = () =>{

}

const handleExit = () => {
    cleanup();
    console.log('Exiting without error.');
    process.exit();
};

const handleError = e => {
    console.error('ERROR! An error was encountered while executing');
    console.error(e);
    cleanupError();
    console.log('Exiting with error.');
    process.exit(1);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);

function isUsingYarn() {
    return (process.env.npm_config_user_agent || "").indexOf("yarn") === 0;
}

if (isUsingYarn()) {
    throw new Error('Yarn is not supported please use npm')
}


const scriptsPath = path.join(rootDir, 'scripts');


if (args.length <= 2) {
    throw new Error('No arguments provided')
}
if (!args.dir) {
    args.dir = 'myproject'
}

const sbiScriptPath = path.join(scriptsPath, 'index.js');

// Setup Wrangler
cp.execSync(
    'echo "y" | wrangler login',
    {
        cwd: rootDir,
        stdio: 'inherit',
    }
);

//Install
cp.execSync(
    `node ${sbiScriptPath} ${args.dir} ${args.cf} ${execDir} --scripts-version="${scriptsPath}"`,
    {
        cwd: rootDir,
        stdio: 'inherit',
    }
);

// Cleanup
handleExit();
