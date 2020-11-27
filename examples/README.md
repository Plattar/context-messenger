### _Required Tools_

Install and setup the following tools to run the examples

-   Install [Docker](https://www.docker.com/)
-   Install [NodeJS](https://nodejs.org/)
-   Install [NPM](https://www.npmjs.com/get-npm)

### _Running Examples_

Run the following commands to launch a local server. The server will launch on port `8100`.

-   Install `NPM` packages
```console
npm install
```

-  Launch a local test server using `Docker`
```console
docker-compose -f local-server.yml up
```

-   Open Browser (Chrome, Edge, Safari, Firefox) and go to `http://localhost:8100/local/function_test/index.html`
-   Visit the other folders to view other examples