
# DriveConnectionDto


## Properties

Name | Type
------------ | -------------
`id` | string
`provider` | string
`account` | string
`status` | string
`connectedAt` | Date

## Example

```typescript
import type { DriveConnectionDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "provider": null,
  "account": null,
  "status": null,
  "connectedAt": null,
} satisfies DriveConnectionDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DriveConnectionDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


