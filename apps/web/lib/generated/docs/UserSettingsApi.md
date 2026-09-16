# UserSettingsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userSettingsControllerGetSettings**](#usersettingscontrollergetsettings) | **GET** /api/user-settings | GET /api/user-settings - ユーザー設定を取得  現在のユーザーの設定を取得します。 存在しない場合はデフォルト値で自動作成します。|
|[**userSettingsControllerResetSettings**](#usersettingscontrollerresetsettings) | **PATCH** /api/user-settings/reset | PATCH /api/user-settings/reset - ユーザー設定をリセット  すべての設定をデフォルト値に戻します。|
|[**userSettingsControllerUpdateSettings**](#usersettingscontrollerupdatesettings) | **PATCH** /api/user-settings | PATCH /api/user-settings - ユーザー設定を更新  指定されたフィールドのみを更新します。|

# **userSettingsControllerGetSettings**
> UserSettingsDto userSettingsControllerGetSettings()


### Example

```typescript
import {
    UserSettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsApi(configuration);

const { status, data } = await apiInstance.userSettingsControllerGetSettings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserSettingsDto**

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

# **userSettingsControllerResetSettings**
> UserSettingsDto userSettingsControllerResetSettings()


### Example

```typescript
import {
    UserSettingsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsApi(configuration);

const { status, data } = await apiInstance.userSettingsControllerResetSettings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserSettingsDto**

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

# **userSettingsControllerUpdateSettings**
> UserSettingsDto userSettingsControllerUpdateSettings(updateUserSettingsDto)


### Example

```typescript
import {
    UserSettingsApi,
    Configuration,
    UpdateUserSettingsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserSettingsApi(configuration);

let updateUserSettingsDto: UpdateUserSettingsDto; //

const { status, data } = await apiInstance.userSettingsControllerUpdateSettings(
    updateUserSettingsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateUserSettingsDto** | **UpdateUserSettingsDto**|  | |


### Return type

**UserSettingsDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

