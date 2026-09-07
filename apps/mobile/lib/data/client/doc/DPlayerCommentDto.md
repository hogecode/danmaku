# mobile.model.DPlayerCommentDto

## Load the model package
```dart
import 'package:mobile/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**time** | **num** | コメント表示時刻（秒単位の浮動小数点数） 例: 10.5 (10秒500ミリ秒) | 
**type** | **String** | コメント種類 - \"normal\" (中央) - \"top\" / \"ue\" (上) - \"bottom\" / \"shita\" (下) | 
**size** | **String** | コメント文字サイズ - \"small\" (小) - \"normal\" / \"\" (通常) - \"big\" (大) | 
**color** | **String** | コメント色（16進数カラーコード） 例: \"#ffffff\" (白) | 
**author** | **String** | コメント投稿者ID（匿名の場合は null） | [optional] 
**text** | **String** | コメント内容（テキスト） | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


