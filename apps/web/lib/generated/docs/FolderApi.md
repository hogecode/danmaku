# FolderApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**folderControllerListFolder**](#foldercontrollerlistfolder) | **GET** /api/drive/list | GET /api/drive/list フォルダ内容を取得|
|[**folderControllerListFolderByConnection**](#foldercontrollerlistfolderbyconnection) | **GET** /api/drive/connections/{connectionId}/files | GET /api/drive/connections/:connectionId/files  特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）|
|[**folderControllerSearch**](#foldercontrollersearch) | **GET** /api/drive/search | GET /api/drive/search フォルダ内でキーワード検索|
|[**folderControllerSearchByConnection**](#foldercontrollersearchbyconnection) | **GET** /api/drive/connections/{connectionId}/search | GET /api/drive/connections/:connectionId/search 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）|

# **folderControllerListFolder**
> FolderListDto folderControllerListFolder()


### Example

```typescript
import {
    FolderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FolderApi(configuration);

let connectionId: string; // (default to undefined)
let folderId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.folderControllerListFolder(
    connectionId,
    folderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **connectionId** | [**string**] |  | defaults to undefined|
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

# **folderControllerListFolderByConnection**
> FolderListDto folderControllerListFolderByConnection()


### Example

```typescript
import {
    FolderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FolderApi(configuration);

let connectionId: string; // (default to undefined)
let folderId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.folderControllerListFolderByConnection(
    connectionId,
    folderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **connectionId** | [**string**] |  | defaults to undefined|
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

# **folderControllerSearch**
> FolderListDto folderControllerSearch()


### Example

```typescript
import {
    FolderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FolderApi(configuration);

let connectionId: string; // (default to undefined)
let folderId: string; // (default to undefined)
let query: string; // (default to undefined)

const { status, data } = await apiInstance.folderControllerSearch(
    connectionId,
    folderId,
    query
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **connectionId** | [**string**] |  | defaults to undefined|
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

# **folderControllerSearchByConnection**
> FolderListDto folderControllerSearchByConnection()


### Example

```typescript
import {
    FolderApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FolderApi(configuration);

let connectionId: string; // (default to undefined)
let folderId: string; // (default to undefined)
let query: string; // (default to undefined)

const { status, data } = await apiInstance.folderControllerSearchByConnection(
    connectionId,
    folderId,
    query
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **connectionId** | [**string**] |  | defaults to undefined|
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

