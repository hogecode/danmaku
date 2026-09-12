//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class FolderApi {
  FolderApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// GET /api/drive/list フォルダ内容を取得
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] folderId:
  Future<Response> folderControllerListFolderWithHttpInfo(String connectionId, { String? folderId, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/drive/list';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (folderId != null) {
      queryParams.addAll(_queryParams('', 'folderId', folderId));
    }
      queryParams.addAll(_queryParams('', 'connectionId', connectionId));

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

  /// GET /api/drive/list フォルダ内容を取得
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] folderId:
  Future<FolderListDto?> folderControllerListFolder(String connectionId, { String? folderId, }) async {
    final response = await folderControllerListFolderWithHttpInfo(connectionId,  folderId: folderId, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'FolderListDto',) as FolderListDto;
    
    }
    return null;
  }

  /// GET /api/drive/connections/:connectionId/files  特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] folderId:
  Future<Response> folderControllerListFolderByConnectionWithHttpInfo(String connectionId, { String? folderId, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/drive/connections/{connectionId}/files'
      .replaceAll('{connectionId}', connectionId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (folderId != null) {
      queryParams.addAll(_queryParams('', 'folderId', folderId));
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

  /// GET /api/drive/connections/:connectionId/files  特定のドライブ接続からフォルダ内容を取得（マルチプロバイダー対応）
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] folderId:
  Future<FolderListDto?> folderControllerListFolderByConnection(String connectionId, { String? folderId, }) async {
    final response = await folderControllerListFolderByConnectionWithHttpInfo(connectionId,  folderId: folderId, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'FolderListDto',) as FolderListDto;
    
    }
    return null;
  }

  /// GET /api/drive/search フォルダ内でキーワード検索
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] query (required):
  Future<Response> folderControllerSearchWithHttpInfo(String connectionId, String folderId, String query,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/drive/search';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'connectionId', connectionId));
      queryParams.addAll(_queryParams('', 'folderId', folderId));
      queryParams.addAll(_queryParams('', 'query', query));

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

  /// GET /api/drive/search フォルダ内でキーワード検索
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] query (required):
  Future<FolderListDto?> folderControllerSearch(String connectionId, String folderId, String query,) async {
    final response = await folderControllerSearchWithHttpInfo(connectionId, folderId, query,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'FolderListDto',) as FolderListDto;
    
    }
    return null;
  }

  /// GET /api/drive/connections/:connectionId/search 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] query (required):
  Future<Response> folderControllerSearchByConnectionWithHttpInfo(String connectionId, String folderId, String query,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/drive/connections/{connectionId}/search'
      .replaceAll('{connectionId}', connectionId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'folderId', folderId));
      queryParams.addAll(_queryParams('', 'query', query));

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

  /// GET /api/drive/connections/:connectionId/search 特定のドライブ接続内でキーワード検索（マルチプロバイダー対応）
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] query (required):
  Future<FolderListDto?> folderControllerSearchByConnection(String connectionId, String folderId, String query,) async {
    final response = await folderControllerSearchByConnectionWithHttpInfo(connectionId, folderId, query,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'FolderListDto',) as FolderListDto;
    
    }
    return null;
  }
}
