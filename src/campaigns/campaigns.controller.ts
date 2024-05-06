import {
        Body,
        Controller,
        Delete,
        Get,
        Param,
        Post,
        Put,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from '../dto/campaigns/create.campaigns.dto';
import { UpdateCampaignDto } from '../dto/campaigns/update.campaigns.dto';

@Controller('campaigns')
export class CampaignsController {
        constructor(private campaingsService: CampaignsService) {}

        @Get()
        async findAll() {
                return this.campaingsService.findAll();
        }

        @Get(':id')
        async findOne(@Param('id') id: string) {
                return this.campaingsService.findOne(id);
        }

        @Post()
        async create(@Body() createCampaign: CreateCampaignDto) {
                return this.campaingsService.create(createCampaign);
        }

        @Put(':id')
        async update(
                @Param('id') id: string,
                @Body() updateCampaign: UpdateCampaignDto,
        ) {
                return this.campaingsService.update(id, updateCampaign);
        }

        @Delete(':id')
        async delete(@Param('id') id: string) {
                return this.campaingsService.delete(id);
        }
}
