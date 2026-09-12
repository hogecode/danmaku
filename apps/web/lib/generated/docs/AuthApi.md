# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authControllerCallbackWithProvider**](#authcontrollercallbackwithprovider) | **GET** /api/auth/callback/{provider} | GET /api/auth/callback/:provider - プロバイダー別 OAuth コールバック 例: GET /api/auth/callback/onedrive  DB にユーザー情報を保存し、セッションにユーザーIDを設定してリダイレクトする|
|[**authControllerGetUserInfo**](#authcontrollergetuserinfo) | **GET** /api/auth/me | GET /api/auth/me - ユーザー情報取得|
|[**authControllerLoginWithProvider**](#authcontrollerloginwithprovider) | **POST** /api/auth/login/{provider} | POST /api/auth/login/:provider - プロバイダー別ログイン開始  認可URLを生成して返す|
|[**authControllerLogout**](#authcontrollerlogout) | **POST** /api/auth/logout | POST /api/auth/logout - ログアウト|

# **authControllerCallbackWithProvider**
> authControllerCallbackWithProvider()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let provider: string; // (default to undefined)
let code: string; // (default to undefined)
let state: string; // (default to undefined)
let error: string; // (optional) (default to undefined)
let errorDescription: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.authControllerCallbackWithProvider(
    provider,
    code,
    state,
    error,
    errorDescription
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **provider** | [**string**] |  | defaults to undefined|
| **code** | [**string**] |  | defaults to undefined|
| **state** | [**string**] |  | defaults to undefined|
| **error** | [**string**] |  | (optional) defaults to undefined|
| **errorDescription** | [**string**] |  | (optional) defaults to undefined|


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

# **authControllerGetUserInfo**
> UserInfoDto authControllerGetUserInfo()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authControllerGetUserInfo();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserInfoDto**

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

# **authControllerLoginWithProvider**
> LoginResponseDto authControllerLoginWithProvider()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let provider: string; // (default to undefined)

const { status, data } = await apiInstance.authControllerLoginWithProvider(
    provider
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **provider** | [**string**] |  | defaults to undefined|


### Return type

**LoginResponseDto**

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

# **authControllerLogout**
> authControllerLogout()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authControllerLogout();
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

