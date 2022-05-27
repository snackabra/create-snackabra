const fs = require('fs')
const path = require("path");
const execSync = require("child_process").execSync;
const md5 = require("md5")
const {argv: args} = require("yargs");


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
        const wrangler = fs.readFileSync(`${path.join(projectRoot, 'setup', 'template.wrangler.toml')}`).toString();
        let out = wrangler.replace(/<your Account Id>/i, accountId)
        fs.writeFileSync(path.join(projectRoot,'wrangler.toml'), out)

        const KEYS_NAMESPACE_TEXT = execSync(
            `wrangler kv:namespace create "KEYS_NAMESPACE"`,
        {
            cwd: projectRoot,
        }
        ).toString()
        let KEYS_NAMESPACE_ID = KEYS_NAMESPACE_TEXT.match(/id = "(\w+)"/)
        out = out.replace(/{ binding = "KEYS_NAMESPACE", id = "<id>" }/, `{ binding = "KEYS_NAMESPACE", id = "${KEYS_NAMESPACE_ID[1]}" }`)

        const LEDGER_NAMESPACE_TEXT = execSync(
            `wrangler kv:namespace create "LEDGER_NAMESPACE"`,
            {
                cwd: projectRoot,
            }
        ).toString()
        let LEDGER_NAMESPACE_ID = LEDGER_NAMESPACE_TEXT.match(/id = "(\w+)"/)
        out = out.replace(/{ binding = "LEDGER_NAMESPACE", id = "<id>" }/, `{ binding = "LEDGER_NAMESPACE", id = "${LEDGER_NAMESPACE_ID[1]}" }`)

        const RECOVERY_NAMESPACE_TEXT = execSync(
            `wrangler kv:namespace create "RECOVERY_NAMESPACE"`,
            {
                cwd: projectRoot,
            }
        ).toString()
        let RECOVERY_NAMESPACE_ID = RECOVERY_NAMESPACE_TEXT.match(/id = "(\w+)"/)
        out = out.replace(/{ binding = "RECOVERY_NAMESPACE", id = "<id>" }/, `{ binding = "RECOVERY_NAMESPACE", id = "${RECOVERY_NAMESPACE_ID[1]}" }`)

        const IMAGES_NAMESPACE_TEXT = execSync(
            `wrangler kv:namespace create "IMAGES_NAMESPACE"`,
            {
                cwd: projectRoot,
            }
        ).toString()
        let IMAGES_NAMESPACE_ID = IMAGES_NAMESPACE_TEXT.match(/id = "(\w+)"/)
        out = out.replace(/{ binding = "IMAGES_NAMESPACE", id = "<id>" }/, `{ binding = "IMAGES_NAMESPACE", id = "${IMAGES_NAMESPACE_ID[1]}" }`)

        fs.writeFileSync(path.join(projectRoot,'wrangler.toml'), out)
        execSync(`wrangler publish`)
        const SERVER_SECRET = fs.readFileSync(path.join(root, 'servers', 'SERVER_SECRET.txt')).toString();
        execSync(`echo "${SERVER_SECRET}" | wrangler secret put SERVER_SECRET`)
        process.chdir(root);

    }


}

module.exports = {
    init
};
