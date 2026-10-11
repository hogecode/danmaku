
# VideoDownloadStatusResponseDtoResult


## Properties

Name | Type
------------ | -------------
`fileName` | string
`s3Key` | string
`s3Url` | string
`fileSize` | number
`duration` | number
`title` | string
`commentCount` | number
`completedAt` | string

## Example

```typescript
import type { VideoDownloadStatusResponseDtoResult } from ''

// TODO: Update the object below with actual values
const example = {
  "fileName": null,
  "s3Key": null,
  "s3Url": null,
  "fileSize": null,
  "duration": null,
  "title": null,
  "commentCount": null,
  "completedAt": null,
} satisfies VideoDownloadStatusResponseDtoResult

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as VideoDownloadStatusResponseDtoResult
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


