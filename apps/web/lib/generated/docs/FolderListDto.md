# FolderListDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**items** | [**Array&lt;FileItemDto&gt;**](FileItemDto.md) | フォルダ内のファイル/フォルダ一覧 | [default to undefined]
**nextPageToken** | **string** | 次のページトークン（ページネーション用） あれば指定してリクエスト | [optional] [default to undefined]

## Example

```typescript
import { FolderListDto } from './api';

const instance: FolderListDto = {
    items,
    nextPageToken,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
