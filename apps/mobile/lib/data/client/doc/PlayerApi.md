# mobile.api.PlayerApi

## Load the API package
```dart
import 'package:mobile/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**playerControllerGetComments**](PlayerApi.md#playercontrollergetcomments) | **GET** /api/player/comments/{videoFileId} | GET /api/player/comments/:videoFileId DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す  Query Parameters: - folderId (required): 動画ファイルが存在するフォルダID  Response (DPlayer 互換形式): {   \"comments\": [     {       \"time\": 10.5,       \"type\": \"normal\",       \"size\": \"normal\",       \"color\": \"#ffffff\",       \"author\": \"SlF_cF2J1CdotJTaojvbM9mDYAE or null\",       \"text\": \"てか無料期間中に見れば無料やん\"     }   ] }
[**playerControllerStreamVideo**](PlayerApi.md#playercontrollerstreamvideo) | **GET** /api/player/stream/{fileId} | GET /api/player/stream/:fileId 動画ファイルをストリーミング再生  Range リクエスト対応: - Range: bytes=0-1023 （最初の1KBのみ取得） - Range: bytes=1024- （1KBから最後まで取得） - Range: bytes=-512 （最後の512バイトを取得）  レスポンス: - Range ヘッダーなし: HTTP 200 + Content-Length - Range ヘッダーあり（有効）: HTTP 206 + Content-Range - Range ヘッダーあり（無効）: HTTP 400 Bad Request


# **playerControllerGetComments**
> DPlayerCommentListDto playerControllerGetComments(videoFileId, folderId)

GET /api/player/comments/:videoFileId DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す  Query Parameters: - folderId (required): 動画ファイルが存在するフォルダID  Response (DPlayer 互換形式): {   \"comments\": [     {       \"time\": 10.5,       \"type\": \"normal\",       \"size\": \"normal\",       \"color\": \"#ffffff\",       \"author\": \"SlF_cF2J1CdotJTaojvbM9mDYAE or null\",       \"text\": \"てか無料期間中に見れば無料やん\"     }   ] }

### Example
```dart
import 'package:mobile/api.dart';

final api_instance = PlayerApi();
final videoFileId = videoFileId_example; // String | 
final folderId = folderId_example; // String | 

try {
    final result = api_instance.playerControllerGetComments(videoFileId, folderId);
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

### Return type

[**DPlayerCommentListDto**](DPlayerCommentListDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **playerControllerStreamVideo**
> playerControllerStreamVideo(fileId, range)

GET /api/player/stream/:fileId 動画ファイルをストリーミング再生  Range リクエスト対応: - Range: bytes=0-1023 （最初の1KBのみ取得） - Range: bytes=1024- （1KBから最後まで取得） - Range: bytes=-512 （最後の512バイトを取得）  レスポンス: - Range ヘッダーなし: HTTP 200 + Content-Length - Range ヘッダーあり（有効）: HTTP 206 + Content-Range - Range ヘッダーあり（無効）: HTTP 400 Bad Request

### Example
```dart
import 'package:mobile/api.dart';

final api_instance = PlayerApi();
final fileId = fileId_example; // String | 
final range = range_example; // String | 

try {
    api_instance.playerControllerStreamVideo(fileId, range);
} catch (e) {
    print('Exception when calling PlayerApi->playerControllerStreamVideo: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
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

