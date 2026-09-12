# UserInfoDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**email** | **string** |  | [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**picture_url** | **string** |  | [optional] [default to undefined]
**last_login** | **string** |  | [optional] [default to undefined]
**drives** | [**Array&lt;DriveConnectionDto&gt;**](DriveConnectionDto.md) |  | [default to undefined]

## Example

```typescript
import { UserInfoDto } from './api';

const instance: UserInfoDto = {
    id,
    email,
    name,
    picture_url,
    last_login,
    drives,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
