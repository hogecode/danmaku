# mobile.api.NicovideoApi

## Load the API package
```dart
import 'package:mobile/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**nicovideoControllerDownloadComments**](NicovideoApi.md#nicovideocontrollerdownloadcomments) | **POST** /api/nicovideo/download/comments | 


# **nicovideoControllerDownloadComments**
> nicovideoControllerDownloadComments(body)



### Example
```dart
import 'package:mobile/api.dart';

final api_instance = NicovideoApi();
final body = Object(); // Object | 

try {
    api_instance.nicovideoControllerDownloadComments(body);
} catch (e) {
    print('Exception when calling NicovideoApi->nicovideoControllerDownloadComments: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **body** | **Object**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

