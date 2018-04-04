export default {
    "publicPath": "/static/",
    "proxy": {
      "/api": {
        "target": "http://jsonplaceholder.typicode.com/",
        "changeOrigin": true,
        "pathRewrite": { "^/api" : "" }
      },
      "/of": {
        "target": "http://localhost:8080/",
        "changeOrigin": true,
        "pathRewrite": { "^/of" : "" }
      },
    },
  }