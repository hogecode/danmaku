//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class PlayerApi {
  PlayerApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Performs an HTTP 'GET /api/player/comments/{videoFileId}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] videoFileId (required):
  ///
  /// * [String] folderId (required):
  Future<Response> playerControllerGetCommentsWithHttpInfo(String videoFileId, String folderId,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/player/comments/{videoFileId}'
      .replaceAll('{videoFileId}', videoFileId);

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
  /// * [String] videoFileId (required):
  ///
  /// * [String] folderId (required):
  Future<void> playerControllerGetComments(String videoFileId, String folderId,) async {
    final response = await playerControllerGetCommentsWithHttpInfo(videoFileId, folderId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Performs an HTTP 'GET /api/player/stream/{fileId}' operation and returns the [Response].
  /// Parameters:
  ///
  /// * [String] fileId (required):
  ///
  /// * [String] range (required):
  Future<Response> playerControllerStreamVideoWithHttpInfo(String fileId, String range,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/player/stream/{fileId}'
      .replaceAll('{fileId}', fileId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    headerParams[r'range'] = parameterToString(range);

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
  /// * [String] fileId (required):
  ///
  /// * [String] range (required):
  Future<void> playerControllerStreamVideo(String fileId, String range,) async {
    final response = await playerControllerStreamVideoWithHttpInfo(fileId, range,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
