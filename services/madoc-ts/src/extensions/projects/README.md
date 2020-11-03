# Project extensions

- A project extension can optionally be instantiated with a set of content
- A project extension can also choose the content automatically if needed
- A project extension can react to events during the project done through the API client
    - Task creation
    - Content added
    - Project status changes (paused / completed etc.)
- A project extensions specifies some react components for UI elements:
    - Project creation
    - Project homepage
    - Project advertisement (e.g. manifest page)
    - ...
- A project extension specifies default configuration
- A project extension can enable or disable specific configuration
- A project extension can define custom actions for the project

## Example 1: OCR correction project

The user experience for an OCR project should be:
- When I am on the "OCR ingest" page I can choose to correct the OCR of this manifest
- The project will be created with a model, and the content
- I can choose to open the project up to others or to do the correction myself
- Once I have completed the correction I can choose a custom action on the project to save the OCR back to the main service.
- If I choose to open up the OCR corrections publicly, I can choose to hide from project list
- I can choose to run the project without reviews and auto-accept contributions

The extension model will achieve this by:
- ...


## Example 2: Simple templates with pre-defined model

- I want to be able to create a project type that uses a static model template as a starting point.
- Auto-generated details for the project
- Automatic content if I choose content at the time.
- Default configuration chosen for me

## Extra changes

- "Add this to a project" button on manifest page
- "Add this to a project" button on collection page
- "Start project" from manifest page
- "Start project" from collection page
- A link to the frontend of the project to share
- List of reviewers when viewing a project
- List of contributors (active)
- Skip the contribution step - or make it more accessible
- A more complete overview of a project on the homepage
- Fill in the gaps on the crowdsourcing task list - make it easier to read.
- Distinct and clear when you are in a project versus when you are looking at a page
- Add "Collections" button to the menu by default when creating a site
- Add "Crowdsourcing" button to the menu by default when creating a site
- Create unified content selection widget with search and browse (single + multiple)

