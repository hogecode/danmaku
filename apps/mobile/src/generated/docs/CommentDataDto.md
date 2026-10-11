
# CommentDataDto


## Properties

Name | Type
------------ | -------------
`title` | string
`commentCount` | number
`retrievedCount` | number
`threads` | number

## Example

```typescript
import type { CommentDataDto } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "commentCount": null,
  "retrievedCount": null,
  "threads": null,
} satisfies CommentDataDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CommentDataDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


