import {
  Controller,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { TeamService } from './services/team.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { UnifiedTeamOutput } from './types/model.unified';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('ticketing/teams')
@Controller('ticketing/teams')
export class TeamController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly teamService: TeamService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(TeamController.name);
  }

  @ApiOperation({
    operationId: 'getTeams',
    summary: 'List a batch of Teams',
  })
  @ApiHeader({
    name: 'connection_token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedTeamOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTeams(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.teamService.getTeams(remoteSource, linkedUserId, remote_data);
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getTeam',
    summary: 'Retrieve a Team',
    description: 'Retrieve a team from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the team you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedTeamOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTeam(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.teamService.getTeam(id, remote_data);
  }
}
