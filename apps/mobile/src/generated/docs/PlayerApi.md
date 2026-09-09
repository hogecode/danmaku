# PlayerApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**playerControllerGetComments**](PlayerApi.md#playercontrollergetcomments) | **GET** /api/player/comments/{videoFileId} | DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \&quot;aaa.mp4\&quot; - コメント: \&quot;aaa.xml\&quot; または \&quot;aaa.json\&quot; を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す |
| [**playerControllerStreamVideo**](PlayerApi.md#playercontrollerstreamvideo) | **GET** /api/player/stream/{fileId} | 動画ファイルをストリーミング再生 |



## playerControllerGetComments

> DPlayerCommentListDto playerControllerGetComments(videoFileId, folderId)

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

> playerControllerStreamVideo(fileId, range)

動画ファイルをストリーミング再生

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

