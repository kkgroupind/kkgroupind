import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const DEFAULT_SETTINGS_ID = 'default';

@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.siteSetting.findUnique({
      where: { id: DEFAULT_SETTINGS_ID },
    });

    if (!settings) {
      settings = await this.prisma.siteSetting.create({
        data: {
          id: DEFAULT_SETTINGS_ID,
          siteName: 'KK Group',
          siteTagline: 'Professional Services & Workforce Solutions',
          siteTaglineMl: 'കാസർഗോഡ് ജില്ലയിലെ വിശ്വസനീയമായ തൊഴിൽ സേവനങ്ങൾ',
          primaryDistrict: 'Kasaragod',
          operatingAreas:
            'Kasaragod, Kanhangad, Nileshwaram, Uppala, Manjeshwar, Cheruvathur, Bekal, Kumbla',
          contactPhone: '+91 94470 12345',
          whatsappPhone: '+91 98460 54321',
          supportEmail: 'contact@kkgroupkerala.com',
          officeAddress:
            'KK Group Hub, Main Road, Kasaragod, Kerala - 671121',
          businessHours: '08:00 AM - 07:00 PM (Monday - Saturday)',
          emergencyDispatch: true,
          publicEnquiries: true,
          multilingualEnabled: true,
          announcementBanner:
            'Special seasonal offers available on coconut tree maintenance and cleaning across Kasaragod.',
          bannerActive: false,
        },
      });
    }

    return settings;
  }

  async updateSettings(data: UpdateSettingsDto, updatedBy?: string) {
    return this.prisma.siteSetting.upsert({
      where: { id: DEFAULT_SETTINGS_ID },
      create: {
        id: DEFAULT_SETTINGS_ID,
        siteName: data.siteName ?? 'KK Group',
        siteTagline:
          data.siteTagline ?? 'Professional Services & Workforce Solutions',
        siteTaglineMl:
          data.siteTaglineMl ??
          'കാസർഗോഡ് ജില്ലയിലെ വിശ്വസനീയമായ തൊഴിൽ സേവനങ്ങൾ',
        primaryDistrict: data.primaryDistrict ?? 'Kasaragod',
        operatingAreas:
          data.operatingAreas ??
          'Kasaragod, Kanhangad, Nileshwaram, Uppala, Manjeshwar, Cheruvathur, Bekal, Kumbla',
        contactPhone: data.contactPhone ?? '+91 94470 12345',
        whatsappPhone: data.whatsappPhone ?? '+91 98460 54321',
        supportEmail: data.supportEmail ?? 'contact@kkgroupkerala.com',
        officeAddress:
          data.officeAddress ??
          'KK Group Hub, Main Road, Kasaragod, Kerala - 671121',
        businessHours:
          data.businessHours ?? '08:00 AM - 07:00 PM (Monday - Saturday)',
        emergencyDispatch: data.emergencyDispatch ?? true,
        publicEnquiries: data.publicEnquiries ?? true,
        multilingualEnabled: data.multilingualEnabled ?? true,
        announcementBanner: data.announcementBanner,
        bannerActive: data.bannerActive ?? false,
        updatedBy,
      },
      update: {
        ...(data.siteName !== undefined && { siteName: data.siteName }),
        ...(data.siteTagline !== undefined && { siteTagline: data.siteTagline }),
        ...(data.siteTaglineMl !== undefined && { siteTaglineMl: data.siteTaglineMl }),
        ...(data.primaryDistrict !== undefined && { primaryDistrict: data.primaryDistrict }),
        ...(data.operatingAreas !== undefined && { operatingAreas: data.operatingAreas }),
        ...(data.contactPhone !== undefined && { contactPhone: data.contactPhone }),
        ...(data.whatsappPhone !== undefined && { whatsappPhone: data.whatsappPhone }),
        ...(data.supportEmail !== undefined && { supportEmail: data.supportEmail }),
        ...(data.officeAddress !== undefined && { officeAddress: data.officeAddress }),
        ...(data.businessHours !== undefined && { businessHours: data.businessHours }),
        ...(data.emergencyDispatch !== undefined && { emergencyDispatch: data.emergencyDispatch }),
        ...(data.publicEnquiries !== undefined && { publicEnquiries: data.publicEnquiries }),
        ...(data.multilingualEnabled !== undefined && { multilingualEnabled: data.multilingualEnabled }),
        ...(data.announcementBanner !== undefined && { announcementBanner: data.announcementBanner }),
        ...(data.bannerActive !== undefined && { bannerActive: data.bannerActive }),
        updatedBy,
      },
    });
  }
}
