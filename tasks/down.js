#!/usr/bin/env node
'use strict';
const path = require('path');
const cp = require('child_process');
const fs = require("fs");

const rootDir = path.join(__dirname);
const cleanUp = () => {
    channelServerCleanUp();
    storageServerCleanUp();
    webclientCleanUp();
    cp.execSync(
        'rm -rf ' + rootDir,
        {
            cwd: rootDir,
            stdio: 'inherit',
        })
};

const channelServerCleanUp = () => {
    console.log('Cleaning up.');
    console.log(`${path.join(rootDir, 'servers', 'channel-server', 'wrangler.toml')}`)
    const wrangler = fs.readFileSync(`${path.join(rootDir, 'servers', 'channel-server', 'wrangler.toml')}`).toString();
    let out = wrangler.split('\n')
    out = out.splice(0, out.length - 4)
    fs.writeFileSync(`${path.join(rootDir, 'servers', 'channel-server', 'wrangler.toml')}`, out.join('\n'))
    cp.execSync(
        `wrangler publish --delete-class ChatRoomAPI`,
        {
            cwd: path.join(rootDir, 'servers', 'channel-server'),
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding MESSAGES_NAMESPACE`,
        {
            cwd: path.join(rootDir, 'servers', 'channel-server'),
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding KEYS_NAMESPACE`,
        {
            cwd: path.join(rootDir, 'servers', 'channel-server'),
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding LEDGER_NAMESPACE`,
        {
            cwd: path.join(rootDir, 'servers', 'channel-server'),
            stdio: 'inherit',
        })
}

const storageServerCleanUp = () => {
    console.log('Cleaning up.');

    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding RECOVERY_NAMESPACE`,
        {
            cwd: path.join(rootDir, 'servers', 'storage-server'),
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding IMAGES_NAMESPACE`,
        {
            cwd: path.join(rootDir, 'servers', 'storage-server'),
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding KEYS_NAMESPACE`,
        {
            cwd: path.join(rootDir, 'servers', 'storage-server'),
            stdio: 'inherit',
        })
    cp.execSync(
        `echo "y" | wrangler kv:namespace delete --binding LEDGER_NAMESPACE`,
        {
            cwd: path.join(rootDir, 'servers', 'storage-server'),
            stdio: 'inherit',
        })

}

const webclientCleanUp  = () =>{

}

// Cleanup
cleanUp();
