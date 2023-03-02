import { ThemeRepository } from '../../../src/repository/theme-repository';

describe('Theme repository parse remote', () => {
  test('parsing NLW header', () => {
    const parsed = ThemeRepository.parseRemoteHeader(`<!doctype html>
<html lang="en">
<head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- SITE SPECIFIC meta tags-->
    
    <!-- favicon -->
    <link rel="shortcut icon" type="image/png" href="https://brandedframe.library.wales/templates/bootstrap5-nui/img/favicon.ico"/>

    
    <!-- Branded Frame CSS - applies to all sites-->
    <link rel="stylesheet" type="text/css" href="https://brandedframe.library.wales/templates/bootstrap5-nui/css/llgc_brandedframe.css">

    <!-- fontawesome -->
    <link rel="stylesheet" type="text/css" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" media="all">

    <!-- lato and roboto fonts-->
    <link href="https://fonts.googleapis.com/css?family=Lato:400,550,700|Roboto:400,500" rel="stylesheet">

    <!-- Site Specific CSS from the tpl file in /css-->
    
    <!-- SITE SPECIFIC js files -->
    
    <!-- Site Specific TITLE from the tpl file in /metaTags-->
    <title></title>


    <script type="text/javascript">

        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-10859855-2']);
        _gaq.push(['_setDomainName', 'library.wales']);
        _gaq.push(['_trackPageview']);

        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();

    </script>

</head>
<body>
<div id="skipnav"><a href="#skip-to-content">Skip to main content</a></div>
<div class="container llgc_navbar">
    <nav class="navbar navbar-expand-lg bg-#FFFFFF" role="navigation" aria-label="Navbar" title="Navbar">
        <div class="llgc_navbar_container container-fluid">
            <a class="llgc_header_logo" href="https://www.library.wales/">
                <img class="" width="284" src="https://brandedframe.library.wales/templates/bootstrap5-nui/img/llgc_logo.png" aria-label="Ewch i hafan LlGC" title="Ewch i hafan LlGC" alt="Logo baner LlGC"/>
            </a>
            <a class="llgc_header_logo_small" href="https://www.library.wales/">
                <img class="" width="63" src="https://brandedframe.library.wales/templates/bootstrap5-nui/img/logo-nlw-sgwar.svg" aria-label="Ewch i hafan LlGC" title="Ewch i hafan LlGC" alt="Logo bach LlGC"/>
            </a>
            <!-- Previous nav-icon/button -->
            <!--            <button class="navbar-toggler llgc_nav_icon ms-auto mb-3 mb-lg-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="--><?//= $lang['b5.header.navbar-toggler.aria']; ?><!--" title="--><?//= $lang['b5.header.navbar-toggler.title']; ?><!--">-->
            <!--                Code for previous nav-icon <span class="navbar-toggler-icon"></span> -->
            <!--                <i class="fas fa-chevron-up "></i> --><?//= $lang['b5.header.navbar-toggler.text']; ?>
            <!--            </button>-->
            <a class="llgc_navbar_link llgc_translate" id="llgc_lang_switch" href="" title="Translate page to Welsh" aria-label="Translate page to Welsh" lang="cy">Cymraeg</a>
            <button class="llgc_nav_toggler second-button mb-3 mb-lg-0 collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#navbarText"
                    aria-controls="navbarToggleExternalContent10" aria-expanded="false"
                    aria-label="Toggle navigation">
                <div class="animated-icon2"><span></span><span></span><span></span><span></span></div>
            </button>
        </div>
        <nav class="collapse navbar-collapse llgc_slide_content" id="navbarText">
            <ul class="navbar-nav mb-2 mb-lg-0" >
                <li class="nav-item llgc_site_specific_link" id="llgc_home_page_mobile">
                    <a class="llgc_navbar_link text-start text-nowrap llgc_hide_nav" id="llgc_home_page" aria-current="page" href="" title="Go back to Home page" aria-label="Go back to Home page">Home</a>
                </li>
                <li class="nav-item " id="llgc_tithe_maps_mobile">
                    <a class="llgc_navbar_link text-start text-nowrap" id="llgc_tithe_maps" aria-current="page" href="https://places.library.wales/" title="Go to the Tithe Maps page" aria-label="Go to the Tithe Maps page">Tithe Maps</a>
                </li>
                <li class="nav-item" id="llgc_newspapers_mobile">
                    <a class="llgc_navbar_link text-nowrap" id="llgc_newspapers" href="https://newspapers.library.wales/" title="Go to the Newspapers page" aria-label="Go to the Newspapers page">Newspapers</a>
                </li>
                <li class="nav-item" id="llgc_journals_mobile">
                    <a class="llgc_navbar_link text-nowrap" id="llgc_journals" href="https://journals.library.wales/" title="Go to the Journals page" aria-label="Go to the Journals page">Journals</a>
                </li>
                <li class="nav-item" id="llgc_catalogue_mobile">
                    <a class="llgc_navbar_link text-nowrap" id="llgc_catalogue" href="https://discover.library.wales/" title="Go to the Main Catalogue" aria-label="Go to the Main Catalogue">Catalogue</a>
                </li>
                <li class="nav-item" id="llgc_more_resources_mobile">
                    <a class="llgc_navbar_link" id="llgc_more_resources" href="https://www.library.wales/index.php?id=6860" title="Go to our other resources" aria-label="Go to our other resources">Resources</a>
                </li>
                                <span class="llgc_navbar_separator" role="separator">|</span>
                <a class="llgc_navbar_link llgc_translate_navbar" id="llgc_mobile_lang_switch" href="" title="Translate page to Welsh" aria-label="Translate page to Welsh">Cymraeg</a>
            </ul>
        </nav>
    </nav>
</div>

<!-- Main site text -->
<div class="container llgc_main_text shadow-sm pt-3 pb-1 bg-white border-top" id="llgc_main_content" role="main">
    <a id="skip-to-content"></a>    
    `);

    expect(parsed.mainElement).toEqual({
      className: 'container llgc_main_text shadow-sm pt-3 pb-1 bg-white border-top',
      id: 'llgc_main_content',
    });
    expect(parsed.meta).toEqual([]);
    expect(parsed.scripts).toEqual([]);
    expect(parsed.stylesheets).toEqual([
      'https://brandedframe.library.wales/templates/bootstrap5-nui/css/llgc_brandedframe.css',
      'https://use.fontawesome.com/releases/v5.8.1/css/all.css',
      'https://fonts.googleapis.com/css?family=Lato:400,550,700|Roboto:400,500',
    ]);
    expect(parsed.inlineScripts).toMatchInlineSnapshot(`
      [
        "var _gaq = _gaq || [];
              _gaq.push(['_setAccount', 'UA-10859855-2']);
              _gaq.push(['_setDomainName', 'library.wales']);
              _gaq.push(['_trackPageview']);

              (function() {
                  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
              })();",
      ]
    `);
    expect(parsed.mainHTML).toEqual(`<a id="skip-to-content"></a>`);
  });
});
