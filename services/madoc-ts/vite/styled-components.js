import babel from '@rolldown/plugin-babel';

export const styledComponents = () =>
  babel({
    plugins: [
      [
        'babel-plugin-styled-components',
        {
          displayName: true,
          fileName: false,
        },
      ],
    ],
  });
