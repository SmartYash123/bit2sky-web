const SibApiV3Sdk = require('@getbrevo/brevo');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, phone, company, message, sourcePage } = req.body;

  if (!email || !firstName) {
    return res.status(400).json({ error: 'Email and first name are required.' });
  }

  try {
    // Initialize Contacts API
    const contactsApi = new SibApiV3Sdk.ContactsApi();
    contactsApi.setApiKey(
      SibApiV3Sdk.ContactsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    // Initialize Transactional Emails API
    const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    emailApi.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    // 1. Create or update contact in Brevo CRM
    const createContact = new SibApiV3Sdk.CreateContact();
    createContact.email = email;
    createContact.attributes = {
      FIRSTNAME: firstName,
      LASTNAME: lastName || '',
      COMPANY: company || '',
      PHONE: phone || '',
      MESSAGE: message || '',
      SOURCE_PAGE: sourcePage || 'unknown'
    };
    createContact.listIds = [parseInt(process.env.BREVO_QUOTE_LIST_ID)];
    createContact.updateEnabled = true;

    await contactsApi.createContact(createContact);

    // 2. Send auto-reply to visitor
    const autoReply = new SibApiV3Sdk.SendSmtpEmail();
    autoReply.to = [{ email: email, name: firstName }];
    autoReply.templateId = parseInt(process.env.BREVO_QUOTE_TEMPLATE_ID);
    autoReply.params = {
      FIRSTNAME: firstName,
      SOURCE_PAGE: sourcePage || 'bit2sky.com'
    };

    await emailApi.sendTransacEmail(autoReply);

    // 3. Send notification to team
    const teamNotify = new SibApiV3Sdk.SendSmtpEmail();
    teamNotify.to = [{ email: 'info@bit2sky.com', name: 'Bit2Sky Team' }];
    teamNotify.replyTo = { email: email, name: firstName + (lastName ? ' ' + lastName : '') };
    teamNotify.templateId = parseInt(process.env.BREVO_TEAM_NOTIFY_TEMPLATE_ID);
    teamNotify.params = {
      FIRSTNAME: firstName,
      LASTNAME: lastName || '',
      EMAIL: email,
      PHONE: phone || '',
      COMPANY: company || '',
      MESSAGE: message || '',
      SOURCE_PAGE: sourcePage || 'unknown'
    };

    await emailApi.sendTransacEmail(teamNotify);

    return res.status(200).json({ success: true, message: 'Thank you! We will be in touch shortly.' });
  } catch (error) {
    console.error('Brevo API error:', error?.body || error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};
