Feature: Basic user permissions

  Background:
    Given I am using the "empty-site-users" site template

  Scenario: Users stays logged in with JWT
    Given I have logged in as "Viewer" on site "1"

    When I open the "Home page"
    Then I should see "Default site" in the "Title" of the "Header"

    When I open the "User dashboard"
    Then I should see "Welcome back Viewer" in "Heading 1" on the "Page"


  Scenario: Viewer should only navigation relevant to my role
    Given I have logged in as "Viewer" on site "1"

    When I open the "User dashboard"
    Then I should see 3 "Nav items" inside the "Page navigation"
    And I should see a "Nav item" in "Page navigation" containing "Projects"
    And I should see a "Nav item" in "Page navigation" containing "Collections"
    And I should see a "Nav item" in "Page navigation" containing "Manage account"
    And I should see "Welcome back Viewer" in "Heading 1" on the "Page"

    When I open the "Admin dashboard"
    Then I should be redirected to the "Home page"

    When I open the "Site projects" page
    Then I should see 4 "Project containers"
    And I should see 1 "Project status container" containing "This project is published"

  Scenario: Reviewer should only navigation relevant to my role
    Given I have logged in as "Reviewer" on site "1"
    When I open the "User dashboard"
    Then I should see 4 "Nav items" inside the "Page navigation"
    And I should see a "Nav item" in "Page navigation" containing "Projects"
    And I should see a "Nav item" in "Page navigation" containing "Collections"
    And I should see a "Nav item" in "Page navigation" containing "Manage account"
    And I should see a "Nav item" in "Page navigation" containing "All tasks"
    And I should see "Welcome back Reviewer" in "Heading 1" on the "Page"

    When I open the "Admin dashboard"
    Then I should be redirected to the "Home page"

    When I open the "Site projects" page
    Then I should see 4 "Project containers"
    And I should see 1 "Project status container" containing "This project is published"

  Scenario: Limited reviewer should only navigation relevant to my role
    Given I have logged in as "Limited reviewer" on site "1"
    When I open the "User dashboard"
    Then I should see 4 "Nav items" inside the "Page navigation"
    And I should see a "Nav item" in "Page navigation" containing "Projects"
    And I should see a "Nav item" in "Page navigation" containing "Collections"
    And I should see a "Nav item" in "Page navigation" containing "Manage account"
    And I should see a "Nav item" in "Page navigation" containing "All tasks"
    And I should see "Welcome back Limited reviewer" in "Heading 1" on the "Page"

    When I open the "Admin dashboard"
    Then I should be redirected to the "Home page"

    When I open the "Site projects" page
    Then I should see 4 "Project containers"
    And I should see 1 "Project status container" containing "This project is published"

  Scenario: Transcriber should only navigation relevant to my role
    Given I have logged in as "Transcriber" on site "1"
    When I open the "User dashboard"
    Then I should see 4 "Nav items" inside the "Page navigation"
    And I should see a "Nav item" in "Page navigation" containing "Projects"
    And I should see a "Nav item" in "Page navigation" containing "Collections"
    And I should see a "Nav item" in "Page navigation" containing "Manage account"
    And I should see a "Nav item" in "Page navigation" containing "All tasks"
    And I should see "Welcome back Transcriber" in "Heading 1" on the "Page"

    When I open the "Admin dashboard"
    Then I should be redirected to the "Home page"

    When I open the "Site projects" page
    Then I should see 4 "Project containers"
    And I should see 1 "Project status container" containing "This project is published"

  Scenario: Limited Transcriber should only navigation relevant to my role
    Given I have logged in as "Limited contributor" on site "1"
    When I open the "User dashboard"
    Then I should see 4 "Nav items" inside the "Page navigation"
    And I should see a "Nav item" in "Page navigation" containing "Projects"
    And I should see a "Nav item" in "Page navigation" containing "Collections"
    And I should see a "Nav item" in "Page navigation" containing "Manage account"
    And I should see a "Nav item" in "Page navigation" containing "All tasks"
    And I should see "Welcome back Limited contributor" in "Heading 1" on the "Page"

    When I open the "Admin dashboard"
    Then I should be redirected to the "Home page"

    When I open the "Site projects" page
    Then I should see 4 "Project containers"
    And I should see 1 "Project status container" containing "This project is published"

  Scenario: Administrator should only navigation relevant to my role
    Given I have logged in as "admin" on site "1"
    When I open the "User dashboard"
    Then I should see 5 "Nav items" inside the "Page navigation"
    And I should see a "Nav item" in "Page navigation" containing "Projects"
    And I should see a "Nav item" in "Page navigation" containing "Collections"
    And I should see a "Nav item" in "Page navigation" containing "Manage account"
    And I should see a "Nav item" in "Page navigation" containing "All tasks"
    And I should see a "Nav item" in "Page navigation" containing "Admin"
    And I should see "Welcome back admin" in "Heading 1" on the "Page"

    When I open the "Admin dashboard"
    Then I should see "Site admin" in the "Admin page title"

    When I open the "Site projects" page
    Then I should see 5 "Project containers"
    And I should see 1 "Project status container" containing "This project is published"
    And I should see 1 "Project status container" containing "This project is paused, only you can see it"
    And I should see 1 "Project status container" containing "This project is archived, only you can see it"

