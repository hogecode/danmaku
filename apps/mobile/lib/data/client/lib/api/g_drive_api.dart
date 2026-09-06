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

  /// Performs an HTTP 'GET /api/gdrive/list' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] folderId (required):
  Future<Response> gDriveControllerListFolderWithHttpInfo(String folderId,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/gdrive/list';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'folderId', folderId));

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

  /// Parameters:
  ///
  /// * [String] folderId (required):
  Future<void> gDriveControllerListFolder(String folderId,) async {
    final response = await gDriveControllerListFolderWithHttpInfo(folderId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/gdrive/search' operation and returns the [Response].
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

  /// Parameters:
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] query (required):
  Future<void> gDriveControllerSearch(String folderId, String query,) async {
    final response = await gDriveControllerSearchWithHttpInfo(folderId, query,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
