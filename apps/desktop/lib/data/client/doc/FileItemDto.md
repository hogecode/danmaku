# desktop.model.FileItemDto

## Load the model package
```dart
import 'package:desktop/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | ファイル/フォルダID | 
**name** | **String** | ファイル/フォルダ名 | 
**mimeType** | **String** | MIME タイプ - 'application/vnd.google-apps.folder' = フォルダ - 'video/mp4' = MP4 ビデオ | 
**size** | **num** | ファイル/フォルダサイズ（バイト） フォルダの場合は null | [optional] 
**modifiedTime** | **String** | 最終更新日時（ISO 8601形式） | 
**webViewLink** | **String** | Google Drive WebView URL | 
**thumbnailLink** | **String** | サムネイル URL（ビデオファイルの場合のみ） | [optional] 
**parentId** | **String** | 親フォルダID | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


