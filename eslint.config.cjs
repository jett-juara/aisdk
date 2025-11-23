const next = require("eslint-config-next");

module.exports = [
  ...next,
  {
    files: ["src/components/about/hero.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];
