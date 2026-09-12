# PlayerApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**playerControllerGenerateVideoToken**](PlayerApi.md#playercontrollergeneratevideotoken) | **POST** /api/player/token | POST /api/player/token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token&#x3D;{jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）  TODO: userIdではなく、videoFileIdを使ってトークンを生成するように変更する |
| [**playerControllerGetComments**](PlayerApi.md#playercontrollergetcomments) | **GET** /api/player/comments/{videoFileId} | DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \&quot;aaa.mp4\&quot; - コメント: \&quot;aaa.xml\&quot; または \&quot;aaa.json\&quot; を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す |
| [**playerControllerStreamVideo**](PlayerApi.md#playercontrollerstreamvideo) | **GET** /api/player/stream/{connectionId}/{fileId} | 動画ファイルをストリーミング再生（マルチプロバイダー対応） |



## playerControllerGenerateVideoToken

> playerControllerGenerateVideoToken()

POST /api/player/token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token&#x3D;{jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）  TODO: userIdではなく、videoFileIdを使ってトークンを生成するように変更する

### Example

```ts
import {
  Configuration,
  PlayerApi,
} from '';
import type { PlayerControllerGenerateVideoTokenRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PlayerApi();

  try {
    const data = await api.playerControllerGenerateVideoToken();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

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


## playerControllerGetComments

> DPlayerCommentListDto playerControllerGetComments(videoFileId, folderId, connectionId)

DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \&quot;aaa.mp4\&quot; - コメント: \&quot;aaa.xml\&quot; または \&quot;aaa.json\&quot; を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す

### Example

```ts
import {
  Configuration,
  PlayerApi,
} from '';
import type { PlayerControllerGetCommentsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PlayerApi();

  const body = {
    // string
    videoFileId: videoFileId_example,
    // string
    folderId: folderId_example,
    // string
    connectionId: connectionId_example,
  } satisfies PlayerControllerGetCommentsRequest;

  try {
    const data = await api.playerControllerGetComments(body);
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
| **videoFileId** | `string` |  | [Defaults to `undefined`] |
| **folderId** | `string` |  | [Defaults to `undefined`] |
| **connectionId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**DPlayerCommentListDto**](DPlayerCommentListDto.md)

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


## playerControllerStreamVideo

> playerControllerStreamVideo(connectionId, fileId, range)

動画ファイルをストリーミング再生（マルチプロバイダー対応）

### Example

```ts
import {
  Configuration,
  PlayerApi,
} from '';
import type { PlayerControllerStreamVideoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PlayerApi();

  const body = {
    // string
    connectionId: connectionId_example,
    // string
    fileId: fileId_example,
    // string
    range: range_example,
  } satisfies PlayerControllerStreamVideoRequest;

  try {
    const data = await api.playerControllerStreamVideo(body);
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
| **connectionId** | `string` |  | [Defaults to `undefined`] |
| **fileId** | `string` |  | [Defaults to `undefined`] |
| **range** | `string` |  | [Defaults to `undefined`] |

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

