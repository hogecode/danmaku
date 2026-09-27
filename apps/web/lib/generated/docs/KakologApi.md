# KakologApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**kakologControllerDownloadComments**](#kakologcontrollerdownloadcomments) | **POST** /api/kakolog/download/comments | POST /api/kakolog/download/comments  チャンネルの時間範囲内のコメントを DPlayer 形式で取得|

# **kakologControllerDownloadComments**
> GetKakologCommentsResponseDto kakologControllerDownloadComments(getKakologCommentsRequestDto)


### Example

```typescript
import {
    KakologApi,
    Configuration,
    GetKakologCommentsRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new KakologApi(configuration);

let getKakologCommentsRequestDto: GetKakologCommentsRequestDto; //

const { status, data } = await apiInstance.kakologControllerDownloadComments(
    getKakologCommentsRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **getKakologCommentsRequestDto** | **GetKakologCommentsRequestDto**|  | |


### Return type

**GetKakologCommentsResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

