# DriveConnectionInitiateResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**authorize_url** | **string** | OAuth認可URL | [default to undefined]
**state** | **string** | CSRF対策用ステート | [default to undefined]
**expires_in** | **number** | ステート有効期限（秒） | [default to undefined]

## Example

```typescript
import { DriveConnectionInitiateResponseDto } from './api';

const instance: DriveConnectionInitiateResponseDto = {
    authorize_url,
    state,
    expires_in,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
