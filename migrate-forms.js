const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

// Quote form HTML (with labels, matching Brevo UI style)
const QUOTE_FORM_HTML = `<form class="brevo-quote-form" novalidate>
                <div class="fieldsets row">
                    <div class="col-sm-12 mb-3">
                        <label>First name</label>
                        <input type="text" name="firstName" class="form-control" required>
                    </div>
                    <div class="col-sm-12 mb-3">
                        <label>Last name</label>
                        <input type="text" name="lastName" class="form-control">
                    </div>
                    <div class="col-sm-12 mb-3">
                        <label>Email<span style="color:red">*</span></label>
                        <input type="email" name="email" class="form-control" required>
                    </div>
                    <div class="col-sm-12 mb-3">
                        <label>Phone</label>
                        <input type="tel" name="phone" class="form-control">
                    </div>
                    <div class="col-sm-12 mb-3">
                        <label>Company</label>
                        <input type="text" name="company" class="form-control">
                    </div>
                    <div class="col-sm-12 mb-3">
                        <label>Message</label>
                        <textarea name="message" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="col-sm-12">
                        <button type="submit" class="btn-submit">Submit</button>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-status"></div>
                    </div>
                </div>
            </form>`;

// Newsletter form HTML
const NEWSLETTER_FORM_HTML = `<form class="brevo-newsletter-form d-flex flex-wrap gap-2 align-items-center" novalidate>
                        <div class="flex-grow-1">
                            <input type="email" name="email" placeholder="Enter your email address" class="form-control form-control-lg" required>
                        </div>
                        <div>
                            <button type="submit" class="btn-submit">Subscribe</button>
                        </div>
                        <div class="w-100">
                            <div class="form-status"></div>
                        </div>
                    </form>`;

// Regex to match HubSpot form blocks
const HUBSPOT_QUOTE_REGEX = /<script[^>]*data-cfasync[^>]*>[\s\S]*?<\/script>\s*<script[^>]*src="[^"]*hsforms[^"]*"[^>]*><\/script>\s*<script[^>]*>\s*hbspt\.forms\.create\(\{\s*region:\s*"na1",\s*portalId:\s*"8399082",\s*formId:\s*"88a03aa7-0834-4dcb-9339-73ff748b8acd"\s*\}\);\s*<\/script>/g;

const HUBSPOT_NEWSLETTER_REGEX = /<script[^>]*data-cfasync[^>]*>[\s\S]*?<\/script>\s*<script[^>]*src="[^"]*hsforms[^"]*"[^>]*><\/script>\s*<script[^>]*>\s*hbspt\.forms\.create\(\{\s*region:\s*"na1",\s*portalId:\s*"8399082",\s*formId:\s*"a241040f-94ec-41c6-ada7-03cebc610f25"\s*\}\);\s*<\/script>/g;

const HUBSPOT_QUOTE_REGEX2 = /<script[^>]*src="[^"]*hsforms[^"]*"[^>]*><\/script>\s*<script[^>]*>\s*hbspt\.forms\.create\(\{\s*region:\s*"na1",\s*portalId:\s*"8399082",\s*formId:\s*"88a03aa7-0834-4dcb-9339-73ff748b8acd"\s*\}\);\s*<\/script>/g;

const HUBSPOT_NEWSLETTER_REGEX2 = /<script[^>]*src="[^"]*hsforms[^"]*"[^>]*><\/script>\s*<script[^>]*>\s*hbspt\.forms\.create\(\{\s*region:\s*"na1",\s*portalId:\s*"8399082",\s*formId:\s*"a241040f-94ec-41c6-ada7-03cebc610f25"\s*\}\);\s*<\/script>/g;

function getAllHtmlFiles(dir, files) {
  files = files || [];
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (item === '.git' || item === 'node_modules' || item === 'api') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllHtmlFiles(fullPath, files);
    } else if (item.endsWith('.html') || item.endsWith('.htm') || (!item.includes('.') && stat.isFile())) {
      if (!item.includes('.')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8').trim();
          if (content.startsWith('<!DOCTYPE') || content.startsWith('<html') || content.startsWith('<HTML')) {
            files.push(fullPath);
          }
        } catch (e) {}
      } else {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function getRelativePath(filePath, targetFile) {
  const fileDir = path.dirname(filePath);
  return path.relative(fileDir, path.join(projectRoot, targetFile)).replace(/\\/g, '/');
}

let totalModified = 0;
let totalQuoteReplaced = 0;
let totalNewsletterReplaced = 0;

const files = getAllHtmlFiles(projectRoot);
console.log(`Found ${files.length} HTML files to process`);

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let quoteCount = 0;
  let newsletterCount = 0;

  const nlBefore = content;
  content = content.replace(HUBSPOT_NEWSLETTER_REGEX, NEWSLETTER_FORM_HTML);
  content = content.replace(HUBSPOT_NEWSLETTER_REGEX2, NEWSLETTER_FORM_HTML);
  if (content !== nlBefore) {
    newsletterCount++;
    modified = true;
  }

  const qBefore = content;
  content = content.replace(HUBSPOT_QUOTE_REGEX, QUOTE_FORM_HTML);
  content = content.replace(HUBSPOT_QUOTE_REGEX2, QUOTE_FORM_HTML);
  if (content !== qBefore) {
    quoteCount++;
    modified = true;
  }

  if (modified || content.includes('hsforms')) {
    if (!content.includes('brevo-forms.css')) {
      const cssPath = getRelativePath(filePath, 'assets/css/brevo-forms.css');
      content = content.replace(
        /<link[^>]*href="[^"]*plugin\.min\.css"[^>]*>/,
        match => match + `\n    <link href="${cssPath}" rel="stylesheet">`
      );
    }

    if (!content.includes('brevo-forms.js')) {
      const jsPath = getRelativePath(filePath, 'assets/js/brevo-forms.js');
      content = content.replace(
        /<\/body>/i,
        `<script src="${jsPath}" type="text/javascript"></script>\n</body>`
      );
    }

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    totalModified++;
    totalQuoteReplaced += quoteCount;
    totalNewsletterReplaced += newsletterCount;
    console.log(`Modified: ${path.relative(projectRoot, filePath)} (quotes: ${quoteCount}, newsletter: ${newsletterCount})`);
  }
}

console.log(`\nDone! Modified ${totalModified} files.`);
console.log(`Quote forms replaced: ${totalQuoteReplaced}`);
console.log(`Newsletter forms replaced: ${totalNewsletterReplaced}`);
