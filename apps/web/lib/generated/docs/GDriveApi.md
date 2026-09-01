# GDriveApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**gDriveControllerListFolder**](#gdrivecontrollerlistfolder) | **GET** /api/gdrive/list | GET /api/gdrive/list フォルダ内容を取得|
|[**gDriveControllerSearch**](#gdrivecontrollersearch) | **GET** /api/gdrive/search | GET /api/gdrive/search フォルダ内でキーワード検索|

# **gDriveControllerListFolder**
> FolderListDto gDriveControllerListFolder()


### Example

```typescript
import {
    GDriveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GDriveApi(configuration);

let folderId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.gDriveControllerListFolder(
    folderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **folderId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**FolderListDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gDriveControllerSearch**
> FolderListDto gDriveControllerSearch()


### Example

```typescript
import {
    GDriveApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GDriveApi(configuration);

let folderId: string; // (default to undefined)
let query: string; // (default to undefined)

const { status, data } = await apiInstance.gDriveControllerSearch(
    folderId,
    query
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **folderId** | [**string**] |  | defaults to undefined|
| **query** | [**string**] |  | defaults to undefined|


### Return type

**FolderListDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

