import 'package:mobile/data/client/lib/api.dart';
import 'package:mobile/services/video_service.dart';

/// ビデオコメント取得サービス
///
/// 責務：
/// - VideoService をラップしてコメント取得を管理
/// - DTO のバリデーション（将来の拡張用）
///
/// 設計パターン：Repository Pattern (Service層実装)
/// VideoService（API層）の上に薄いラッパーを提供
class VideoCommentService {
  final VideoService videoService;

  VideoCommentService({required this.videoService});

  /// 動画のコメント（弾幕）を取得
  ///
  /// @param videoFileId - 動画ファイル ID (GDrive)
  /// @param folderId - 動画が存在するフォルダ ID
  /// @returns DPlayer 互換コメント配列
  Future<List<DPlayerCommentDto>> getComments(
    String videoFileId,
    String folderId,
  ) =>
      videoService.getVideoComments(
        videoFileId: videoFileId,
        folderId: folderId,
      );

  /// 複数の動画のコメントを一括取得（将来の拡張用）
  Future<Map<String, List<DPlayerCommentDto>>> getMultipleComments(
    List<String> videoFileIds,
    String folderId,
  ) =>
      videoService.getMultipleVideoComments(
        videoFileIds: videoFileIds,
        folderId: folderId,
      );
}
