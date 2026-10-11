# desktop.api.KakologApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**kakologControllerDownloadComments**](KakologApi.md#kakologcontrollerdownloadcomments) | **POST** /api/kakolog/download/comments | POST /api/kakolog/download/comments  チャンネルの時間範囲内のコメントを DPlayer 形式で取得


# **kakologControllerDownloadComments**
> GetKakologCommentsResponseDto kakologControllerDownloadComments(getKakologCommentsRequestDto)

POST /api/kakolog/download/comments  チャンネルの時間範囲内のコメントを DPlayer 形式で取得

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = KakologApi();
final getKakologCommentsRequestDto = GetKakologCommentsRequestDto(); // GetKakologCommentsRequestDto | 

try {
    final result = api_instance.kakologControllerDownloadComments(getKakologCommentsRequestDto);
    print(result);
} catch (e) {
    print('Exception when calling KakologApi->kakologControllerDownloadComments: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **getKakologCommentsRequestDto** | [**GetKakologCommentsRequestDto**](GetKakologCommentsRequestDto.md)|  | 

### Return type

[**GetKakologCommentsResponseDto**](GetKakologCommentsResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

