# PlayerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**playerControllerGenerateVideoToken**](#playercontrollergeneratevideotoken) | **POST** /api/player/token | POST /api/player/token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token&#x3D;{jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）  TODO: userIdではなく、videoFileIdを使ってトークンを生成するように変更する|
|[**playerControllerGetComments**](#playercontrollergetcomments) | **GET** /api/player/comments/{videoFileId} | DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \&quot;aaa.mp4\&quot; - コメント: \&quot;aaa.xml\&quot; または \&quot;aaa.json\&quot; を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す|
|[**playerControllerStreamVideo**](#playercontrollerstreamvideo) | **GET** /api/player/stream/{connectionId}/{fileId} | 動画ファイルをストリーミング再生（マルチプロバイダー対応）|

# **playerControllerGenerateVideoToken**
> playerControllerGenerateVideoToken()


### Example

```typescript
import {
    PlayerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

const { status, data } = await apiInstance.playerControllerGenerateVideoToken();
```

### Parameters
This endpoint does not have any parameters.


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

# **playerControllerGetComments**
> DPlayerCommentListDto playerControllerGetComments()


### Example

```typescript
import {
    PlayerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let videoFileId: string; // (default to undefined)
let folderId: string; // (default to undefined)
let connectionId: string; // (default to undefined)

const { status, data } = await apiInstance.playerControllerGetComments(
    videoFileId,
    folderId,
    connectionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **videoFileId** | [**string**] |  | defaults to undefined|
| **folderId** | [**string**] |  | defaults to undefined|
| **connectionId** | [**string**] |  | defaults to undefined|


### Return type

**DPlayerCommentListDto**

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

# **playerControllerStreamVideo**
> playerControllerStreamVideo()


### Example

```typescript
import {
    PlayerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlayerApi(configuration);

let connectionId: string; // (default to undefined)
let fileId: string; // (default to undefined)
let range: string; // (default to undefined)

const { status, data } = await apiInstance.playerControllerStreamVideo(
    connectionId,
    fileId,
    range
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **connectionId** | [**string**] |  | defaults to undefined|
| **fileId** | [**string**] |  | defaults to undefined|
| **range** | [**string**] |  | defaults to undefined|


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

