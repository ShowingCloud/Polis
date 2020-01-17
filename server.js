/* eslint-env node */
const express = require('express');
const compression = require('compression');

const yargs = require('yargs').options({
  port: {
    default: 8080,
    description: 'Port to listen on.',
  },
  public: {
    type: 'boolean',
    description: 'Run a public server that listens on all interfaces.',
  },
  help: {
    alias: 'h',
    type: 'boolean',
    description: 'Show this help.',
  },
});

const { argv } = yargs;

if (argv.help) {
  yargs.showHelp();
  process.exit(1);
}

// eventually this mime type configuration will need to change
// https://github.com/visionmedia/send/commit/d2cb54658ce65948b0ed6e5fb5de69d022bef941
// *NOTE* Any changes you make here must be mirrored in web.config.
const { mime } = express.static;
mime.define({
  'application/json': ['czml', 'json', 'geojson', 'topojson'],
  'image/crn': ['crn'],
  'image/ktx': ['ktx'],
  'model/gltf+json': ['gltf'],
  'model/gltf.binary': ['bgltf', 'glb'],
  'text/plain': ['glsl'],
});

const app = express();
app.use(compression());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.static(__dirname));
// app.use('/Cesium', express.static(__dirname + '/node_modules/cesium/Build/Cesium/'));
app.use('/Build', express.static(`${__dirname}/Source/`));
app.use('/Cesium', express.static(`${__dirname}/Source/Cesium/`));
app.use('/MQTT', express.static(`${__dirname}/node_modules/mqtt/dist/`));
app.use('/js', express.static(`${__dirname}/Source/js/`));
app.use('/css', express.static(`${__dirname}/Source/css/`));
app.use('/images', express.static(`${__dirname}/Source/Images/`));
app.use('/fonts', express.static(`${__dirname}/Source/fonts/`));
app.use('/Models', express.static(`${__dirname}/Source/Models/`));
app.use('/s3mdata', express.static(`${__dirname}/Source/s3mdata/`));

const server = app.listen(argv.port, argv.public ? undefined : 'localhost', () => {
  if (argv.public) {
    console.log('Cesium development server running publicly.  Connect to http://localhost:%d/', server.address().port);
  } else {
    console.log('Cesium development server running locally.  Connect to http://localhost:%d/', server.address().port);
  }
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Error: Port %d is already in use, select a different port.', argv.port);
    console.log('Example: node server.js --port %d', argv.port + 1);
  } else if (e.code === 'EACCES') {
    console.log('Error: This process does not have permission to listen on port %d.', argv.port);
    if (argv.port < 1024) {
      console.log('Try a port number higher than 1024.');
    }
  }
  console.log(e);
  process.exit(1);
});

server.on('close', () => {
  console.log('Cesium development server stopped.');
});

let isFirstSig = true;
process.on('SIGINT', () => {
  if (isFirstSig) {
    console.log('Cesium development server shutting down.');
    server.close(() => {
      process.exit(0);
    });
    isFirstSig = false;
  } else {
    console.log('Cesium development server force kill.');
    process.exit(1);
  }
});
