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

  /// POST /api/player/token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token={jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）  TODO: userIdではなく、videoFileIdを使ってトークンを生成するように変更する
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> playerControllerGenerateVideoTokenWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/api/player/token';

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

  /// POST /api/player/token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token={jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）  TODO: userIdではなく、videoFileIdを使ってトークンを生成するように変更する
  Future<void> playerControllerGenerateVideoToken() async {
    final response = await playerControllerGenerateVideoTokenWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] videoFileId (required):
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] connectionId (required):
  Future<Response> playerControllerGetCommentsWithHttpInfo(String videoFileId, String folderId, String connectionId,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/player/comments/{videoFileId}'
      .replaceAll('{videoFileId}', videoFileId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

      queryParams.addAll(_queryParams('', 'folderId', folderId));
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

  /// DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す
  ///
  /// Parameters:
  ///
  /// * [String] videoFileId (required):
  ///
  /// * [String] folderId (required):
  ///
  /// * [String] connectionId (required):
  Future<DPlayerCommentListDto?> playerControllerGetComments(String videoFileId, String folderId, String connectionId,) async {
    final response = await playerControllerGetCommentsWithHttpInfo(videoFileId, folderId, connectionId,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'DPlayerCommentListDto',) as DPlayerCommentListDto;
    
    }
    return null;
  }

  /// 動画ファイルをストリーミング再生（マルチプロバイダー対応）
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] fileId (required):
  ///
  /// * [String] range (required):
  Future<Response> playerControllerStreamVideoWithHttpInfo(String connectionId, String fileId, String range,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/player/stream/{connectionId}/{fileId}'
      .replaceAll('{connectionId}', connectionId)
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

  /// 動画ファイルをストリーミング再生（マルチプロバイダー対応）
  ///
  /// Parameters:
  ///
  /// * [String] connectionId (required):
  ///
  /// * [String] fileId (required):
  ///
  /// * [String] range (required):
  Future<void> playerControllerStreamVideo(String connectionId, String fileId, String range,) async {
    final response = await playerControllerStreamVideoWithHttpInfo(connectionId, fileId, range,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
