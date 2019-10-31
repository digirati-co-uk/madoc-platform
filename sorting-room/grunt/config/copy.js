// grunt/config/copy.js

module.exports = {
  dev: {
    expand: true,
    cwd: 'src/asset-files',
    src: ['**'],
    dest: 'build/assets',
  },

  dist: {
    expand: true,
    cwd: 'src/asset-files',
    src: ['**'],
    dest: 'dist/assets',
  },
};
