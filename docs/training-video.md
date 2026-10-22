# Project training video

A project can offer a training video on its help page, open it from a header button, and show it automatically when a signed-in contributor opens a canvas or manifest contribution editor.

## Set up a video

1. Create a help page using the page editor and add **Training video (main project video)** to its body. Set the video link, title and introduction. YouTube and Vimeo page links, embed URLs, and direct MP4, WebM, Ogg or M4V files are supported. The provider must allow embedding.
2. In the project's **Configuration → Interface**, set **Training video help page** to that page's path, for example `/help/my-project`.
3. Enable **Show the training video on the contribution page until the volunteer marks it as watched** to show the reminder. Leave it off to offer replay only.
4. Optionally enable **Hide the training video button in the site header**. The video remains available on its help page.

The default header includes the replay button. A customized header slot needs a **Training video button** block added explicitly; enable that block's **Header button** setting if it should respect the project setting. The same button can be placed in other slots with project context. Projects without a valid video link show no button or automatic reminder.

Site configuration supplies defaults for projects. An explicitly empty project help-page path disables the video for that project. Existing customized editor slots must include the canvas or manifest model editor block to show the automatic prompt.

## Contributor experience

**Watch later and close**, the close control, Escape, or following the help link postpones an automatic reminder for 24 hours in that browser. If browser storage is unavailable, the video can appear again on the next contribution page.

**Mark as watched and close** asks for confirmation, then saves the preference for the signed-in account, site and project. A failed save leaves the dialog open with a retry message. Watched status is a manual acknowledgement; it does not measure playback. Replacing the project's video does not reset existing acknowledgements.

The header button always allows replay. Outside contribution pages it opens a simple player without watched controls. Each player also provides **Open video in a new tab** for cases where embedding is unavailable.

For translated videos, use the page editor's existing block language rules: give the language variants the same sort key and mark one as the fallback. The overlay selects the same language variant as the help page. Supply captions through the video provider or the video itself.

## Integration

The feature uses the `default.TrainingVideo` and `default.TrainingVideoButton` page blocks, the `trainingVideoPage` and `trainingVideoOptions` configuration fields, and authenticated `GET`/`POST /api/madoc/me/training-video` endpoints. Watched dates are stored under `user_preferences.trainingVideo[siteId][projectId]`; no database migration is required.

The implementation was extracted from Paul’s NLW commits `98c637c3948f79c2cefa8c1a5154975b28438fdc` and `14b97f8484a5207a473d8764ea09d0e3dd98e9eb`, with subsequent integration and accessibility fixes. Other changes from the NLW branch are excluded.
