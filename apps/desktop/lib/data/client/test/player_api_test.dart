//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

import 'package:desktop/api.dart';
import 'package:test/test.dart';


/// tests for PlayerApi
void main() {
  // final instance = PlayerApi();

  group('tests for PlayerApi', () {
    // POST /api/player/token - 動画ストリーミング用トークン生成  目的: モバイルアプリでの動画URL認証 - URL クエリパラメータ ?token={jwt} で認証するためのトークンを生成 - 有効期限: 15分（デフォルト）  TODO: userIdではなく、videoFileIdを使ってトークンを生成するように変更する
    //
    //Future playerControllerGenerateVideoToken() async
    test('test playerControllerGenerateVideoToken', () async {
      // TODO
    });

    // DPlayer 互換形式でコメントを取得  コメントファイルの自動検出: - 動画: \"aaa.mp4\" - コメント: \"aaa.xml\" または \"aaa.json\" を自動検索 - 見つかった場合: DPlayer 互換形式に変換して返す - 見つからない場合: 空配列を返す
    //
    //Future<DPlayerCommentListDto> playerControllerGetComments(String videoFileId, String folderId, String connectionId) async
    test('test playerControllerGetComments', () async {
      // TODO
    });

    // 動画ファイルをストリーミング再生（マルチプロバイダー対応）
    //
    //Future playerControllerStreamVideo(String connectionId, String fileId, String range) async
    test('test playerControllerStreamVideo', () async {
      // TODO
    });

  });
}
