# desktop.api.PlayerApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**playerControllerGenerateVideoToken**](PlayerApi.md#playercontrollergeneratevideotoken) | **POST** /api/player/token | POST /api/player/token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token={jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）  TODO: userIdではなく、videoFileIdを使ってトークンを生成するように変更する
[**playerControllerGetComments**](PlayerApi.md#playercontrollergetcomments) | **GET** /api/player/comments/{videoFileId} | DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す
[**playerControllerStreamVideo**](PlayerApi.md#playercontrollerstreamvideo) | **GET** /api/player/stream/{connectionId}/{fileId} | 動画ファイルをストリーミング再生（マルチプロバイダー対応）


# **playerControllerGenerateVideoToken**
> playerControllerGenerateVideoToken()

POST /api/player/token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token={jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）  TODO: userIdではなく、videoFileIdを使ってトークンを生成するように変更する

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = PlayerApi();

try {
    api_instance.playerControllerGenerateVideoToken();
} catch (e) {
    print('Exception when calling PlayerApi->playerControllerGenerateVideoToken: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **playerControllerGetComments**
> DPlayerCommentListDto playerControllerGetComments(videoFileId, folderId, connectionId)

DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = PlayerApi();
final videoFileId = videoFileId_example; // String | 
final folderId = folderId_example; // String | 
final connectionId = connectionId_example; // String | 

try {
    final result = api_instance.playerControllerGetComments(videoFileId, folderId, connectionId);
    print(result);
} catch (e) {
    print('Exception when calling PlayerApi->playerControllerGetComments: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **videoFileId** | **String**|  | 
 **folderId** | **String**|  | 
 **connectionId** | **String**|  | 

### Return type

[**DPlayerCommentListDto**](DPlayerCommentListDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **playerControllerStreamVideo**
> playerControllerStreamVideo(connectionId, fileId, range)

動画ファイルをストリーミング再生（マルチプロバイダー対応）

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = PlayerApi();
final connectionId = connectionId_example; // String | 
final fileId = fileId_example; // String | 
final range = range_example; // String | 

try {
    api_instance.playerControllerStreamVideo(connectionId, fileId, range);
} catch (e) {
    print('Exception when calling PlayerApi->playerControllerStreamVideo: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectionId** | **String**|  | 
 **fileId** | **String**|  | 
 **range** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

