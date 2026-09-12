# DriveConnectionApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**driveConnectionControllerDelete**](DriveConnectionApi.md#driveconnectioncontrollerdelete) | **DELETE** /api/drive-connections/{connectionId} | DELETE /api/drive-connections/:connectionId 接続を削除 |
| [**driveConnectionControllerHandleConnectionCallback**](DriveConnectionApi.md#driveconnectioncontrollerhandleconnectioncallback) | **GET** /api/drive-connections/{provider}/callback | GET /api/drive-connections/:provider/callback Drive接続 callback（JSON返却） |
| [**driveConnectionControllerInitiateConnection**](DriveConnectionApi.md#driveconnectioncontrollerinitiateconnection) | **POST** /api/drive-connections/{provider} | POST /api/drive-connections/:provider Drive接続開始（OAuth認可URLを返す） |
| [**driveConnectionControllerList**](DriveConnectionApi.md#driveconnectioncontrollerlist) | **GET** /api/drive-connections | GET /api/drive-connections 接続済みドライブリストを取得 |



## driveConnectionControllerDelete

> driveConnectionControllerDelete(connectionId)

DELETE /api/drive-connections/:connectionId 接続を削除

### Example

```ts
import {
  Configuration,
  DriveConnectionApi,
} from '';
import type { DriveConnectionControllerDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DriveConnectionApi();

  const body = {
    // string
    connectionId: connectionId_example,
  } satisfies DriveConnectionControllerDeleteRequest;

  try {
    const data = await api.driveConnectionControllerDelete(body);
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

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## driveConnectionControllerHandleConnectionCallback

> driveConnectionControllerHandleConnectionCallback(provider, code, state)

GET /api/drive-connections/:provider/callback Drive接続 callback（JSON返却）

### Example

```ts
import {
  Configuration,
  DriveConnectionApi,
} from '';
import type { DriveConnectionControllerHandleConnectionCallbackRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DriveConnectionApi();

  const body = {
    // string
    provider: provider_example,
    // string
    code: code_example,
    // string
    state: state_example,
  } satisfies DriveConnectionControllerHandleConnectionCallbackRequest;

  try {
    const data = await api.driveConnectionControllerHandleConnectionCallback(body);
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
| **provider** | `string` |  | [Defaults to `undefined`] |
| **code** | `string` |  | [Defaults to `undefined`] |
| **state** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## driveConnectionControllerInitiateConnection

> driveConnectionControllerInitiateConnection(provider)

POST /api/drive-connections/:provider Drive接続開始（OAuth認可URLを返す）

### Example

```ts
import {
  Configuration,
  DriveConnectionApi,
} from '';
import type { DriveConnectionControllerInitiateConnectionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DriveConnectionApi();

  const body = {
    // string
    provider: provider_example,
  } satisfies DriveConnectionControllerInitiateConnectionRequest;

  try {
    const data = await api.driveConnectionControllerInitiateConnection(body);
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
| **provider** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## driveConnectionControllerList

> driveConnectionControllerList()

GET /api/drive-connections 接続済みドライブリストを取得

### Example

```ts
import {
  Configuration,
  DriveConnectionApi,
} from '';
import type { DriveConnectionControllerListRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new DriveConnectionApi();

  try {
    const data = await api.driveConnectionControllerList();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

