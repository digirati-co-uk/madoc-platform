# Adding new Omeka fixtures

Export the table from the command-line
```
bin/madoc test-instance-dump-omeka TABLE_NAME
```

If it's just an update to the existing fixture - this is all you need to do. If it is a new 
table, you need to also update the `docker-compose.test.yml`

Under the `madoc-database` entry you will find the list of fixtures volumed in:
```yaml
madoc-database:
    volumes:
      # Example fixture
      - ./e2e/test-fixtures/omeka/user.sql:/docker-entrypoint-initdb.d/99-user.sql

      # Add your fixture here, replacing TABLE_NAME in both places
      - ./e2e/test-fixtures/omeka/TABLE_NAME.sql:/docker-entrypoint-initdb.d/99-TABLE_NAME.sql
```
