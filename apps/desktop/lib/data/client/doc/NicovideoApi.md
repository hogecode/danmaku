# desktop.api.NicovideoApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**nicovideoControllerCancelDownload**](NicovideoApi.md#nicovideocontrollercanceldownload) | **DELETE** /api/nicovideo/download/{jobId} | DELETE /api/nicovideo/download/:jobId  ダウンロードジョブをキャンセル
[**nicovideoControllerDownloadComments**](NicovideoApi.md#nicovideocontrollerdownloadcomments) | **POST** /api/nicovideo/download/comments | POST /api/nicovideo/download/comments  ニコ動のコメントを取得して DPlayer 形式に変換  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 = 非公開動画またはコメント機能無効 4. ニコ動形式のコメント → DPlayer形式に変換
[**nicovideoControllerGetDownloadProgress**](NicovideoApi.md#nicovideocontrollergetdownloadprogress) | **GET** /api/nicovideo/download/progress/{jobId}/sse | GET /api/nicovideo/download/progress/:jobId/sse  Server-Sent Events で進捗をリアルタイム配信
[**nicovideoControllerGetDownloadStatus**](NicovideoApi.md#nicovideocontrollergetdownloadstatus) | **GET** /api/nicovideo/download/status/{jobId} | GET /api/nicovideo/download/status/:jobId  ダウンロードジョブのステータスを確認
[**nicovideoControllerStartVideoDownload**](NicovideoApi.md#nicovideocontrollerstartvideodownload) | **POST** /api/nicovideo/download/video | POST /api/nicovideo/download/video  非同期で動画ダウンロードを開始 ジョブIDを即座に返す


# **nicovideoControllerCancelDownload**
> VideoDownloadCancelResponseDto nicovideoControllerCancelDownload(jobId)

DELETE /api/nicovideo/download/:jobId  ダウンロードジョブをキャンセル

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = NicovideoApi();
final jobId = jobId_example; // String | 

try {
    final result = api_instance.nicovideoControllerCancelDownload(jobId);
    print(result);
} catch (e) {
    print('Exception when calling NicovideoApi->nicovideoControllerCancelDownload: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **jobId** | **String**|  | 

### Return type

[**VideoDownloadCancelResponseDto**](VideoDownloadCancelResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nicovideoControllerDownloadComments**
> DownloadCommentWithDPlayerResponseDto nicovideoControllerDownloadComments(downloadCommentRequestDto)

POST /api/nicovideo/download/comments  ニコ動のコメントを取得して DPlayer 形式に変換  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 = 非公開動画またはコメント機能無効 4. ニコ動形式のコメント → DPlayer形式に変換

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = NicovideoApi();
final downloadCommentRequestDto = DownloadCommentRequestDto(); // DownloadCommentRequestDto | 

try {
    final result = api_instance.nicovideoControllerDownloadComments(downloadCommentRequestDto);
    print(result);
} catch (e) {
    print('Exception when calling NicovideoApi->nicovideoControllerDownloadComments: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **downloadCommentRequestDto** | [**DownloadCommentRequestDto**](DownloadCommentRequestDto.md)|  | 

### Return type

[**DownloadCommentWithDPlayerResponseDto**](DownloadCommentWithDPlayerResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nicovideoControllerGetDownloadProgress**
> nicovideoControllerGetDownloadProgress(jobId)

GET /api/nicovideo/download/progress/:jobId/sse  Server-Sent Events で進捗をリアルタイム配信

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = NicovideoApi();
final jobId = jobId_example; // String | 

try {
    api_instance.nicovideoControllerGetDownloadProgress(jobId);
} catch (e) {
    print('Exception when calling NicovideoApi->nicovideoControllerGetDownloadProgress: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **jobId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nicovideoControllerGetDownloadStatus**
> VideoDownloadStatusResponseDto nicovideoControllerGetDownloadStatus(jobId)

GET /api/nicovideo/download/status/:jobId  ダウンロードジョブのステータスを確認

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = NicovideoApi();
final jobId = jobId_example; // String | 

try {
    final result = api_instance.nicovideoControllerGetDownloadStatus(jobId);
    print(result);
} catch (e) {
    print('Exception when calling NicovideoApi->nicovideoControllerGetDownloadStatus: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **jobId** | **String**|  | 

### Return type

[**VideoDownloadStatusResponseDto**](VideoDownloadStatusResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **nicovideoControllerStartVideoDownload**
> VideoDownloadStartResponseDto nicovideoControllerStartVideoDownload(downloadVideoRequestDto)

POST /api/nicovideo/download/video  非同期で動画ダウンロードを開始 ジョブIDを即座に返す

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = NicovideoApi();
final downloadVideoRequestDto = DownloadVideoRequestDto(); // DownloadVideoRequestDto | 

try {
    final result = api_instance.nicovideoControllerStartVideoDownload(downloadVideoRequestDto);
    print(result);
} catch (e) {
    print('Exception when calling NicovideoApi->nicovideoControllerStartVideoDownload: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **downloadVideoRequestDto** | [**DownloadVideoRequestDto**](DownloadVideoRequestDto.md)|  | 

### Return type

[**VideoDownloadStartResponseDto**](VideoDownloadStartResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

