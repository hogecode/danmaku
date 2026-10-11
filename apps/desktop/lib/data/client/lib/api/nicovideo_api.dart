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

  /// DELETE /api/nicovideo/download/:jobId  ダウンロードジョブをキャンセル
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] jobId (required):
  Future<Response> nicovideoControllerCancelDownloadWithHttpInfo(String jobId,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/nicovideo/download/{jobId}'
      .replaceAll('{jobId}', jobId);

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

  /// DELETE /api/nicovideo/download/:jobId  ダウンロードジョブをキャンセル
  ///
  /// Parameters:
  ///
  /// * [String] jobId (required):
  Future<VideoDownloadCancelResponseDto?> nicovideoControllerCancelDownload(String jobId,) async {
    final response = await nicovideoControllerCancelDownloadWithHttpInfo(jobId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'VideoDownloadCancelResponseDto',) as VideoDownloadCancelResponseDto;
    
    }
    return null;
  }

  /// POST /api/nicovideo/download/comments  ニコ動のコメントを取得して DPlayer 形式に変換  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 = 非公開動画またはコメント機能無効 4. ニコ動形式のコメント → DPlayer形式に変換
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

  /// POST /api/nicovideo/download/comments  ニコ動のコメントを取得して DPlayer 形式に変換  1. getVideoMetadata() で HTML から thread_key を抽出 2. thread_key が存在すればコメント取得可能 3. thread_key が不在 = 非公開動画またはコメント機能無効 4. ニコ動形式のコメント → DPlayer形式に変換
  ///
  /// Parameters:
  ///
  /// * [DownloadCommentRequestDto] downloadCommentRequestDto (required):
  Future<DownloadCommentWithDPlayerResponseDto?> nicovideoControllerDownloadComments(DownloadCommentRequestDto downloadCommentRequestDto,) async {
    final response = await nicovideoControllerDownloadCommentsWithHttpInfo(downloadCommentRequestDto,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'DownloadCommentWithDPlayerResponseDto',) as DownloadCommentWithDPlayerResponseDto;
    
    }
    return null;
  }

  /// GET /api/nicovideo/download/progress/:jobId/sse  Server-Sent Events で進捗をリアルタイム配信
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] jobId (required):
  Future<Response> nicovideoControllerGetDownloadProgressWithHttpInfo(String jobId,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/nicovideo/download/progress/{jobId}/sse'
      .replaceAll('{jobId}', jobId);

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

  /// GET /api/nicovideo/download/progress/:jobId/sse  Server-Sent Events で進捗をリアルタイム配信
  ///
  /// Parameters:
  ///
  /// * [String] jobId (required):
  Future<void> nicovideoControllerGetDownloadProgress(String jobId,) async {
    final response = await nicovideoControllerGetDownloadProgressWithHttpInfo(jobId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// GET /api/nicovideo/download/status/:jobId  ダウンロードジョブのステータスを確認
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] jobId (required):
  Future<Response> nicovideoControllerGetDownloadStatusWithHttpInfo(String jobId,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/nicovideo/download/status/{jobId}'
      .replaceAll('{jobId}', jobId);

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

  /// GET /api/nicovideo/download/status/:jobId  ダウンロードジョブのステータスを確認
  ///
  /// Parameters:
  ///
  /// * [String] jobId (required):
  Future<VideoDownloadStatusResponseDto?> nicovideoControllerGetDownloadStatus(String jobId,) async {
    final response = await nicovideoControllerGetDownloadStatusWithHttpInfo(jobId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'VideoDownloadStatusResponseDto',) as VideoDownloadStatusResponseDto;
    
    }
    return null;
  }

  /// POST /api/nicovideo/download/video  非同期で動画ダウンロードを開始 ジョブIDを即座に返す
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [DownloadVideoRequestDto] downloadVideoRequestDto (required):
  Future<Response> nicovideoControllerStartVideoDownloadWithHttpInfo(DownloadVideoRequestDto downloadVideoRequestDto,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/nicovideo/download/video';

    // ignore: prefer_final_locals
    Object? postBody = downloadVideoRequestDto;

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

  /// POST /api/nicovideo/download/video  非同期で動画ダウンロードを開始 ジョブIDを即座に返す
  ///
  /// Parameters:
  ///
  /// * [DownloadVideoRequestDto] downloadVideoRequestDto (required):
  Future<VideoDownloadStartResponseDto?> nicovideoControllerStartVideoDownload(DownloadVideoRequestDto downloadVideoRequestDto,) async {
    final response = await nicovideoControllerStartVideoDownloadWithHttpInfo(downloadVideoRequestDto,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'VideoDownloadStartResponseDto',) as VideoDownloadStartResponseDto;
    
    }
    return null;
  }
}
