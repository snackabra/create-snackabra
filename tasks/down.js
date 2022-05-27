#!/usr/bin/env node
'use strict';
const args = require('yargs').argv;
const path = require('path');
const cp = require('child_process');
const {execSync} = require("child_process");
const fs = require("fs");

const rootDir = path.join(__dirname, '..');
console.log(rootDir,  args.dir)
const cleanUp = () => {
    channelServerCleanUp();
    storageServerCleanUp();
    webclientCleanUp();
    cp.execSync(
        'rm -rf ' + args.dir,
        {
            cwd: rootDir,
            stdio: 'inherit',
        })
};

const channelServerCleanUp = () => {
    console.log('Cleaning up.');
    console.log(`${path.join(rootDir, args.dir, 'servers', 'channel-server', 'wrangler.toml')}`)
    const wrangler = fs.readFileSync(`${path.join(rootDir, args.dir, 'servers', 'channel-server', 'wrangler.toml')}`).toString();
    let out = wrangler.split('\n')
    out = out.splice(0, out.length - 3)
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
    const wrangler = fs.readFileSync(`${path.join(rootDir, args.dir, 'servers', 'storage-server', 'wrangler.toml')}`).toString();
    let out = wrangler.split('\n')
    out = out.splice(0, out.length - 4)
    fs.writeFileSync(`${path.join(rootDir, args.dir, 'servers', 'storage-server', 'wrangler.toml')}`, out.join('\n'))

}

const webclientCleanUp  = () =>{

}

// Cleanup
cleanUp();
