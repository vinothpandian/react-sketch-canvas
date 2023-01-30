// <reference types="cypress" />

const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: false,
  experimentalStudio: false,
  e2e: {
    baseUrl: "http://localhost:4173",
    setupNodeEvents(on, config) {
      require("@cypress/code-coverage/task")(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },
});
