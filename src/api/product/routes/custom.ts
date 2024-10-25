module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/products/search',
        handler: 'custom.custom',
        config: {
          policies: [],
          middlewares: [],
          auth: false
        },
      },
    ],
  };
  