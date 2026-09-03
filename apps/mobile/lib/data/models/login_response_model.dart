/// ログイン開始レスポンスモデル
class LoginResponseModel {
  final String authorizeUrl;
  final String state;
  final int expiresIn;

  LoginResponseModel({
    required this.authorizeUrl,
    required this.state,
    required this.expiresIn,
  });

  factory LoginResponseModel.fromJson(
      Map<String, dynamic> json) {
    return LoginResponseModel(
      authorizeUrl:
          json['authorize_url'] as String,
      state: json['state'] as String,
      expiresIn: json['expires_in'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'authorize_url': authorizeUrl,
        'state': state,
        'expires_in': expiresIn,
      };
}
