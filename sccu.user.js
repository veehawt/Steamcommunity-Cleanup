// ==UserScript==
// @name         Steamcommunity-Cleanup
// @namespace    https://github.com/veehawt/Steamcommunity-Cleanup
// @version      0.4.57
// @description  UserScript that enhances the Steam forums by filtering discussion topics and comments.
// @author       vee (https://github.com/veehawt | https://steamcommunity.com/profiles/76561197969754818)
// @supportURL   https://github.com/veehawt/Steamcommunity-Cleanup/issues
// @downloadURL  https://github.com/veehawt/Steamcommunity-Cleanup/raw/master/sccu.user.js
// @updateURL    https://github.com/veehawt/Steamcommunity-Cleanup/raw/master/sccu.user.js
// @match        https://steamcommunity.com/*/*/discussions/*
// @match        https://steamcommunity.com/app/*/tradingforum/*
// @match        https://steamcommunity.com/app/*/eventcomments/*
// @match        https://steamcommunity.com/workshop/discussions/*
// @match        https://steamcommunity.com/discussions/forum/*
// @match        https://steamcommunity.com/profiles/*
// @match        https://steamcommunity.com/id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Hide comments quoting blocked users
    // Default: false
    const hideBlockedCommentQuote = false;

    // Hide topics with trade-related intent in their titles
    // Note: Trade-related filtering is always disabled in trading forums, regardless of this setting
    // Default: true
    const hideTradeRelatedTopics = true;

    // Enable Counter-Strike 2 specific regexes (weapons, finishes, wear, float, stattrak) in other Steam forums
    // Default: false
    const enableCS2SpecificRegexGlobally = false;

    // Keywords to filter from topic titles
    const keywords = [
        //"hack", // Add your keywords here
        //"cheat",
        //"devs",
        //"noob",
    ];

    // List of regex-based language patterns to filter from topic titles and comments
    // Note: Language filtering is always disabled in trading forums
    const regexLanguage = [
        //["English and the basic Latin alphabet",                               /[A-Za-z]+/],
        ["Cyrillic (Russian, Ukrainian, Bulgarian, Serbian etc.)",              /[\u0400-\u04FF]/],
        ["Arabic",                                                              /[\u0600-\u06FF]/],
        ["Hebrew",                                                              /[\u0590-\u05FF]/],
        ["Chinese",                                                             /[\u4E00-\u9FFF]/],
        ["Devanagari (Hindi, Marathi, Sanskrit, etc.)",                         /[\u0900-\u097F]/],
        ["Thai",                                                                /[\u0E00-\u0E7F]/],
        ["Korean",                                                              /[\uAC00-\uD7AF\u1100-\u11FF]/],
        ["Japanese",                                                            /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/],
        ["Vietnamese",                                                          /[ảạằắẳẵặỉĩịỏọồốổỗộờớởỡợủũụưừứửữựỷỹỵđ]/i],
        ["Greek",                                                               /[\u0370-\u03FF]/],
        ["Turkish",                                                             /[ğşı\u0130\u0307]/i],
        ["Portuguese",                                                          /[ãõ]/i],
        ["Spanish",                                                             /[ñ]/i],
        ["Hungarian",                                                           /[őű]/i],
        ["Polish",                                                              /[ł]/i],
        ["Turkish, French, Portuguese, Spanish         (shared Latin letter)",  /[ç]/i],
        ["Turkish, German, Estonian, Finnish, Hungarian  (shared diacritics)",  /[äöü]/i],
        ["Spanish, Portuguese, Czech, Hungarian, Slovak  (shared diacritics)",  /[áéíóú]/i],
        ["French, Portuguese                             (shared diacritics)",  /[âô]/i],
        ["French, Portuguese, Italian                    (shared diacritics)",  /[à]/i],
        ["French, Portuguese, Italian, Dutch, Romanian   (shared diacritics)",  /[èêëîïùûÿ]/i],
        ["French, Danish, Icelandic, Norwegian       (shared special letter)",  /[æ]/i],
        ["Danish, Finnish, Icelandic, Norwegian, Swedish   (special letters)",  /[øåþð]/i],
    ];

    // Set of Unicode characters sometimes used in text-based emoticons
    // These characters are ignored by language filters and do *not* cause topics or comments to be filtered
    const smileyCharSet = new Set(['ツ', 'ッ', 'シ', 'ノ', 'ヘ', 'ハ', 'ミ', 'メ', 'Д', 'ಠ', '益', '□', '°']);

    // List of regex-based spam patterns to filter from topic titles and comments
    const regexSpam = [
        ["+rep for rep",        /\b[\+\-]?\s*rep\b(?:\s*(?:for\s*[\+\-]?\s*rep|me|pls|plz|plx|please|4\s*(?:me|u|[\+\-]?\s*rep)))?|\bgive\s+[\+\-]?\s*rep\b/i],
        ["comment for comment", /\bcomment\s*(?:for|4)?\s*comment\b/i],
    ];

    // List of regex-based trade patterns to filter from topic titles
    // Note: Trade-related filtering is always disabled in trading forums
    const regexTrade = [
        ["free points",                              /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bp\s*o+\s*i\s*n\s*t\s*s\b))[^\w\s]*\b/i],
        ["free skins",                               /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bs\s*k(?:i|\|)n\s*s\b))[^\w\s]*\b/i],
        ["free items",                               /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bi(?:t|\+)e\s*m(?:s|\$)\b))[^\w\s]*\b/i],
        ["free knife",                               /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bk\s*n\s*i\s*[vf]\s*e\s*s\b))[^\w\s]*\b/i],
        ["free gloves",                              /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bg\s*l\s*o\s*v\s*e\s*s\b))[^\w\s]*\b/i],
        ["free keyword combination",                 /\bfree\s+(?:cases?|gloves?|items?|k(?:nife|nives|nifes)|points|skins?)\b/i],
        ["WTB/WTS/WTT disguised spacing",            /\b[^\w\s]*(?:w\s*t\s*b|w\s*t\s*s|w\s*t\s*t)[^\w\s]*\b/i],
        ["H/W (have/want) variants with brackets",   /\b[\[\(\{\<\-\*\_]?([hw])[\]\)\}\>\-\*\_]?(\b|(?=\W))(?!\/)/i],
        ["open inventory/trade",                     /\bopen (?:inventory|inv|trade)\b/i],
        ["currency pre-/suffix: $10k, €1.2k, 2000$", /(?:\d{1,3}(?:[.,]\d{1,3})?k\s*(?:€|\$|£|¥|usd|euro)|(?:€|\$|£|¥|usd|euro)\s*\d{1,3}(?:[.,]\d{1,3})?k|\d{1,6}\s*(?:€|\$|£|¥|usd|euro)|(?:€|\$|£|¥|usd|euro)\s*\d{1,6})/i]
    ];


    // List of refined regex-based trade intent patterns used to estimate trade confidence score from topic titles
    // Note: Trade-related filtering is always disabled in trading forums
    const regexTradeIntent = new RegExp(String.raw`\b(
        |check(?: my)? (?:inv+|inventory)|fast trade(s|z)?|fair\s+(trade(s|z)?|deal(s|z)?)|fast response|full loadout|gift me|in stock|invent|inv+|knife for knife|
        |(?:lf|lookin(?:g)?)?\s*(?:for|4)[\s-]*trade|(?:no|don'? ?t)\s+lowball(?:ings?|s?)?|o+f{2,}e+r{1,}i?n?g?s?|o+p+e+n+|open(?:[\s-]?(for\s?)?(24\/7|trade|inv+))|
        |personal trader|send trade|(?:some(?:one|body)|anyone)\b(?:\s+\w+){0,3}?\s+trade\s+me|tradeoffers?|t[r4]+[a@]+([i1]+)?d+[e3]?s?[r]?|trade(?:[-\s]?up)?|trading|
        |up for exchange|zero to knife|
      )\b`, 'gi');

    const regexTradeIntentLight = new RegExp(String.raw`\b(
        |buy(ing?)?|capsules?|case(s)?(?![\s-]*hard(?:ened|end))|downgrades?|upgrades?|crates?|give me|have|want|kato(wice)?|
        |(?:lf\b|lookin(?:g)?\s+(?:for|4))(?![\s-]*(friends?|more|players?|team(?:mate|mates|m8s)?|mates?|m8s?))|loadout|open|(play[\s-]?)?skins?|rare|sell(ing?)?|stickers?|store|swap|
      )\b`, 'gi');

    const regexWeapons = new RegExp(String.raw`\b(
        |kni(fe|ve)(s|z)?|bayonets?|bowies?|bfks?|butterfl(ies?|ys?)|falchions?|flip|gut|huntsmans?|kara(mbits?)?|
        |kukris?|m9s?|nomads?|paracords?|(shadow[\s-]?)?daggers?|skeleton?|stilettos?|survivals?|talons?|ursus|
        |glove(s|z)?|blood[\s-]?hounds?|broken[\s-]?fangs?|drivers?|hand[\s-]?wraps?|hydras?|motos?|specialists?|sports?|
        |ak(?:[-\s]?47)?|aug|awp|famas|galil|g3sg1|m4|m4a1[-\s]?s|m4a4|a4|scar[-\s]?20|ssg|
        |bizon|mac[-\s]?10|mp7|mp9|ump|mag[-\s]?7|nova|negev|
        |cz75|deagle|desert eagle|dgl|five[-\s]?seven|glock|p2000|p250|tec[-\s]?9|usp[-\s]?s|agents?|
      )\b`, 'gi');

    const regexFinishes = new RegExp(String.raw`\b(
        |amber[\s-]?fade|amphibious|arboreal|arid|asiimov|autotronic|atomic[\s-]?alloy|badlands|big[\s-]?game|(?:black|blue|green|midnight|red)[\s-]?laminate|
        |(?:(black|wild)[\s-]?)?lotus|black[\s-]?(pearl|tie)|blood[\s-]?(pressure|sport)?|blue[\s-]?(gem|steel|titanium)|boreal[\s-]?forest|bright[\s-]?water|
        |bronze(?:[\s-]?morph|d)|buckshot|capillary|cartel|case[\s-]?hard(?:ened|end)|charred|chrome[\s-]?cannon|chromatic[\s-]?abberation|caution|
        |cobalt(?:[\s-]?skulls)?|commander|conspiracy|constrictor|convoy|cool[\s-]?mint|cmyk|crakow|crimson(?:[\s-]?(kimono|web)?)?|damascus|ddpat|
        |(desert|scarlet)[\s-]?shamagh|diamond(back)?|(gamma[\s-]?)?dopplers?|dragon[\s-]?lore|duct[\s-]?tape|eclipse|emerald(?:[\s-]?web)?|empress|fade|field[\s-]?agent|
        |finish[\s-]?line|fever[\s-]?dream|fennec[\s-]?fox|fire[\s-]?serpent|forest|foundation|freehand|fuel[\s-]?injector|giraffe|gold[\s-]?arabesque|
        |golden(?:[\s-]?(coil|koi))?|green[\s-]?energy|guerrilla|gungir|heat[\s-]?treated|hedge(?:[\s-]?maze)?|hellfire|howl|hot[\s-]?rod|hyper[\s-]?beast|
        |ice[\s-]?coaled|imperial(?:[\s-]?plaid)?|inheritance|icarus[\s-]?fell|jade|(?:king[\s-]?)?snake(?:bite)?|leather|
        |(?:lightning|tiger|serpent)[\s-]?strike|long(?:[\s-]?)dog|lore|lunar[\s-]?weave|marble(?:[\s-]?fade)?|mecha[\s-]?industries|mogul|
        |modern[\s-]?hunter|moss[\s-]?quartz|mangrove|mulberry|needle(?:[\s-]?point)?|neon[\s-]?(revolution|rider)?|night(?:[\s-]?(mare|stripe|wish))?|nocts|
        |neo[\s-]?noir|ocean[\s-]?drive|omega|overprint|overtake|(?:p\s*([1-4])|phase\s*([1-4]))|pandora(?:'s?[\s-]?box|[\s-]?)?|phosphor|polygon|poseidon|pow|print[\s-]?stream|
        |(?:queen[\s-]?)?jaguar|radiation[\s-]?hazard|rattler|red[\s-]?line|rub(y|ies)|rust[\s-]?coat|sapphires?|crim[\s-]?z|searing|slate|slaughter|slingshot|smoke[\s-]?out|
        |(?:snow[\s-])?leopards?|spruce|stained|stratosphere|sunset[\s-]?storm|spearmint|starcade|superconductor|(?:silk[\s-]?)?tiger([\s-]?tooth)?|temukau|
        |tilted|transport|turtle|ultraviolet|unhinged|vanilla|vaporwave|vice|vulcan|whiteout|wildfire|x[-\s]?ray|yellow[\s-]?banded|zebra[\s-]?stripe|ibuypower|dignitas|titan|
      )\b`, 'gi');

    const regexWear = /\b(factory new|fn|minimal wear|mw|field[-\s]?tested|ft|well[-\s]?worn|ww|battle[-\s]?scarred|bs|float)\b/gi;
    const regexFloat = /(?<!\d)[.,]\d{1,14}(?![\d\w])|\b0[.,]\d{1,14}(?![\d\w])/g;
    const regexStatTrak = /\b(stat[\s\-]?trak|stat[\s\-]?track)\b/gi;

    const regexTradeNegatives = new RegExp(String.raw`\b(
        |(1|2|3|4|5)[\s-]?v(?:s\.?|s)?[\s-]?(1|2|3|4|5)|abilit(y|ies)|access|add(ition)?|advanc(ed?|es?|ing)|advis(ed?|es?|ing)?|advices?|api[\s-]?keys?|animations?|anti[\s-]?cheats?|
        |apps?|aren'? ?t|isn'? ?t|weren'? ?t|wasn'? ?t|won'? ?t|wouldn'? ?t|couldn'? ?t|shouldn'? ?t|didn'? ?t|doesn'? ?t|don'? ?t|can'? ?t|hasn'? ?t|hadn'? ?t|mustn'? ?t|
        |artists?|attempt(ed|ing|s)?|attention|authentic(at(ed|es|ing|ions?|ors?))?|available(?![\s-]?for trade)|back|badges?|ban(ned|ning|s)?|because|(been|has) limited|best|
        |black screen|(bring|brought) back|bind(ed|ing|s)?|blank(s|ed|ing)?|bound(ed)?|broken(?![\s-]?fang)|brows(ed?|ers?|ing)?|bugs?|builds?|but|can (I|you)|cannot|casuals?|
        |chang(e|es|ing)|clans?|clients?|commands?|com(?:munit(?:y|ies)|m{1,2}s?|municat(?:e[ds]?|ing))|confessions?|confirm(ed|ing|s)?|consoles?|countr(ies|y)|crash(ed|es)?|created|
        |crosshairs?|custom(i[sz](ation|ing)s?|s)?|deceiv(ed|es|ing)|deleted?|desktop|detect(ed|ion(s)?|s)|disappear(ed|ing|s)?|discussions?|dlcs?|do(es)? (I|you)?|drop(ping|s)?|
        |duos?|trios?|quads?|elos?|error|extend(?:ed|s|ion|ions)?|f2p|free2play|free[\s-]?to[\s-]?play|faceit|fail(ings?|s)?|fak(ed?|es?|ing)|favo(u)?rit(e|ed|es|ing)|feedbacks?|
        |filter(ed|ing|s)?|fix(ed|es)?|for \d+ days|forums?|fps|friends?|freez(es?|ing)|fresh|gam(e(s)?|ing)|game store|glitch(ed|es|ing)?|gpus?|groups?|hard[\s-]?stuck|
        |hat(e(d|s)?|er(s)?|ful(ly)?|ing|red)|help(ed|full?|ing|s)?|hid(e|ing)|hi(gh)?jack(ed|ing|s)|histor(y|ies)|hold(ings?|s)?|hop(e|ing)|host(ile|ings?|ed|s)?|how (can|do)?|
        |(I )?opened|icons?|idea|improv(ement(s)?|ing)|info(rmation)?s?|install(ed|ing|s)?|invalid|is (it|there)|issues?|lags?|languages?|let (me|us)|(?:re)?load(?:ing)?|
        |lik(ed?|es?|ing)?|locati(ons?|ng)|(?:un)?lock(?:ed|s|ing)?|lost|lov(ed?|es?|ing)?|made|match(es|ing)?|matchmaking|mm|memor(ies|y)|menus?|messag(ed?|es?|ing)?|msgs?|
        |miss(ed|es|ing)?|mod(ded|ding|s|erators?)|monitor(ed|ing|s)?|multiplayer|mute(d|s)?|name|network(ing|s)?|no trad(e|es|ing)|noises?|not|opinions?|option(al|s)?|or not|
        |pag(ed?|es?|ing)?|patch(es|ing)?|pc|people|permission|person(al(ly)?|as?|s)?|phones?|players?|point shop|polic(ing|y|ies)|possibl(e|y)|practice|pre[\s-]?mades?|prem(iere?)?|
        |prices?|prime|privacy|problems?|profiles?|questions?|rant(ing)?|rat(e(s)?|ing(s)?)|receiv(e|ed|ing)|recruiting|refund(able|ings?|ed|er|es)?|remove(d|s)?|report(ed|ing|s)?|
        |reset(s|ted|ting)?|resolutions?|resolv(e|es|ing)|restart(ed|ing|s)?|revamps?|reward(ed|ing|s)?|rules|scam(?:s|med|mer)?|stolen|scrim(?:s|z)?|scrimmages?|should|show(ings?|s)?|
        |(?<!\b(?:buy|sell|gift)(?:ing)?\s)(some(?:body|one|thing))(?!\s(?:buy|sell|gift)(?:ing)?\b)|some(how|what|where)|sounds?|sources?|suggestions?|together|
        |restrict(ed|ing|ions?|s)?|rever(ses?|sal|ted|ts?|ting)|rework(ed|ing|s)?|run(ning|s)?|settings?|should I|sort(ing|s)?|specific|steam(?:[\s-]?(guard|vr))?|servers?|
        |showcas(ed?|es?|ing)|sold|stacks?|stop|store page|strats?|stretched|stuck|systems?|tactics?|team(?:mate|mates|m8s)?|mates?|m8s?|thoughts?|tickets?|to play\s+.+?(?:\s+with)?|
        |training|troll(ed|ing|s)?|tr(ied|ies?|ying?|ys?)|tutorials?|unable|unauthorized|unavailable|unbans?|uninstall(ed|ing|s)?|unknow(ing(ly)?|ns?)?|updates?|
        |unexpected|us(e|es|ers|ing)|vac|valve|version(ing|s)?|view(ed|ing|models?|s)?visual(ly|s)?|wait(ing)? time|warnings?|we|what|when|where|which|who|why|wingman|wish(ed|s)?|
        |wishlist(ed|ing|s)?|work(ed|ing|s|shop)?|worst|(?:it[\s,]+worth|worth[\s,]+it)(?![\s-]?of)|worth(?:less(?:ly)?|while|y)|would you|
        |(?<!https steamcommunity\.com tradeoffer )\bnews?\b(?!\s+(kni(fe|ve)(s|z)?|glove(s|z)?|skins?))
      )\b`, 'gi');


    const scriptStyles = `
        .nickname img.nickname-icon {
            vertical-align: middle;
            margin-left: 4px;
            margin-right: -2px;
            position: relative;
            top: 1px;
        }
        .header_all,
        .header_blocked,
        .footer_all,
        .footer_blocked {
            display: inline-block;
            border-radius: 2px;
            border: none;
            width: 112px;
            height: 17px;
            padding: 0px 16px;
            background: rgba(103, 193, 245, 0.2);
            cursor: pointer;
            text-decoration: none !important;
            color: #67c1f5 !important;
            line-height: 17px;
        }
        .header_all.active,
        .header_blocked.active,
        .footer_all.active,
        .footer_blocked.active {
            box-shadow: 0 0 2px #417a9b, 0 0 10px #417a9b;
            background: #549EC8
            background: -webkit-linear-gradient( 150deg, #417a9b 5%, #549EC8 95%);
            background: linear-gradient( -60deg, #417a9b 5%, #549EC8 95%);
            color: #fff !important;
        }
        .header_all:hover,
        .header_blocked:hover,
        .footer_all:hover,
        .footer_blocked:hover {
            background: #417a9b;
            background: -webkit-linear-gradient( 150deg, #417a9b 5%,#67c1f5 95%);
            background: linear-gradient( -60deg, #417a9b 5%, #67c1f5 95%);
            color: #fff !important;
        }
        .blocked-user {
            box-shadow: inset 2px 0 0 #f84972, inset -2px 0 0 #f84972;
            background-color: rgba(118, 85, 116, 0.5);
        }
        .blocked-user:hover {
            background-color: rgba(141, 102, 139, 0.8);
        }
        .blocked-user-comment {
            background-color: #2b2230 !important;
        }
        .blocked-user-comment-quote {
            background-color: #141d29 !important;
        }
        .blocked-user-OP {
            background: linear-gradient(to bottom right, #3a2c3f, #1a141c) !important;
            border: 1px solid #1e161f !important;
        }
        .filtered-keywords {
            background-color: rgba(211, 165, 136, 0.5);
        }
        .filtered-keywords:hover {
            background-color: rgba(211, 165, 136, 0.8);
        }
        .filtered-regex {
            background-color: rgba(118, 85, 116, 0.5);
        }
        .filtered-regex:hover {
            background-color: rgba(141, 102, 139, 0.8);
        }
        .filtered-regex-comment {
            background-color: rgba(67, 47, 67, 0.5) !important;
        }

        .filtered-trade-related {
            background-color: rgba(44, 165, 141, 0.5) !important;
        }
        .filtered-trade-related:hover {
            background-color: rgba(54, 187, 169, 0.8) !important;
        }
        .filtered-regex-trade-related {
            background: linear-gradient(50deg, rgba(118, 85, 116, 0.5) 15%, 45%, rgba(44, 165, 141, 0.5)) 30%;
            border: 1px solid transparent;
            border-image: linear-gradient(80deg, rgba(118, 85, 116, 0.8), rgba(44, 165, 141, 0.8)) 1;
        }
        .filtered-regex-trade-related:hover {
            background: linear-gradient(50deg, rgba(141, 102, 139, 0.8) 15%, 45%, rgba(54, 187, 169, 0.8)) 30%;
        }
        .forum_paging_header_extended,
        .forum_paging_pagectn_extended,
        .forum_paging_footer_extended,
        .forum_paging_fpagectn_extended {
            position: relative;
            display: flex;
            justify-content: space-between;
            line-height: 25px;
            height: 25px;
            background-color: rgba(21, 31, 44, 0.7);
            color: #56707f;
            padding: 0px 6px;
        }
        .forum_paging_header,
        .forum_paging_pagectn {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            margin-bottom: 0;
            margin-top: 2px;
        }
        .forum_paging_header_extended,
        .forum_paging_pagectn_extended {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border-bottom-left-radius: 3px;
            border-bottom-right-radius: 3px;
            margin-top: 0;
            margin-bottom: 2px;
        }
        .forum_paging_footer,
        .forum_paging_fpagectn {
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            margin-top: 0;
            margin-bottom: 2px;
        }
        .forum_paging_footer_extended,
        .forum_paging_fpagectn_extended {
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            margin-top: 2px;
            margin-bottom: 0;
        }
        .button-container {
            display: flex;
            justify-content: space-between;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = scriptStyles;
    document.head.appendChild(styleSheet);

    const logStyles = {
        label: 'color: #888888;',
        default: 'color: #54a5d4;',
        keyword: 'color: #d3a588;',
        regex: 'color: #773d61;',
        trade: 'color: #2ca58d;',
        regextrade: 'color: #d17842',
        blocked: 'color: #d4545f;',
        quoted: 'color: #d48754;'
    };


    const SCRIPT_VERSION = '0.4.57';
    const devMode = false;
    const tradeCheckCache = new Map();
    const loggedComments = new Set();
    const loggedLocations = new Set();
    let devLogGroupOpen = false;

    const isCS2Forum =
        window.location.href.includes("/app/730/") ||
        window.location.href.includes("workshop/discussions") && window.location.href.includes("appid=730");
    const isTradingForum = window.location.href.includes('/tradingforum/');
    const isProfileContainer = document.querySelector('.profile_page');
    const isTopicsContainer = document.querySelector('.forum_topics_container');
    const isCommentsContainer = document.querySelector('.commentthread_comment_container');
    const isGeneralForum = !!isTopicsContainer;
    const isDiscussion = !!isCommentsContainer;



    let regexFiltersComments;
    if (isTradingForum) {
        regexFiltersComments = [...regexSpam];
    } else {
        regexFiltersComments = [...regexLanguage, ...regexSpam];
    }

    const useCS2SpecificRegexGlobally = isCS2Forum || enableCS2SpecificRegexGlobally;
    const cs2Keys = ['weapons', 'finishes', 'wear', 'float', 'stattrak'];

    const regexTradeTests = {
        negatives: regexTradeNegatives,
        intent: regexTradeIntent,
        intentlight: regexTradeIntentLight,
        weapons: regexWeapons,
        finishes: regexFinishes,
        wear: regexWear,
        float: regexFloat,
        stattrak: regexStatTrak
    };

    const fuzzyRegexTermsByKey = Object.fromEntries(
        Object.entries(regexTradeTests)
            .filter(([key]) =>
                ['intent', 'weapons', 'finishes'].includes(key)
            )
            .map(([key, regex]) => [key, extractTermsFromRegex(regex)])
    );

    const buttonManager = createButtonStateManager();

    let showAllHeader = false;
    let showAllFooter = false;
    let showBlockedHeader = false;
    let showBlockedFooter = false;

    let headerBtnAll, footerBtnAll, headerBtnBlocked, footerBtnBlocked;
    let buttonContainerHeader, buttonContainerFooter;

    let currentEndIndex = 0;

    const pendingDevLogs = new Map();

    function getPatternWeights() {
        const baseWeights = {
            intent: 4,
            intentlight: 2,
            negatives: -3,
            weapons: 2,
            finishes: 2,
            wear: 3,
            float: 3,
            stattrak: 2,
        };

        if (!useCS2SpecificRegexGlobally) {
            baseWeights.weapons = 0;
            baseWeights.finishes = 0;
            baseWeights.wear = 0;
            baseWeights.float = 0;
            baseWeights.stattrak = 0;
        }

        return baseWeights;
    }


    function normalizeRaw(raw) {
        return raw
            .toLowerCase()
            .replace(/\s+/g, ' ') // collapse tabs, newlines, multiple spaces
            .trim();
    }

    function normalizeContent(content) {
        return content
            .toLowerCase()
            .normalize("NFKD") // strip accents and diacritics
            .replace(/[^\p{ASCII}]/gu, ' ') // replace all non-ASCII characters (emojis, special symbols, etc.)
            .replace(/[^\p{L}\p{N}\s\-\.,?]/gu, ' ') // replace everything but letters, numbers, spaces, hypens, periods, commas and question marks
            .replace(/\s+/g, ' ') // collapse whitespaces
            .trim()
    }

    function damerauLevenshtein(a, b) {
        const da = [];
        const m = a.length;
        const n = b.length;

        for (let i = 0; i <= m; i++) {
            da[i] = [];
            for (let j = 0; j <= n; j++) {
                if (i === 0) da[i][j] = j;
                else if (j === 0) da[i][j] = i;
                else da[i][j] = 0;
            }
        }

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                let cost = a[i - 1] === b[j - 1] ? 0 : 1;

                da[i][j] = Math.min(
                    da[i - 1][j] + 1,           // Deletion
                    da[i][j - 1] + 1,           // Insertion
                    da[i - 1][j - 1] + cost     // Substitution
                );

                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    da[i][j] = Math.min(da[i][j], da[i - 2][j - 2] + cost);
                }
            }
        }

        return da[m][n];
    }

    function extractTermsFromRegex(regex) {
        const source = regex.source;
        const terms = new Set();

        let cleaned = source
            .replace(/\\b/g, '')
            .replace(/\(\?:/g, '(')
            .replace(/\\s\??/g, ' ')
            .replace(/[-\s]?\?/g, ' ')
            .replace(/[^a-zA-Z0-9|() ]+/g, '')
            .replace(/\s{2,}/g, ' ');

        function expandGroup(base, groupContent) {
            const variants = groupContent.split('|');
            const results = [];
            for (const variant of variants) {
                results.push(base + variant);
            }
            return results;
        }

        const altGroupRegex = /([a-z0-9]+)\(([^()]+)\)\?/gi;
        cleaned = cleaned.replace(altGroupRegex, (_, base, opts) => {
            return expandGroup(base, opts).join('|');
        });

        const flatGroupMatches = cleaned.match(/\(([^()]+)\)/g) || [];
        for (const group of flatGroupMatches) {
            const parts = group.slice(1, -1).split('|');
            for (let term of parts) {
                term = term.trim().replace(/\s+/g, ' ');
                if (term.length >= 3) terms.add(term);
            }
        }

        const looseTerms = cleaned
            .split('|')
            .map(t => t.trim())
            .filter(t => t.length >= 3);

        for (const term of looseTerms) {
            terms.add(term);
        }

        return [...terms].map(text => ({
            text,
            isSingleToken: !text.includes(' ')
        }));
    }

    function generateNGrams(tokens, maxSize) {
        const nGrams = {};
        for (let size = 1; size <= maxSize; size++) {
            nGrams[size] = [];
            for (let i = 0; i <= tokens.length - size; i++) {
                const phrase = tokens.slice(i, i + size).join(' ');
                nGrams[size].push(phrase);
            }
        }
        return nGrams;
    }

    function isFuzzyMatch(word, regexTerm, minWordLength = 5) {
        if (word === regexTerm) return false;
        if (word.length < minWordLength || regexTerm.length < minWordLength) return false;

        const minAllowed = 1;
        const maxAllowed = Math.min(2, Math.floor(regexTerm.length / 5));
        const allowedDistance = Math.max(minAllowed, maxAllowed);

        const distance = damerauLevenshtein(word, regexTerm);

        return distance <= allowedDistance;
    }

    function getFuzzyMatchesForKey(tokens, regexTermList, allExactMatches, {
        globalUsedFuzzyTokens = new Set(),
        fuzzyStopwords = new Set(),
        allowlist = null
    } = {}) {
        const fuzzyMatches = [];
        const localUsedFuzzyTokens = new Set();

        const maxWindow = Math.max(...regexTermList.map(t => t.text.split(' ').length));
        const nGrams = generateNGrams(tokens, maxWindow);

        for (const { text: regexTerm } of regexTermList) {
            if (allowlist && !allowlist.has(regexTerm)) continue;

            const size = regexTerm.split(' ').length;
            const candidates = nGrams[size] || [];

            for (const phrase of candidates) {
                const normalized = phrase.trim().toLowerCase();

                if (
                    isFuzzyMatch(normalized, regexTerm) &&
                    !allExactMatches.has(normalized) &&
                    !localUsedFuzzyTokens.has(normalized) &&
                    !globalUsedFuzzyTokens.has(normalized) &&
                    !fuzzyStopwords.has(normalized)
                ) {
                    fuzzyMatches.push(normalized);
                    localUsedFuzzyTokens.add(normalized);
                    globalUsedFuzzyTokens.add(normalized);
                }
            }
        }

        return fuzzyMatches;
    }

    function applyFuzzyEnhancement(showAll, showBlocked) {
        const topics = document.querySelectorAll('.forum_topic');

        topics.forEach(topic => {
            if (topic.closest('.rightSectionTopTitle')) return;
            if (topic.classList.contains('blocked-user')) return;

            evaluateTopicFilters(topic, showAll, false);
        });

        if (devMode) {
            console.groupEnd();
        }

        if (!showAll && !showBlocked) {
            setVisibleCount();
        }

        initCounts();
    }

    function isKeywords(text, keywordList) {
        const keywordMatches = keywordList.filter(keyword =>
            text.toLowerCase().includes(keyword.toLowerCase())
        );
        return {
            isMatch: keywordMatches.length > 0,
            keywordMatches
        };
    }

    function isRegex(text, regexList) {
        const matches = [];

        for (const [description, regex] of regexList) {
            const found = text.match(regex);
            if (!found) continue;

            const hasNonSmiley = found.some(token =>
                [...token].some(char => !smileyCharSet.has(char))
            );

            if (hasNonSmiley) {
                matches.push(`${description}: ${found[0]}`);
            }
        }

        return {
            isMatch: matches.length > 0,
            regexMatches: matches,
        };
    }

    function analyzeTradeMatch(content, skipFuzzy) {
        const normalized = normalizeContent(content);

        const {
            score,
            breakdown,
            matchedByKey,
            fuzzyMatchByKey
        } = getTradeConfidenceScore(normalized, skipFuzzy);

        return {
            isTrade: score >= 3,
            score,
            confidence: getConfidenceLevel(score),
            scoreByKey: breakdown,
            matchedByKey,
            fuzzyMatchByKey,
            normalized
        };
    }

    function isTradeRelated(content, topic = null, regexMatches = {}, keywordMatches = [], skipFuzzy = false) {
        if (isTradingForum && !devMode) return false;

        const cacheKey = `${content}::${skipFuzzy ? 'nofuzzy' : 'full'}`;
        if (tradeCheckCache.has(cacheKey)) {
            return tradeCheckCache.get(cacheKey);
        }

        const result = analyzeTradeMatch(content, skipFuzzy);

        let output;
        if (devMode) {
            output = getDebugResult({
                ...result,
                raw: normalizeRaw(content),
                regexLanguageMatch: regexMatches.regexLanguageMatch,
                regexSpamMatch: regexMatches.regexSpamMatch,
                regexTradeMatch: regexMatches.regexTradeMatch,
                keywordMatches,
                topic,
                skipFuzzy,
                useCS2SpecificRegexGlobally
            });
        } else {
            output = result.isTrade;
        }

        tradeCheckCache.set(cacheKey, output);
        return output;
    }


    function getTradeConfidenceScore(normalized, skipFuzzy = false) {
        const patternWeights = getPatternWeights();

        const scoreBreakdown = {};
        const matchedByKey = {};
        const fuzzyMatchByKey = {};

        const tokens = normalized.split(/\s+/);
        const allExactMatches = new Set();
        let totalScore = 0;

        const globalUsedFuzzyTokens = new Set();
        const fuzzyStopwords = new Set(['block', 'open']);
        const allowedTerms = new Set([
            ...(fuzzyRegexTermsByKey.intent || []).map(t => t.text),
            ...(fuzzyRegexTermsByKey.weapons || []).map(t => t.text),
            ...(fuzzyRegexTermsByKey.finishes || []).map(t => t.text),
        ]);

        for (const [key, regex] of Object.entries(regexTradeTests)) {
            if (key === 'intentlight' && matchedByKey.intent && matchedByKey.intent.length > 0) {
                matchedByKey[key] = [];
                fuzzyMatchByKey[key] = [];
                scoreBreakdown[key] = { count: 0, fuzzyCount: 0, groupScore: 0 };
                continue;
            }

            let matches = [...normalized.matchAll(regex)].map(m => m[0]);
            matchedByKey[key] = matches;
            matches.forEach(m => allExactMatches.add(m));

            if (key === 'float') {
                matches = matches.filter((match) => {
                    const idx = normalized.indexOf(match);
                    const before = normalized.slice(Math.max(0, idx - 6), idx);
                    const after = normalized.slice(idx + match.length, idx + match.length + 6);

                    const datePatternBefore = /\b\d{1,2}\.\d{1,2}$/.test(before);
                    const datePatternAfter = /^\d{1,2}\.\d{2,4}\b/.test(after);

                    return !(datePatternBefore || datePatternAfter);
                });
                matchedByKey[key] = matches;
            }

            let exactCount = matches.length;
            let fuzzyCount = 0;
            let fuzzyMatches = [];

            const allowFuzzy = !skipFuzzy && fuzzyRegexTermsByKey[key] && exactCount === 0;
            if (allowFuzzy) {
                fuzzyMatches = getFuzzyMatchesForKey(tokens, fuzzyRegexTermsByKey[key], allExactMatches, {
                    globalUsedFuzzyTokens,
                    fuzzyStopwords,
                    allowlist: allowedTerms
                });
                fuzzyCount = key === 'intent' ? Math.min(1, fuzzyMatches.length) : fuzzyMatches.length;
                fuzzyMatchByKey[key] = fuzzyMatches;
            } else {
                fuzzyMatchByKey[key] = [];
            }

            if (key === 'intent') {
                exactCount = Math.min(1, exactCount);
                if (exactCount === 1) fuzzyCount = 0;
            }

            const weight = patternWeights[key] || 0;
            let groupScore = 0;

            if (key === 'negatives') {
                // Remove matches that are part of a known trade link
                matches = matches.filter(match => {
                    const index = normalized.indexOf(match);
                    const slice = normalized.slice(Math.max(0, index - 60), index + 60);
                    // Exclude matches inside the trade link
                    return !/https steamcommunity\.com tradeoffer new/i.test(slice);
                });

                // Then check for '?' only if it is NOT inside the trade link
                const questionMatches = [...normalized.matchAll(/\?/g)].map(m => m[0]);
                const questionInTradeLink = questionMatches.some((qm, i) => {
                    const idx = normalized.indexOf(qm);
                    const slice = normalized.slice(Math.max(0, idx - 60), idx + 60);
                    return /https steamcommunity\.com tradeoffer new/i.test(slice);
                });

                let hasQuestion = false;
                if (normalized.includes('?') && !matches.includes('?') && !questionInTradeLink) {
                    hasQuestion = true;
                    matches.push('?');
                    exactCount++;
                }

                for (let i = 0; i < exactCount + fuzzyCount; i++) {
                    groupScore -= Math.max(0, 3 - i);
                }

                // Ensure '?' always penalizes at least -2 for the trade confidence score
                if (hasQuestion) {
                    const penaltyIndex = exactCount + fuzzyCount - 1;
                    const basePenalty = Math.max(0, 3 - penaltyIndex);
                    if (basePenalty < 2) {
                        groupScore -= (2 - basePenalty);
                    }

                    matchedByKey.negatives = [...new Set([...(matchedByKey.negatives || []), '?'])];
                }
            } else {
                groupScore = (exactCount + fuzzyCount * 0.5) * weight;
            }

            scoreBreakdown[key] = { count: exactCount, fuzzyCount, groupScore };
            totalScore += groupScore;
        }

        return {
            score: totalScore,
            breakdown: scoreBreakdown,
            matchedByKey,
            fuzzyMatchByKey
        };
    }

    function getConfidenceLevel(score) {
        if (score < 0) return 'very unlikely';
        if (score < 3) return 'unlikely';
        if (score < 6) return 'likely';
        return 'very likely';
    }

    function shouldCheckLanguage() {
        return !isTradingForum || devMode;
    }

    function shouldCheckTrade() {
        return hideTradeRelatedTopics && (!isTradingForum || devMode);
    }

    function matchRegexGroup(text, group) {
        for (const [_, pattern] of group) {
            const matches = text.match(pattern);
            if (!matches) continue;

            const hasNonSmiley = matches.some(token =>
                [...token].some(char => !smileyCharSet.has(char))
            );

            if (hasNonSmiley) {
                return true;
            }
        }
        return false;
    }

    function getRegexMatches(text, { excludeTrade = false } = {}) {
        return {
            regexLanguageMatch: shouldCheckLanguage() && matchRegexGroup(text, regexLanguage),
            regexSpamMatch: matchRegexGroup(text, regexSpam),
            regexTradeMatch: !excludeTrade && shouldCheckTrade() && matchRegexGroup(text, regexTrade),
        };
    }

    function isBlockedTopic(topic) {
        if (!isGeneralForum) return false;

        const title = topic.querySelector('.forum_topic_name.op_hidden');
        if (!title) return false;

        const label = title.querySelector('.forum_topic_label');
        if (!label) return false;

        if (topic.classList.contains('moved')) return false;

        const allowedLabels = ['pinned', 'announcement', 'sticky'];
        const labelText = label.textContent.trim().toLowerCase();

        return !allowedLabels.some(allowed => labelText.includes(allowed));
    }

    function isBlockedComment(comment) {
        if (!isDiscussion) return false;

        return comment.classList.contains('commentthread_deleted_expanded');
    }

    function isBlockedCommentQuote(comment) {
        if (!hideBlockedCommentQuote) return false;
        if (!isDiscussion) return false;

        const commentText = comment.querySelector('.commentthread_comment_text');
        if (!commentText) return false;

        const blockedCommentIds = new Set(
            Array.from(document.querySelectorAll('.commentthread_deleted_expanded[id^="comment_"]'))
                .map(el => el.id.replace('comment_', ''))
        );

        const quoteLinks = commentText.querySelectorAll('a[href^="#c"]');
        for (const link of quoteLinks) {
            const quotedId = link.getAttribute('href').substring(2);
            if (blockedCommentIds.has(quotedId)) {
                return true;
            }
        }

        return false;
    }

    function getTopicHoverText(topic) {
        const rawTooltipHTML = topic.getAttribute('data-tooltip-forum');
        if (!rawTooltipHTML) return '';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawTooltipHTML;

        const hoverTextDiv = tempDiv.querySelector('.topic_hover_text');
        return hoverTextDiv ? hoverTextDiv.textContent.trim() : '';
    }



    function evaluateTopicFilters(topic, showAll, includeLogs = true) {
        const topicName = topic.querySelector('.forum_topic_name');
        if (!topicName) return;

        const titleText = normalizeRaw(topicName.textContent);
        const hoverText = normalizeRaw(getTopicHoverText(topic));

        const titleMatches = getRegexMatches(titleText);
        const hoverMatches = getRegexMatches(hoverText, { excludeTrade: true });

        const regexLanguageMatch = titleMatches.regexLanguageMatch || hoverMatches.regexLanguageMatch;
        const regexSpamMatch = titleMatches.regexSpamMatch || hoverMatches.regexSpamMatch;
        const regexTradeMatch = titleMatches.regexTradeMatch;

        const { isMatch: isKeywordMatch, keywordMatches } = isKeywords(titleText, keywords);

        const isRegexMatch = regexLanguageMatch || regexSpamMatch || regexTradeMatch;

        const tradeResult = isTradeRelated(
            titleText,
            topic,
            {
                regexLanguageMatch,
                regexSpamMatch,
                regexTradeMatch
            },
            keywordMatches,
            includeLogs
        );

        const isTrade = typeof tradeResult === 'object' ? tradeResult.isTrade : tradeResult;

        topic.dataset.tradeMatch = isTrade;
        topic.dataset.regexMatch = isRegexMatch;
        topic.dataset.regexLanguageMatch = regexLanguageMatch;
        topic.dataset.regexSpamMatch = regexSpamMatch;
        topic.dataset.regexTradeMatch = regexTradeMatch;

        applyTopicClasses(
            topic,
            isKeywordMatch,
            regexLanguageMatch,
            regexSpamMatch,
            regexTradeMatch,
            isTrade,
            showAll
        );
    }

    function applyTopicClasses(topic, keywordMatch, regexLanguageMatch, regexSpamMatch, regexTradeMatch, tradeMatch, showAll) {
        topic.classList.remove(
            'filtered-keywords',
            'filtered-regex',
            'filtered-trade-related',
            'filtered-regex-trade-related'
        );

        const isTradeIntentFilteringEnabled = hideTradeRelatedTopics ? tradeMatch : false;
        const isTradeRegexFilteringEnabled = hideTradeRelatedTopics ? regexTradeMatch : false;

        const isFiltered = keywordMatch || regexLanguageMatch || regexSpamMatch || isTradeRegexFilteringEnabled || isTradeIntentFilteringEnabled;

        if (devMode) {
            if (isTradeRegexFilteringEnabled && isTradeIntentFilteringEnabled) {
                topic.classList.add('filtered-regex-trade-related');
            } else if (isTradeRegexFilteringEnabled) {
                topic.classList.add('filtered-regex');
            } else if (regexLanguageMatch || regexSpamMatch) {
                topic.classList.add('filtered-regex');
            } else if (isTradeIntentFilteringEnabled) {
                topic.classList.add('filtered-trade-related');
            }

            if (keywordMatch) {
                topic.classList.add('filtered-keywords');
            }
        } else if (isFiltered) {
            topic.classList.add('filtered-regex');
        }

        topic.style.display = showAll || !isFiltered ? '' : 'none';
    }

    function filterTopics(showAll = devMode, showBlocked = false) {
        const locationInfo = getForumLocationInfo();

        if (isGeneralForum) {
            devLogGroupStart(locationInfo);
        }

        const topics = document.querySelectorAll('.forum_topic');
        topics.forEach(topic => {
            if (topic.closest('.rightSectionTopTitle')) return;

            topic.classList.remove(
                'blocked-user',
                'filtered-regex',
                'filtered-trade-related',
                'filtered-regex-trade-related',
                'filtered-keywords',
            );

            if (isBlockedTopic(topic)) {
                topic.classList.add('blocked-user');
                topic.style.display = (showAll || showBlocked) ? '' : 'none';
                return;
            }

            evaluateTopicFilters(topic, showAll, true);
        });

        initCounts();

        setTimeout(() => {
            if (isGeneralForum) {
                applyFuzzyEnhancement(showAll, showBlocked);
            }

            if (devLogGroupOpen) {
                console.groupEnd();
                devLogGroupOpen = false;
            }
        }, 50);
    }

    function getCleanedCommentText(commentElem) {
        const commentText = commentElem.querySelector('.commentthread_comment_text');
        if (!commentText) return '';

        const textClone = commentText.cloneNode(true);
        textClone.querySelectorAll('blockquote').forEach(bq => bq.remove());
        textClone.querySelectorAll('.btn_darkblue_white_innerfade').forEach(el => el.remove());
        textClone.querySelectorAll('.dynamiclink_box').forEach(el => el.remove());

        return textClone.textContent.trim();
    }

    function filterComments(showAll = devMode, showBlocked = false) {
        const locationInfo = getForumLocationInfo();

        if (isDiscussion) {
            devLogGroupStart(locationInfo);
        }

        filterOP(showAll, showBlocked);

        const comments = document.querySelectorAll('.commentthread_comment');

        comments.forEach(comment => {
            const container = comment.closest('.commentthread_comment_container');
            if (container?.id.startsWith('commentthread_Profile_')) return;

            if (comment.classList.contains('commentthread_deleted_comment')) {
                comment.remove();
                return;
            }

            comment.classList.remove(
                'blocked-user-comment',
                'filtered-regex-comment',
                'blocked-user-comment-quote'
            );

            let reason = '';
            let isRegexMatch = false;

            if (isBlockedComment(comment)) {
                comment.classList.add('blocked-user-comment');
                comment.style.display = (showAll || showBlocked) ? '' : 'none';
                reason = 'comment by blocked user';

            } else if (hideBlockedCommentQuote && isBlockedCommentQuote(comment)) {
                comment.classList.add('blocked-user-comment-quote');
                comment.style.display = (showAll || showBlocked || !hideBlockedCommentQuote) ? '' : 'none';
                reason = 'comment quoting blocked user';

            } else {
                const cleanedText = getCleanedCommentText(comment);
                const result = isRegex(cleanedText, regexFiltersComments);

                if (result.isMatch) {
                    comment.classList.add('filtered-regex-comment');
                    comment.style.display = showAll ? '' : 'none';
                    isRegexMatch = true;
                    reason = result.regexMatches.length
                        ? `filtered by regex: ${result.regexMatches.join(', ')}`
                        : 'filtered by regex';
                } else {
                    comment.style.display = '';
                }
            }

            const commentId = comment.id || comment.dataset.commentid || comment.dataset.id;
            if (devMode && commentId && !loggedComments.has(commentId)) {
                logCommentInfo(comment, reason);
                loggedComments.add(commentId);
            }
        });

        initCounts();

        if (isDiscussion && devLogGroupOpen) {
            console.groupEnd();
            devLogGroupOpen = false;
        }
    }

    function filterOP(showAll = devMode, showBlocked = false) {
        const opWrapper = document.querySelector('.forum_op');
        const blockedHiddenPost = document.querySelector('.forum_op [id^="forum_op_hidden_"]');
        const blockedHiddenPostToggle = document.querySelector('.forum_op [id^="forum_op_showhidden_"]');
        const blockedHiddenPostUnhide = document.querySelector('.forum_op .commentthread_show_deleted_link');

        if (blockedHiddenPostUnhide && blockedHiddenPost && blockedHiddenPostToggle) {
            const isBlockedOP = getComputedStyle(blockedHiddenPostToggle).display !== 'none';

            blockedHiddenPostUnhide.addEventListener('click', () => {
                opWrapper.classList.add('blocked-user-OP');
            });

            if (isBlockedOP) {
                if (showAll || showBlocked) {
                    blockedHiddenPostUnhide.click(); // Simulate Steam's "Show"
                    opWrapper.classList.add('blocked-user-OP');
                }
            } else {
                if (!(showAll || showBlocked)) {
                    blockedHiddenPost.style.setProperty('display', 'none', 'important');
                    blockedHiddenPostToggle.style.removeProperty('display');
                    opWrapper.classList.remove('blocked-user-OP');
                }
            }
        }
    }

    function addNickname(menu) {
        if (!menu || menu.querySelector(".nickname")) return;

        const blockBtn = menu.querySelector("a[href*='Forum_BlockUser']");
        if (!blockBtn) return;

        const blockHref = blockBtn.getAttribute("href");
        const match = blockHref.match(/'(\d+)'/);
        if (!match) return;

        const userId = match[1];

        const nicknameTooltip = document.createElement("a");
        nicknameTooltip.className = "forum_comment_action nickname tooltip";
        nicknameTooltip.href = `https://steamcommunity.com/profiles/${userId}/#addnickname`;
        nicknameTooltip.target = "_blank";
        nicknameTooltip.innerHTML = `
        <img class="nickname-icon" src="https://community.fastly.steamstatic.com/public/images/skin_1/notification_icon_edit_bright.png">
        Add Nickname
        `;

        if (blockBtn) {
            blockBtn.insertAdjacentElement("afterend", nicknameTooltip);
        } else {
            menu.appendChild(nicknameTooltip);
        }
    }



    function getDebugResult({
        raw,
        normalized,
        isTrade,
        score,
        confidence,
        scoreByKey: breakdown,
        matchedByKey,
        fuzzyMatchByKey,
        regexLanguageMatch,
        regexSpamMatch,
        regexTradeMatch,
        keywordMatches,
        skipFuzzy,
        useCS2SpecificRegexGlobally
    }) {
        const isRegexMatch = regexLanguageMatch || regexSpamMatch || regexTradeMatch;
        const debugInfo = {
            raw,
            normalized,
            isTrade,
            score,
            confidence,
            scoreByKey: breakdown,
            matchedByKey,
            fuzzyMatchByKey,
            isRegexMatch,
            regexLanguageMatch,
            regexSpamMatch,
            regexTradeMatch,
            isKeywordMatch: keywordMatches?.length > 0,
            keywordMatches,
            useCS2SpecificRegexGlobally
        };

        const cacheKey = normalized;

        if (skipFuzzy) {
            pendingDevLogs.set(cacheKey, debugInfo);
        } else {
            logTopicInfo(debugInfo);
            pendingDevLogs.delete(cacheKey);
        }

        return debugInfo;
    }

    function buildTopicLabel({
        raw,
        isKeywordMatch,
        regexLanguageMatch,
        regexSpamMatch,
        regexTradeMatch,
        isTrade,
        hasFuzzyMatches,
        isTradeFilteringEnabled,
    }) {

        let label = `"${raw}"`;
        const coreTags = [];

        const isRegexMatch = regexLanguageMatch || regexSpamMatch || regexTradeMatch;

        if (isKeywordMatch) coreTags.push('Keyword');
        if (isRegexMatch) coreTags.push('Regex');
        if (isTrade) coreTags.push('Trade');

        const styleArgs = [];

        if (coreTags.length) {
            label += ` %c[%c${coreTags.join('+')}%c]%c`;
        }
        if (hasFuzzyMatches) {
            label += ` %c[%cF%cu%cz%cz%cy%c]%c`;
        }

        let groupStyleMain = logStyles.label;

        if (isTradeFilteringEnabled) {
            if (isTrade && isRegexMatch) {
                groupStyleMain = logStyles.regextrade;
            } else if (isTrade) {
                groupStyleMain = logStyles.trade;
            } else if (isRegexMatch) {
                groupStyleMain = logStyles.regex;
            } else if (isKeywordMatch) {
                groupStyleMain = logStyles.keyword;
            }
        } else {
            if ((regexLanguageMatch || regexSpamMatch) && !regexTradeMatch) {
                groupStyleMain = logStyles.regex;
            } else if (isKeywordMatch) {
                groupStyleMain = logStyles.keyword;
            }
        }

        styleArgs.push(groupStyleMain);

        if (coreTags.length) {
            styleArgs.push(
                groupStyleMain, // [
                groupStyleMain, // content
                groupStyleMain, // ]
                groupStyleMain
            );
        }

        if (hasFuzzyMatches) {
            styleArgs.push(
                'color: #ff0000;', // [
                'color: #ff1a00;', // F
                'color: #ff5500;', // u
                'color: #ff8800;', // z
                'color: #ffaa00;', // z
                'color: #ffcc00;', // y
                'color: #ffee00;', // ]
                logStyles.label
            );
        }

        return { label, styleArgs };
    }

    function getTopicDetailLines({ keywordMatches, raw, matchedByKey, fuzzyMatchByKey, scoreByKey, enableTradeRelatedFiltering, patternWeights, useCS2SpecificRegexGlobally }) {
        const lines = [];

        lines.push(...logKeywordMatches(keywordMatches));
        lines.push(...logRegexMatches(raw, enableTradeRelatedFiltering));
        lines.push(...logTradeMatches(matchedByKey, scoreByKey, patternWeights, useCS2SpecificRegexGlobally));
        lines.push(...logFuzzyTradeMatches(fuzzyMatchByKey, scoreByKey, patternWeights, useCS2SpecificRegexGlobally));

        return lines;
    }

    function getFilteringWarnings({ isTrade, regexTradeMatch, isTradeFilteringEnabled }) {
        const warnings = [];

        if (!isTradeFilteringEnabled && (regexTradeMatch || isTrade)) {
            const combinedText = `%c[info] Trade match detected but filtering skipped (enableTradeRelatedFiltering = false)`;
            warnings.push({
                text: combinedText,
                styles: [logStyles.info]
            });
        }

        return warnings;
    }

    function getDisabledRegexWarnings(patternWeights, useCS2SpecificRegexGlobally) {
        const warnings = [];

        const cs2Keys = ['weapons', 'finishes', 'wear', 'float', 'stattrak'];

        for (const key of cs2Keys) {
            const weight = patternWeights?.[key] ?? 0;

            if (weight === 0 && !useCS2SpecificRegexGlobally) {
                warnings.push({
                    key,
                    note: ` [CS2-specific scoring disabled (enableCS2SpecificRegexGlobally = false)]`
                });
            }
        }

        return warnings;
    }

    function logKeywordMatches(keywordMatches) {
        const lines = [];
        if (keywordMatches?.length) {
            lines.push(renderMatchLine('keyword', keywordMatches, false, 0, logStyles.keyword));
        }

        return lines;
    }

    function logRegexMatches(raw) {
        const lines = [];

        for (const [description, pattern] of regexLanguage) {
            const match = raw.match(pattern);
            if (match) {
                const isOnlySmileys = match.every(token =>
                    [...token].every(char => smileyCharSet.has(char))
                );
                if (!isOnlySmileys) {
                    lines.push(renderMatchLine('language', [`${match[0]} // ${description}`], false, 0, logStyles.regex));
                    break;
                }
            }
        }

        for (const [description, pattern] of regexSpam) {
            const match = raw.match(pattern);
            if (match) {
                lines.push(renderMatchLine('spam', [`${match[0]} // ${description}`], false, 0, logStyles.regex));
                break;
            }
        }

        for (const [description, pattern] of regexTrade) {
            const match = raw.match(pattern);
            if (match) {
                lines.push(renderMatchLine('trade', [`${match[0]} // ${description}`], false, 0, logStyles.regex));
                break;
            }
        }

        return lines;
    }

    function logTradeMatches(matchedByKey, scoreByKey, patternWeights, useCS2SpecificRegexGlobally) {
        const tradeKeys = ['intent', 'intentlight', 'finishes', 'weapons', 'wear', 'float', 'stattrak', 'negatives'];
        const lines = [];

        const disabledNotes = getDisabledRegexWarnings(patternWeights, useCS2SpecificRegexGlobally);

        for (const key of tradeKeys) {
            const matches = matchedByKey[key] || [];
            if (matches.length === 0) continue;

            const weight = scoreByKey[key]?.groupScore;
            const isNegative = (key === 'negatives');
            const note = disabledNotes.find(w => w.key === key)?.note || '';
            const forceWeightDisplay = cs2Keys.includes(key);

            lines.push(renderMatchLine(key, matches, isNegative, weight, null, note, forceWeightDisplay));
        }

        return lines;
    }

    function logFuzzyTradeMatches(fuzzyMatchByKey, scoreByKey, patternWeights, useCS2SpecificRegexGlobally) {
        const lines = [];

        const disabledNotes = getDisabledRegexWarnings(patternWeights, useCS2SpecificRegexGlobally);

        if (fuzzyMatchByKey && typeof fuzzyMatchByKey === 'object') {
            for (const key of Object.keys(fuzzyMatchByKey)) {
                const fuzzyMatches = fuzzyMatchByKey[key] || [];
                if (!fuzzyMatches.length) continue;

                const groupScore = scoreByKey[key]?.groupScore;
                const isNegative = key === 'negatives';
                const note = disabledNotes.find(w => w.key === key)?.note || '';
                const forceWeightDisplay = cs2Keys.includes(key);

                lines.push(renderMatchLine(`${key} (fuzzy)`, fuzzyMatches, isNegative, groupScore, null, note, forceWeightDisplay));
            }
        }

        return lines;
    }

    function logTopicInfo(params) {
        const {
            raw,
            normalized,
            isTrade,
            regexLanguageMatch,
            regexSpamMatch,
            regexTradeMatch,
            matchedByKey = {},
            fuzzyMatchByKey = {},
            score = 0,
            scoreByKey = {},
            keywordMatches = [],
            confidence,
            useCS2SpecificRegexGlobally
        } = params;

        const isKeywordMatch = keywordMatches?.length > 0;
        const isRegexMatch = regexLanguageMatch || regexSpamMatch || regexTradeMatch;
        const hasFuzzyMatches = Object.values(fuzzyMatchByKey).some(arr => arr.length > 0);

        const { label, styleArgs } = buildTopicLabel({
            raw,
            isKeywordMatch,
            regexLanguageMatch,
            regexSpamMatch,
            regexTradeMatch,
            isTrade,
            hasFuzzyMatches,
            isTradeFilteringEnabled: hideTradeRelatedTopics
        });

        const lines = getTopicDetailLines({
            keywordMatches,
            raw,
            matchedByKey,
            fuzzyMatchByKey,
            scoreByKey,
            enableTradeRelatedFiltering: hideTradeRelatedTopics,
            useCS2SpecificRegexGlobally
        });

        const tradeKeys = ['intent', 'intentlight', 'finishes', 'weapons', 'wear', 'float', 'stattrak', 'negatives'];
        const hasTradeMatches = tradeKeys.some(
            key => (matchedByKey[key]?.length || 0) + (fuzzyMatchByKey[key]?.length || 0) > 0
        );

        if (hasTradeMatches) {
            const scoreColor = score >= 3 ? logStyles.trade : logStyles.default;
            const qualitativeColor = score >= 3 ? logStyles.trade : logStyles.default;
            lines.push({
                text: `%cTrade-related score: %c${score} %c- %c${confidence}`,
                styles: [logStyles.label, scoreColor, logStyles.label, qualitativeColor]
            });
        }

        console.groupCollapsed(`%c${label}`, ...styleArgs);
        logKeyValue("Normalized", `"${normalized}"`);

        logInfoRow([
            ["isKeyword", isKeywordMatch, isKeywordMatch && 'keyword'],
            ["isRegex", isRegexMatch, isRegexMatch && 'regex'],
            ["isTrade", isTrade, isTrade && 'trade']
        ]);

        const filteringWarnings = getFilteringWarnings({
            isTrade,
            regexTradeMatch,
            isTradeFilteringEnabled: hideTradeRelatedTopics
        });

        for (const warning of filteringWarnings) {
            console.log(warning.text, ...warning.styles);
        }

        for (const line of lines) {
            console.log(line.text, ...line.styles);
        }

        console.groupEnd();
    }



    function extractCommentMeta(commentElem, reason = '') {
        const number = commentElem.querySelector('.forum_comment_permlink a')?.textContent.trim() || '??';
        const authorBdi = commentElem.querySelector('.commentthread_author_link bdi');
        const baseName = authorBdi?.childNodes[0]?.textContent?.trim() || 'Unknown';
        const nickname = authorBdi?.querySelector('.nickname_name')?.textContent?.trim();
        const authorName = nickname ? `${baseName} (${nickname})` : baseName;

        const { quotes, comment } = extractCommentText(commentElem.querySelector('.commentthread_comment_text'));

        let extra = '';
        let extraStyle = logStyles.label;

        if (reason === 'comment by blocked user') {
            extra = 'Blocked user';
            extraStyle = logStyles.blocked;

        } else if (reason === 'comment quoting blocked user') {
            extra = 'Quotes blocked user';
            extraStyle = logStyles.quoted;

        } else if (reason.startsWith('filtered by regex')) {
            const cleanedMatchText = reason.replace(/^filtered by regex:?\s*/, '');
            extra = `[Regex] ${cleanedMatchText}`;
            extraStyle = logStyles.regex;
        }

        const blockedIds = new Set(
            [...document.querySelectorAll('.commentthread_deleted_expanded[id^="comment_"]')]
                .map(el => el.id.replace('comment_', ''))
        );

        const quoteBlocks = quotes.map(({ header, body, quotedId }) => {
            const isBlocked = quotedId && blockedIds.has(quotedId);
            const quoteStyle = `${isBlocked ? logStyles.quoted : ''} font-style: italic; padding: 2px 6px; border-left: 3px solid #ccc; white-space: pre-wrap;`;
            const cleanedBody = body.replace(/\n{3,}/g, '\n\n');
            const text = header
                ? `> ${header}${header.endsWith(':') ? '' : ':'}\n${cleanedBody}`
                : `> ${cleanedBody}`;
            return { text, style: quoteStyle };
        });

        const formattedComment = comment.replace(/\n{3,}/g, '\n\n');
        const commentStyle = commentElem.classList.contains('blocked-user-comment') ||
            commentElem.classList.contains('filtered-regex-comment')
            ? `${extraStyle} white-space: pre-wrap;`
            : 'white-space: pre-wrap;';

        return {
            number,
            authorName,
            extra,
            extraStyle,
            quoteBlocks,
            comment: formattedComment,
            commentStyle
        };
    }

    function buildCommentLabel({ number, authorName, extra, extraStyle }) {
        const labelParts = [
            { text: number, style: extraStyle },
            { text: ' - ', style: logStyles.label },
            { text: authorName, style: extraStyle }
        ];

        if (extra) {
            labelParts.push({ text: ' - ', style: logStyles.label });
            labelParts.push({ text: extra, style: extraStyle });
        }

        return labelParts;
    }

    function extractCommentText(commentTextElem) {
        if (!commentTextElem) return { quotes: [], comment: '[No content]' };

        const clone = commentTextElem.cloneNode(true);
        const quotes = [];

        clone.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode('\n')));

        const blockquotes = Array.from(clone.querySelectorAll('blockquote')).reverse();

        for (const bq of blockquotes) {

            bq.querySelectorAll('br').forEach(br => br.replaceWith(document.createTextNode('\n')));

            const quoteAuthorDiv = bq.querySelector('.bb_quoteauthor');
            if (quoteAuthorDiv) {
                quoteAuthorDiv.appendChild(document.createTextNode('\n'));
            }

            const fullText = bq.textContent.replace(/\n{2,}/g, '\n').trim();

            const lines = fullText.split('\n');
            let header = '', body = '';

            if (lines[0]?.includes(':')) {
                header = lines[0].trim();
                body = lines.slice(1).join('\n').trim();
            } else {
                body = fullText;
            }

            const quotedIdMatch = bq.querySelector('a[href^="#c"]')?.getAttribute('href')?.match(/^#c(\d+)/);
            const quotedId = quotedIdMatch?.[1] || null;

            if (header || body) {
                quotes.push({ header, body, quotedId });
            }

            bq.remove();
        }


        const comment = clone.textContent.replace(/\n{2,}/g, '\n').trim();
        return { quotes, comment };
    }

    function logCommentInfo(commentElem, reason) {
        const meta = extractCommentMeta(commentElem, reason);
        const labelParts = buildCommentLabel(meta);
        openStyledGroup(labelParts);

        for (const { text, style } of meta.quoteBlocks) {
            logMultilineBlock(text, style);
        }

        logMultilineBlock(meta.comment, meta.commentStyle);

        console.groupEnd();
    }

    function renderMatchLine(label, matches = [], isNegative = false, weightSum = undefined, overrideStyle = null, note = '', forceWeightDisplay = false) {
        let baseStyle;

        if (overrideStyle) {
            baseStyle = overrideStyle;
        } else if (matches.length) {
            baseStyle = isNegative ? logStyles.default : logStyles.trade;
        } else {
            baseStyle = logStyles.default;
        }

        const matchText = matches.join(', ');

        let weightText = '';
        if (forceWeightDisplay || (typeof weightSum === 'number' && weightSum !== 0)) {
            const sign = isNegative ? '-' : '+';
            weightText = ` (${sign}${Math.abs(weightSum)})`;
        }

        const suffixNote = note ? ` %c${note}` : '';

        return {
            text: `%c${label}: %c${matchText}%c${weightText}${suffixNote}`,
            styles: [logStyles.label, baseStyle, baseStyle, ...(note ? [logStyles.info] : [])]
        };
    }

    function logKeyValue(label, value, labelStyle = logStyles.label, valueStyle = logStyles.default) {
        console.log(`%c${label}:%c ${value}`, labelStyle, valueStyle);
    }

    function logInfoRow(pairs) {
        const format = pairs.map(() => '%c%s:%c%s').join('   ');
        const args = pairs.flatMap(([label, value, highlightKey]) => [
            logStyles.label, label,
            highlightKey ? logStyles[highlightKey] : logStyles.default, String(value)
        ]);
        console.log(format, ...args);
    }

    function logMultilineBlock(text, style) {
        console.log(`%c${text}`, style);
    }

    function openStyledGroup(labelParts) {
        const format = labelParts.map(() => '%c%s').join(' ');
        const args = labelParts.flatMap(part => [part.style, part.text]);
        console.groupCollapsed(format, ...args);
    }

    function getForumLocationInfo() {
        let forumType = null;
        let subForum = null;
        let topicTitle = null;
        let pageNumber = 1;

        const isMiniDiscussionList = !!document.querySelector('.rightSectionTopTitle');

        if (!isMiniDiscussionList && (isGeneralForum || isTopicsContainer)) {
            const breadcrumbs = document.querySelector('.group_breadcrumbs.discussions_breadcrumbs');
            const appNameDiv = document.querySelector('.apphub_AppName');

            if (breadcrumbs) {
                const selectedSubForum = document.querySelector('.rightbox_list_option.selected .forum_list_name a');
                if (selectedSubForum) {
                    forumType = "Steam Forums";
                    subForum = selectedSubForum.textContent.trim();
                }
            } else if (appNameDiv) {
                forumType = appNameDiv.textContent.trim();

                const selectedGameSubForum = document.querySelector('.rightbox_list_option.selected .forum_list_name a.whiteLink');
                if (selectedGameSubForum) {
                    subForum = selectedGameSubForum.textContent.trim();
                }
            }
        }

        if (isDiscussion || isCommentsContainer || isMiniDiscussionList) {
            const breadcrumbsD =
                document.querySelector('.forum_breadcrumbs.group_content_bodytext.breadcrumbs') ||
                document.querySelector('.group_breadcrumbs.discussions_breadcrumbs');

            if (breadcrumbsD) {
                const links = breadcrumbsD.querySelectorAll('a');
                if (links.length <= 2) {
                    forumType = links[0].textContent.trim();
                    subForum = links[1].textContent.trim();
                }
                if (links.length >= 3) {
                    forumType = links[1].textContent.trim();
                    subForum = links[2].textContent.trim();
                }
            }

            const topicTitleDiv = document.querySelector('.topic');
            if (topicTitleDiv) {
                topicTitle = topicTitleDiv.textContent.trim();
            }
        }

        const activePage =
            document.querySelector('.forum_paging_pagelink.active') ||
            document.querySelector('.commentthread_pagelink.active');

        if (activePage) {
            pageNumber = parseInt(activePage.textContent.trim(), 10);
        }

        const locationInfo = [forumType, subForum, topicTitle, `Page ${pageNumber}`]
            .filter(Boolean)
            .join(' - ') || 'Unknown Forum Location';

        return locationInfo;
    }

    function devLogGroupStart(locationInfo) {
        if (devMode && !loggedLocations.has(locationInfo)) {
            console.groupCollapsed(`%cDev Log @ [${locationInfo}]`, 'color: gray;');
            devLogGroupOpen = true;
            loggedLocations.add(locationInfo);
        }
    }

    function logScriptBanner() {
        const parts = [
            { text: 'Steamcommunity', style: 'color: white; background: black;' },
            { text: '-', style: 'color: gray; background: black;' },
            { text: 'Cleanup', style: 'color: #ff8fab; background: black;' },
            { text: ` v${SCRIPT_VERSION}`, style: 'color: white; background: black;' },
            { text: ' https://github.com/veehawt/Steamcommunity-Cleanup', style: '' }
        ];

        const text = parts.map(p => `%c${p.text}`).join('');
        const styles = parts.map(p => p.style);

        console.log(text, ...styles);
    }



    function countHiddenContent() {
        let blockedCount = 0;
        let blockedQuoteCount = 0;
        let filteredCount = 0;

        if (isGeneralForum) {
            const topics = document.querySelectorAll('.forum_topic');

            topics.forEach(topic => {
                if (topic.closest('.rightSectionTopTitle')) return;

                if (topic.classList.contains('blocked-user')) {
                    blockedCount++;
                }

                if (
                    topic.classList.contains('filtered-regex') ||
                    topic.classList.contains('filtered-trade-related') ||
                    topic.classList.contains('filtered-regex-trade-related')
                ) {
                    filteredCount++;
                }
            });
        }

        if (isDiscussion) {
            const comments = document.querySelectorAll('.commentthread_comment');

            comments.forEach(comment => {
                if (comment.classList.contains('blocked-user-comment')) {
                    blockedCount++;
                }

                if (comment.classList.contains('blocked-user-comment-quote')) {
                    blockedQuoteCount++;
                }

                if (comment.classList.contains('filtered-regex-comment')) {
                    filteredCount++;
                }
            });
        }

        return { blockedCount, blockedQuoteCount, filteredCount };
    }

    function createDisplayText(blockedCount, blockedQuoteCount, filteredCount) {
        const parts = [];
        if (blockedCount > 0) parts.push(`${blockedCount} from blocked users`);
        if (hideBlockedCommentQuote && blockedQuoteCount > 0) parts.push(`${blockedQuoteCount} quoting blocked users`);
        if (filteredCount > 0) parts.push(`${filteredCount} filtered`);
        return parts.join(', ');
    }

    function displayCount(blockedCount, blockedQuoteCount, filteredCount) {
        const pagingSummaries = document.querySelectorAll('.forum_paging_summary.ellipsis');

        pagingSummaries.forEach(pagingSummary => {
            let countDisplay = pagingSummary.querySelector('#count-display');
            const rawText = createDisplayText(blockedCount, blockedQuoteCount, filteredCount);
            const displayText = rawText ? ` (${rawText})` : '';

            if (countDisplay) {
                if (countDisplay.textContent !== displayText) {
                    countDisplay.textContent = displayText;
                }
            } else {
                const newCountDisplay = document.createElement('span');
                newCountDisplay.id = 'count-display';
                newCountDisplay.textContent = displayText;

                const pageEnd = pagingSummary.querySelector('[id$="pageend"], [id$="fpageend"]');
                if (pageEnd) {
                    pageEnd.insertAdjacentElement('afterend', newCountDisplay);
                }
            }
        });
    }


    const userLocale = navigator.language || 'en-US';

    function formatNumberWithLocale(number) {
        const formatter = new Intl.NumberFormat(userLocale);
        return formatter.format(number);
    }

    function setVisibleCount() {
        const pageStart = document.querySelector(
            'span[id^="forum_"][id$="_pagestart"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_pagestart"]'
        );
        const pageEnd = document.querySelector(
            'span[id^="forum_"][id$="_pageend"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_pageend"]'
        );
        const pageStartFooter = document.querySelector(
            'span[id^="forum_"][id$="_footerpagestart"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_fpagestart"]'
        );
        const pageEndFooter = document.querySelector(
            'span[id^="forum_"][id$="_footerpageend"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_fpageend"]'
        );
        const summaryDivs = document.querySelectorAll(
            '.forum_paging_summary.ellipsis'
        );

        if (!pageStart || !pageEnd || !pageStartFooter || !pageEndFooter || !summaryDivs) return;

        const startIndex = getPageStartIndex(pageStart);
        const visibleCount = getVisibleCount();
        const endIndex = updatePageEnd(pageEnd, pageEndFooter, startIndex, visibleCount);

        updatePageStart(pageStart, pageStartFooter, endIndex !== 0, startIndex);
        updateDashSeparators(summaryDivs, endIndex !== 0);
        updateFooterVisibility()
    }

    function getVisibleCount() {
        if (isDiscussion) {
            return document.querySelectorAll('.commentthread_comment:not([style*="display: none"])').length;
        } else {
            return document.querySelectorAll('.forum_topic:not([style*="display: none"])').length;
        }
    }

    function getPageStartIndex(span) {
        const text = span.textContent.trim().replace(/[.,]/g, '');
        return parseInt(text, 10) || 1;
    }

    function updatePageStart(span, footerSpan, isVisible, startIndex) {
        const formatted = formatNumberWithLocale(startIndex);
        span.textContent = formatted;
        footerSpan.textContent = formatted;

        span.style.display = isVisible ? '' : 'none';
        footerSpan.style.display = isVisible ? '' : 'none';
    }

    function updatePageEnd(span, footerSpan, startIndex, visibleCount) {
        const endIndex = visibleCount > 0 ? startIndex + visibleCount - 1 : 0;
        currentEndIndex = endIndex;

        const formatted = formatNumberWithLocale(endIndex);

        span.textContent = formatted;
        footerSpan.textContent = formatted;

        return endIndex;
    }

    function updateDashSeparators(summaryDivs, shouldShowDash) {
        summaryDivs.forEach(summary => {
            const existingDash = summary.querySelector('.dash') ||
                [...summary.childNodes].find(
                    node => node.nodeType === 3 && node.nodeValue.trim() === '-'
                );

            if (shouldShowDash && !existingDash) {
                const dashSpan = document.createElement('span');
                dashSpan.textContent = '-';
                dashSpan.classList.add('dash');

                const endSpans = summary.querySelectorAll('span[id$="_pageend"], span[id$="_footerpageend"], span[id$="_fpageend"]');
                if (endSpans.length > 0) {
                    summary.insertBefore(dashSpan, endSpans[0]);
                }
            } else if (!shouldShowDash && existingDash) {
                existingDash.remove ? existingDash.remove() : summary.removeChild(existingDash);
            }
        });
    }



    function extendSections(sectionType) {
        let querySelector = `.forum_paging.forum_paging_${sectionType}`;

        if (sectionType === 'pagectn' || sectionType === 'fpagectn') {
            querySelector = `.forum_paging[id$='_${sectionType}']`;
        }

        const sections = Array.from(document.querySelectorAll(querySelector)).filter(section => {
            const isPageCtn = sectionType === 'pagectn' || sectionType === 'fpagectn';
            if (isPageCtn) {
                return section.id.endsWith(`_${sectionType}`);
            } else {
                return section.classList.contains(`forum_paging_${sectionType}`);
            }
        });

        sections.forEach((section) => {
            if (!section || window.getComputedStyle(section).display === 'none') return;

            section.classList.add(`forum_paging_${sectionType}`);

            const exSections = document.createElement('div');
            exSections.classList.add(`forum_paging_${sectionType}_extended`);

            if (sectionType === 'header' || sectionType === 'pagectn') {
                section.insertAdjacentElement('afterend', exSections);
                exSections.appendChild(buttonContainerHeader);
            } else if (sectionType === 'footer' || sectionType === 'fpagectn') {
                section.insertAdjacentElement('beforebegin', exSections);
                exSections.appendChild(buttonContainerFooter);
            }

            setPagingCtrls(exSections, sectionType);
        });
    }

    function updateFooterVisibility() {
        const footerTypes = ['footer', 'fpagectn'];

        footerTypes.forEach(type => {
            const section = document.querySelector(`.forum_paging_${type}`);
            const extended = document.querySelector(`.forum_paging_${type}_extended`);

            if (currentEndIndex === 0) {
                if (section) section.style.display = 'none';
                if (extended) extended.style.display = 'none';
            } else {
                if (section) section.style.display = '';
                if (extended) extended.style.display = '';
            }
        });
    }

    function setPagingCtrls(newElement, controlType) {
        let pagingControls;

        if (controlType === 'header' || controlType === 'pagectn') {
            pagingControls = document.querySelector(
                '[id^="forum_"][id$="_pagecontrols"], ' +
                '[id^="commentthread_ForumTopic_"][id$="_pagecontrols"]'
            );
        } else if (controlType === 'footer' || controlType === 'fpagectn') {
            pagingControls = document.querySelector(
                '[id^="forum_"][id$="_footerpagecontrols"], ' +
                '[id^="commentthread_ForumTopic_"][id$="_fpagecontrols"]'
            );
        }

        if (pagingControls && newElement) {
            pagingControls.style.marginLeft = 'auto';
            newElement.appendChild(pagingControls);
        }
    }

    function createButton(text, className, onClickHandler) {
        const button = document.createElement('button');
        button.innerText = text;
        button.className = className;
        button.addEventListener('click', onClickHandler);
        return button;
    }

    function createButtonContainer(buttons) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.style.display = 'inline-flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.alignItems = 'center';
        buttonContainer.style.maxWidth = 'fit-content';

        buttons.forEach(button => buttonContainer.appendChild(button));

        return buttonContainer;
    }

    function createButtonStateManager() {

        function applyFilters() {
            filterTopics(showAllHeader, showBlockedHeader);
            filterComments(showAllHeader, showBlockedHeader);
        }

        function toggleState(buttonType, stateType) {
            const isBlocked = !!stateType;

            const states = {
                all: {
                    header: { value: showAllHeader, btn: headerBtnAll },
                    footer: { value: showAllFooter, btn: footerBtnAll }
                },
                blocked: {
                    header: { value: showBlockedHeader, btn: headerBtnBlocked },
                    footer: { value: showBlockedFooter, btn: footerBtnBlocked }
                }
            };

            const targetKey = isBlocked ? 'blocked' : 'all';
            const oppositeKey = isBlocked ? 'all' : 'blocked';

            states[oppositeKey].header.value = false;
            states[oppositeKey].header.btn.classList.remove('active');
            states[oppositeKey].footer.value = false;
            states[oppositeKey].footer.btn.classList.remove('active');

            const toggledValue = !states[targetKey][buttonType].value;
            states[targetKey].header.value = toggledValue;
            states[targetKey].footer.value = toggledValue;

            states[targetKey].header.btn.classList.toggle('active', toggledValue);
            states[targetKey].footer.btn.classList.toggle('active', toggledValue);

            showAllHeader = states.all.header.value;
            showAllFooter = states.all.footer.value;
            showBlockedHeader = states.blocked.header.value;
            showBlockedFooter = states.blocked.footer.value;

            applyFilters();
            setVisibleCount();
        }

        return {
            toggleHeaderAll: () => toggleState('header', false),
            toggleHeaderBlocked: () => toggleState('header', true),
            toggleFooterAll: () => toggleState('footer', false),
            toggleFooterBlocked: () => toggleState('footer', true),
            getHeaderAll: () => showAllHeader,
            getHeaderBlocked: () => showBlockedHeader,
            getFooterAll: () => showAllFooter,
            getFooterBlocked: () => showBlockedFooter
        };
    }

    function initButtons() {
        headerBtnAll = createButton('All', 'header_all', buttonManager.toggleHeaderAll);
        headerBtnBlocked = createButton('Blocked', 'header_blocked', buttonManager.toggleHeaderBlocked);
        footerBtnAll = createButton('All', 'footer_all', buttonManager.toggleFooterAll);
        footerBtnBlocked = createButton('Blocked', 'footer_blocked', buttonManager.toggleFooterBlocked);

        buttonContainerHeader = createButtonContainer([headerBtnAll, headerBtnBlocked]);
        buttonContainerFooter = createButtonContainer([footerBtnAll, footerBtnBlocked]);
    }

    function initCounts() {
        const { blockedCount, blockedQuoteCount, filteredCount } = countHiddenContent();
        displayCount(blockedCount, blockedQuoteCount, filteredCount);
    }



    function createObserver({ target, config, onMutation }) {
        const observer = new MutationObserver(onMutation);
        observer.observe(target, config);
        return observer;
    }

    function runFilters() {
        const showAll = buttonManager.getHeaderAll();
        const showBlocked = buttonManager.getHeaderBlocked();
        filterTopics(showAll, showBlocked);
        filterComments(showAll, showBlocked);
    }

    const observedMenus = new WeakSet();

    function observeActionMenu() {
        document.querySelectorAll(".forum_comment_action_menu").forEach((menu) => {
            if (observedMenus.has(menu)) return;
            observedMenus.add(menu);

            createObserver({
                target: menu,
                config: { attributes: true, attributeFilter: ["style"] },
                onMutation: ([mutation]) => {
                    if (mutation.attributeName === "style" && menu.style.display !== "none") {
                        addNickname(menu);
                    }
                }
            });
        });
    }

    if (isProfileContainer) {
        createObserver({
            target: isProfileContainer,
            config: { childList: true, subtree: true },
            onMutation: (mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.classList?.contains("forum_comment_action_menu")) {
                            addNickname(node);
                        }
                    });
                });
            }
        });
    }

    if (isTopicsContainer) {
        createObserver({
            target: isTopicsContainer,
            config: { childList: true, subtree: true },
            onMutation: (mutations) => {
                let topicsChanged = false;

                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.classList?.contains("forum_topic")) topicsChanged = true;
                    });
                });

                if (topicsChanged) {
                    runFilters();
                    getForumLocationInfo();
                    setVisibleCount();
                }
            }
        });
    }

    if (isCommentsContainer) {
        createObserver({
            target: isCommentsContainer,
            config: { childList: true, subtree: true },
            onMutation: (mutations) => {
                let commentsChanged = false;

                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.classList?.contains("commentthread_comment") || node.classList?.contains("commentthread_deleted_expanded")) commentsChanged = true;
                        if (node.classList?.contains("forum_comment_action_menu")) addNickname(node);
                    });
                });

                if (commentsChanged) {
                    runFilters();
                    getForumLocationInfo();
                    setVisibleCount();
                }
            }
        });
    }

    createObserver({
        target: document.body,
        config: { childList: true, subtree: true },
        onMutation: observeActionMenu,
    });

    if (window.location.hash === "#addnickname" && typeof ShowNicknameModal === "function") {
        const nicknameElement = document.querySelector(".nickname");
        const existingNickname = nicknameElement ? nicknameElement.textContent.trim() : "";

        ShowNicknameModal(); // Already defined by Steam

        createObserver({
            target: document.body,
            config: { childList: true, subtree: true },
            onMutation: (_, observer) => {
                const nicknameInput = document.querySelector(".newmodal input[type='text']");
                if (nicknameInput) {
                    const match = existingNickname.match(/^\((.*)\)$/);
                    nicknameInput.value = match ? match[1] : existingNickname;
                    observer.disconnect();
                }
            }
        });
    }

    function init() {
        logScriptBanner();
        getForumLocationInfo();
        initButtons();
        extendSections('header');
        extendSections('footer');
        extendSections('pagectn');
        extendSections('fpagectn');
        filterTopics();
        filterComments();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', postInit);
        } else {
            postInit();
        }
    }

    function postInit() {
        initCounts();
        setVisibleCount();

        if (devMode) {
            showAllHeader = true;
            showAllFooter = true;
            showBlockedHeader = false;
            showBlockedFooter = false;

            headerBtnAll.classList.add('active');
            footerBtnAll.classList.add('active');
            headerBtnBlocked.classList.remove('active');
            footerBtnBlocked.classList.remove('active');
        }
    }

    init();
})();