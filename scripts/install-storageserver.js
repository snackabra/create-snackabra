const fs = require('fs')
const path = require("path");
const execSync = require("child_process").execSync;
const {
    addAccountNumber,
    createKvNameSpace,
    copyTemplate,
    publish,
    setEnvVariable
} = require('./helpers/wrangler')

const kv_namespaces = [
    'KEYS_NAMESPACE',
    'LEDGER_NAMESPACE',
    'RECOVERY_NAMESPACE',
    'IMAGES_NAMESPACE'
]


function init(projectName, accountId, workingDir) {

    createStorageServer(
        projectName,
        accountId,
        "https://github.com/snackabra/snackabra-storageserver.git",
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
        const projectRoot = path.join(root, name, 'servers', 'storage-server');

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

        publish(projectRoot);
        const SERVER_SECRET = fs.readFileSync(path.join(projectRoot, '..', 'channel-server', 'SERVER_SECRET.txt')).toString();
        setEnvVariable('SERVER_SECRET', SERVER_SECRET, projectRoot)
        process.chdir(root);

    }


}

module.exports = {
    init
};
