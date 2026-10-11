//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class KakologApi {
  KakologApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// POST /api/kakolog/download/comments  チャンネルの時間範囲内のコメントを DPlayer 形式で取得
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [GetKakologCommentsRequestDto] getKakologCommentsRequestDto (required):
  Future<Response> kakologControllerDownloadCommentsWithHttpInfo(GetKakologCommentsRequestDto getKakologCommentsRequestDto,) async {
    // ignore: prefer_const_declarations
    final path = r'/api/kakolog/download/comments';

    // ignore: prefer_final_locals
    Object? postBody = getKakologCommentsRequestDto;

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

  /// POST /api/kakolog/download/comments  チャンネルの時間範囲内のコメントを DPlayer 形式で取得
  ///
  /// Parameters:
  ///
  /// * [GetKakologCommentsRequestDto] getKakologCommentsRequestDto (required):
  Future<GetKakologCommentsResponseDto?> kakologControllerDownloadComments(GetKakologCommentsRequestDto getKakologCommentsRequestDto,) async {
    final response = await kakologControllerDownloadCommentsWithHttpInfo(getKakologCommentsRequestDto,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'GetKakologCommentsResponseDto',) as GetKakologCommentsResponseDto;
    
    }
    return null;
  }
}
