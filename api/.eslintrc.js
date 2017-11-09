module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb", "prettier"],
  rules: {
    "jsx-a11y/anchor-is-valid": [0],
    "react/jsx-filename-extension": [1, { extensions: [".js"] }],
    "no-await-in-loop": [0],
    "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
  },
};
