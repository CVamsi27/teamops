import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsEnum(['TEAM', 'TASK'])
  roomType: 'TEAM' | 'TASK';

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  userName: string;
}