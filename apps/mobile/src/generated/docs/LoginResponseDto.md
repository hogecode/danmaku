
# LoginResponseDto


## Properties

Name | Type
------------ | -------------
`authorizeUrl` | string
`state` | string
`expiresIn` | number

## Example

```typescript
import type { LoginResponseDto } from ''

// TODO: Update the object below with actual values
const example = {
  "authorizeUrl": null,
  "state": null,
  "expiresIn": null,
} satisfies LoginResponseDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LoginResponseDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


