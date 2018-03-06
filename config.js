config = {}

config.port = process.env.PORT || 3003;
config.host = process.env.HOSTNAME || `localhost:${config.port}`;


module.exports = config
