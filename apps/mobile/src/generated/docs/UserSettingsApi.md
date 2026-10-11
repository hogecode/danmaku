# UserSettingsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**userSettingsControllerGetSettings**](UserSettingsApi.md#usersettingscontrollergetsettings) | **GET** /api/user-settings | GET /api/user-settings - ユーザー設定を取得  現在のユーザーの設定を取得します。 存在しない場合はデフォルト値で自動作成します。 |
| [**userSettingsControllerResetSettings**](UserSettingsApi.md#usersettingscontrollerresetsettings) | **PATCH** /api/user-settings/reset | PATCH /api/user-settings/reset - ユーザー設定をリセット  すべての設定をデフォルト値に戻します。 |
| [**userSettingsControllerUpdateSettings**](UserSettingsApi.md#usersettingscontrollerupdatesettings) | **PATCH** /api/user-settings | PATCH /api/user-settings - ユーザー設定を更新  指定されたフィールドのみを更新します。 更新可能なフィールド: theme, language, danmaku_max_count, ng_words_reg |



## userSettingsControllerGetSettings

> UserSettingsDto userSettingsControllerGetSettings()

GET /api/user-settings - ユーザー設定を取得  現在のユーザーの設定を取得します。 存在しない場合はデフォルト値で自動作成します。

### Example

```ts
import {
  Configuration,
  UserSettingsApi,
} from '';
import type { UserSettingsControllerGetSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new UserSettingsApi();

  try {
    const data = await api.userSettingsControllerGetSettings();
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

[**UserSettingsDto**](UserSettingsDto.md)

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


## userSettingsControllerResetSettings

> UserSettingsDto userSettingsControllerResetSettings()

PATCH /api/user-settings/reset - ユーザー設定をリセット  すべての設定をデフォルト値に戻します。

### Example

```ts
import {
  Configuration,
  UserSettingsApi,
} from '';
import type { UserSettingsControllerResetSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new UserSettingsApi();

  try {
    const data = await api.userSettingsControllerResetSettings();
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

[**UserSettingsDto**](UserSettingsDto.md)

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


## userSettingsControllerUpdateSettings

> UserSettingsDto userSettingsControllerUpdateSettings(updateUserSettingsDto)

PATCH /api/user-settings - ユーザー設定を更新  指定されたフィールドのみを更新します。 更新可能なフィールド: theme, language, danmaku_max_count, ng_words_reg

### Example

```ts
import {
  Configuration,
  UserSettingsApi,
} from '';
import type { UserSettingsControllerUpdateSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new UserSettingsApi();

  const body = {
    // UpdateUserSettingsDto
    updateUserSettingsDto: ...,
  } satisfies UserSettingsControllerUpdateSettingsRequest;

  try {
    const data = await api.userSettingsControllerUpdateSettings(body);
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
| **updateUserSettingsDto** | [UpdateUserSettingsDto](UpdateUserSettingsDto.md) |  | |

### Return type

[**UserSettingsDto**](UserSettingsDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

