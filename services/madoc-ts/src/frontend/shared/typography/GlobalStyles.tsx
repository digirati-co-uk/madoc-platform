import { createGlobalStyle } from 'styled-components';
import { themeVariable } from '../../themes/helpers/themeVariable';

const globalFont = themeVariable('fonts', 'fontFamily', {
  default: 'Tahoma, sans-serif',
});

export const GlobalStyles = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    font-family: ${globalFont};
  }

  *, *:before, *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  body {
    display: flex;
    flex-direction: column;
    background: #fff; /* Body background */
  }

  a {
    color: #333;
  }
  
  #react-component {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  //.rfs-menu-container {
  //  position: fixed;
  //  max-width: 550px;
  //}
`;
