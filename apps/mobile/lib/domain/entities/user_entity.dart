/// ユーザーエンティティ
class UserEntity {
  final String id;
  final String email;
  final String? name;
  final String? pictureUrl;
  final String oauthProvider;
  final DateTime? lastLogin;
  final DateTime createdAt;

  const UserEntity({
    required this.id,
    required this.email,
    this.name,
    this.pictureUrl,
    required this.oauthProvider,
    this.lastLogin,
    required this.createdAt,
  });

  /// コピー用メソッド
  UserEntity copyWith({
    String? id,
    String? email,
    String? name,
    String? pictureUrl,
    String? oauthProvider,
    DateTime? lastLogin,
    DateTime? createdAt,
  }) {
    return UserEntity(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      pictureUrl: pictureUrl ?? this.pictureUrl,
      oauthProvider: oauthProvider ?? this.oauthProvider,
      lastLogin: lastLogin ?? this.lastLogin,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  String toString() =>
      'UserEntity(id: $id, email: $email, name: $name, oauthProvider: $oauthProvider)';
}
