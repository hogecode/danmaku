//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class GDriveApi {
  GDriveApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// GET /api/gdrive/list フォルダ内容を取得
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] folderId:
  Future<Response> gDriveControllerListFolderWithHttpInfo({ String? folderId, }) async {
    // ignore: prefer_const_declarations
    final path = r'/api/gdrive/list';

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

  /// GET /api/gdrive/list フォルダ内容を取得
  ///
  /// Parameters:
  ///
  /// * [String] folderId:
  Future<FolderListDto?> gDriveControllerListFolder({ String? folderId, }) async {
    final response = await gDriveControllerListFolderWithHttpInfo( folderId: folderId, );
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

  /// GET /api/gdrive/search フォルダ内でキーワード検索
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] query (required):
  Future<Response> gDriveControllerSearchWithHttpInfo(String folderId, String query,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/gdrive/search';

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

  /// GET /api/gdrive/search フォルダ内でキーワード検索
  ///
  /// Parameters:
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] query (required):
  Future<FolderListDto?> gDriveControllerSearch(String folderId, String query,) async {
    final response = await gDriveControllerSearchWithHttpInfo(folderId, query,);
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
