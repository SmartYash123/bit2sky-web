const SibApiV3Sdk = require('@getbrevo/brevo');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
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

    // 1. Add contact to newsletter list
    const createContact = new SibApiV3Sdk.CreateContact();
    createContact.email = email;
    createContact.listIds = [parseInt(process.env.BREVO_NEWSLETTER_LIST_ID)];
    createContact.updateEnabled = true;

    await contactsApi.createContact(createContact);

    // 2. Send welcome email
    const welcomeEmail = new SibApiV3Sdk.SendSmtpEmail();
    welcomeEmail.to = [{ email: email }];
    welcomeEmail.templateId = parseInt(process.env.BREVO_NEWSLETTER_TEMPLATE_ID);
    welcomeEmail.params = { EMAIL: email };

    await emailApi.sendTransacEmail(welcomeEmail);

    return res.status(200).json({ success: true, message: 'Successfully subscribed!' });
  } catch (error) {
    console.error('Brevo API error:', error?.body || error);
    return res.status(500).json({ error: 'Subscription failed. Please try again.' });
  }
};
