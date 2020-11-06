module.exports = {
  components: {
    categories: [
      {
        name: 'Atoms',
        include: [
          'src/uxpin-merge/01-atoms/Button/Button.tsx',
          'src/uxpin-merge/01-atoms/Breadcrumbs/Breadcrumbs.tsx',
          'src/uxpin-merge/01-atoms/CanvasStatus/CanvasStatus.tsx',
          'src/uxpin-merge/01-atoms/AdminHeader/AdminHeader.tsx',
          'src/uxpin-merge/01-atoms/Mirador/Mirador.tsx',
          'src/uxpin-merge/01-atoms/StandardButton/StandardButton.tsx',
        ],
      },
    ],
    wrapper: './src/uxpin-merge/UXPinWrapper.js',
    webpackConfig: './webpack.uxpin.js',
  },
  name: 'UXPin Merge - Madoc',
};
