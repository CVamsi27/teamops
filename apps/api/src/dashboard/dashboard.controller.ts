import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { TaskService } from '../modules/task/task.service';
import { TeamService } from '../modules/team/team.service';
import { ProjectService } from '../modules/project/project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ValidateResponse } from '../common/response-validation.decorator';
import { 
  DashboardDataSchema,
  type Task, 
  type Team, 
  type Project,
  type DashboardData as DashboardDataType
} from '@workspace/api';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private taskService: TaskService,
    private teamService: TeamService,
    private projectService: ProjectService,
  ) {}

  @Get()
  @ValidateResponse(DashboardDataSchema)
  async getDashboardData(@Req() req: AuthenticatedRequest): Promise<DashboardDataType> {
    const userId = req.user!.id || req.user!.userId;

    const myTeams = await this.teamService.getMyTeams(userId);
    
    const teamIds = myTeams.map(team => team.id);
    const projectArrays = await Promise.all(
      teamIds.map(teamId => this.projectService.getProjectsByTeam(teamId))
    );
    const activeProjects = projectArrays.flat();

    const assignedTasks = await this.taskService.getMyTasks(userId);
    
    const projectIds = activeProjects.map(project => project.id);
    const projectTaskArrays = await Promise.all(
      projectIds.map(projectId => this.taskService.getTasksByProject(projectId))
    );
    const projectTasks = projectTaskArrays.flat();

    const hasTeamAccess = assignedTasks.length > 0 || projectTasks.length > 0;
    const allTasks = hasTeamAccess 
      ? this.deduplicateTasks([...assignedTasks, ...projectTasks])
      : [];

    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingTasks = allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= nextWeek;
    });

    const taskStats = {
      todo: allTasks.filter(task => task.status === 'TODO').length,
      inProgress: allTasks.filter(task => task.status === 'IN_PROGRESS').length,
      done: allTasks.filter(task => task.status === 'DONE').length,
    };

    return {
      upcomingTasks: upcomingTasks.slice(0, 10),
      activeProjects: activeProjects.slice(0, 5),
      myTeams,
      taskStats,
    };
  }

  private deduplicateTasks(tasks: any[]): any[] {
    const taskMap = new Map();
    tasks.forEach(task => taskMap.set(task.id, task));
    return Array.from(taskMap.values());
  }
}