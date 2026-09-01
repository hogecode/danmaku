# CommentDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**thread** | **string** | スレッドID | [optional] [default to undefined]
**no** | **number** | コメント番号 | [default to undefined]
**vpos** | **number** | 再生位置（ミリ秒単位） | [default to undefined]
**date** | **number** | UNIXタイムスタンプ | [default to undefined]
**mail** | **string** | 表示フォーマット指定 例: \&quot;184\&quot;, \&quot;184 big ue\&quot;, \&quot;ue\&quot;, \&quot;big\&quot; など | [optional] [default to undefined]
**user_id** | **string** | ユーザーID | [optional] [default to undefined]
**premium** | **number** | プレミアムユーザーフラグ | [optional] [default to undefined]
**anonymity** | **number** | 匿名投稿フラグ | [optional] [default to undefined]
**text** | **string** | コメント内容（テキスト） | [default to undefined]

## Example

```typescript
import { CommentDto } from './api';

const instance: CommentDto = {
    thread,
    no,
    vpos,
    date,
    mail,
    user_id,
    premium,
    anonymity,
    text,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
