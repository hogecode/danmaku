# mobile.api.NicovideoApi

## Load the API package
```dart
import 'package:mobile/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**nicovideoControllerDownloadComments**](NicovideoApi.md#nicovideocontrollerdownloadcomments) | **POST** /api/nicovideo/download/comments | POST /api/nicovideo/download/comments セッション不要 - thread_keyが取得できれば可能  flow: 1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 = 非公開動画またはコメント機能無効


# **nicovideoControllerDownloadComments**
> nicovideoControllerDownloadComments(downloadCommentRequestDto)

POST /api/nicovideo/download/comments セッション不要 - thread_keyが取得できれば可能  flow: 1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 = 非公開動画またはコメント機能無効

### Example
```dart
import 'package:mobile/api.dart';

final api_instance = NicovideoApi();
final downloadCommentRequestDto = DownloadCommentRequestDto(); // DownloadCommentRequestDto | 

try {
    api_instance.nicovideoControllerDownloadComments(downloadCommentRequestDto);
} catch (e) {
    print('Exception when calling NicovideoApi->nicovideoControllerDownloadComments: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **downloadCommentRequestDto** | [**DownloadCommentRequestDto**](DownloadCommentRequestDto.md)|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

