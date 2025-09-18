const path = require("path");
require("dotenv").config();
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

const sdkEnv = process.env.sdkEnv ?? "local";

const endpointMap = {
  prod: "https://api.hyperswitch.io/payments",
  sandbox: "https://sandbox.hyperswitch.io/payments",
  integ: "https://integ.hyperswitch.io/api/payments",
  local: "https://sandbox.hyperswitch.io/payments", // Default or local environment endpoint
};

// Get environment variables with fallbacks
const getEnvVar = (key, defaultValue) => process.env[key] || defaultValue;

const backendEndPoint = endpointMap[sdkEnv] || endpointMap.local;

const devServer = {
  static: {
    directory: path.join(__dirname, "dist"),
  },
  hot: true,
  host: "0.0.0.0",
  port: process.env.PORT || 9050,
  historyApiFallback: true,
  proxy: [
    {
      context: ["/payments", "/api"],
      target: "https://sandbox.hyperswitch.io",
      changeOrigin: true,
      secure: true,
      pathRewrite: { 
        "^/payments": "/payments",
        "^/api": "/api"
      },
    },
    {
      context: ["/assets"],
      target: "https://beta.hyperswitch.io",
      changeOrigin: true,
      secure: true,
      onError: (err, req, res) => {
        console.log(`Proxy error for ${req.url}:`, err.message);
        // Fallback to local files if proxy fails
        if (req.url.includes('/assets/v1/jsons/location/')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ countries: [], states: {} }));
        }
      }
    },
    // Uncomment the following if needed for 3DS method proxying
    // {
    //   context: ["/3dsmethod"],
    //   target: "https://acs40.sandbox.3dsecure.io",
    //   changeOrigin: true,
    //   secure: false,
    // },
  ],
  headers: {
    "Cache-Control": "must-revalidate",
  },
};

module.exports = merge(common(), {
  mode: "development",
  devServer,
});
