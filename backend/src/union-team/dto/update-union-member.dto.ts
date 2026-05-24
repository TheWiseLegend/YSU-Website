import { PartialType } from '@nestjs/mapped-types';
import { CreateUnionMemberDto } from './create-union-member.dto';

export class UpdateUnionMemberDto extends PartialType(CreateUnionMemberDto) {}