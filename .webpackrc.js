export default {
    "publicPath": "/static/",
    "proxy": {
      "/api": {
        "target": "http://jsonplaceholder.typicode.com/",
        "changeOrigin": true,
        "pathRewrite": { "^/api" : "" }
      },
      "/of": {
        "target": "http://192.168.170.26:8080/",
        "changeOrigin": true,
        "pathRewrite": { "^/of" : "" }
      },
    },
  }