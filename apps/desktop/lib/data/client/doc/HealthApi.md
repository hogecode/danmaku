# desktop.api.HealthApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**healthControllerHealth**](HealthApi.md#healthcontrollerhealth) | **GET** /api/health | 


# **healthControllerHealth**
> Object healthControllerHealth()



### Example
```dart
import 'package:desktop/api.dart';

final api_instance = HealthApi();

try {
    final result = api_instance.healthControllerHealth();
    print(result);
} catch (e) {
    print('Exception when calling HealthApi->healthControllerHealth: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

**Object**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

