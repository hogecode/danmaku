# openapi.api.GDriveApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**gDriveControllerListFolder**](GDriveApi.md#gdrivecontrollerlistfolder) | **GET** /api/gdrive/list | 
[**gDriveControllerSearch**](GDriveApi.md#gdrivecontrollersearch) | **GET** /api/gdrive/search | 


# **gDriveControllerListFolder**
> gDriveControllerListFolder(folderId)



### Example
```dart
import 'package:openapi/api.dart';

final api_instance = GDriveApi();
final folderId = folderId_example; // String | 

try {
    api_instance.gDriveControllerListFolder(folderId);
} catch (e) {
    print('Exception when calling GDriveApi->gDriveControllerListFolder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **folderId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gDriveControllerSearch**
> gDriveControllerSearch(folderId, query)



### Example
```dart
import 'package:openapi/api.dart';

final api_instance = GDriveApi();
final folderId = folderId_example; // String | 
final query = query_example; // String | 

try {
    api_instance.gDriveControllerSearch(folderId, query);
} catch (e) {
    print('Exception when calling GDriveApi->gDriveControllerSearch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **folderId** | **String**|  | 
 **query** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

