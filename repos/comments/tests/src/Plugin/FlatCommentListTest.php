<?php

namespace Comments\Tests\Plugin;

use Comments\Plugin\FlatCommentList;
use Comments\Plugin\StaticComment;
use Comments\Plugin\StaticParticipator;
use Comments\Plugin\StaticSubject;
use PHPUnit\Framework\TestCase;

class FlatCommentListTest extends TestCase
{
    public function test_can_instantiate_empty()
    {
        $this->assertNotNull(
            new FlatCommentList()
        );
    }

    public function test_can_instantiate_empty_array()
    {
        $this->assertNotNull(
            new FlatCommentList(...[])
        );
    }

    public function test_can_instantiate_with_options()
    {
        $this->assertNotNull(
            new FlatCommentList(
                new StaticComment(
                    'My awesome comment',
                    new StaticParticipator('1', 'Bob'),
                    new StaticSubject('1', 'Something interesting', '#')
                ),
                new StaticComment(
                    'My awesome comment 2',
                    new StaticParticipator('2', 'Alice'),
                    new StaticSubject('1', 'Something interesting', '#')
                )
            )
        );
    }

    public function test_can_be_sliced()
    {
        $list = new FlatCommentList(
            new StaticComment(
                'My awesome comment',
                new StaticParticipator('1', 'Bob'),
                new StaticSubject('1', 'Something interesting', '#')
            ),
            new StaticComment(
                'My awesome comment 2',
                new StaticParticipator('2', 'Alice'),
                new StaticSubject('1', 'Something interesting', '#')
            )
        );

        $this->assertEquals(count($list->getComments()), 2);
        $this->assertEquals(count($list->getComments(1)), 1);
    }
}
