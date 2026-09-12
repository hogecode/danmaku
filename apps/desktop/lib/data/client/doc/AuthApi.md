# desktop.api.AuthApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authControllerCallbackWithProvider**](AuthApi.md#authcontrollercallbackwithprovider) | **GET** /api/auth/callback/{provider} | GET /api/auth/callback/:provider - プロバイダー別 OAuth コールバック 例: GET /api/auth/callback/onedrive  DB にユーザー情報を保存し、セッションにユーザーIDを設定してリダイレクトする
[**authControllerGetUserInfo**](AuthApi.md#authcontrollergetuserinfo) | **GET** /api/auth/me | GET /api/auth/me - ユーザー情報取得
[**authControllerLoginWithProvider**](AuthApi.md#authcontrollerloginwithprovider) | **POST** /api/auth/login/{provider} | POST /api/auth/login/:provider - プロバイダー別ログイン開始  認可URLを生成して返す
[**authControllerLogout**](AuthApi.md#authcontrollerlogout) | **POST** /api/auth/logout | POST /api/auth/logout - ログアウト


# **authControllerCallbackWithProvider**
> authControllerCallbackWithProvider(provider, code, state, error, errorDescription)

GET /api/auth/callback/:provider - プロバイダー別 OAuth コールバック 例: GET /api/auth/callback/onedrive  DB にユーザー情報を保存し、セッションにユーザーIDを設定してリダイレクトする

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = AuthApi();
final provider = provider_example; // String | 
final code = code_example; // String | 
final state = state_example; // String | 
final error = error_example; // String | 
final errorDescription = errorDescription_example; // String | 

try {
    api_instance.authControllerCallbackWithProvider(provider, code, state, error, errorDescription);
} catch (e) {
    print('Exception when calling AuthApi->authControllerCallbackWithProvider: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **String**|  | 
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

# **authControllerLoginWithProvider**
> LoginResponseDto authControllerLoginWithProvider(provider)

POST /api/auth/login/:provider - プロバイダー別ログイン開始  認可URLを生成して返す

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = AuthApi();
final provider = provider_example; // String | 

try {
    final result = api_instance.authControllerLoginWithProvider(provider);
    print(result);
} catch (e) {
    print('Exception when calling AuthApi->authControllerLoginWithProvider: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **String**|  | 

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

