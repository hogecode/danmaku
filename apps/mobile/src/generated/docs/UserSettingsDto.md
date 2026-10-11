
# UserSettingsDto


## Properties

Name | Type
------------ | -------------
`id` | string
`userId` | string
`theme` | string
`language` | string
`danmakuMaxCount` | number
`ngWordsReg` | Array&lt;string&gt;
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { UserSettingsDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "userId": null,
  "theme": null,
  "language": null,
  "danmakuMaxCount": null,
  "ngWordsReg": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies UserSettingsDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserSettingsDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


