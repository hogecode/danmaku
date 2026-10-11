
# GetKakologCommentsResponseDto


## Properties

Name | Type
------------ | -------------
`status` | string
`message` | string
`channelId` | string
`startTime` | number
`endTime` | number
`commentCount` | number
`retrievedCount` | number
`comments` | [Array&lt;KakologCommentDto&gt;](KakologCommentDto.md)

## Example

```typescript
import type { GetKakologCommentsResponseDto } from ''

// TODO: Update the object below with actual values
const example = {
  "status": null,
  "message": null,
  "channelId": null,
  "startTime": null,
  "endTime": null,
  "commentCount": null,
  "retrievedCount": null,
  "comments": null,
} satisfies GetKakologCommentsResponseDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetKakologCommentsResponseDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


