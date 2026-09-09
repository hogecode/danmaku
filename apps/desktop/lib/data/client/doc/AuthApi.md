# desktop.api.AuthApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authControllerCallback**](AuthApi.md#authcontrollercallback) | **GET** /api/auth/callback | GET /api/auth/callback - OAuth コールバック Google OAuth 認証後にリダイレクトされるエンドポイント - Web版: 302リダイレクト - Flutter版: ディープリンクにリダイレクト
[**authControllerGetUserInfo**](AuthApi.md#authcontrollergetuserinfo) | **GET** /api/auth/me | GET /api/auth/me - ユーザー情報取得
[**authControllerLogin**](AuthApi.md#authcontrollerlogin) | **POST** /api/auth/login | POST /api/auth/login - ログイン開始
[**authControllerLogout**](AuthApi.md#authcontrollerlogout) | **POST** /api/auth/logout | POST /api/auth/logout - ログアウト
[**authControllerRefreshToken**](AuthApi.md#authcontrollerrefreshtoken) | **POST** /api/auth/refresh | POST /api/auth/refresh - トークン更新


# **authControllerCallback**
> authControllerCallback(code, state, error, errorDescription)

GET /api/auth/callback - OAuth コールバック Google OAuth 認証後にリダイレクトされるエンドポイント - Web版: 302リダイレクト - Flutter版: ディープリンクにリダイレクト

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = AuthApi();
final code = code_example; // String | 
final state = state_example; // String | 
final error = error_example; // String | 
final errorDescription = errorDescription_example; // String | 

try {
    api_instance.authControllerCallback(code, state, error, errorDescription);
} catch (e) {
    print('Exception when calling AuthApi->authControllerCallback: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **code** | **String**|  | 
 **state** | **String**|  | 
 **error** | **String**|  | [optional] 
 **errorDescription** | **String**|  | [optional] 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerGetUserInfo**
> UserInfoDto authControllerGetUserInfo()

GET /api/auth/me - ユーザー情報取得

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = AuthApi();

try {
    final result = api_instance.authControllerGetUserInfo();
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->authControllerGetUserInfo: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**UserInfoDto**](UserInfoDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogin**
> LoginResponseDto authControllerLogin()

POST /api/auth/login - ログイン開始

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = AuthApi();

try {
    final result = api_instance.authControllerLogin();
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->authControllerLogin: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**LoginResponseDto**](LoginResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogout**
> authControllerLogout()

POST /api/auth/logout - ログアウト

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = AuthApi();

try {
    api_instance.authControllerLogout();
} catch (e) {
    print('Exception when calling AuthApi->authControllerLogout: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRefreshToken**
> RefreshTokenResponseDto authControllerRefreshToken()

POST /api/auth/refresh - トークン更新

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = AuthApi();

try {
    final result = api_instance.authControllerRefreshToken();
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->authControllerRefreshToken: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**RefreshTokenResponseDto**](RefreshTokenResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

