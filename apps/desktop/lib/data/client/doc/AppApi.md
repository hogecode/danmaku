# desktop.api.AppApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**appControllerGetHello**](AppApi.md#appcontrollergethello) | **GET** / | 


# **appControllerGetHello**
> String appControllerGetHello()



### Example
```dart
import 'package:desktop/api.dart';

final api_instance = AppApi();

try {
    final result = api_instance.appControllerGetHello();
    print(result);
} catch (e) {
    print('Exception when calling AppApi->appControllerGetHello: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**String**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

