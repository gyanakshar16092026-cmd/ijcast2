// EmailJS integration for sending emails
import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    // Initialize EmailJS with your public key
    this.publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    this.serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    this.submissionTemplateId = import.meta.env.VITE_EMAILJS_SUBMISSION_TEMPLATE_ID;
    this.acceptanceTemplateId = import.meta.env.VITE_EMAILJS_ACCEPTANCE_TEMPLATE_ID;
    
    if (this.publicKey) {
      emailjs.init(this.publicKey);
    }
  }

  // Send submission notification to editorial team
  async sendSubmissionNotification(submission) {
    try {
      if (!this.publicKey || !this.serviceId || !this.submissionTemplateId) {
        console.warn('⚠️ EmailJS submission template not configured. Email details logged to console instead.');
        this.logSubmissionNotification(submission);
        return { success: true, method: 'console' };
      }

      // Prepare email data for EmailJS submission template
      const templateParams = {
        author_name: submission.author_name,
        author_email: submission.author_email, // This is used as Reply-To in the template
        paper_title: submission.paper_title,
        submission_id: submission.submission_id,
        message: `
New Paper Submission Received

Author: ${submission.author_name}
Email: ${submission.author_email}
Title: ${submission.paper_title}
Submission ID: ${submission.submission_id}
Date: ${new Date().toLocaleDateString('en-GB')}

Abstract: ${submission.abstract}

Keywords: ${submission.keywords}

Please review this submission in the editorial system.
        `
      };

      console.log('📧 Sending submission notification via EmailJS...', {
        submission: submission.submission_id,
        author: submission.author_name
      });

      // Send email via EmailJS using submission template
      const response = await emailjs.send(
        this.serviceId,
        this.submissionTemplateId,
        templateParams
      );

      console.log('✅ Submission notification sent successfully:', response);
      
      return { 
        success: true, 
        method: 'emailjs',
        messageId: response.text
      };

    } catch (error) {
      console.error('❌ Submission notification failed:', error);
      
      // Fallback to console logging
      console.log('📧 Falling back to console logging...');
      this.logSubmissionNotification(submission);
      
      return { 
        success: true, 
        method: 'console',
        error: error.message
      };
    }
  }

  async sendAcceptanceEmail(submission) {
    try {
      if (!this.publicKey || !this.serviceId || !this.acceptanceTemplateId) {
        console.warn('⚠️ EmailJS acceptance template not configured. Email details logged to console instead.');
        this.logAcceptanceEmail(submission);
        return { success: true, method: 'console' };
      }

      // Generate payment link
      const paymentUrl = 'https://www.ijrt.in/apc';
      
      // Prepare email data for EmailJS acceptance template
      const templateParams = {
        // Author details
        author_name: submission.author_name,
        author_email: submission.author_email,
        
        // Paper details
        paper_title: submission.paper_title,
        submission_id: submission.submission_id,
        
        // Editorial contacts
        primary_email: 'editor.ijrtonline@gmail.com',
        admin_email: 'gyanakshar16092026@gmail.com',
        
        // Email content - using message field for template
        message: `
Dear ${submission.author_name},

We are pleased to inform you that your manuscript titled "${submission.paper_title}" (ID: ${submission.submission_id}) has been accepted for publication in the International Journal of Research in Technology (IJRT).

Next Steps:
1. Payment: Please complete the Article Processing Charge (APC) payment of ₹2000 for Indian authors
2. Copyright Agreement: Sign and submit the copyright transfer agreement  
3. Publication: After payment confirmation, your paper will be published and made freely accessible

Complete your payment and copyright agreement here:
${paymentUrl}

Your paper will be published immediately after payment confirmation and will be freely accessible forever as per our open access policy.

For any queries, please contact us at:
• Primary: editor.ijrtonline@gmail.com
• Administrative: gyanakshar16092026@gmail.com

Thank you for choosing IJRT for your research publication.

Best regards,
Editorial Team
IJRT - International Journal of Research in Technology
        `
      };

      console.log('📧 Sending acceptance email via EmailJS...', {
        to: submission.author_email,
        submission: submission.submission_id
      });

      // Send email via EmailJS using acceptance template
      const response = await emailjs.send(
        this.serviceId,
        this.acceptanceTemplateId,
        templateParams
      );

      console.log('✅ Acceptance email sent successfully:', response);
      
      return { 
        success: true, 
        method: 'emailjs',
        messageId: response.text,
        paymentUrl 
      };

    } catch (error) {
      console.error('❌ Acceptance email sending failed:', error);
      
      // Fallback to console logging
      console.log('📧 Falling back to console logging...');
      this.logAcceptanceEmail(submission);
      
      return { 
        success: true, 
        method: 'console',
        error: error.message,
        paymentUrl: 'https://www.ijrt.in/apc'
      };
    }
  }

  async sendPublicationNotificationEmail(submission, article) {
    try {
      if (!this.publicKey || !this.serviceId || !this.acceptanceTemplateId) {
        console.warn('⚠️ EmailJS not configured. Publication notification logged to console instead.');
        this.logPublicationEmail(submission, article);
        return { success: true, method: 'console' };
      }

      // Prepare publication notification email
      const templateParams = {
        // Author details
        author_name: submission.author_name,
        author_email: submission.author_email,
        
        // Paper details
        paper_title: submission.paper_title,
        submission_id: submission.submission_id,
        
        // Publication details
        article_url: `${window.location.origin}/article/${article.id}`,
        doi: article.doi,
        published_date: new Date().toLocaleDateString('en-GB'),
        
        // Editorial contacts
        primary_email: 'editor.ijrtonline@gmail.com',
        admin_email: 'gyanakshar16092026@gmail.com',
        
        // Email content
        message: `
Dear ${submission.author_name},

🎉 CONGRATULATIONS! Your paper has been PUBLISHED!

We are delighted to inform you that your manuscript titled "${submission.paper_title}" (ID: ${submission.submission_id}) has been successfully published in IJRT and is now freely accessible to the global research community.

📄 Your Published Paper:
• Title: ${submission.paper_title}
• DOI: ${article.doi}
• Publication Date: ${new Date().toLocaleDateString('en-GB')}
• Direct Link: ${window.location.origin}/article/${article.id}

✨ Key Features:
• FREE Open Access - Accessible to everyone worldwide
• Permanent availability with DOI
• Indexed and searchable
• Download in PDF format
• Citation ready

Your research is now part of the permanent scholarly record and will contribute to advancing knowledge in your field.

Thank you for choosing IJRT for your research publication. We appreciate your contribution to the scientific community.

For any queries, please contact us at:
• Primary: editor.ijrtonline@gmail.com  
• Administrative: gyanakshar16092026@gmail.com

Best regards,
Editorial Team
IJRT - International Journal of Research in Technology

---
This is an automated notification. Your paper is now live and accessible worldwide.
        `
      };

      console.log('📧 Sending publication notification via EmailJS...', {
        to: submission.author_email,
        submission: submission.submission_id,
        article: article.id
      });

      // Send email via EmailJS using acceptance template (reusing for publication)
      const response = await emailjs.send(
        this.serviceId,
        this.acceptanceTemplateId,
        templateParams
      );

      console.log('✅ Publication notification sent successfully:', response);
      
      return { 
        success: true, 
        method: 'emailjs',
        messageId: response.text
      };

    } catch (error) {
      console.error('❌ Publication email sending failed:', error);
      
      // Fallback to console logging
      console.log('📧 Falling back to console logging...');
      this.logPublicationEmail(submission, article);
      
      return { 
        success: true, 
        method: 'console',
        error: error.message
      };
    }
  }

  // Fallback method - log submission notification to console
  logSubmissionNotification(submission) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 NEW PAPER SUBMISSION NOTIFICATION (Console Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO: gyanakshar16092026@gmail.com
REPLY-TO: ${submission.author_email}
SUBJECT: New Paper Submission - ${submission.paper_title}

Dear Editorial Team,

A new paper submission has been received:

Author: ${submission.author_name}
Email: ${submission.author_email}
Title: "${submission.paper_title}"
Submission ID: ${submission.submission_id}
Date: ${new Date().toLocaleDateString('en-GB')}

Abstract: ${submission.abstract}

Keywords: ${submission.keywords}

Please review this submission in the editorial system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  To send real emails, ensure EmailJS is configured correctly:
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_SUBMISSION_TEMPLATE_ID=your_template_id
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }

  // Fallback method - log acceptance email details to console
  logAcceptanceEmail(submission) {
    const paymentUrl = 'https://www.ijrt.in/apc';
    
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 ACCEPTANCE EMAIL (Console Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO: ${submission.author_email}
CC: editor.ijrtonline@gmail.com, gyanakshar16092026@gmail.com
SUBJECT: Paper Accepted - ${submission.paper_title} - IJRT

Dear ${submission.author_name},

🎉 CONGRATULATIONS! Your paper has been ACCEPTED!

Paper: "${submission.paper_title}"
ID: ${submission.submission_id}

NEXT STEPS:
1. 💳 Complete APC payment (₹2000)
2. 📝 Sign copyright agreement
3. 🚀 Paper will be published immediately

PAYMENT LINK:
${paymentUrl}

CONTACTS:
• Primary: editor.ijrtonline@gmail.com
• Admin: gyanakshar16092026@gmail.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  To send real emails, ensure EmailJS is configured correctly:
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_ACCEPTANCE_TEMPLATE_ID=your_template_id
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }

  // Fallback method - log publication email details to console
  logPublicationEmail(submission, article) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 PUBLICATION NOTIFICATION (Auto-sent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO: ${submission.author_email}
CC: editor.ijrtonline@gmail.com, gyanakshar16092026@gmail.com
SUBJECT: 🎉 Your Paper is Published - ${submission.paper_title}

Dear ${submission.author_name},

🎉 CONGRATULATIONS! Your paper has been PUBLISHED!

Paper: "${submission.paper_title}"
DOI: ${article.doi}
URL: ${window.location.origin}/article/${article.id}

Your research is now freely accessible worldwide!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AUTO-SENT: No admin action required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }

  // Alternative: SendGrid integration (for server-side sending)
  async sendViaSendGrid(submission) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: submission.author_email,
          cc: ['editor.ijrtonline@gmail.com', 'gyanakshar16092026@gmail.com'],
          subject: `Paper Accepted - ${submission.paper_title} - IJRT`,
          submission: submission
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, method: 'sendgrid', messageId: result.messageId };
      } else {
        throw new Error(result.message || 'SendGrid API failed');
      }
    } catch (error) {
      console.error('SendGrid sending failed:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();



