import 'package:mobile/domain/entities/user_entity.dart';

/// ユーザーモデル（API レスポンス用）
class UserModel {
  final String id;
  final String email;
  final String? name;
  final String? pictureUrl;
  final String oauthProvider;
  final DateTime? lastLogin;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.email,
    this.name,
    this.pictureUrl,
    required this.oauthProvider,
    this.lastLogin,
    required this.createdAt,
  });

  /// JSON からインスタンスを作成
  factory UserModel.fromJson(
      Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String?,
      pictureUrl:
          json['picture_url'] as String?,
      oauthProvider: json['oauth_provider']
          as String,
      lastLogin: json['last_login'] != null
          ? DateTime.parse(
              json['last_login'] as String)
          : null,
      createdAt:
          DateTime.parse(json['created_at']
              as String),
    );
  }

  /// JSON に変換
  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
        'picture_url': pictureUrl,
        'oauth_provider': oauthProvider,
        'last_login': lastLogin?.toIso8601String(),
        'created_at': createdAt.toIso8601String(),
      };

  /// エンティティに変換
  UserEntity toEntity() => UserEntity(
        id: id,
        email: email,
        name: name,
        pictureUrl: pictureUrl,
        oauthProvider: oauthProvider,
        lastLogin: lastLogin,
        createdAt: createdAt,
      );
}
