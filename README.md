# Safety Maps
SafetyMaps is an innovative web-based map application that lets a user generate routes optimized for both distance and safety. We provide two routing options: trip mode, which allows the user to choose a start and end point, and exercise mode, which allows the user to generate a circular path that takes them back to their start point. For their convenience, users may save their favorite routes, view recent routes, and recreate a route they went on before. They can also save their exercise times to keep track of their current and best walking, running, and biking speeds.

## Authors

[Rishi Sankar](https://github.com/rishisankar), [David Deng](https://github.com/daviddeng8), [Evan Zhong](https://github.com/evazhog), [Ray Huang](https://github.com/ray-cj-huang)

## Running the Code

Follow these instructions to get our project running on your local machine.

### Prerequisites
To run this project, you'll need the following programs installed. To install Docker, we recommend you install [Docker Desktop Community Edition](https://www.docker.com/products/docker-desktop).
* Node Package Manager (NPM): v16.14.5
* Docker v19.03.9
* Docker-compose v1.25.5

### Running the Server
To run our server, first navigate into the server directory.
```
cd ./server
```
Next, you will need to set up the Node environment variables. Create a file called `.env` in the server directory with the following contents:
```
DB_USER=myusername
DB_PASS=mypassword
DB_NAME=mydatabase
JWT_SECRET_KEY=secret_string
COOKIE_PARSER_SECRET_KEY=secret_string_2
```
Replace `myusername`, `mypassword`, `mydatabase` with MongoDB database account information for the database where you want your account data to be stored. `secret_string` and `secret_string_2` should be randomly-generated strings containing letters, numbers, and special characters that will be used in encrypting account authorization tokens.

Next, to run the server, use the command:
```
docker-compose up
```
We use Docker to containerize our Node.js and Redis instances. Docker will handle all NPM package installation and Redis database configuration for you. To confirm the server is up and running, wait until you see the following log messages from the safety-maps-backend container:
```
safety-maps-backend_1  | [SafetyMaps] Server started!
safety-maps-backend_1  | [Redis] Connected!
safety-maps-backend_1  | [Router] Data processed!
safety-maps-backend_1  | [Redis Router] Data Loaded into Redis Memory!
```

### Running the Client
Our web client is written using [React](https://reactjs.org/). First navigate into the client directory.
```
cd ./client
```
Then, to install the necessary packages and run the client, 
```
npm install
npm start
```
Note: ensure that the server is running (and all four above long messages have been outputted), or most client functionality will not work.

### Accessing Map Data

We have created and provided a dataset of map data comprised of the greater Los Angeles area, with included safety information sourced from (?). For navigation within Los Angeles, this dataset should be sufficient. However, if you wish to configure this project for a different region, see the Data Generation section for instructions on generating a new dataset.

### Data Generation

todo

## Acknowledgments

* Paul Eggert and the TAs/LAs of UCLA CS 97
* [Mapbox](http://mapbox.com/)'s visualization tools and directions API
