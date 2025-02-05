import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { CommentService } from './services/comment.service';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiCustomResponse } from '@@core/utils/types';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('ticketing/comments')
@Controller('ticketing/comments')
export class CommentController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly commentService: CommentService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(CommentController.name);
  }

  @ApiOperation({
    operationId: 'getComments',
    summary: 'List a batch of Comments',
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
  @ApiCustomResponse(UnifiedCommentOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getComments(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.commentService.getComments(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getComment',
    summary: 'Retrieve a Comment',
    description: 'Retrieve a comment from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the `comment` you want to retrive.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedCommentOutput)
  @Get(':id')
  @UseGuards(ApiKeyAuthGuard)
  getComment(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.commentService.getComment(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addComment',
    summary: 'Create a Comment',
    description: 'Create a comment in any supported Ticketing software',
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
  @ApiBody({ type: UnifiedCommentInput })
  @ApiCustomResponse(UnifiedCommentOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addComment(
    @Body() unfiedCommentData: UnifiedCommentInput,
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.commentService.addComment(
        unfiedCommentData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'addComments',
    summary: 'Add a batch of Comments',
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
  @ApiBody({ type: UnifiedCommentInput, isArray: true })
  @ApiCustomResponse(UnifiedCommentOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addComments(
    @Body() unfiedCommentData: UnifiedCommentInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.commentService.batchAddComments(
        unfiedCommentData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
