import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {}

  private async sendEmail(templateId: string, templateParams: Record<string, string>) {
    const serviceId = this.config.get('EMAILJS_SERVICE_ID');
    const publicKey = this.config.get('EMAILJS_PUBLIC_KEY');

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: templateParams,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`EmailJS error: ${error}`);
        return false;
      }

      this.logger.log(`Email sent successfully via template: ${templateId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendReceiptEmail(params: {
    toEmail: string;
    fullNameAr: string;
    membershipId: string;
    }) {
    return this.sendEmail(
        this.config.get('EMAILJS_RECEIPT_TEMPLATE_ID') ?? '',
        {
        to_email: params.toEmail,
        to_name: params.fullNameAr,
        membership_id: params.membershipId,
        },
    );
    }
    async sendApprovalEmail(params: {
    toEmail: string;
    fullNameAr: string;
    membershipId: string;
    expiresAt: string;
    }) {
    return this.sendEmail(
        this.config.get('EMAILJS_APPROVAL_TEMPLATE_ID') ?? '',
        {
        to_email: params.toEmail,
        to_name: params.fullNameAr,
        membership_id: params.membershipId,
        expires_at: params.expiresAt,
        },
    );
    }


    async sendRejectionEmail(params: {
        toEmail: string;
        fullNameAr: string;
        membershipId: string;
        reason: string;
        }) {
        return this.sendEmail(
            this.config.get('EMAILJS_REJECTION_TEMPLATE_ID') ?? '',
            {
            to_email: params.toEmail,
            to_name: params.fullNameAr,
            membership_id: params.membershipId,
            rejection_reason: params.reason,
            },
        );
    }
}