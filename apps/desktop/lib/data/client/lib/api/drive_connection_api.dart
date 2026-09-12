//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class DriveConnectionApi {
  DriveConnectionApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// DELETE /api/drive-connections/:connectionId 接続を削除
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  Future<Response> driveConnectionControllerDeleteWithHttpInfo(String connectionId,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/drive-connections/{connectionId}'
      .replaceAll('{connectionId}', connectionId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'DELETE',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// DELETE /api/drive-connections/:connectionId 接続を削除
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  Future<void> driveConnectionControllerDelete(String connectionId,) async {
    final response = await driveConnectionControllerDeleteWithHttpInfo(connectionId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// GET /api/drive-connections/:provider/callback Drive接続 callback（JSON返却）
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] provider (required):
  ///
  /// * [String] code (required):
  ///
  /// * [String] state (required):
  Future<Response> driveConnectionControllerHandleConnectionCallbackWithHttpInfo(String provider, String code, String state,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/drive-connections/{provider}/callback'
      .replaceAll('{provider}', provider);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'code', code));
      queryParams.addAll(_queryParams('', 'state', state));

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

  /// GET /api/drive-connections/:provider/callback Drive接続 callback（JSON返却）
  ///
  /// Parameters:
  ///
  /// * [String] provider (required):
  ///
  /// * [String] code (required):
  ///
  /// * [String] state (required):
  Future<void> driveConnectionControllerHandleConnectionCallback(String provider, String code, String state,) async {
    final response = await driveConnectionControllerHandleConnectionCallbackWithHttpInfo(provider, code, state,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// POST /api/drive-connections/:provider Drive接続開始（OAuth認可URLを返す）
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] provider (required):
  Future<Response> driveConnectionControllerInitiateConnectionWithHttpInfo(String provider,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/drive-connections/{provider}'
      .replaceAll('{provider}', provider);

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

  /// POST /api/drive-connections/:provider Drive接続開始（OAuth認可URLを返す）
  ///
  /// Parameters:
  ///
  /// * [String] provider (required):
  Future<void> driveConnectionControllerInitiateConnection(String provider,) async {
    final response = await driveConnectionControllerInitiateConnectionWithHttpInfo(provider,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// GET /api/drive-connections 接続済みドライブリストを取得
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> driveConnectionControllerListWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/drive-connections';

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

  /// GET /api/drive-connections 接続済みドライブリストを取得
  Future<void> driveConnectionControllerList() async {
    final response = await driveConnectionControllerListWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
