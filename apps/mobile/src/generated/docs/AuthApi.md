# AuthApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**authControllerCallback**](AuthApi.md#authcontrollercallback) | **GET** /api/auth/callback | GET /api/auth/callback - OAuth コールバック Google OAuth 認証後にリダイレクトされるエンドポイント - Web版: 302リダイレクト - Flutter版: ディープリンクにリダイレクト |
| [**authControllerGenerateVideoToken**](AuthApi.md#authcontrollergeneratevideotoken) | **POST** /api/auth/video-token | POST /api/auth/video-token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token&#x3D;{jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト） |
| [**authControllerGetUserInfo**](AuthApi.md#authcontrollergetuserinfo) | **GET** /api/auth/me | GET /api/auth/me - ユーザー情報取得 |
| [**authControllerLogin**](AuthApi.md#authcontrollerlogin) | **POST** /api/auth/login | POST /api/auth/login - ログイン開始 |
| [**authControllerLogout**](AuthApi.md#authcontrollerlogout) | **POST** /api/auth/logout | POST /api/auth/logout - ログアウト |
| [**authControllerRefreshToken**](AuthApi.md#authcontrollerrefreshtoken) | **POST** /api/auth/refresh | POST /api/auth/refresh - トークン更新 |



## authControllerCallback

> authControllerCallback(code, state, error, errorDescription)

GET /api/auth/callback - OAuth コールバック Google OAuth 認証後にリダイレクトされるエンドポイント - Web版: 302リダイレクト - Flutter版: ディープリンクにリダイレクト

### Example

```ts
import {
  Configuration,
  AuthApi,
} from '';
import type { AuthControllerCallbackRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  const body = {
    // string
    code: code_example,
    // string
    state: state_example,
    // string (optional)
    error: error_example,
    // string (optional)
    errorDescription: errorDescription_example,
  } satisfies AuthControllerCallbackRequest;

  try {
    const data = await api.authControllerCallback(body);
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


## authControllerGenerateVideoToken

> authControllerGenerateVideoToken()

POST /api/auth/video-token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token&#x3D;{jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）

### Example

```ts
import {
  Configuration,
  AuthApi,
} from '';
import type { AuthControllerGenerateVideoTokenRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  try {
    const data = await api.authControllerGenerateVideoToken();
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


## authControllerLogin

> LoginResponseDto authControllerLogin()

POST /api/auth/login - ログイン開始

### Example

```ts
import {
  Configuration,
  AuthApi,
} from '';
import type { AuthControllerLoginRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  try {
    const data = await api.authControllerLogin();
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


## authControllerRefreshToken

> RefreshTokenResponseDto authControllerRefreshToken()

POST /api/auth/refresh - トークン更新

### Example

```ts
import {
  Configuration,
  AuthApi,
} from '';
import type { AuthControllerRefreshTokenRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthApi();

  try {
    const data = await api.authControllerRefreshToken();
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

[**RefreshTokenResponseDto**](RefreshTokenResponseDto.md)

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

