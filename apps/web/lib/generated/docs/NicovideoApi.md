# NicovideoApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**nicovideoControllerDownloadComments**](#nicovideocontrollerdownloadcomments) | **POST** /api/nicovideo/download/comments | POST /api/nicovideo/download/comments  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 &#x3D; 非公開動画またはコメント機能無効  TODO: レスポンスDTOを定義|

# **nicovideoControllerDownloadComments**
> nicovideoControllerDownloadComments(downloadCommentRequestDto)


### Example

```typescript
import {
    NicovideoApi,
    Configuration,
    DownloadCommentRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new NicovideoApi(configuration);

let downloadCommentRequestDto: DownloadCommentRequestDto; //

const { status, data } = await apiInstance.nicovideoControllerDownloadComments(
    downloadCommentRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **downloadCommentRequestDto** | **DownloadCommentRequestDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

