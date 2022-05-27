const fs = require('fs')
const path = require("path");
const execSync = require("child_process").execSync;
const md5 = require("md5")


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
        console.log(projectRoot);
        process.chdir(projectRoot);
        const wrangler = fs.readFileSync(`${path.join(projectRoot, 'setup', 'template.wranger.toml')}`).toString();
        let out = wrangler.replace(/<your Account Id>/i, accountId)
        fs.writeFileSync(path.join(projectRoot,'wrangler.toml'), out)

        const MESSAGES_NAMESPACE_TEXT = execSync(`wrangler kv:namespace create "MESSAGES_NAMESPACE"`,
            {
                cwd: projectRoot
            }).toString()
        console.log(MESSAGES_NAMESPACE_TEXT)
        let MESSAGES_NAMESPACE_ID = MESSAGES_NAMESPACE_TEXT.match(/id = "(\w+)"/)
        console.log(MESSAGES_NAMESPACE_TEXT)
        out = out.replace(/{ binding = "MESSAGES_NAMESPACE", id = "<id>" }/, `{ binding = "MESSAGES_NAMESPACE", id = "${MESSAGES_NAMESPACE_ID[1]}" }`)
        const KEYS_NAMESPACE_TEXT = execSync(`wrangler kv:namespace create "KEYS_NAMESPACE"`,
            {
                cwd: projectRoot,
            }).toString()
        let KEYS_NAMESPACE_ID = KEYS_NAMESPACE_TEXT.match(/id = "(\w+)"/)
        out = out.replace(/{ binding = "KEYS_NAMESPACE", id = "<id>" }/, `{ binding = "KEYS_NAMESPACE", id = "${KEYS_NAMESPACE_ID[1]}" }`)

        const LEDGER_NAMESPACE_TEXT = execSync(`wrangler kv:namespace create "LEDGER_NAMESPACE"`,
            {
                cwd: projectRoot,
            }).toString()
        let LEDGER_NAMESPACE_ID = LEDGER_NAMESPACE_TEXT.match(/id = "(\w+)"/)
        out = out.replace(/{ binding = "LEDGER_NAMESPACE", id= "<id>" }/, `{ binding = "LEDGER_NAMESPACE", id = "${LEDGER_NAMESPACE_ID[1]}" }`)

        fs.writeFileSync(path.join(projectRoot,'wrangler.toml'), out)
        execSync(`wrangler publish --new-class ChatRoomAPI`)

        const SERVER_SECRET = md5(new Date().toString());
        fs.writeFileSync(path.join(root, 'servers', 'SERVER_SECRET.txt'), SERVER_SECRET + '\n')
        execSync(`echo "${SERVER_SECRET}" | wrangler secret put SERVER_SECRET`,
            {
                cwd: projectRoot,
            })
        execSync(`node ${projectRoot}/mint_keys.js`,
            {
                cwd: projectRoot,
            })
        const my_public_key = fs.readFileSync(`${path.join(projectRoot, 'my_public_key')}`).toString();
        execSync(`echo "${my_public_key}" | wrangler secret put LEDGER_KEY`)
        process.chdir(root);
    }


}

module.exports = {
    init
};
