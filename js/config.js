require('dotenv').config({
    // path: "../.env"
});

module.exports = {
    serverPort: process.env.SERVER_PORT || 3000,
    rabbit: {
        host: process.env.RABBIT_HOST || "localhost",
        port: process.env.RABBIT_PORT || 5672,
        user: encodeURIComponent(process.env.RABBIT_USER || ""),
        pwd: encodeURIComponent(process.env.RABBIT_PWD || ""),
        vhost: encodeURIComponent(process.env.RABBIT_VHOST || "")
    }
}
