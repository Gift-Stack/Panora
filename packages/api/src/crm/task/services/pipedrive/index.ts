import { Injectable } from '@nestjs/common';
import { ITaskService } from '@crm/task/types';
import {
  CrmObject,
  PipedriveTaskInput,
  PipedriveTaskOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class PipedriveService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addTask(
    taskData: PipedriveTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveTaskOutput>> {
    try {
      //TODO: check required scope  => crm.objects.tasks.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.post(
        `https://api.pipedrive.com/v1/tasks`,
        JSON.stringify(taskData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: resp.data.data,
        message: 'Pipedrive task created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.task,
        ActionType.POST,
      );
    }
    return;
  }

  async syncTasks(
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveTaskOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.tasks.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.get(`https://api.pipedrive.com/v1/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return {
        data: resp.data.data,
        message: 'Pipedrive tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.task,
        ActionType.GET,
      );
    }
  }
}
