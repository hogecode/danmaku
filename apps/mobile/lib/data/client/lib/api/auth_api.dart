//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class AuthApi {
  AuthApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// GET /api/auth/callback - OAuth コールバック Google OAuth 認証後にリダイレクトされるエンドポイント - Web版: 302リダイレクト - Flutter版: ディープリンクにリダイレクト
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] code (required):
  ///
  /// * [String] state (required):
  ///
  /// * [String] error:
  ///
  /// * [String] errorDescription:
  Future<Response> authControllerCallbackWithHttpInfo(String code, String state, { String? error, String? errorDescription, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/callback';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'code', code));
      queryParams.addAll(_queryParams('', 'state', state));
    if (error != null) {
      queryParams.addAll(_queryParams('', 'error', error));
    }
    if (errorDescription != null) {
      queryParams.addAll(_queryParams('', 'error_description', errorDescription));
    }

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

  /// GET /api/auth/callback - OAuth コールバック Google OAuth 認証後にリダイレクトされるエンドポイント - Web版: 302リダイレクト - Flutter版: ディープリンクにリダイレクト
  ///
  /// Parameters:
  ///
  /// * [String] code (required):
  ///
  /// * [String] state (required):
  ///
  /// * [String] error:
  ///
  /// * [String] errorDescription:
  Future<void> authControllerCallback(String code, String state, { String? error, String? errorDescription, }) async {
    final response = await authControllerCallbackWithHttpInfo(code, state,  error: error, errorDescription: errorDescription, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// GET /api/auth/me - ユーザー情報取得
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> authControllerGetUserInfoWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/me';

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

  /// GET /api/auth/me - ユーザー情報取得
  Future<UserInfoDto?> authControllerGetUserInfo() async {
    final response = await authControllerGetUserInfoWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'UserInfoDto',) as UserInfoDto;
    
    }
    return null;
  }

  /// POST /api/auth/login - ログイン開始
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> authControllerLoginWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/login';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// POST /api/auth/login - ログイン開始
  Future<LoginResponseDto?> authControllerLogin() async {
    final response = await authControllerLoginWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'LoginResponseDto',) as LoginResponseDto;
    
    }
    return null;
  }

  /// POST /api/auth/logout - ログアウト
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> authControllerLogoutWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/logout';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// POST /api/auth/logout - ログアウト
  Future<void> authControllerLogout() async {
    final response = await authControllerLogoutWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// POST /api/auth/refresh - トークン更新
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> authControllerRefreshTokenWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/auth/refresh';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// POST /api/auth/refresh - トークン更新
  Future<RefreshTokenResponseDto?> authControllerRefreshToken() async {
    final response = await authControllerRefreshTokenWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'RefreshTokenResponseDto',) as RefreshTokenResponseDto;
    
    }
    return null;
  }
}
