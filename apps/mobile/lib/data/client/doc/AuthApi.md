# mobile.api.AuthApi

## Load the API package
```dart
import 'package:mobile/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authControllerCallback**](AuthApi.md#authcontrollercallback) | **GET** /api/auth/callback | 
[**authControllerGetUserInfo**](AuthApi.md#authcontrollergetuserinfo) | **GET** /api/auth/me | 
[**authControllerLogin**](AuthApi.md#authcontrollerlogin) | **POST** /api/auth/login | 
[**authControllerLogout**](AuthApi.md#authcontrollerlogout) | **POST** /api/auth/logout | 
[**authControllerRefreshToken**](AuthApi.md#authcontrollerrefreshtoken) | **POST** /api/auth/refresh | 


# **authControllerCallback**
> authControllerCallback()



### Example
```dart
import 'package:mobile/api.dart';

final api_instance = AuthApi();

try {
    api_instance.authControllerCallback();
} catch (e) {
    print('Exception when calling AuthApi->authControllerCallback: $e\n');
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

# **authControllerGetUserInfo**
> authControllerGetUserInfo()



### Example
```dart
import 'package:mobile/api.dart';

final api_instance = AuthApi();

try {
    api_instance.authControllerGetUserInfo();
} catch (e) {
    print('Exception when calling AuthApi->authControllerGetUserInfo: $e\n');
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

# **authControllerLogin**
> authControllerLogin()



### Example
```dart
import 'package:mobile/api.dart';

final api_instance = AuthApi();

try {
    api_instance.authControllerLogin();
} catch (e) {
    print('Exception when calling AuthApi->authControllerLogin: $e\n');
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

# **authControllerLogout**
> authControllerLogout()



### Example
```dart
import 'package:mobile/api.dart';

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
> authControllerRefreshToken()



### Example
```dart
import 'package:mobile/api.dart';

final api_instance = AuthApi();

try {
    api_instance.authControllerRefreshToken();
} catch (e) {
    print('Exception when calling AuthApi->authControllerRefreshToken: $e\n');
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

