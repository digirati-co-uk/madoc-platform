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
  
  .react-tooltip {
    z-index: 9999;
  }
  
  //.rfs-menu-container {
  //  position: fixed;
  //  max-width: 550px;
  //}
  
  .selector-preview-svg {
    stroke: red;
  }

  /* HTML Block styles (un-reset tailwind) */
  .simple-html-block {
      ol {
        list-style: decimal;
        padding-left: 2em;
      }
      ul {
        list-style: disc;
        padding-left: 2em;
      }
      li {
        margin: 0.5em 0;
      }
      
      p {
        margin: 1em 0;
      }
      
      h1 {
        font-size: 1.5em;
        margin: 1em 0;
      }
      
      h2 {
        font-size: 1.25em;
        margin: 1em 0;
      }
      
      h3 {
        font-size: 1.1em;
        margin: 1em 0;
      }
      
      h4 {
        font-size: 1em;
        margin: 1em 0;
      }
      
      h5 {
        font-size: 0.9em;
        margin: 1em 0;
      }
      
      h6 {
        font-size: 0.8em;
        margin: 1em 0;
      }
      
      blockquote {
        margin: 1em 0;
        padding-left: 1em;
        border-left: 2px solid #ccc;
      }
      
      pre {
        margin: 1em 0;
        padding: 1em;
        background: #eee;
        border-radius: 0.5em;
      }
      
      code {
        font-family: monospace;
      }
      
      a {
        color: #333;
      }
      a:hover {
        color: #000;
        text-decoration: underline;
      }
      
      img {
        max-width: 100%;
      }
      
      
  }
`;
