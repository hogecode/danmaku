# NicovideoApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**nicovideoControllerCancelDownload**](#nicovideocontrollercanceldownload) | **DELETE** /api/nicovideo/download/{jobId} | DELETE /api/nicovideo/download/:jobId  ダウンロードジョブをキャンセル|
|[**nicovideoControllerDownloadComments**](#nicovideocontrollerdownloadcomments) | **POST** /api/nicovideo/download/comments | POST /api/nicovideo/download/comments  ニコ動のコメントを取得して DPlayer 形式に変換  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 &#x3D; 非公開動画またはコメント機能無効 4. ニコ動形式のコメント → DPlayer形式に変換|
|[**nicovideoControllerGetDownloadProgress**](#nicovideocontrollergetdownloadprogress) | **GET** /api/nicovideo/download/progress/{jobId}/sse | GET /api/nicovideo/download/progress/:jobId/sse  Server-Sent Events で進捗をリアルタイム配信|
|[**nicovideoControllerGetDownloadStatus**](#nicovideocontrollergetdownloadstatus) | **GET** /api/nicovideo/download/status/{jobId} | GET /api/nicovideo/download/status/:jobId  ダウンロードジョブのステータスを確認|
|[**nicovideoControllerStartVideoDownload**](#nicovideocontrollerstartvideodownload) | **POST** /api/nicovideo/download/video | POST /api/nicovideo/download/video  非同期で動画ダウンロードを開始 ジョブIDを即座に返す|

# **nicovideoControllerCancelDownload**
> VideoDownloadCancelResponseDto nicovideoControllerCancelDownload()


### Example

```typescript
import {
    NicovideoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NicovideoApi(configuration);

let jobId: string; // (default to undefined)

const { status, data } = await apiInstance.nicovideoControllerCancelDownload(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] |  | defaults to undefined|


### Return type

**VideoDownloadCancelResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nicovideoControllerDownloadComments**
> DownloadCommentWithDPlayerResponseDto nicovideoControllerDownloadComments(downloadCommentRequestDto)


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

**DownloadCommentWithDPlayerResponseDto**

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

# **nicovideoControllerGetDownloadProgress**
> nicovideoControllerGetDownloadProgress()


### Example

```typescript
import {
    NicovideoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NicovideoApi(configuration);

let jobId: string; // (default to undefined)

const { status, data } = await apiInstance.nicovideoControllerGetDownloadProgress(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nicovideoControllerGetDownloadStatus**
> VideoDownloadStatusResponseDto nicovideoControllerGetDownloadStatus()


### Example

```typescript
import {
    NicovideoApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new NicovideoApi(configuration);

let jobId: string; // (default to undefined)

const { status, data } = await apiInstance.nicovideoControllerGetDownloadStatus(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] |  | defaults to undefined|


### Return type

**VideoDownloadStatusResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nicovideoControllerStartVideoDownload**
> VideoDownloadStartResponseDto nicovideoControllerStartVideoDownload(downloadVideoRequestDto)


### Example

```typescript
import {
    NicovideoApi,
    Configuration,
    DownloadVideoRequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new NicovideoApi(configuration);

let downloadVideoRequestDto: DownloadVideoRequestDto; //

const { status, data } = await apiInstance.nicovideoControllerStartVideoDownload(
    downloadVideoRequestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **downloadVideoRequestDto** | **DownloadVideoRequestDto**|  | |


### Return type

**VideoDownloadStartResponseDto**

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

