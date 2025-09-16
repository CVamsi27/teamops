// import { CreateTeamDto } from 'team/dto/create-team.dto';
// import { UpdateTeamDto } from 'team/dto/update-team.dto';
// import { Team } from 'team/entities/team.entity';

// import { CreateTaskDto } from 'task/dto/create-task.dto';
// import { UpdateTaskDto } from 'task/dto/update-task.dto';
// import { Task } from 'task/entities/task.entity';

// import { CreateUserDto } from 'user/dto/create-user.dto';
// import { UpdateUserDto } from 'user/dto/update-user.dto';
// import { User } from 'user/entities/user.entity';

// import { LoginDto } from 'auth/dto/login.dto';
// import { RegisterDto } from 'auth/dto/register.dto';

// export const api = {
//   dto: {
//     team: {
//       CreateTeamDto,
//       UpdateTeamDto,
//     },
//     task: {
//       CreateTaskDto,
//       UpdateTaskDto,
//     },
//     user: {
//       CreateUserDto,
//       UpdateUserDto,
//     },
//     auth: {
//       LoginDto,
//       RegisterDto,
//     },
//   },
//   entities: {
//     Team,
//     Task,
//     User,
//   },
// };

export * from './schemas/common';
export * from './schemas/team.schema';
export * from './schemas/task.schema';
export * from './validation';
