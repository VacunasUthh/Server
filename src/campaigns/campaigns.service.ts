import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCampaignDto } from '../dto/campaigns/create.campaigns.dto';
import { UpdateCampaignDto } from '../dto/campaigns/update.campaigns.dto';
import { Campaigns } from '../schemas/campaigns.schema';

@Injectable()
export class CampaignsService {
        constructor(
                @InjectModel(Campaigns.name)
                private campaingsModel: Model<Campaigns>,
        ) {}

        async findAll() {
                return this.campaingsModel.find();
        }

        async create(createCampaign: CreateCampaignDto) {
                const createdCampaign = new this.campaingsModel(createCampaign);
                return createdCampaign.save();
        }

        async update(id: string, updateCampaign: UpdateCampaignDto) {
                return this.campaingsModel.findByIdAndUpdate(
                        id,
                        updateCampaign,
                        { new: true },
                );
        }

        async findOne(id: string) {
                return this.campaingsModel.findById(id);
        }

        async delete(id: string) {
                return this.campaingsModel.findOneAndDelete({ _id: id });
        }
}
