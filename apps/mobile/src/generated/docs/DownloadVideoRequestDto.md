
# DownloadVideoRequestDto


## Properties

Name | Type
------------ | -------------
`videoId` | string
`quality` | string
`commentsLimit` | number
`commentsFrom` | number
`downloadComments` | boolean

## Example

```typescript
import type { DownloadVideoRequestDto } from ''

// TODO: Update the object below with actual values
const example = {
  "videoId": null,
  "quality": null,
  "commentsLimit": null,
  "commentsFrom": null,
  "downloadComments": null,
} satisfies DownloadVideoRequestDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DownloadVideoRequestDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


