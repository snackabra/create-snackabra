# create-snackabra

Installer for snackabra.io

## Prerequisites

### Nodejs v15

Because we use web crypto from, a new feature in LTS 15, we want to make sure this is the version we are using.

### Setup Cloudflare

* Set up a domain (we will call it "example.com") that you control.
  You will need to be able to change the nameservers to be Cloudflare.
* Set up a free account with CF: https://dash.cloudflare.com/sign-up -
  use your domain in the signup process.
* Go to the "workers" section and pick a name for your worker on
  CF, we'll call it "example" here. That sets up a subdomain on
  "workers.dev", e.g. "example.workers.dev."  Later you can set
  up "routes" from own domain.
* Click on the "Free" button, you need to upgrade to the
  "Pay-as-you-go" plan.

### Install Wrangler CLI

* Next set up the CF command line environment, the "Wrangler CLI", we use "yarn" in general but the personal server code is pure JS and (currently) does not need any node packages. Follow instructions at https://developers.cloudflare.com/workers/cli-wrangler/ - at time of writing:

```
# install the CLI:
yarn global add @cloudflare/wrangler
```
## Usage

```
git clone https://github.com/snackabra/create-snackabra.git
```
```angular2html
cd ./create-snackabra
npm install
cd ..
```

```
npx ./create-snackabra --dir=snackabra --cf=YOUR_CLOUDFLARE_ACCOUNT_ID
```


