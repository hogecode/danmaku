# PlayerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**playerControllerGetComments**](#playercontrollergetcomments) | **GET** /api/player/comments/{videoFileId} | 動画に対応するコメントを取得  コメントファイルの自動検出: - 動画: \&quot;aaa.mp4\&quot; - コメント: \&quot;aaa.xml\&quot; または \&quot;aaa.json\&quot; を自動検索 - 見つかった場合: JSON に変換して返す - 見つからない場合: 空配列を返す  Response: {   \&quot;comments\&quot;: [     {       \&quot;thread\&quot;: \&quot;1492023606\&quot;,       \&quot;no\&quot;: 19886,       \&quot;vpos\&quot;: 0,       \&quot;date\&quot;: 1492100460,       \&quot;mail\&quot;: \&quot;184\&quot;,       \&quot;user_id\&quot;: \&quot;SlF_cF2J1CdotJTaojvbM9mDYAE\&quot;,       \&quot;premium\&quot;: 1,       \&quot;anonymity\&quot;: 1,       \&quot;text\&quot;: \&quot;てか無料期間中に見れば無料やん\&quot;     }   ] }|
|[**playerControllerStreamVideo**](#playercontrollerstreamvideo) | **GET** /api/player/stream/{fileId} | GET /api/player/stream/:fileId 動画ファイルをストリーミング再生  Range リクエスト対応: - Range: bytes&#x3D;0-1023 （最初の1KBのみ取得） - Range: bytes&#x3D;1024- （1KBから最後まで取得） - Range: bytes&#x3D;-512 （最後の512バイトを取得）  レスポンス: - Range ヘッダーなし: HTTP 200 + Content-Length - Range ヘッダーあり（有効）: HTTP 206 + Content-Range - Range ヘッダーあり（無効）: HTTP 400 Bad Request|

# **playerControllerGetComments**
> CommentListDto playerControllerGetComments()


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

const { status, data } = await apiInstance.playerControllerGetComments(
    videoFileId,
    folderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **videoFileId** | [**string**] |  | defaults to undefined|
| **folderId** | [**string**] |  | defaults to undefined|


### Return type

**CommentListDto**

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

let fileId: string; // (default to undefined)
let range: string; // (default to undefined)

const { status, data } = await apiInstance.playerControllerStreamVideo(
    fileId,
    range
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

