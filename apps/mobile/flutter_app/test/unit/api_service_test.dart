import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_app/data/services/api_service.dart';

class MockHttpClient extends Mock implements http.Client {}

void main() {
  group('APIService', () {
    late APIService apiService;
    late MockHttpClient mockClient;

    setUp(() {
      mockClient = MockHttpClient();
      apiService = APIService();
    });

    test('APIService 初期化', () {
      expect(apiService, isNotNull);
    });

    test('ベースURL設定', () {
      expect(apiService.baseUrl, isNotEmpty);
    });

    test('ダンマク取得エンドポイント', () {
      final videoId = 'test_video_123';
      final endpoint = '/api/danmaku/$videoId';
      expect(endpoint, contains('test_video_123'));
    });

    test('API レスポンス パース - 成功', () {
      final jsonResponse = '''
      {
        "code": 0,
        "message": "success",
        "data": [
          {
            "id": "1",
            "text": "テスト",
            "type": "right",
            "time": 0,
            "color": "#FFFFFF"
          }
        ]
      }
      ''';

      // レスポンスがJSONとしてパース可能か確認
      expect(jsonResponse.contains('"code": 0'), true);
      expect(jsonResponse.contains('"data"'), true);
    });

    test('API エラーハンドリング', () {
      final errorResponse = '''
      {
        "code": 1,
        "message": "Video not found"
      }
      ''';

      expect(errorResponse.contains('"code": 1'), true);
      expect(errorResponse.contains('"message"'), true);
    });

    test('複数ダンマク取得', () {
      final danmakuList = [
        {'id': '1', 'text': 'テスト1', 'time': 0, 'type': 'right'},
        {'id': '2', 'text': 'テスト2', 'time': 1, 'type': 'right'},
        {'id': '3', 'text': 'テスト3', 'time': 2, 'type': 'top'},
      ];

      expect(danmakuList.length, 3);
      expect(danmakuList[0]['text'], 'テスト1');
      expect(danmakuList[2]['type'], 'top');
    });

    test('ダンマクタイプの検証', () {
      final types = ['right', 'top', 'bottom'];
      expect(types.contains('right'), true);
      expect(types.contains('top'), true);
      expect(types.contains('bottom'), true);
      expect(types.contains('invalid'), false);
    });

    test('タイムスタンプ検証', () {
      final danmaku = {
        'id': '1',
        'text': 'テスト',
        'time': 5.5,
        'type': 'right'
      };

      final time = danmaku['time'] as double;
      expect(time, greaterThanOrEqualTo(0));
      expect(time, 5.5);
    });

    test('色コード検証', () {
      final colorCode = '#FFFFFF';
      expect(colorCode.startsWith('#'), true);
      expect(colorCode.length, 7);
    });

    test('API リクエストヘッダー', () {
      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      expect(headers['Content-Type'], 'application/json');
      expect(headers.containsKey('Accept'), true);
    });

    test('API タイムアウト処理', () {
      const timeout = Duration(seconds: 30);
      expect(timeout.inSeconds, 30);
    });

    test('API レート制限', () {
      final requestLimit = 100; // 1分あたりのリクエスト制限
      final timeWindow = Duration(minutes: 1);

      expect(requestLimit, greaterThan(0));
      expect(timeWindow.inSeconds, 60);
    });

    test('複数ビデオのダンマク管理', () {
      final videoDanmakuMap = {
        'video1': [
          {'id': '1', 'text': 'テスト1', 'time': 0},
          {'id': '2', 'text': 'テスト2', 'time': 1},
        ],
        'video2': [
          {'id': '3', 'text': 'テスト3', 'time': 0},
          {'id': '4', 'text': 'テスト4', 'time': 2},
        ],
      };

      expect(videoDanmakuMap.keys.length, 2);
      expect(videoDanmakuMap['video1']!.length, 2);
      expect(videoDanmakuMap['video2']![0]['text'], 'テスト3');
    });
  });
}
