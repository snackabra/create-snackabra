const fs = require('fs')
const path = require("path");
const execSync = require("child_process").execSync;
const md5 = require("md5")
const {argv: args} = require("yargs");


function init(projectName, accountId, workingDir) {

    createStorageServer(
        projectName,
        accountId,
        "https://github.com/snackabra/snackabra-webclient.git",
    );

    function createStorageServer(name, accountId, repo) {
        const major = Number(process.versions.node.split('.')[0])
        const unsupportedNodeVersion = major <= 15;


        if (unsupportedNodeVersion) {
            console.log('\x1b[31m%s\x1b[0m',

                `You are using Node ${process.version}.\n\n` +
                `Please update to Node 15 or higher.\n`
            );
            process.exit(1)
        }
        let root = path.resolve(workingDir);
        console.log(root)
        const projectRoot = path.join(root, name, 'ui');

        fs.mkdirSync(name, {recursive: true});

        console.log();
        console.log(`Creating SB in ${'\x1b[32m%s\x1b[0m', (root)}.`);
        console.log();

        execSync(`git clone ${repo} ${projectRoot}`)
        const subdomain = execSync(
            `wrangler subdomain`, {
                cwd: path.join(root, name, 'servers', 'channel-server')
            }).toString().match(/\s(.+)\.workers\.dev/)[1];
        process.chdir(projectRoot);
        const env = `REACT_APP_ROOM_SERVER=r.${subdomain.trim()}.worker.dev\n` +
            `REACT_APP_STORAGE_SERVER=s.${subdomain.trim()}.worker.dev\n`
        fs.writeFileSync(path.join(`${projectRoot}`, '.env'), env)
        execSync(`npm install --force`,
            {
                cwd: projectRoot,
                stdio: 'inherit',
            }
        )
        execSync(`npm run build`,
            {
                cwd: projectRoot,
                stdio: 'inherit',
            })
        process.chdir(root);
    }


}

module.exports = {
    init
};
