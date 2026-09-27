# KakologCommentDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**time** | **number** | コメント表示時刻（秒単位） | [default to undefined]
**type** | **string** | コメント種類: \&quot;normal\&quot;, \&quot;top\&quot;, \&quot;bottom\&quot; | [default to undefined]
**size** | **string** | コメントサイズ: \&quot;small\&quot;, \&quot;medium\&quot;, \&quot;big\&quot; | [default to undefined]
**color** | **string** | コメント色（色番号、例: \&quot;184\&quot;） | [default to undefined]
**author** | **string** | 投稿者ID（匿名の場合は null） | [default to undefined]
**text** | **string** | コメント内容 | [default to undefined]

## Example

```typescript
import { KakologCommentDto } from './api';

const instance: KakologCommentDto = {
    time,
    type,
    size,
    color,
    author,
    text,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
