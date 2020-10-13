Feature: Capture model editor permissions

  Background:
    Given I am using the "empty-site-users" site template

  Scenario: Viewer should not see the editor
    Given I have logged in as "Viewer" on site "1"

  Scenario: Limited reviewer should be able to see the editor
    Given I have logged in as "Limited reviewer" on site "1"
    # I can see the UI for adding a contribution

  Scenario: Transcriber should see the editor
    Given I have logged in as "Transcriber" on site "1"
    # I can see the UI for adding a contribution

  Scenario: Limited contributor should only see editor when task is assigned to them
    Given I have logged in as "Limited contributor" on site "1"
    # I cannot see the UI for adding a contribution

  Scenario: Admin should see the editor
    Given I have logged in as "admin" on site "1"
    # I can see the UI for adding a contribution
