# openapi.api.PlayerApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**playerControllerGetComments**](PlayerApi.md#playercontrollergetcomments) | **GET** /api/player/comments/{videoFileId} | 
[**playerControllerStreamVideo**](PlayerApi.md#playercontrollerstreamvideo) | **GET** /api/player/stream/{fileId} | 


# **playerControllerGetComments**
> playerControllerGetComments(videoFileId, folderId)



### Example
```dart
import 'package:openapi/api.dart';

final api_instance = PlayerApi();
final videoFileId = videoFileId_example; // String | 
final folderId = folderId_example; // String | 

try {
    api_instance.playerControllerGetComments(videoFileId, folderId);
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

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **playerControllerStreamVideo**
> playerControllerStreamVideo(fileId, range)



### Example
```dart
import 'package:openapi/api.dart';

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

