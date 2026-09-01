import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * ニコ動ログイン要求DTO
 */
export class NicovideoLoginRequestDto {
  @IsEmail({}, { message: 'メールアドレスの形式が正しくありません' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'パスワードを入力してください' })
  password!: string;
}
