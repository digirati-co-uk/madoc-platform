# Saving a test environment
Start an empty environment
```
bin/madoc test-instance
```

Set up madoc, and then run:
```
bin/madoc test-instance-dump-postgres
```

Will create a file in this folder `default.sql`. Open and remove the schema creation.

Move the `default.sql` into the `./default` folder.

Remove the existing test environment
```
bin/madoc test-instance-down
```

And start it again, your changes will be at the point of the DB dump.
```
bin/madoc test-instance
```

In future this will be in a submodule and E2E tests ran against it.
