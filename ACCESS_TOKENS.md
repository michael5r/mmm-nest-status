# Access Keys & Tokens for mmm-nest-status

## Which Keys & Tokens Do I Need?
You'll need these 4:
- Google Cloud Platform OAuth 2.0 Client ID
- Google Cloud Platform OAuth 2.0 Client Secret
- Device Access Project ID
- Device Access Refresh Token

## So ... How Do I Get Them?

Well, the easiest way is to simply follow Google's [Device Access Quick Start Guide](https://developers.google.com/nest/device-access/get-started). You will, of course, need a Google acount in order to do so.

If you go through Step 1 (Get Started) and Step 2 (Authorize an Account), it should provide you with the necessary keys and tokens.

## Is This a Difficult Process? Can You Help?

It really depends on your technical knowledge & skill level. I'm fairly tech-savvy and there were still a couple of areas during the process I felt a bit stumped.

With that said, here are the steps I took in order to get this working on my own mirrors:

1. Register for Device Access in the [Device Access Console](https://console.nest.google.com/device-access). You'll need to pay a one-time fee of $5.
2. Enable the API & get an OAuth 2.0 Client ID for a Google Cloud Platform project
  - I'd suggest using the `Enable the API and get an OAuth 2.0 Client ID` button that's on the `Get Started` page of the Quick Start Guide I linked above - it's much easier than doing it inside the Google Cloud Console.
  - Make sure to choose `Web Server` when it asks "Where are you calling from?" and to enter `https://www.google.com` as the value for Authorized redirect URIs. If you don't, the next step will fail.
  - Save the `OAuth Client ID` and `OAuth Client Secret` values for later - you'll need them for the main `config.js` file in your MagicMirror installation and also to get the refresh token.
3. Go to the [Device Access Console](https://console.nest.google.com/device-access) and create a new project.
  - Pick a name (doesn't really matter what it is), then add the `OAuth Client ID` that was generated in the previous step.
  - I don't use Events in this module, so whether you enable/disable them is up to you.
  - Once you're done, you'll get a `Project ID` which you'll add to the the main `config.js` file in your MagicMirror installation.
4. Link your account using the instructions on the [Authorize an Account page](https://developers.google.com/nest/device-access/authorize).
  - Make sure you're using the `Project ID` you just generated and the `OAuth Client ID` from Step 2 above.
  - I would suggest you enable **all** permissions for **all** devices (saves you from having to do this again if you're also using my `mmm-nest-cameras` module), but, technically, you only need to enable access to your thermostats in order for this module to work.
  - Once you've confirmed your choices, you'll be redirected to `google.com` and your URL will contain an `authorization code` you'll need for the next (and final) step. Make sure to copy that code before navigating away from that page.
5. Get an access token using the instructions on the [Authorize an Account page](https://developers.google.com/nest/device-access/authorize).
  - You can either do this in your `terminal` using curl (as the example shows on the page) or use a dedicated REST client like [Postman](https://www.postman.com).
  - If everything goes according to plan, you should get a JSON response that contains both an `access_token` and a `refresh_token`. This module only uses the `refresh_token`, so feel free to ignore everything else.

That's it - you should now have:
- Google Cloud Platform OAuth 2.0 Client ID from Step 2
- Google Cloud Platform OAuth 2.0 Client Secret from Step 2
- Device Access Project ID from Step 3
- Device Access Refresh Token from Step 4

Add them to the `config.js` file in your MagicMirror installation and you should be good to go:

![image](https://user-images.githubusercontent.com/3209660/144290713-c4b0d3cb-68bc-4a66-912b-0887f1e3793a.png)

## Can I Use My Old Nest Developer Account With This Module?

The 2.x version of this module **only** supports the [Google Device Access API](https://developers.google.com/nest/device-access).

If you still have an old Nest developer account, you'll need to either migrate it to Google or use the [`1.4.3`](https://github.com/michael5r/mmm-nest-status/tree/1.4.3) version of this module.
