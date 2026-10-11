
# VideoDownloadStatusResponseDto


## Properties

Name | Type
------------ | -------------
`jobId` | string
`status` | string
`videoId` | string
`progress` | [VideoDownloadStatusResponseDtoProgress](VideoDownloadStatusResponseDtoProgress.md)
`result` | [VideoDownloadStatusResponseDtoResult](VideoDownloadStatusResponseDtoResult.md)

## Example

```typescript
import type { VideoDownloadStatusResponseDto } from ''

// TODO: Update the object below with actual values
const example = {
  "jobId": null,
  "status": null,
  "videoId": null,
  "progress": null,
  "result": null,
} satisfies VideoDownloadStatusResponseDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as VideoDownloadStatusResponseDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


