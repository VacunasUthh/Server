import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaigns, CampaignsSchema } from '../schemas/campaigns.schema';

@Module({
        imports: [
                MongooseModule.forFeature([
                        { name: Campaigns.name, schema: CampaignsSchema },
                ]),
        ],
        controllers: [CampaignsController],
        providers: [CampaignsService],
})
export class CampaignsModule {}
