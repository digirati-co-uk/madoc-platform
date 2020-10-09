Feature: Basic homepage test

  Background:
    Given I am using the "empty-site-users" site template

  Scenario:
    Given I have logged in as "Reviewer" on site "1"
    When I open the "Home page"
    Then I should see "Default site" in the "Title" of the "Header"
    When I open the "User dashboard"
    Then I should see "Welcome back admin" in "Heading 1" on the "Page"
