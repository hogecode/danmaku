# DPlayerCommentDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**time** | **number** | コメント表示時刻（秒単位の浮動小数点数） 例: 10.5 (10秒500ミリ秒) | [default to undefined]
**type** | **string** | コメント種類 - \&quot;normal\&quot; (中央) - \&quot;top\&quot; / \&quot;ue\&quot; (上) - \&quot;bottom\&quot; / \&quot;shita\&quot; (下) | [default to undefined]
**size** | **string** | コメント文字サイズ - \&quot;small\&quot; (小) - \&quot;normal\&quot; / \&quot;\&quot; (通常) - \&quot;big\&quot; (大) | [default to undefined]
**color** | **string** | コメント色（16進数カラーコード） 例: \&quot;#ffffff\&quot; (白) | [default to undefined]
**author** | **string** | コメント投稿者ID（匿名の場合は null） | [optional] [default to undefined]
**text** | **string** | コメント内容（テキスト） | [default to undefined]

## Example

```typescript
import { DPlayerCommentDto } from './api';

const instance: DPlayerCommentDto = {
    time,
    type,
    size,
    color,
    author,
    text,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
