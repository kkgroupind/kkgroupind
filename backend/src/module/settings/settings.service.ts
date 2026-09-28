import { Injectable, Logger } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AuditService } from '../audit/audit.service';
import { SETTINGS_MESSAGES } from '../../common/constants/messages.constant';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly auditService: AuditService,
  ) {}

  async getPublicSettings() {
    const settings = await this.settingsRepository.getSettings();
    return {
      siteName: settings.siteName,
      siteTagline: settings.siteTagline,
      siteTaglineMl: settings.siteTaglineMl,
      primaryDistrict: settings.primaryDistrict,
      operatingAreas: settings.operatingAreas,
      contactPhone: settings.contactPhone,
      whatsappPhone: settings.whatsappPhone,
      supportEmail: settings.supportEmail,
      officeAddress: settings.officeAddress,
      businessHours: settings.businessHours,
      emergencyDispatch: settings.emergencyDispatch,
      publicEnquiries: settings.publicEnquiries,
      multilingualEnabled: settings.multilingualEnabled,
      announcementBanner: settings.bannerActive
        ? settings.announcementBanner
        : null,
      bannerActive: settings.bannerActive,
    };
  }

  async getAdminSettings() {
    return this.settingsRepository.getSettings();
  }

  async updateSettings(
    dto: UpdateSettingsDto,
    currentUser: {
      id: string;
      name?: string;
      email?: string;
      role?: string;
    },
    ipAddress?: string,
    userAgent?: string,
  ) {
    const updated = await this.settingsRepository.updateSettings(
      dto,
      currentUser.id,
    );

    // Non-blocking immutable audit logging
    this.auditService
      .recordLog({
        userId: currentUser.id,
        userName: currentUser.name || 'Admin',
        userEmail: currentUser.email || 'admin@kkgroup.com',
        userRole: currentUser.role as any,
        action: 'SITE_SETTINGS_UPDATED',
        entityType: 'SITE_SETTINGS',
        entityId: 'default',
        details: JSON.stringify({
          updatedFields: Object.keys(dto),
          whatsappPhone: dto.whatsappPhone,
          contactPhone: dto.contactPhone,
          supportEmail: dto.supportEmail,
          officeAddress: dto.officeAddress,
          primaryDistrict: dto.primaryDistrict,
        }),
        ipAddress,
        userAgent,
      })
      .catch((err) =>
        this.logger.warn(`Failed to log site settings audit: ${err.message}`),
      );

    return {
      message: SETTINGS_MESSAGES.SETTINGS_UPDATED_SUCCESS,
      settings: updated,
    };
  }
}
