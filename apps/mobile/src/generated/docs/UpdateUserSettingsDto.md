
# UpdateUserSettingsDto


## Properties

Name | Type
------------ | -------------
`theme` | string
`language` | string
`danmakuMaxCount` | number
`ngWordsReg` | Array&lt;string&gt;

## Example

```typescript
import type { UpdateUserSettingsDto } from ''

// TODO: Update the object below with actual values
const example = {
  "theme": null,
  "language": null,
  "danmakuMaxCount": null,
  "ngWordsReg": null,
} satisfies UpdateUserSettingsDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateUserSettingsDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


