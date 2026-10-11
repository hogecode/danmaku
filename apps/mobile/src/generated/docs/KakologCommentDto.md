
# KakologCommentDto


## Properties

Name | Type
------------ | -------------
`time` | number
`type` | string
`size` | string
`color` | string
`author` | string
`text` | string

## Example

```typescript
import type { KakologCommentDto } from ''

// TODO: Update the object below with actual values
const example = {
  "time": null,
  "type": null,
  "size": null,
  "color": null,
  "author": null,
  "text": null,
} satisfies KakologCommentDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as KakologCommentDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


