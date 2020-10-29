module.exports = {
  components: {
    categories: [
      {
        name: 'Atoms',
        include: [
          'src/uxpin-merge/01-atoms/Button/Button.tsx',
          'src/uxpin-merge/01-atoms/Breadcrumbs/Breadcrumbs.tsx',
          'src/uxpin-merge/01-atoms/CanvasStatus/CanvasStatus.tsx',
        ],
      },
    ],
    wrapper: './src/uxpin-merge/UXPinWrapper.js',
    webpackConfig: './webpack.uxpin.js',
  },
  name: 'UXPin Merge - Madoc',
};
