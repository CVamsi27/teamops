import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsEnum(['TEAM', 'TASK'])
  roomType: 'TEAM' | 'TASK';
}