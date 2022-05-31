const fs = require('fs')
const path = require("path");
const execSync = require("child_process").execSync;
const md5 = require("md5")

const {
    addAccountNumber,
    createKvNameSpace,
    copyTemplate,
    publish,
    setEnvVariable
} = require('./helpers/wrangler')

const kv_namespaces = [
    'MESSAGES_NAMESPACE',
    'KEYS_NAMESPACE',
    'LEDGER_NAMESPACE'
]


function init(projectName, accountId, workingDir) {

    createChannelServer(
        projectName,
        accountId,
        "https://github.com/snackabra/snackabra-roomserver.git",
    );

    function createChannelServer(name, accountId, repo) {
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
        const projectRoot = path.join(root, name, 'servers', 'channel-server');

        fs.mkdirSync(name, {recursive: true});

        console.log();
        console.log(`Creating SB in ${'\x1b[32m%s\x1b[0m', (root)}.`);
        console.log();

        execSync(`git clone ${repo} ${projectRoot}`)
        process.chdir(projectRoot);
        copyTemplate(projectRoot)
        addAccountNumber(accountId, projectRoot)


        for (let x in kv_namespaces) {
            createKvNameSpace(kv_namespaces[x], projectRoot, projectRoot)
        }

        publish(projectRoot, '--new-class ChatRoomAPI')

        const SERVER_SECRET = md5(new Date().toString());
        fs.writeFileSync(path.join(projectRoot, 'SERVER_SECRET.txt'), SERVER_SECRET + '\n')
        setEnvVariable('SERVER_SECRET', SERVER_SECRET, projectRoot)
        execSync(`node ${projectRoot}/mint_keys.js`,
            {
                cwd: projectRoot,
            })
        const my_public_key = fs.readFileSync(`${path.join(projectRoot, 'my_public_key')}`).toString();

        setEnvVariable('LEDGER_KEY', my_public_key, projectRoot)
        process.chdir(root);
    }


}

module.exports = {
    init
};
