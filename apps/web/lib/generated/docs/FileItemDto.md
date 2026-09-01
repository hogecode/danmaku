# FileItemDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** | ファイル/フォルダID | [default to undefined]
**name** | **string** | ファイル/フォルダ名 | [default to undefined]
**mimeType** | **string** | MIME タイプ - \&#39;application/vnd.google-apps.folder\&#39; &#x3D; フォルダ - \&#39;video/mp4\&#39; &#x3D; MP4 ビデオ | [default to undefined]
**size** | **number** | ファイル/フォルダサイズ（バイト） フォルダの場合は null | [optional] [default to undefined]
**modifiedTime** | **string** | 最終更新日時（ISO 8601形式） | [default to undefined]
**webViewLink** | **string** | Google Drive WebView URL | [default to undefined]
**thumbnailLink** | **string** | サムネイル URL（ビデオファイルの場合のみ） | [optional] [default to undefined]
**parentId** | **string** | 親フォルダID | [optional] [default to undefined]

## Example

```typescript
import { FileItemDto } from './api';

const instance: FileItemDto = {
    id,
    name,
    mimeType,
    size,
    modifiedTime,
    webViewLink,
    thumbnailLink,
    parentId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
