Bugs & Incomplete features:
- Tab dragging doesn't change tab to new column when released, also has incorrect position.
- Autocomplete has a tendency to add extra characters, also it's not easy to use.
- Javascript inheritence shortcut does not work.
- cleanup console.log spam
- when project list view is open and columns are resized before going back to one column the project list view will take up more space

Things I want:
- Renderer should indicate to main that it is fully loaded and ready.
- Project view folder collapse, and better indication of depth.
- Project view file search.
- ```src/shared/config.js``` is an inconvenient place for plugin things, editor could probably look in ``src/plugins`` instead.
- better indication that a gcc style line error can be clicked
- set charset/encoding for open & save to something specific 