import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
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
  
  .rfs-menu-container {
    overflow: hidden;
    box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.18), 0 0px 0px 1px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  }
  
  //.rfs-menu-container {
  //  position: fixed;
  //  max-width: 550px;
  //}
`;
