// v1.263_001/babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
      presets: ["babel-preset-expo"],
      plugins: [
        [
          "module-resolver",
          {
            root: ["./"],
            alias: {
              "@": "./src",
              "@assets": "./assets",
              "@components": "./src/components",
              "@config": "./src/config",
              "@hooks": "./src/hooks",
              "@services": "./src/services",
              "@utils": "./src/utils",
              "@typeDefs": "./src/types",
            },
          },
        ],
      ],
    };
  };