# FolderApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**folderControllerListFolder**](FolderApi.md#foldercontrollerlistfolder) | **GET** /api/drive/list | GET /api/drive/list フォルダ内容を取得 |
| [**folderControllerListFolderByConnection**](FolderApi.md#foldercontrollerlistfolderbyconnection) | **GET** /api/drive/connections/{connectionId}/files | GET /api/drive/connections/:connectionId/files  特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応） |
| [**folderControllerSearch**](FolderApi.md#foldercontrollersearch) | **GET** /api/drive/search | GET /api/drive/search フォルダ内でキーワード検索 |
| [**folderControllerSearchByConnection**](FolderApi.md#foldercontrollersearchbyconnection) | **GET** /api/drive/connections/{connectionId}/search | GET /api/drive/connections/:connectionId/search 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応） |



## folderControllerListFolder

> FolderListDto folderControllerListFolder(connectionId, folderId)

GET /api/drive/list フォルダ内容を取得

### Example

```ts
import {
  Configuration,
  FolderApi,
} from '';
import type { FolderControllerListFolderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new FolderApi();

  const body = {
    // string
    connectionId: connectionId_example,
    // string (optional)
    folderId: folderId_example,
  } satisfies FolderControllerListFolderRequest;

  try {
    const data = await api.folderControllerListFolder(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **connectionId** | `string` |  | [Defaults to `undefined`] |
| **folderId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**FolderListDto**](FolderListDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## folderControllerListFolderByConnection

> FolderListDto folderControllerListFolderByConnection(connectionId, folderId)

GET /api/drive/connections/:connectionId/files  特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）

### Example

```ts
import {
  Configuration,
  FolderApi,
} from '';
import type { FolderControllerListFolderByConnectionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new FolderApi();

  const body = {
    // string
    connectionId: connectionId_example,
    // string (optional)
    folderId: folderId_example,
  } satisfies FolderControllerListFolderByConnectionRequest;

  try {
    const data = await api.folderControllerListFolderByConnection(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **connectionId** | `string` |  | [Defaults to `undefined`] |
| **folderId** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**FolderListDto**](FolderListDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## folderControllerSearch

> FolderListDto folderControllerSearch(connectionId, folderId, query)

GET /api/drive/search フォルダ内でキーワード検索

### Example

```ts
import {
  Configuration,
  FolderApi,
} from '';
import type { FolderControllerSearchRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new FolderApi();

  const body = {
    // string
    connectionId: connectionId_example,
    // string
    folderId: folderId_example,
    // string
    query: query_example,
  } satisfies FolderControllerSearchRequest;

  try {
    const data = await api.folderControllerSearch(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **connectionId** | `string` |  | [Defaults to `undefined`] |
| **folderId** | `string` |  | [Defaults to `undefined`] |
| **query** | `string` |  | [Defaults to `undefined`] |

### Return type

[**FolderListDto**](FolderListDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## folderControllerSearchByConnection

> FolderListDto folderControllerSearchByConnection(connectionId, folderId, query)

GET /api/drive/connections/:connectionId/search 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）

### Example

```ts
import {
  Configuration,
  FolderApi,
} from '';
import type { FolderControllerSearchByConnectionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new FolderApi();

  const body = {
    // string
    connectionId: connectionId_example,
    // string
    folderId: folderId_example,
    // string
    query: query_example,
  } satisfies FolderControllerSearchByConnectionRequest;

  try {
    const data = await api.folderControllerSearchByConnection(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **connectionId** | `string` |  | [Defaults to `undefined`] |
| **folderId** | `string` |  | [Defaults to `undefined`] |
| **query** | `string` |  | [Defaults to `undefined`] |

### Return type

[**FolderListDto**](FolderListDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

