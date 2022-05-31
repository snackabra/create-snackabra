const fs = require("fs")
const path = require("path")
const execSync = require("child_process").execSync;

const createKvNameSpace = (KV_NAMESPACE, cwd, projectRoot) => {
    try {
        const original = fs.readFileSync(`${path.join(projectRoot, 'wrangler.toml')}`).toString();
        const namespace = execSync(
            `wrangler kv:namespace create "${KV_NAMESPACE}"`,
            {
                cwd: cwd,
            }
        ).toString()
        let id = namespace.match(/id = "(\w+)"/)
        const regex = `{ binding = "${KV_NAMESPACE}", id = "<id>" }`
        const modified = original.replace(regex, `{ binding = "${KV_NAMESPACE}", id = "${id[1]}" }`)
        fs.writeFileSync(path.join(projectRoot, 'wrangler.toml'), modified)
    } catch (e) {
        console.error(e.message);
    }
}

const copyTemplate = (projectRoot) => {
    const wrangler = fs.readFileSync(`${path.join(projectRoot, 'setup', 'template.wrangler.toml')}`).toString();
    fs.writeFileSync(path.join(projectRoot, 'wrangler.toml'), wrangler)
}

const addAccountNumber = (accountId, projectRoot) => {
    try {
        const original = fs.readFileSync(`${path.join(projectRoot, 'wrangler.toml')}`).toString();
        let modified = original.replace(/<your Account Id>/i, accountId)
        fs.writeFileSync(path.join(projectRoot, 'wrangler.toml'), modified)
    } catch (e) {
        console.error(e.message);
    }
}

const publish = (cwd, options) => {
    let args = options || '';
    execSync(
        `wrangler publish ${args}`.trim(),
        {cwd: cwd}
    )

}

const setEnvVariable = (name, value, cwd) => {
    execSync(
        `echo "${value}" | wrangler secret put ${name}`,
        {cwd: cwd}
    )
}

module.exports = {
    createKvNameSpace,
    copyTemplate,
    addAccountNumber,
    setEnvVariable,
    publish
}
