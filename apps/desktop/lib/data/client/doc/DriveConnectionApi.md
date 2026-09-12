# desktop.api.DriveConnectionApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**driveConnectionControllerDelete**](DriveConnectionApi.md#driveconnectioncontrollerdelete) | **DELETE** /api/drive-connections/{connectionId} | DELETE /api/drive-connections/:connectionId 接続を削除
[**driveConnectionControllerHandleConnectionCallback**](DriveConnectionApi.md#driveconnectioncontrollerhandleconnectioncallback) | **GET** /api/drive-connections/{provider}/callback | GET /api/drive-connections/:provider/callback Drive接続 callback（JSON返却）
[**driveConnectionControllerInitiateConnection**](DriveConnectionApi.md#driveconnectioncontrollerinitiateconnection) | **POST** /api/drive-connections/{provider} | POST /api/drive-connections/:provider Drive接続開始（OAuth認可URLを返す）
[**driveConnectionControllerList**](DriveConnectionApi.md#driveconnectioncontrollerlist) | **GET** /api/drive-connections | GET /api/drive-connections 接続済みドライブリストを取得


# **driveConnectionControllerDelete**
> driveConnectionControllerDelete(connectionId)

DELETE /api/drive-connections/:connectionId 接続を削除

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = DriveConnectionApi();
final connectionId = connectionId_example; // String | 

try {
    api_instance.driveConnectionControllerDelete(connectionId);
} catch (e) {
    print('Exception when calling DriveConnectionApi->driveConnectionControllerDelete: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **connectionId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **driveConnectionControllerHandleConnectionCallback**
> driveConnectionControllerHandleConnectionCallback(provider, code, state)

GET /api/drive-connections/:provider/callback Drive接続 callback（JSON返却）

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = DriveConnectionApi();
final provider = provider_example; // String | 
final code = code_example; // String | 
final state = state_example; // String | 

try {
    api_instance.driveConnectionControllerHandleConnectionCallback(provider, code, state);
} catch (e) {
    print('Exception when calling DriveConnectionApi->driveConnectionControllerHandleConnectionCallback: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **String**|  | 
 **code** | **String**|  | 
 **state** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **driveConnectionControllerInitiateConnection**
> driveConnectionControllerInitiateConnection(provider)

POST /api/drive-connections/:provider Drive接続開始（OAuth認可URLを返す）

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = DriveConnectionApi();
final provider = provider_example; // String | 

try {
    api_instance.driveConnectionControllerInitiateConnection(provider);
} catch (e) {
    print('Exception when calling DriveConnectionApi->driveConnectionControllerInitiateConnection: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **provider** | **String**|  | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **driveConnectionControllerList**
> driveConnectionControllerList()

GET /api/drive-connections 接続済みドライブリストを取得

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = DriveConnectionApi();

try {
    api_instance.driveConnectionControllerList();
} catch (e) {
    print('Exception when calling DriveConnectionApi->driveConnectionControllerList: $e\n');
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

