# mobile.api.GDriveApi

## Load the API package
```dart
import 'package:mobile/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**gDriveControllerListFolder**](GDriveApi.md#gdrivecontrollerlistfolder) | **GET** /api/gdrive/list | GET /api/gdrive/list フォルダ内容を取得
[**gDriveControllerSearch**](GDriveApi.md#gdrivecontrollersearch) | **GET** /api/gdrive/search | GET /api/gdrive/search フォルダ内でキーワード検索


# **gDriveControllerListFolder**
> FolderListDto gDriveControllerListFolder(folderId)

GET /api/gdrive/list フォルダ内容を取得

### Example
```dart
import 'package:mobile/api.dart';

final api_instance = GDriveApi();
final folderId = folderId_example; // String | 

try {
    final result = api_instance.gDriveControllerListFolder(folderId);
    print(result);
} catch (e) {
    print('Exception when calling GDriveApi->gDriveControllerListFolder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **folderId** | **String**|  | [optional] 

### Return type

[**FolderListDto**](FolderListDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gDriveControllerSearch**
> FolderListDto gDriveControllerSearch(folderId, query)

GET /api/gdrive/search フォルダ内でキーワード検索

### Example
```dart
import 'package:mobile/api.dart';

final api_instance = GDriveApi();
final folderId = folderId_example; // String | 
final query = query_example; // String | 

try {
    final result = api_instance.gDriveControllerSearch(folderId, query);
    print(result);
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

[**FolderListDto**](FolderListDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

