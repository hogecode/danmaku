//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class NicovideoApi {
  NicovideoApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// POST /api/nicovideo/download/comments  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 = 非公開動画またはコメント機能無効  TODO: レスポンスDTOを定義
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [DownloadCommentRequestDto] downloadCommentRequestDto (required):
  Future<Response> nicovideoControllerDownloadCommentsWithHttpInfo(DownloadCommentRequestDto downloadCommentRequestDto,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/nicovideo/download/comments';

    // ignore: prefer_final_locals
    Object? postBody = downloadCommentRequestDto;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


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

  /// POST /api/nicovideo/download/comments  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 = 非公開動画またはコメント機能無効  TODO: レスポンスDTOを定義
  ///
  /// Parameters:
  ///
  /// * [DownloadCommentRequestDto] downloadCommentRequestDto (required):
  Future<void> nicovideoControllerDownloadComments(DownloadCommentRequestDto downloadCommentRequestDto,) async {
    final response = await nicovideoControllerDownloadCommentsWithHttpInfo(downloadCommentRequestDto,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
