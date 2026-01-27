# ClawdNow Waitlist

Simple waitlist landing page for ClawdNow early access signups.

## Features

- 📧 Email collection with validation
- 📋 User preferences (use cases, platform)
- 🤖 Spam protection (honeypot field)
- 📱 Mobile responsive
- 🎨 Beautiful dark theme

## Deploy

### Netlify (Recommended)

1. Push to GitHub
2. Connect to Netlify
3. Deploy — forms work automatically!

### Other Platforms

The form uses Netlify Forms by default. To use a different backend:

1. Remove `data-netlify="true"` from the form
2. Update the form's `action` attribute
3. Modify the JavaScript submit handler

## Customization

- **Counter**: Update the initial count in the HTML
- **Colors**: Modify CSS variables (orange theme: `#D97706`)
- **Contact**: Update email in footer

## License

MIT
