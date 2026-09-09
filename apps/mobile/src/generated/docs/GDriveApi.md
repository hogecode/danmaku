# GDriveApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**gDriveControllerListFolder**](GDriveApi.md#gdrivecontrollerlistfolder) | **GET** /api/gdrive/list | GET /api/gdrive/list フォルダ内容を取得 |
| [**gDriveControllerSearch**](GDriveApi.md#gdrivecontrollersearch) | **GET** /api/gdrive/search | GET /api/gdrive/search フォルダ内でキーワード検索 |



## gDriveControllerListFolder

> FolderListDto gDriveControllerListFolder(folderId)

GET /api/gdrive/list フォルダ内容を取得

### Example

```ts
import {
  Configuration,
  GDriveApi,
} from '';
import type { GDriveControllerListFolderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new GDriveApi();

  const body = {
    // string (optional)
    folderId: folderId_example,
  } satisfies GDriveControllerListFolderRequest;

  try {
    const data = await api.gDriveControllerListFolder(body);
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


## gDriveControllerSearch

> FolderListDto gDriveControllerSearch(folderId, query)

GET /api/gdrive/search フォルダ内でキーワード検索

### Example

```ts
import {
  Configuration,
  GDriveApi,
} from '';
import type { GDriveControllerSearchRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new GDriveApi();

  const body = {
    // string
    folderId: folderId_example,
    // string
    query: query_example,
  } satisfies GDriveControllerSearchRequest;

  try {
    const data = await api.gDriveControllerSearch(body);
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

