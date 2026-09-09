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

  /// GET /api/player/comments/:videoFileId DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す  Query Parameters: - folderId (required): 動画ファイルが存在するフォルダID  Response (DPlayer 互換形式): {   \"comments\": [     {       \"time\": 10.5,       \"type\": \"normal\",       \"size\": \"normal\",       \"color\": \"#ffffff\",       \"author\": \"SlF_cF2J1CdotJTaojvbM9mDYAE or null\",       \"text\": \"てか無料期間中に見れば無料やん\"     }   ] }
  ///
  /// Note: This method returns the HTTP [Response].
  ///
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

  /// GET /api/player/comments/:videoFileId DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す  Query Parameters: - folderId (required): 動画ファイルが存在するフォルダID  Response (DPlayer 互換形式): {   \"comments\": [     {       \"time\": 10.5,       \"type\": \"normal\",       \"size\": \"normal\",       \"color\": \"#ffffff\",       \"author\": \"SlF_cF2J1CdotJTaojvbM9mDYAE or null\",       \"text\": \"てか無料期間中に見れば無料やん\"     }   ] }
  ///
  /// Parameters:
  ///
  /// * [String] videoFileId (required):
  ///
  /// * [String] folderId (required):
  Future<DPlayerCommentListDto?> playerControllerGetComments(String videoFileId, String folderId,) async {
    final response = await playerControllerGetCommentsWithHttpInfo(videoFileId, folderId,);
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

  /// GET /api/player/stream/:fileId 動画ファイルをストリーミング再生  Range リクエスト対応: - Range: bytes=0-1023 （最初の1KBのみ取得） - Range: bytes=1024- （1KBから最後まで取得） - Range: bytes=-512 （最後の512バイトを取得）  レスポンス: - Range ヘッダーなし: HTTP 200 + Content-Length - Range ヘッダーあり（有効）: HTTP 206 + Content-Range - Range ヘッダーあり（無効）: HTTP 400 Bad Request
  ///
  /// Note: This method returns the HTTP [Response].
  ///
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

  /// GET /api/player/stream/:fileId 動画ファイルをストリーミング再生  Range リクエスト対応: - Range: bytes=0-1023 （最初の1KBのみ取得） - Range: bytes=1024- （1KBから最後まで取得） - Range: bytes=-512 （最後の512バイトを取得）  レスポンス: - Range ヘッダーなし: HTTP 200 + Content-Length - Range ヘッダーあり（有効）: HTTP 206 + Content-Range - Range ヘッダーあり（無効）: HTTP 400 Bad Request
  ///
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
