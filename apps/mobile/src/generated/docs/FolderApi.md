# FolderApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**folderControllerListFolderByConnection**](FolderApi.md#foldercontrollerlistfolderbyconnection) | **GET** /api/drive/connections/{connectionId}/files | GET /api/drive/connections/:connectionId/files  特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応） |
| [**folderControllerSearchByConnection**](FolderApi.md#foldercontrollersearchbyconnection) | **GET** /api/drive/connections/{connectionId}/search | GET /api/drive/connections/:connectionId/search  特定のドライブ接続内でキーワード検索（マルチプロバイダー対応） |



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


## folderControllerSearchByConnection

> FolderListDto folderControllerSearchByConnection(connectionId, folderId, query)

GET /api/drive/connections/:connectionId/search  特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）

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

