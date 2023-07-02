process.env.WP_COPY_PHP_FILES_TO_DIST = true;
const defaultConfig = require("@wordpress/scripts/config/webpack.config");
const path = require('path');

const newEntryConfig = async () => {
  const originalEntry = await defaultConfig.entry();

  return {
    ...originalEntry,
    'gutenberg-ex': path.resolve(__dirname, './src/gutenberg-ex.js')
  };
};

module.exports = {
  ...defaultConfig,
  entry: newEntryConfig,
};