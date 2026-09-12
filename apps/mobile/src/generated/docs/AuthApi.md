# AuthApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**authControllerCallbackWithProvider**](AuthApi.md#authcontrollercallbackwithprovider) | **GET** /api/auth/callback/{provider} | GET /api/auth/callback/:provider - プロバイダー別 OAuth コールバック 例: GET /api/auth/callback/onedrive  DB にユーザー情報を保存し、セッションにユーザーIDを設定してリダイレクトする |
| [**authControllerGetUserInfo**](AuthApi.md#authcontrollergetuserinfo) | **GET** /api/auth/me | GET /api/auth/me - ユーザー情報取得 |
| [**authControllerLoginWithProvider**](AuthApi.md#authcontrollerloginwithprovider) | **POST** /api/auth/login/{provider} | POST /api/auth/login/:provider - プロバイダー別ログイン開始  認可URLを生成して返す |
| [**authControllerLogout**](AuthApi.md#authcontrollerlogout) | **POST** /api/auth/logout | POST /api/auth/logout - ログアウト |



## authControllerCallbackWithProvider

> authControllerCallbackWithProvider(provider, code, state, error, errorDescription)

GET /api/auth/callback/:provider - プロバイダー別 OAuth コールバック 例: GET /api/auth/callback/onedrive  DB にユーザー情報を保存し、セッションにユーザーIDを設定してリダイレクトする

### Example

```ts
import {
  Configuration,
  AuthApi,
} from '';
import type { AuthControllerCallbackWithProviderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  const body = {
    // string
    provider: provider_example,
    // string
    code: code_example,
    // string
    state: state_example,
    // string (optional)
    error: error_example,
    // string (optional)
    errorDescription: errorDescription_example,
  } satisfies AuthControllerCallbackWithProviderRequest;

  try {
    const data = await api.authControllerCallbackWithProvider(body);
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
| **error** | `string` |  | [Optional] [Defaults to `undefined`] |
| **errorDescription** | `string` |  | [Optional] [Defaults to `undefined`] |

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


## authControllerGetUserInfo

> UserInfoDto authControllerGetUserInfo()

GET /api/auth/me - ユーザー情報取得

### Example

```ts
import {
  Configuration,
  AuthApi,
} from '';
import type { AuthControllerGetUserInfoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  try {
    const data = await api.authControllerGetUserInfo();
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

[**UserInfoDto**](UserInfoDto.md)

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


## authControllerLoginWithProvider

> LoginResponseDto authControllerLoginWithProvider(provider)

POST /api/auth/login/:provider - プロバイダー別ログイン開始  認可URLを生成して返す

### Example

```ts
import {
  Configuration,
  AuthApi,
} from '';
import type { AuthControllerLoginWithProviderRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  const body = {
    // string
    provider: provider_example,
  } satisfies AuthControllerLoginWithProviderRequest;

  try {
    const data = await api.authControllerLoginWithProvider(body);
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

[**LoginResponseDto**](LoginResponseDto.md)

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


## authControllerLogout

> authControllerLogout()

POST /api/auth/logout - ログアウト

### Example

```ts
import {
  Configuration,
  AuthApi,
} from '';
import type { AuthControllerLogoutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  try {
    const data = await api.authControllerLogout();
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

