import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteContainer, SiteContainerBackground } from '../../../shared/layout/SiteContainer';
import { RenderFragment } from '../../../shared/components/RenderFragment';
import { UserBar } from '../../../shared/components/UserBar';
import { useClearFormResponse, useSite, useSiteTheme, useUser } from '../../../shared/hooks/use-site';
import { ErrorBoundary } from '../../../shared/utility/error-boundary';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { useStaticData } from '../../../shared/hooks/use-data';
import { GlobalFooter } from '../../features/GlobalFooter';
import { GlobalSiteFooter } from '../../features/GlobalSiteFooter';
import { GlobalSiteHeader } from '../../features/GlobalSiteHeader';
import { GlobalSiteNavigation } from '../../features/GlobalSiteNavigation';
import { ConfigProvider, SiteConfigurationContext } from '../../features/SiteConfigurationContext';

export type RootLoaderType = {
  params: any;
  query: any;
  variables: any;
  data: {
    project: SiteConfigurationContext['project'];
    navigation: SiteConfigurationContext['navigation'];
  };
  context: any;
};

export const RootLoader: UniversalComponent<RootLoaderType> = createUniversalComponent<RootLoaderType>(
  () => {
    const site = useSite();
    const user = useUser();
    const { data } = useStaticData(RootLoader, [], {
      cacheTime: 24 * 60 * 60,
    });
    const { i18n } = useTranslation();
    const siteTheme = useSiteTheme();
    const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n]);
    const userBarAbove = siteTheme?.options?.userBarAbove;

    const clearFormResponse = useClearFormResponse();
    const location = useLocation();
    const [initialPath] = useState(location.pathname);
    useEffect(() => {
      if (initialPath !== location.pathname) {
        clearFormResponse();
      }
    }, [clearFormResponse, initialPath, location.pathname]);

    const themeHeader =
      siteTheme &&
      ((siteTheme.languages[i18n.language] ? siteTheme.languages[i18n.language].html?.header : null) ||
        siteTheme.html.header);

    return (
      <ConfigProvider project={data ? data.project : undefined} navigation={data ? data.navigation : undefined}>
        <Helmet>
          <title>{site.title}</title>
          <style>{`
            .ol-box{box-sizing:border-box;border-radius:2px;border:2px solid #00f}.ol-mouse-position{top:8px;right:8px;position:absolute}.ol-scale-line{background:rgba(0,60,136,.3);border-radius:4px;bottom:8px;left:8px;padding:2px;position:absolute}.ol-scale-line-inner{border:1px solid #eee;border-top:none;color:#eee;font-size:10px;text-align:center;margin:1px;will-change:contents,width;transition:all .25s}.ol-scale-bar{position:absolute;bottom:8px;left:8px}.ol-scale-step-marker{width:1px;height:15px;background-color:#000;float:right;z-Index:10}.ol-scale-step-text{position:absolute;bottom:-5px;font-size:12px;z-Index:11;color:#000;text-shadow:-2px 0 #fff,0 2px #fff,2px 0 #fff,0 -2px #fff}.ol-scale-text{position:absolute;font-size:14px;text-align:center;bottom:25px;color:#000;text-shadow:-2px 0 #fff,0 2px #fff,2px 0 #fff,0 -2px #fff}.ol-scale-singlebar{position:relative;height:10px;z-Index:9;box-sizing:border-box;border:1px solid #000}.ol-unsupported{display:none}.ol-unselectable,.ol-viewport{-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}.ol-selectable{-webkit-touch-callout:default;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text}.ol-grabbing{cursor:-webkit-grabbing;cursor:-moz-grabbing;cursor:grabbing}.ol-grab{cursor:move;cursor:-webkit-grab;cursor:-moz-grab;cursor:grab}.ol-control{position:absolute;background-color:rgba(255,255,255,.4);border-radius:4px;padding:2px}.ol-control:hover{background-color:rgba(255,255,255,.6)}.ol-zoom{top:.5em;left:.5em}.ol-rotate{top:.5em;right:.5em;transition:opacity .25s linear,visibility 0s linear}.ol-rotate.ol-hidden{opacity:0;visibility:hidden;transition:opacity .25s linear,visibility 0s linear .25s}.ol-zoom-extent{top:4.643em;left:.5em}.ol-full-screen{right:.5em;top:.5em}.ol-control button{display:block;margin:1px;padding:0;color:#fff;font-size:1.14em;font-weight:700;text-decoration:none;text-align:center;height:1.375em;width:1.375em;line-height:.4em;background-color:rgba(0,60,136,.5);border:none;border-radius:2px}.ol-control button::-moz-focus-inner{border:none;padding:0}.ol-zoom-extent button{line-height:1.4em}.ol-compass{display:block;font-weight:400;font-size:1.2em;will-change:transform}.ol-touch .ol-control button{font-size:1.5em}.ol-touch .ol-zoom-extent{top:5.5em}.ol-control button:focus,.ol-control button:hover{text-decoration:none;background-color:rgba(0,60,136,.7)}.ol-zoom .ol-zoom-in{border-radius:2px 2px 0 0}.ol-zoom .ol-zoom-out{border-radius:0 0 2px 2px}.ol-attribution{text-align:right;bottom:.5em;right:.5em;max-width:calc(100% - 1.3em)}.ol-attribution ul{margin:0;padding:0 .5em;color:#000;text-shadow:0 0 2px #fff}.ol-attribution li{display:inline;list-style:none}.ol-attribution li:not(:last-child):after{content:" "}.ol-attribution img{max-height:2em;max-width:inherit;vertical-align:middle}.ol-attribution button,.ol-attribution ul{display:inline-block}.ol-attribution.ol-collapsed ul{display:none}.ol-attribution:not(.ol-collapsed){background:rgba(255,255,255,.8)}.ol-attribution.ol-uncollapsible{bottom:0;right:0;border-radius:4px 0 0}.ol-attribution.ol-uncollapsible img{margin-top:-.2em;max-height:1.6em}.ol-attribution.ol-uncollapsible button{display:none}.ol-zoomslider{top:4.5em;left:.5em;height:200px}.ol-zoomslider button{position:relative;height:10px}.ol-touch .ol-zoomslider{top:5.5em}.ol-overviewmap{left:.5em;bottom:.5em}.ol-overviewmap.ol-uncollapsible{bottom:0;left:0;border-radius:0 4px 0 0}.ol-overviewmap .ol-overviewmap-map,.ol-overviewmap button{display:inline-block}.ol-overviewmap .ol-overviewmap-map{border:1px solid #7b98bc;height:150px;margin:2px;width:150px}.ol-overviewmap:not(.ol-collapsed) button{bottom:1px;left:2px;position:absolute}.ol-overviewmap.ol-collapsed .ol-overviewmap-map,.ol-overviewmap.ol-uncollapsible button{display:none}.ol-overviewmap:not(.ol-collapsed){background:rgba(255,255,255,.8)}.ol-overviewmap-box{border:2px dotted rgba(0,60,136,.7)}.ol-overviewmap .ol-overviewmap-box:hover{cursor:move}
.maps.svelte-g8bt9.svelte-g8bt9{height:100%;flex-grow:1;display:flex;flex-direction:column;overflow:hidden;position:relative}.tabs.svelte-g8bt9.svelte-g8bt9{top:0;right:0;position:absolute;padding:0.5em}.tabs.svelte-g8bt9 li a.svelte-g8bt9{background:white}.ol-container.svelte-g8bt9.svelte-g8bt9{flex-grow:1;height:100%;position:relative}#ol.svelte-l06dta{position:absolute;width:100%;height:100%}.select-container.svelte-l06dta{bottom:0;right:0;position:absolute;padding:0.5em}#ol.svelte-1ngyv2x{position:absolute;width:100%;height:100%}.maps.svelte-jokzjz.svelte-jokzjz.svelte-jokzjz{list-style-type:none;display:flex;flex-direction:row;overflow-x:hidden;margin:0;padding:5px;flex-shrink:0}.maps.svelte-jokzjz .map.svelte-jokzjz.svelte-jokzjz{margin:5px;padding:0;height:100px;width:100px;flex-shrink:0}.maps.svelte-jokzjz .map button.svelte-jokzjz.svelte-jokzjz{cursor:pointer;width:100%;height:100%;display:inline-block;position:relative;border:none;background:none}.maps.svelte-jokzjz .map button.selected.svelte-jokzjz.svelte-jokzjz{border-style:solid;border-width:2px}.maps.svelte-jokzjz .map button.svelte-jokzjz>.svelte-jokzjz{top:0;left:0;position:absolute;width:100%;height:100%}.maps.svelte-jokzjz .map button .index.svelte-jokzjz.svelte-jokzjz{padding:0.5em;text-shadow:0 0 2px white}img.single.svelte-1qy1r73{top:0;left:0;position:absolute;width:100%;height:100%;object-fit:cover}.ReactQueryDevtools{margin-top:0}
          `}</style>
          {siteTheme && siteTheme.assets.css
            ? siteTheme.assets.css.map(item => (
                <link
                  key={item}
                  rel="stylesheet"
                  href={item.startsWith('http') ? item : `/s/${site.slug}/themes/${siteTheme.id}/public/${item}`}
                />
              ))
            : null}
          {siteTheme && siteTheme.assets.js
            ? siteTheme.assets.js.map(item => (
                <script
                  key={item}
                  type="application/javascript"
                  src={item.startsWith('http') ? item : `/s/${site.slug}/themes/${siteTheme.id}/public/${item}`}
                />
              ))
            : null}
          {siteTheme && siteTheme.html.inlineJs
            ? siteTheme.html.inlineJs.map((inlined, n) => (
                <script key={n} type="application/javascript" dangerouslySetInnerHTML={{ __html: inlined }} />
              ))
            : null}
        </Helmet>
        {userBarAbove ? <UserBar user={user} /> : null}
        {themeHeader ? <RenderFragment fragment={themeHeader} /> : null}
        {!userBarAbove ? <UserBar user={user} /> : null}
        <GlobalSiteHeader menu={<GlobalSiteNavigation />} />
        <SiteContainerBackground>
          <SiteContainer className={siteTheme?.classNames?.main} lang={i18n.language} dir={viewingDirection}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </SiteContainer>
        </SiteContainerBackground>
        <GlobalSiteFooter menu={<GlobalSiteNavigation />} />
        <GlobalFooter />
        {siteTheme && siteTheme.assets.footerJs
          ? siteTheme.assets.footerJs.map(item => (
              <script
                key={item}
                type="application/javascript"
                src={item.startsWith('http') ? item : `/s/${site.slug}/themes/${siteTheme.id}/public/${item}`}
              />
            ))
          : null}
        {siteTheme && siteTheme.html.footerInlineJs
          ? siteTheme.html.footerInlineJs.map((inlined, n) => (
              <script key={n} type="application/javascript" dangerouslySetInnerHTML={{ __html: inlined }} />
            ))
          : null}
      </ConfigProvider>
    );
  },
  {
    hooks: [
      {
        creator: () => [],
        name: 'getUserDetails',
      },
    ],
    getKey: () => {
      return ['root-config', []];
    },
    getData: async (key, vars, api) => {
      const project = api.getSiteConfiguration();
      const navigation = api.pageBlocks.getPageNavigation();

      return {
        project: await project,
        navigation: (await navigation).navigation,
      };
    },
  }
);
