# Dynamic data sources
This extension allows dynamic data sources to be defined and loaded when a capture model is created.

## Function of the extension
When a capture model is cloned, the following will happen:
- Detect if any of the fields in the capture model have data sources defined
- Load related code for generating data source, passing in the current resource and API
- Request the new value from the dynamic data source
- Return the model

### Persisting data on publish
This might not be in the scope of this but when data is saved (revision approved) then this extension
could detect and persist the linked properties back to the source. This is not current planned.


### Possible uses
In madoc there is a lot of sources of data that could be cycled like this in a project.

- Plain text transcriptions
- Canvas labels
- Metadata pairs
- Tags or JSON-LD documents that can be associated
