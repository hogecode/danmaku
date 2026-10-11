# KakologApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**kakologControllerDownloadComments**](KakologApi.md#kakologcontrollerdownloadcomments) | **POST** /api/kakolog/download/comments | POST /api/kakolog/download/comments  チャンネルの時間範囲内のコメントを DPlayer 形式で取得 |



## kakologControllerDownloadComments

> GetKakologCommentsResponseDto kakologControllerDownloadComments(getKakologCommentsRequestDto)

POST /api/kakolog/download/comments  チャンネルの時間範囲内のコメントを DPlayer 形式で取得

### Example

```ts
import {
  Configuration,
  KakologApi,
} from '';
import type { KakologControllerDownloadCommentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new KakologApi();

  const body = {
    // GetKakologCommentsRequestDto
    getKakologCommentsRequestDto: ...,
  } satisfies KakologControllerDownloadCommentsRequest;

  try {
    const data = await api.kakologControllerDownloadComments(body);
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
| **getKakologCommentsRequestDto** | [GetKakologCommentsRequestDto](GetKakologCommentsRequestDto.md) |  | |

### Return type

[**GetKakologCommentsResponseDto**](GetKakologCommentsResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

