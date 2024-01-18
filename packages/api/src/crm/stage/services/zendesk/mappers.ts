import { ZendeskStageInput, ZendeskStageOutput } from '@crm/@utils/@types';
import {
  UnifiedStageInput,
  UnifiedStageOutput,
} from '@crm/stage/types/model.unified';
import { IStageMapper } from '@crm/stage/types';

export class ZendeskStageMapper implements IStageMapper {
  desunify(
    source: UnifiedStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskStageInput {
    const result: ZendeskStageInput = {
      name: source.stage_name,
    };

    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  unify(
    source: ZendeskStageOutput | ZendeskStageOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput | UnifiedStageOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleStageToUnified(source, customFieldMappings);
    }

    // Handling array of ZendeskStageOutput
    return source.map((stage) =>
      this.mapSingleStageToUnified(stage, customFieldMappings),
    );
  }

  private mapSingleStageToUnified(
    stage: ZendeskStageOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: stage[mapping.remote_id],
      })) || [];

    return {
      stage_name: stage.name,
      field_mappings,
    };
  }
}
