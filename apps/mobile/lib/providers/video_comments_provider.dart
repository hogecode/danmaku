import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/data/client/lib/api.dart';
import 'package:mobile/data/repositories/video_comment_repository.dart';
import 'package:mobile/services/video_service.dart';

/// ビデオコメントリポジトリのプロバイダー
/// 
/// VideoService を使用して VideoCommentRepository を生成
final videoCommentRepositoryProvider = Provider<VideoCommentRepository>((ref) {
  return VideoCommentRepository(videoService: VideoService());
});

/// ビデオコメント取得の非同期プロバイダー
/// 
/// 特徴：
/// - 動画ファイル ID とフォルダ ID から非同期でコメント取得
/// - 自動キャッシング
/// - エラー時は空配列を返す（プレイヤーは継続動作）
/// 
/// 使用例：
/// ```dart
/// final commentsAsync = ref.watch(
///   videoCommentsSimpleProvider((videoFileId, folderId))
/// );
/// 
/// commentsAsync.when(
///   loading: () => SizedBox.shrink(),
///   error: (error, stackTrace) => SizedBox.shrink(),
///   data: (comments) => DanmakuCanvas(danmakuList: comments),
/// );
/// ```
final videoCommentsSimpleProvider = FutureProvider.family<
    List<DPlayerCommentDto>,
    (String, String)>((ref, args) async {
  final (videoFileId, folderId) = args;
  final repository = ref.watch(videoCommentRepositoryProvider);
  return repository.getComments(videoFileId, folderId);
});
