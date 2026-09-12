# DriveConnectionApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**driveConnectionControllerDelete**](#driveconnectioncontrollerdelete) | **DELETE** /api/drive-connections/{connectionId} | DELETE /api/drive-connections/:connectionId 接続を削除|
|[**driveConnectionControllerHandleConnectionCallback**](#driveconnectioncontrollerhandleconnectioncallback) | **GET** /api/drive-connections/{provider}/callback | GET /api/drive-connections/:provider/callback Drive接続 callback（JSON返却）|
|[**driveConnectionControllerInitiateConnection**](#driveconnectioncontrollerinitiateconnection) | **POST** /api/drive-connections/{provider} | POST /api/drive-connections/:provider Drive接続開始（OAuth認可URLを返す）|
|[**driveConnectionControllerList**](#driveconnectioncontrollerlist) | **GET** /api/drive-connections | GET /api/drive-connections 接続済みドライブリストを取得|

# **driveConnectionControllerDelete**
> driveConnectionControllerDelete()


### Example

```typescript
import {
    DriveConnectionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriveConnectionApi(configuration);

let connectionId: string; // (default to undefined)

const { status, data } = await apiInstance.driveConnectionControllerDelete(
    connectionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **connectionId** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **driveConnectionControllerHandleConnectionCallback**
> driveConnectionControllerHandleConnectionCallback()


### Example

```typescript
import {
    DriveConnectionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriveConnectionApi(configuration);

let provider: string; // (default to undefined)
let code: string; // (default to undefined)
let state: string; // (default to undefined)

const { status, data } = await apiInstance.driveConnectionControllerHandleConnectionCallback(
    provider,
    code,
    state
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **provider** | [**string**] |  | defaults to undefined|
| **code** | [**string**] |  | defaults to undefined|
| **state** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **driveConnectionControllerInitiateConnection**
> driveConnectionControllerInitiateConnection()


### Example

```typescript
import {
    DriveConnectionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriveConnectionApi(configuration);

let provider: string; // (default to undefined)

const { status, data } = await apiInstance.driveConnectionControllerInitiateConnection(
    provider
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **provider** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **driveConnectionControllerList**
> driveConnectionControllerList()


### Example

```typescript
import {
    DriveConnectionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DriveConnectionApi(configuration);

const { status, data } = await apiInstance.driveConnectionControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

