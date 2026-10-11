# desktop.api.UserSettingsApi

## Load the API package
```dart
import 'package:desktop/api.dart';
```

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**userSettingsControllerGetSettings**](UserSettingsApi.md#usersettingscontrollergetsettings) | **GET** /api/user-settings | GET /api/user-settings - ユーザー設定を取得  現在のユーザーの設定を取得します。 存在しない場合はデフォルト値で自動作成します。
[**userSettingsControllerResetSettings**](UserSettingsApi.md#usersettingscontrollerresetsettings) | **PATCH** /api/user-settings/reset | PATCH /api/user-settings/reset - ユーザー設定をリセット  すべての設定をデフォルト値に戻します。
[**userSettingsControllerUpdateSettings**](UserSettingsApi.md#usersettingscontrollerupdatesettings) | **PATCH** /api/user-settings | PATCH /api/user-settings - ユーザー設定を更新  指定されたフィールドのみを更新します。 更新可能なフィールド: theme, language, danmaku_max_count, ng_words_reg


# **userSettingsControllerGetSettings**
> UserSettingsDto userSettingsControllerGetSettings()

GET /api/user-settings - ユーザー設定を取得  現在のユーザーの設定を取得します。 存在しない場合はデフォルト値で自動作成します。

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = UserSettingsApi();

try {
    final result = api_instance.userSettingsControllerGetSettings();
    print(result);
} catch (e) {
    print('Exception when calling UserSettingsApi->userSettingsControllerGetSettings: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**UserSettingsDto**](UserSettingsDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userSettingsControllerResetSettings**
> UserSettingsDto userSettingsControllerResetSettings()

PATCH /api/user-settings/reset - ユーザー設定をリセット  すべての設定をデフォルト値に戻します。

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = UserSettingsApi();

try {
    final result = api_instance.userSettingsControllerResetSettings();
    print(result);
} catch (e) {
    print('Exception when calling UserSettingsApi->userSettingsControllerResetSettings: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**UserSettingsDto**](UserSettingsDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userSettingsControllerUpdateSettings**
> UserSettingsDto userSettingsControllerUpdateSettings(updateUserSettingsDto)

PATCH /api/user-settings - ユーザー設定を更新  指定されたフィールドのみを更新します。 更新可能なフィールド: theme, language, danmaku_max_count, ng_words_reg

### Example
```dart
import 'package:desktop/api.dart';

final api_instance = UserSettingsApi();
final updateUserSettingsDto = UpdateUserSettingsDto(); // UpdateUserSettingsDto | 

try {
    final result = api_instance.userSettingsControllerUpdateSettings(updateUserSettingsDto);
    print(result);
} catch (e) {
    print('Exception when calling UserSettingsApi->userSettingsControllerUpdateSettings: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateUserSettingsDto** | [**UpdateUserSettingsDto**](UpdateUserSettingsDto.md)|  | 

### Return type

[**UserSettingsDto**](UserSettingsDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

