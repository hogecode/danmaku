/**
 * OneDrive プレイヤー固有定数
 */
export class PlayerOnedriveConstants {
  // OneDrive API 設定（Microsoft Graph API）
  static readonly API = {
    // GET /me/drive/items/{item-id} 用フィールド
    BASIC_FIELDS: 'id,name,file,size,webUrl',
    // /me/drive/root/children 用フィールド
    LIST_FIELDS: 'id,name,file,size,parentReference',
    PAGE_SIZE: 200,
  };

  // プライベートコンストラクタ
  private constructor() {}
}
