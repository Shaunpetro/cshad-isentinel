// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "@babel/preset-typescript",   // must be first to transform TypeScript before class plugins
      "babel-preset-expo",
    ],
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
      // These must come after TypeScript transform
      "@babel/plugin-transform-class-properties",
      "@babel/plugin-transform-private-methods",
    ],
  };
};