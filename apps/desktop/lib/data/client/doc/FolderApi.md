# desktop.api.FolderApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**folderControllerListFolder**](FolderApi.md#foldercontrollerlistfolder) | **GET** /api/drive/list | GET /api/drive/list フォルダ内容を取得
[**folderControllerListFolderByConnection**](FolderApi.md#foldercontrollerlistfolderbyconnection) | **GET** /api/drive/connections/{connectionId}/files | GET /api/drive/connections/:connectionId/files  特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）
[**folderControllerSearch**](FolderApi.md#foldercontrollersearch) | **GET** /api/drive/search | GET /api/drive/search フォルダ内でキーワード検索
[**folderControllerSearchByConnection**](FolderApi.md#foldercontrollersearchbyconnection) | **GET** /api/drive/connections/{connectionId}/search | GET /api/drive/connections/:connectionId/search 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）


# **folderControllerListFolder**
> FolderListDto folderControllerListFolder(connectionId, folderId)

GET /api/drive/list フォルダ内容を取得

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = FolderApi();
final connectionId = connectionId_example; // String | 
final folderId = folderId_example; // String | 

try {
    final result = api_instance.folderControllerListFolder(connectionId, folderId);
    print(result);
} catch (e) {
    print('Exception when calling FolderApi->folderControllerListFolder: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectionId** | **String**|  | 
 **folderId** | **String**|  | [optional] 

### Return type

[**FolderListDto**](FolderListDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **folderControllerListFolderByConnection**
> FolderListDto folderControllerListFolderByConnection(connectionId, folderId)

GET /api/drive/connections/:connectionId/files  特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = FolderApi();
final connectionId = connectionId_example; // String | 
final folderId = folderId_example; // String | 

try {
    final result = api_instance.folderControllerListFolderByConnection(connectionId, folderId);
    print(result);
} catch (e) {
    print('Exception when calling FolderApi->folderControllerListFolderByConnection: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectionId** | **String**|  | 
 **folderId** | **String**|  | [optional] 

### Return type

[**FolderListDto**](FolderListDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **folderControllerSearch**
> FolderListDto folderControllerSearch(connectionId, folderId, query)

GET /api/drive/search フォルダ内でキーワード検索

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = FolderApi();
final connectionId = connectionId_example; // String | 
final folderId = folderId_example; // String | 
final query = query_example; // String | 

try {
    final result = api_instance.folderControllerSearch(connectionId, folderId, query);
    print(result);
} catch (e) {
    print('Exception when calling FolderApi->folderControllerSearch: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectionId** | **String**|  | 
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

# **folderControllerSearchByConnection**
> FolderListDto folderControllerSearchByConnection(connectionId, folderId, query)

GET /api/drive/connections/:connectionId/search 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = FolderApi();
final connectionId = connectionId_example; // String | 
final folderId = folderId_example; // String | 
final query = query_example; // String | 

try {
    final result = api_instance.folderControllerSearchByConnection(connectionId, folderId, query);
    print(result);
} catch (e) {
    print('Exception when calling FolderApi->folderControllerSearchByConnection: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectionId** | **String**|  | 
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

