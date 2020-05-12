Safety maps

Install the node dependencies in both the client and server directories

```
cd ./client
npm install
cd ../server
npm install
```

Running the client
```
cd ./client
npm start
```
Create-react-app takes care of running a dev server on localhost:3000

Running the server
```
cd ./server
npm start
```
This runs `node index.js` and will start listening at localhost:8000

Alternatively, you can cd into either the client or server folder, and then run:
```
npm run install-all
npm run dev
```
This will install all node dependencies and run both the client and the server.
