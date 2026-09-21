
<br/>
<div align="center">

<h1 align="center">Steamcommunity-Cleanup</h1>
<p align="center">
UserScript that enhances the Steam forums by filtering discussion topics and comments.

<br/>
<br/>
<a href="https://steamcommunity.com/sharedfiles/filedetails/?id=3288209441">View Guide</a>  
<a href="https://github.com/veehawt/Steamcommunity-Cleanup/issues/new?template=bug_report.md">Report Bug</a>
<a href="https://github.com/veehawt/Steamcommunity-Cleanup/issues/new?template=feature_request.md">Request Feature</a>
</p>
</div>

## Table of Contents

Choose where to install:

- [Steam Client](#installation-in-the-steam-client)
- [Web Browser](#installation-in-a-web-browser)

<br/>

## Installation in the Steam Client

This guide explains how to install **Steamcommunity-Cleanup** within the Steam client.

#### Step 1: Open the Steam browser

- Open the **Steam client**
- Open a new browser tab by right-clicking any link within Steam and selecting **_Open link in new tab_**

#### Step 2: Enable Chrome Developer Mode

- In the new Steam browser tab, select the **address bar**
- Enter `chrome:extensions` and press <kbd>Enter</kbd>
- Enable **Developer mode** using the toggle in the top-right corner

#### Step 3: Install ScriptCat

- Open the [Chrome Web Store](https://chromewebstore.google.com/) in a new tab by right-clicking the link on the left-hand side and selecting **_Open link in new tab_**
- Search for the [ScriptCat](https://chromewebstore.google.com/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf) extension
- Click **Add to Chrome** and confirm the installation
- You will be asked to choose a download location. It doesn't matter where you save the file, as it will only be used temporarily
- Once the download and installation are complete, a new *normal* Chrome window will open
> [!IMPORTANT]
> **Do NOT close this Chrome window!**

#### Step 4: Add Steamcommunity-Cleanup to ScriptCat

- In the new Chrome window, click the **Extensions** icon (puzzle piece) in the top-right corner
- Pin **ScriptCat** to your toolbar
- Click the **ScriptCat** icon
- Wait a few seconds for the ScriptCat interface to open, then click the **⚙️ Settings** icon
- Read or skip the tutorial
- In the top-right corner, hover over **Create Script** and select **Link Import**
- Enter the URL of the **Steamcommunity-Cleanup** (`https://github.com/veehawt/Steamcommunity-Cleanup/raw/master/sccu.user.js`) script and proceed with the installation

#### Step 5: Edit the script

The installation is now complete.

Before closing the Chrome window, open the [configuration guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3288209441) and adjust the **language filters** and other options to your preference.

Once you have finished configuring the script, you can close the Chrome window and return to Steam.

> [!CAUTION]
> If you run into an issue where Steam stops responding or loads indefinitely, press <kbd>Win</kbd> + <kbd>R</kbd> and enter `%LocalAppData%\Steam\htmlcache`. Delete everything in the folder and restart the Steam client.

<br/>

## Installation in a web browser

#### Step 1: Install a UserScript Manager

Get a [UserScript Manager](https://en.wikipedia.org/wiki/Userscript_manager) of your choice. I personally recommend [Violentmonkey](https://violentmonkey.github.io/) because it's open source but any other will do.

> - [Violentmonkey](https://violentmonkey.github.io/) - [Firefox](https://addons.mozilla.org/firefox/addon/violentmonkey/) / [Chrome](https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag) / [Edge](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao)
> - [Tampermonkey](https://www.tampermonkey.net/) - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) / [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) / [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) / [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/) / [Safari](https://apps.apple.com/us/app/tampermonkey/id6738342400)
> - Greasemonkey - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
> - Userscripts - [Safari](https://apps.apple.com/us/app/userscripts/id1463298887)

#### Step 2: Install UserScript

> - Install **Steamcommunity-Cleanup** by clicking this [link](https://github.com/veehawt/Steamcommunity-Cleanup/raw/master/sccu.user.js)

<br/>

### License

[MIT License](https://opensource.org/licenses/MIT).
