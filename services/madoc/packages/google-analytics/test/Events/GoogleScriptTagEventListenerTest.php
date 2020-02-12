<?php

namespace GoogleAnalytics\Events;

use Omeka\Settings\Settings;
use Omeka\Test\TestCase;
use Zend\View\Helper\HeadScript;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\JsonRenderer;
use Zend\View\Renderer\PhpRenderer;
use Zend\View\Renderer\RendererInterface;
use Zend\View\ViewEvent;

class GoogleScriptTagEventListenerTest extends TestCase
{
    const GA_KEY_VALUE = 'TEST_ANALYTICS_KEY';

    /**
     * Verify that the tracking code isn't inserted into templates containing the string 'admin'.
     */
    public function testShouldNotAppearOnAdminPages()
    {
        $headScript = new HeadScript();
        $renderer = $this->getRendererMock($headScript);
        $settings = $this->getSettingsMock(self::GA_KEY_VALUE);
        $event = $this->getViewEventStub($renderer, '/admin/index');

        $listener = new GoogleScriptTagEventListener($settings);
        $listener($event);

        $this->assertEmpty($headScript->toString(), "<head> tag should not contain tracking code on admin pages");
    }

    /**
     * Verify that the tracking code isn't inserted into templates when the admin has yet to setup a tracking ID.
     */
    public function testShouldNotAppearWhenNotConfigured()
    {
        $headScript = new HeadScript();
        $renderer = $this->getRendererMock($headScript);
        $settings = $this->getSettingsMock(null);
        $event = $this->getViewEventStub($renderer, '/child/site/page');

        $listener = new GoogleScriptTagEventListener($settings);
        $listener($event);

        $this->assertEmpty($headScript->toString(), "<head> tag should not contain analytics code when no tracking id is present");
    }

    /**
     * Tests that the listener has no interactions with the renderer when an inapplicable view event containing
     * a JSON model is fired.
     */
    public function testShouldNotAppearForInapplicableJsonModel()
    {
        $settings = $this->getSettingsMock(null);
        $renderer = $this->getMock(JsonRenderer::class, ['escapeJs', 'headScript']);
        $event = new ViewEvent();
        $event->setModel(new JsonModel());
        $event->setRenderer(new JsonRenderer());

        $listener = new GoogleScriptTagEventListener($settings);
        $listener($event);

        $renderer
            ->expects($this->never())
            ->method($this->anything());
    }

    /**
     * Verify that the tracking code is inserted correctly when a valid tracking ID exists and there is no reason
     * to otherwise prevent the tracking code from loading.
     */
    public function testShouldAppearWhenConfigured()
    {
        $headScript = new HeadScript();
        $renderer = $this->getRendererMock($headScript);
        $settings = $this->getSettingsMock(self::GA_KEY_VALUE);
        $event = $this->getViewEventStub($renderer, '/child/site/page');

        $listener = new GoogleScriptTagEventListener($settings);
        $listener($event);

        $this->assertContains(self::GA_KEY_VALUE, $headScript->toString(), 'Expected to find Google Analytics code in <head> tag');
    }

    /**
     * Create a new stub {@link ViewEvent} that has a 2 level ViewModel tree (layout -> page) using the given
     * {@link RendererInterface}.
     *
     * @param RendererInterface $renderer
     * @param string $childTemplate
     * @return ViewEvent
     */
    private function getViewEventStub(RendererInterface $renderer, $childTemplate)
    {
        $event = new ViewEvent('name', 'target');
        $rootModel = new ViewModel();
        $rootModel->setTemplate('layout/layout');
        $childModel = new ViewModel();
        $childModel->setTemplate($childTemplate);
        $rootModel->addChild($childModel);
        $event->setModel($rootModel);
        $event->setRenderer($renderer);

        return $event;
    }

    /**
     * Create a new mock of a {@link PhpRenderer} with a given {@link HeadScript} as a stub.
     *
     * @param HeadScript $script
     * @return RendererInterface
     */
    private function getRendererMock(HeadScript $script)
    {
        $renderer = $this->getMock(PhpRenderer::class, ['escapeJs', 'headScript']);
        $renderer->method('escapeJs')
            ->willReturnArgument(0);

        $renderer
            ->expects($this->any())
            ->method('headScript')
            ->willReturn($script);

        return $renderer;
    }

    /**
     * Creates an Omeka {@link Settings} mock with the 'google_analytics_key' mocked to {@code $value}.
     * @param $value
     * @return Settings
     */
    private function getSettingsMock($value)
    {
        $settings = $this->getMockBuilder(Settings::class)
            ->disableOriginalConstructor()
            ->getMock();

        $settings
            ->method('get')
            ->with(
                $this->equalTo('google_analytics_key'),
                $this->anything()
            )
            ->willReturn($value);

        return $settings;
    }
}
