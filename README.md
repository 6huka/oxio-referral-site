# Oxio referral website

Referral code: RGYJA2F
Referral link: https://order.oxio.ca/?referral=RGYJA2F

## 1. Replace YOURDOMAIN.ca

After you buy your domain, replace every occurrence of:

YOURDOMAIN.ca

inside the `public` folder with your real domain.

On macOS/Linux, from the project folder:

```bash
grep -rl "YOURDOMAIN.ca" public | xargs sed -i.bak 's/YOURDOMAIN.ca/your-real-domain.ca/g'
find public -name "*.bak" -delete
```

Replace `your-real-domain.ca` in that command with your actual domain.

## 2. Create a GitHub repository

Create a blank GitHub repository named:

oxio-referral-site

Then run from this project folder:

```bash
git init
git add .
git commit -m "Initial Oxio referral site"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/oxio-referral-site.git
git push -u origin main
```

## 3. Deploy to Cloudflare Pages

In Cloudflare:

Workers & Pages -> Create application -> Pages -> Import an existing Git repository

Select `oxio-referral-site`.

Use:

- Production branch: `main`
- Framework preset: None
- Build command: `exit 0`
- Build output directory: `public`

Deploy.

## 4. Add your custom domain

In your Pages project:

Custom domains -> Set up a domain

Enter your real `.ca` domain and follow Cloudflare's DNS instructions.

## 5. Google Search Console

Open Google Search Console.

Add a Domain property using your domain.

Google will give you a DNS TXT verification record. Add that TXT record in Cloudflare DNS and verify the property.

Then go to:

Indexing -> Sitemaps

Submit:

sitemap.xml

Then use URL Inspection and request indexing for:

- https://YOURDOMAIN.ca/
- https://YOURDOMAIN.ca/how-to-use-oxio-referral-code/
- https://YOURDOMAIN.ca/faq/

## 6. Bing Webmaster Tools

Open Bing Webmaster Tools and import the site from Google Search Console, then submit the same sitemap if needed.

## 7. Update the site later

Edit any file inside `public`, then run:

```bash
git add .
git commit -m "Update site"
git push
```

Cloudflare Pages will automatically redeploy the website.
