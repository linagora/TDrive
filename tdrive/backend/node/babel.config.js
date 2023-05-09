module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-typescript"],
  plugins: [
    ["@babel/plugin-proposal-decorators", { version: "2018-09", decoratorsBeforeExport: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
    "babel-plugin-parameter-decorator",
  ],
};
