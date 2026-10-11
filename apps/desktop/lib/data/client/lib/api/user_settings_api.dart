//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class UserSettingsApi {
  UserSettingsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// GET /api/user-settings - ユーザー設定を取得  現在のユーザーの設定を取得します。 存在しない場合はデフォルト値で自動作成します。
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> userSettingsControllerGetSettingsWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/user-settings';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// GET /api/user-settings - ユーザー設定を取得  現在のユーザーの設定を取得します。 存在しない場合はデフォルト値で自動作成します。
  Future<UserSettingsDto?> userSettingsControllerGetSettings() async {
    final response = await userSettingsControllerGetSettingsWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'UserSettingsDto',) as UserSettingsDto;
    
    }
    return null;
  }

  /// PATCH /api/user-settings/reset - ユーザー設定をリセット  すべての設定をデフォルト値に戻します。
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> userSettingsControllerResetSettingsWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/user-settings/reset';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// PATCH /api/user-settings/reset - ユーザー設定をリセット  すべての設定をデフォルト値に戻します。
  Future<UserSettingsDto?> userSettingsControllerResetSettings() async {
    final response = await userSettingsControllerResetSettingsWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'UserSettingsDto',) as UserSettingsDto;
    
    }
    return null;
  }

  /// PATCH /api/user-settings - ユーザー設定を更新  指定されたフィールドのみを更新します。 更新可能なフィールド: theme, language, danmaku_max_count, ng_words_reg
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [UpdateUserSettingsDto] updateUserSettingsDto (required):
  Future<Response> userSettingsControllerUpdateSettingsWithHttpInfo(UpdateUserSettingsDto updateUserSettingsDto,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/user-settings';

    // ignore: prefer_final_locals
    Object? postBody = updateUserSettingsDto;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// PATCH /api/user-settings - ユーザー設定を更新  指定されたフィールドのみを更新します。 更新可能なフィールド: theme, language, danmaku_max_count, ng_words_reg
  ///
  /// Parameters:
  ///
  /// * [UpdateUserSettingsDto] updateUserSettingsDto (required):
  Future<UserSettingsDto?> userSettingsControllerUpdateSettings(UpdateUserSettingsDto updateUserSettingsDto,) async {
    final response = await userSettingsControllerUpdateSettingsWithHttpInfo(updateUserSettingsDto,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'UserSettingsDto',) as UserSettingsDto;
    
    }
    return null;
  }
}
