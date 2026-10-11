# NicovideoApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**nicovideoControllerCancelDownload**](NicovideoApi.md#nicovideocontrollercanceldownload) | **DELETE** /api/nicovideo/download/{jobId} | DELETE /api/nicovideo/download/:jobId  ダウンロードジョブをキャンセル |
| [**nicovideoControllerDownloadComments**](NicovideoApi.md#nicovideocontrollerdownloadcomments) | **POST** /api/nicovideo/download/comments | POST /api/nicovideo/download/comments  ニコ動のコメントを取得して DPlayer 形式に変換  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 &#x3D; 非公開動画またはコメント機能無効 4. ニコ動形式のコメント → DPlayer形式に変換 |
| [**nicovideoControllerGetDownloadProgress**](NicovideoApi.md#nicovideocontrollergetdownloadprogress) | **GET** /api/nicovideo/download/progress/{jobId}/sse | GET /api/nicovideo/download/progress/:jobId/sse  Server-Sent Events で進捗をリアルタイム配信 |
| [**nicovideoControllerGetDownloadStatus**](NicovideoApi.md#nicovideocontrollergetdownloadstatus) | **GET** /api/nicovideo/download/status/{jobId} | GET /api/nicovideo/download/status/:jobId  ダウンロードジョブのステータスを確認 |
| [**nicovideoControllerStartVideoDownload**](NicovideoApi.md#nicovideocontrollerstartvideodownload) | **POST** /api/nicovideo/download/video | POST /api/nicovideo/download/video  非同期で動画ダウンロードを開始 ジョブIDを即座に返す |



## nicovideoControllerCancelDownload

> VideoDownloadCancelResponseDto nicovideoControllerCancelDownload(jobId)

DELETE /api/nicovideo/download/:jobId  ダウンロードジョブをキャンセル

### Example

```ts
import {
  Configuration,
  NicovideoApi,
} from '';
import type { NicovideoControllerCancelDownloadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new NicovideoApi();

  const body = {
    // string
    jobId: jobId_example,
  } satisfies NicovideoControllerCancelDownloadRequest;

  try {
    const data = await api.nicovideoControllerCancelDownload(body);
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
| **jobId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**VideoDownloadCancelResponseDto**](VideoDownloadCancelResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## nicovideoControllerDownloadComments

> DownloadCommentWithDPlayerResponseDto nicovideoControllerDownloadComments(downloadCommentRequestDto)

POST /api/nicovideo/download/comments  ニコ動のコメントを取得して DPlayer 形式に変換  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 &#x3D; 非公開動画またはコメント機能無効 4. ニコ動形式のコメント → DPlayer形式に変換

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

[**DownloadCommentWithDPlayerResponseDto**](DownloadCommentWithDPlayerResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## nicovideoControllerGetDownloadProgress

> nicovideoControllerGetDownloadProgress(jobId)

GET /api/nicovideo/download/progress/:jobId/sse  Server-Sent Events で進捗をリアルタイム配信

### Example

```ts
import {
  Configuration,
  NicovideoApi,
} from '';
import type { NicovideoControllerGetDownloadProgressRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new NicovideoApi();

  const body = {
    // string
    jobId: jobId_example,
  } satisfies NicovideoControllerGetDownloadProgressRequest;

  try {
    const data = await api.nicovideoControllerGetDownloadProgress(body);
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
| **jobId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## nicovideoControllerGetDownloadStatus

> VideoDownloadStatusResponseDto nicovideoControllerGetDownloadStatus(jobId)

GET /api/nicovideo/download/status/:jobId  ダウンロードジョブのステータスを確認

### Example

```ts
import {
  Configuration,
  NicovideoApi,
} from '';
import type { NicovideoControllerGetDownloadStatusRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new NicovideoApi();

  const body = {
    // string
    jobId: jobId_example,
  } satisfies NicovideoControllerGetDownloadStatusRequest;

  try {
    const data = await api.nicovideoControllerGetDownloadStatus(body);
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
| **jobId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**VideoDownloadStatusResponseDto**](VideoDownloadStatusResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## nicovideoControllerStartVideoDownload

> VideoDownloadStartResponseDto nicovideoControllerStartVideoDownload(downloadVideoRequestDto)

POST /api/nicovideo/download/video  非同期で動画ダウンロードを開始 ジョブIDを即座に返す

### Example

```ts
import {
  Configuration,
  NicovideoApi,
} from '';
import type { NicovideoControllerStartVideoDownloadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new NicovideoApi();

  const body = {
    // DownloadVideoRequestDto
    downloadVideoRequestDto: ...,
  } satisfies NicovideoControllerStartVideoDownloadRequest;

  try {
    const data = await api.nicovideoControllerStartVideoDownload(body);
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
| **downloadVideoRequestDto** | [DownloadVideoRequestDto](DownloadVideoRequestDto.md) |  | |

### Return type

[**VideoDownloadStartResponseDto**](VideoDownloadStartResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

