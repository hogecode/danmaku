# GetKakologCommentsResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **string** |  | [default to undefined]
**message** | **string** |  | [optional] [default to undefined]
**channelId** | **string** |  | [default to undefined]
**startTime** | **number** |  | [default to undefined]
**endTime** | **number** |  | [default to undefined]
**commentCount** | **number** |  | [default to undefined]
**retrievedCount** | **number** |  | [default to undefined]
**comments** | [**Array&lt;KakologCommentDto&gt;**](KakologCommentDto.md) |  | [default to undefined]

## Example

```typescript
import { GetKakologCommentsResponseDto } from './api';

const instance: GetKakologCommentsResponseDto = {
    status,
    message,
    channelId,
    startTime,
    endTime,
    commentCount,
    retrievedCount,
    comments,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
