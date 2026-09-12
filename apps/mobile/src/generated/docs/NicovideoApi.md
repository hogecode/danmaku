# NicovideoApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**nicovideoControllerDownloadComments**](NicovideoApi.md#nicovideocontrollerdownloadcomments) | **POST** /api/nicovideo/download/comments | POST /api/nicovideo/download/comments  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 &#x3D; 非公開動画またはコメント機能無効  TODO: レスポンスDTOを定義 |



## nicovideoControllerDownloadComments

> nicovideoControllerDownloadComments(downloadCommentRequestDto)

POST /api/nicovideo/download/comments  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 &#x3D; 非公開動画またはコメント機能無効  TODO: レスポンスDTOを定義

### Example

```ts
import {
  Configuration,
  NicovideoApi,
} from '';
import type { NicovideoControllerDownloadCommentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new NicovideoApi();

  const body = {
    // DownloadCommentRequestDto
    downloadCommentRequestDto: ...,
  } satisfies NicovideoControllerDownloadCommentsRequest;

  try {
    const data = await api.nicovideoControllerDownloadComments(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **downloadCommentRequestDto** | [DownloadCommentRequestDto](DownloadCommentRequestDto.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

