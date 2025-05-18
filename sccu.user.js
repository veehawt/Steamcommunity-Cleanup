// ==UserScript==
// @name         Steamcommunity-Cleanup
// @namespace    https://github.com/veehawt/Steamcommunity-Cleanup
// @version      0.4.27
// @description  UserScript that enhances the Steam forums by filtering discussion topics and comments.
// @author       vee (https://github.com/veehawt | https://steamcommunity.com/profiles/76561197969754818)
// @supportURL   https://github.com/veehawt/Steamcommunity-Cleanup/issues
// @downloadURL  https://github.com/veehawt/Steamcommunity-Cleanup/raw/master/sccu.user.js
// @updateURL    https://github.com/veehawt/Steamcommunity-Cleanup/raw/master/sccu.user.js
// @match        https://steamcommunity.com/*/*/discussions/*
// @match        https://steamcommunity.com/app/*/tradingforum/*
// @match        https://steamcommunity.com/app/*/eventcomments/*
// @match        https://steamcommunity.com/discussions/forum/*
// @match        https://steamcommunity.com/profiles/*
// @match        https://steamcommunity.com/id/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Keywords in topic titles to hide
    const keywords = [
        //"hack", // Add your keywords here
        //"cheat",
        //"devs",
        //"noob",
    ];

    // Regex language patterns in topic titles and topic comments to hide (disabled on trade forums)
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
        ["Turkish",                                                             /[ğşşçıİĞŞÇ]/],
        ["Turkish, German, Estonian, Finnish, Hungarian (shared diacritics)",   /[ÄäÖöÜü]/],
        ["Hungarian",                                                           /[ŐőŰű]/],
        ["Polish",                                                              /[Łł]/],
        ["Nordic (Danish, Finnish, Icelandic, Norwegian, Swedish)",             /[ÆæØøÅåÞþÐð]/],
    ];

    const regexSpam = [
        ["+rep for rep",          /\b[\+\-]?\s*rep\s*(for\s*[\+\-]?\s*rep|\bme\b)?\b/i],
        ["comment for comment",   /\bcomment\s+for\s+comment\b/i],
    ];

    // Regex trade patterns in topic titles to hide (disabled on trade forums)
    const regexTrade = [
        ["free giveaway",                            /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bg\s*i\s*v\s*e\s*a\s*w\s*a\s*y\b))[^\w\s]*\b/i],
        ["free points",                              /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bp\s*o+\s*i\s*n\s*t\s*s\b))[^\w\s]*\b/i],
        ["free skins",                               /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bs\s*k(?:i|\|)n\s*s\b))[^\w\s]*\b/i],
        ["free items",                               /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bi(?:t|\+)e\s*m(?:s|\$)\b))[^\w\s]*\b/i],
        ["free knife",                               /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bk\s*n\s*i\s*[vf]\s*e\s*s\b))[^\w\s]*\b/i],
        ["free gloves",                              /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bg\s*l\s*o\s*v\s*e\s*s\b))[^\w\s]*\b/i],
        ["free keyword combination",                 /\bfree\s+(?:cases?|giveaway|gloves?|items?|k(?:nife|nives|nifes)|points|skins?)\b/i],
        ["WTB/WTS/WTT disguised spacing",            /\b[^\w\s]*(?:w\s*t\s*b|w\s*t\s*s|w\s*t\s*t)[^\w\s]*\b/i],
        ["variations of 'offer' / 'offering'",       /\bo+f{2,}e+r{1,}i?n?g?s?\b/i],
        ["H/W (have/want) variants with brackets",   /\b[\[\(\{\<\-\*\_]?([hw])[\]\)\}\>\-\*\_]?(\b|(?=\W))/i],
        ["open inventory/trade",                     /\bopen (?:inventory|inv|trade)\b/i],
        ["currency-prefixed or -suffixed numbers",   /\b\d{1,3}(?:[.,]\d{1,3})?k[\s]?[€$£¥]?|[€$£¥][\s]?\d{1,3}(?:[.,]\d{1,3})?k\b|\b\d{1,6}[\s]?[€$£¥]|[€$£¥][\s]?\d{1,6}\b/i],
    ];


    // Refined Regex trade patterns in topic titles to hide (disabled on trade forums)
    const regexTradeIntent = new RegExp(String.raw`\b(
        |buy(ing)?|capsules?|cases?|check(?: my)? (?:inv+|inventory)|downgrades?|upgrades?|fast trade(s|z)?|fair\s+(trade(s|z)?|deal(s|z)?)|fast response|full loadout|giveaway|give me|have|want|in stock|
        |invent(ory)?|inv+|kato(wice)?|knife for knife|for trade|loadout|lf\b|looking for(?: trade)?|o+p+e+n+|open(?:[\s-]?(for\s?)?(24\/7|trade|inv+))|
        |personal trader|rare|send trade|someone trade me|stickers?|store|swap|t[r4]+[a@]+([i1]+)?[d+]+[e3]+[sr]?|trade(?:[-\s]?up)?|trading|
        |zero to knife|
      )\b`, 'gi');

    const regexWeapons = new RegExp(String.raw`\b(
        |(for[\s-]?)?kni(fe|ve)(s|z)?|bayonet|bowie|bfk|butterfly|flip|gut|huntsman|kara(mbit)?|kukri|m9|nomad|paracord|(shadow[\s-]?)?daggers?|skeleton|stiletto|survival|talon|ursus|
        |(for[\s-]?)?glove(s|z)?|blood[\s-]?hound|broken[\s-]?fang|driver|hand[\s-]?wraps?|hydra|moto|specialist|sport|
        |ak(?:[-\s]?47)?|aug|awp|famas|galil|g3sg1|m4|m4a1[-\s]?s|m4a4|a4|scar[-\s]?20|ssg|
        |bizon|mac[-\s]?10|mp7|mp9|ump|mag[-\s]?7|nova|negev|
        |cz75|deagle|desert eagle|dgl|five[-\s]?seven|glock|p2000|p250|tec[-\s]?9|usp[-\s]?s|agents?|
      )\b`, 'gi');

    const regexFinishes = new RegExp(String.raw`\b(
        |(play[\s-]?)?skins?|amber[\s-]?fade|amphibious|arboreal|arid|asiimov|autotronic|atomic[\s-]?alloy|badlands|big[\s-]?game|(?:black|blue|green|midnight|red)[\s-]?laminate|
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
        |tilted|transport|turtle|ultraviolet|unhinged|vaporwave|vice|vulcan|whiteout|wildfire|x[-\s]?ray|yellow[\s-]?banded|zebra[\s-]?stripe|ibuypower|
      )\b`, 'gi');

    const regexWear = /\b(factory new|fn|minimal wear|mw|field[-\s]?tested|ft|well[-\s]?worn|ww|battle[-\s]?scarred|bs|float)\b/gi;
    const regexFloat = /\b(?:0?\.\d{1,9}|1\.0{1,9})\b/g;
    const regexStatTrak = /\b(stat[\s\-]?trak|stat[\s\-]?track)\b/gi;

    const regexTradeNegatives = new RegExp(String.raw`\b(
        |(1|2|3|4|5)[\s-]?v(?:s\.?|s)?[\s-]?(1|2|3|4|5)|abilit(y|ies)|access|add(ition)?|animation|aren'? ?t|isn'? ?t|weren'? ?t|wasn'? ?t|won'? ?t|wouldn'? ?t|couldn'? ?t|shouldn'? ?t|didn'? ?t|doesn'? ?t|don'? ?t|can'? ?t|hasn'? ?t|hadn'? ?t|mustn'? ?t|
        |authentic(at(ed|es|ing|ions?|ors?))?|back|badges?|ban(ned|ning|s)?|because|(been|has) limited|best|black screen|(bring|brought) back|broken(?![\s-]?fang)|bugs?|builds?|can I|can you|cannot|casuals?|chang(e|es|ing)|clans?|clients?|confirm(ed|ing|s)?|crash(ed|es)?|created|crosshairs?|deleted?|desktop|disappear(ed|ing|s)?|discussions?|dlcs?|do(es)? (I|you)?|drop(ping|s)?|
        |duo|trio|quad|error|extend(?:ed|s|ion|ions)?|fail(ing|s)?|fix(ed|es)?|for \d+ days|forums?|fps|friends?|gam(es|ing)|game store|glitch(ed|es|ing)?|groups?|hard[\s-]?stuck|help|hid(e|ing)|histor(y|ies)|hold(ings?|s)?|hop(e|ing)|how (can|do)?|(I )?opened|icons?|idea|install(ed|ing|s)?|is (it|there)|issues?|lags?|let (me|us)|(?:re)?load(?:ing)?|lost|
        |made|match(es|ing)?|matchmaking|mm|menus?|miss(ed|es|ing)?|multiplayer|name|network(ing|s)?|no trad(e|es|ing)|not (available|work(ing)?)?|opinions?|option(al|s)?|or not|
        |patch(es|ing)?|people|permission|phones?|players?|possibl(e|y)|practice|premiere?|prices?|privacy|problems?|profiles?|questions?|receiv(e|ed|ing)|recruiting|remove(d|s)?|reset(s|ted|ting)?|resolv(e|es|ing)|revamps?|rules|scam(?:s|med)?|stolen|scrim(?:s|z)?|scrimmages?|
        |should|some(body|how|one|what)|suggestions?|team(?:mate|mates|m8s)?|mates?|m8s?|rant(ing)?|restrict(ed|ing|ions?|s)?|rework(ed|ing|s)?|should I|sort(ing|s)?|specific|steam(?:[\s-]?(guard|vr))?|
        |servers?|sold|stop|store page|strats?|stuck|tactics?|thoughts?|to play\s+.+?(?:\s+with)?|training|tutorials?|unauthorized|unbans?|uninstall(ed|ing|s)?|updates?|unexpected|us(e|es|ers|ing)|valve|version(ing|s)?|visual(ly|s)?|wait(ing)? time|warnings?|we|
        |what|when|where|which|who|why|
        |wingman|wish(ed|s)?|wishlist(ed|ing|s)?|work(ing)?|worst|would you|\?|
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
        label: 'color: #888; font-weight: bold;',
        default: 'color: #54a5d4;',
        keyword: 'color: #d3a588;',
        regex: 'color: #765574;',
        trade: 'color: #2ca58d;',
    };


    const SCRIPT_VERSION = '0.4.27';
    const devMode = false;
    const tradeCheckCache = new Map();

    const isTradingForum = window.location.href.includes('/tradingforum/');
    const isTopicsContainer = document.querySelector('.forum_topics_container');
    const isCommentsContainer = document.querySelector('.commentthread_comment_container');
    const isGeneralForum = !!isTopicsContainer;
    const isDiscussion = !!isCommentsContainer;


    let regexFiltersTopics;
    if (isTradingForum && !devMode) {
        regexFiltersTopics = [regexSpam];
    } else {
        regexFiltersTopics = [...regexLanguage, ...regexSpam, ...regexTrade];
    }

    let regexFiltersComments;
    if (isTradingForum) {
        regexFiltersComments = [...regexSpam];
    } else {
        regexFiltersComments = [...regexLanguage, ...regexSpam];
    }

    const regexTradeTests = {
        negatives: regexTradeNegatives,
        intent: regexTradeIntent,
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

    const patternWeights = {
        intent: 4,
        weapons: 2,
        finishes: 2,
        wear: 3,
        float: 3,
        stattrak: 2,
        negatives: -3
    };



    function normalizeContent(content) {
        return content
            .toLowerCase()
            .normalize("NFKD") // strip accents and diacritics
            .replace(/[^\p{ASCII}]/gu, ' ') // replace all non-ASCII characters (emojis, special symbols, etc.)
            .replace(/[^\p{L}\p{N}\s\-\.?]/gu, ' ') // replace everything but letters, numbers, spaces, hypens, periods and question marks
            .replace(/\s+/g, ' ') // collapse whitespaces
            .trim()
    }

    function damerauLevenshtein(a, b) {
        const da = [];
        const m = a.length;
        const n = b.length;

        for (let i = 0; i <= m; i++) {
            da[i] = [i];
        }

        for (let j = 0; j <= n; j++) {
            da[0][j] = j;
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
        const regexTerms = new Set();

        const groupMatches = source.match(/\(([^()]+)\)/g) || [];
        for (const group of groupMatches) {
            const terms = group
            .slice(1, -1)
            .split('|')
            .map(s => s.replace(/\\s/g, ' ').replace(/[-\s]?\?/g, ' ').replace(/[-\s]?/g, ' ').trim())
            .map(s => s.replace(/\s+/g, ' '));

            for (const term of terms) {
                if (term.length >= 3) {
                    regexTerms.add(term);
                }
            }
        }

        const baseWords = source.match(/[a-zA-Z0-9@\$]+/g) || [];
        for (let word of baseWords) {
            if (word.length >= 3 && !/^\d+$/.test(word)) {
                regexTerms.add(word);
            }
        }

        return [...regexTerms].map(text => ({
            text,
            isSingleToken: !text.includes(' ')
        }));
    }

    function isFuzzyMatch(word, regexTerm) {
        if (word === regexTerm) return false;

        const distance = damerauLevenshtein(word, regexTerm);
        let maxAllowed = 0

        if (regexTerm.length > 6) {
            maxAllowed = 2;
        } else if (regexTerm.length > 4) {
            maxAllowed = 1;
        }

        return distance <= maxAllowed;
    }

    function getFuzzyMatchesForKey(tokens, regexTermList, allExactMatches) {
        const fuzzyMatches = [];
        const usedFuzzyTokens = new Set();

        for (const { text: regexTerm } of regexTermList) {
            const windowSize = regexTerm.split(/\s+/).length;
            if (regexTerm.length <= 3) continue;

            for (let i = 0; i <= tokens.length - windowSize; i++) {
                const phrase = tokens.slice(i, i + windowSize).join(' ');

                if (
                    isFuzzyMatch(phrase, regexTerm) &&
                    !allExactMatches.has(phrase) &&
                    !usedFuzzyTokens.has(phrase)
                ) {
                    fuzzyMatches.push(phrase);
                    usedFuzzyTokens.add(phrase);
                }
            }
        }

        return fuzzyMatches;
    }

    function applyFuzzyEnhancement(showAll) {
        const topics = document.querySelectorAll('.forum_topic');

        topics.forEach(topic => {
            if (topic.closest('.rightSectionTopTitle')) return;
            if (topic.classList.contains('blocked-user')) return;

            const topicName = topic.querySelector('.forum_topic_name');
            if (!topicName) return;

            const text = topicName.textContent.trim();

            const { isMatch: isKeywordMatch, keywordMatches } = isKeywords(text, keywords);
            const { isMatch: isRegexMatch } = isRegex(text, regexFiltersTopics);

            const tradeResult = isTradeRelated(text, topic, isRegexMatch, keywordMatches, false);
            const isTrade = typeof tradeResult === 'object' ? tradeResult.isTrade : tradeResult;

            topic.dataset.tradeMatch = isTrade;
            topic.dataset.regexMatch = isRegexMatch;

            applyTopicClasses(topic, isKeywordMatch, isRegexMatch, isTrade, showAll);
        });

        if (devMode) {
            console.groupEnd();
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
        const regexMatches = regexList
        .map(entry => {
            const regex = Array.isArray(entry) ? entry[1] : entry;
            return regex instanceof RegExp && regex.test(text) ? regex.toString() : null;
        })
        .filter(Boolean);

        return {
            isMatch: regexMatches.length > 0,
            regexMatches
        };
    }

    function isTradeRelated(content, topic = null, precomputedRegexMatch = false, keywordMatches = [], skipFuzzy = false) {
        if (isTradingForum && !devMode) return false;

        const cacheKey = `${content}::${skipFuzzy ? 'nofuzzy' : 'full'}`;
        if (tradeCheckCache.has(cacheKey)) {
            return tradeCheckCache.get(cacheKey);
        }

        const raw = content.toLowerCase();
        const normalized = normalizeContent(content);

        const {
            score,
            breakdown,
            matchedByKey,
            fuzzyMatchByKey,
        } = getTradeConfidenceScore(normalized, skipFuzzy);

        const isTrade = score >= 3;
        const confidence = getConfidenceLevel(score);
        const isRegexMatch = precomputedRegexMatch;

        let result;
        if (devMode) {
            result = getDebugResult({
                raw,
                normalized,
                isTrade,
                score,
                confidence,
                scoreByKey: breakdown,
                matchedByKey,
                fuzzyMatchByKey,
                isRegexMatch,
                keywordMatches,
                topic,
                skipFuzzy
            });
        } else {
            result = isTrade;
        }

        tradeCheckCache.set(cacheKey, result);
        return result;
    }


    function getTradeConfidenceScore(normalized, skipFuzzy = false) {
        const scoreBreakdown = {};
        const matchedByKey = {};
        const fuzzyMatchByKey = {};

        const tokens = normalized.split(/\s+/);
        const allExactMatches = new Set();
        let totalScore = 0;

        for (const [key, regex] of Object.entries(regexTradeTests)) {
            let matches = [...normalized.matchAll(regex)].map(m => m[0]);
            matchedByKey[key] = matches;
            matches.forEach(m => allExactMatches.add(m));

            if (key === 'float') {
                matches = matches.filter((match) => {
                    const idx = normalized.indexOf(match);
                    const before = normalized.slice(Math.max(0, idx - 3), idx);
                    const after = normalized.slice(idx + match.length, idx + match.length + 3);
                    return !/[\d]\.[\d]/.test(before + match + after);
                });
                matchedByKey[key] = matches;
            }

            let exactCount = matches.length;
            let fuzzyCount = 0;
            let fuzzyMatches = [];

            const allowFuzzy = !skipFuzzy && fuzzyRegexTermsByKey[key] && exactCount === 0;
            if (allowFuzzy) {
                fuzzyMatches = getFuzzyMatchesForKey(tokens, fuzzyRegexTermsByKey[key], allExactMatches, key);
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
                for (let i = 0; i < exactCount + fuzzyCount; i++) {
                    groupScore -= Math.max(0, 3 - i);
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


    function isBlockedTopic(topic) {
        const title = topic.querySelector('.forum_topic_name.op_hidden');
        if (!title) return false;

        const label = title.querySelector('.forum_topic_label');
        if (!label) return false;

        const allowedLabels = ['pinned', 'announcement', 'sticky'];
        const labelText = label.textContent.trim().toLowerCase();

        return !allowedLabels.some(allowed => labelText.includes(allowed));
    }

    function isBlockedComment(comment) {
        return comment.classList.contains('commentthread_deleted_expanded');
    }

    function isFilteredComment(comment) {
        if (isBlockedComment(comment)) return false;

        const commentText = comment.querySelector('.commentthread_comment_text');
        if (!commentText) return false;

        const textClone = commentText.cloneNode(true);
        textClone.querySelectorAll('blockquote').forEach(bq => bq.remove());
        const cleanedText = textClone.textContent.trim();

        if (!cleanedText) return false;

        const { isMatch, regexMatches } = isRegex(cleanedText, regexFiltersComments);

        if (isMatch) {
            console.log('%cFiltered comment matched:', 'color:red;font-weight:bold;', cleanedText);
            console.log('Matched by regex:', regexMatches);
            return true;
        }

        return false;
    }



    function applyTopicClasses(topic, keywordMatch, regexMatch, tradeMatch, showAll) {
        topic.classList.remove(
            'filtered-keywords',
            'filtered-regex',
            'filtered-trade-related',
            'filtered-regex-trade-related'
        );

        const isFiltered = keywordMatch || regexMatch || tradeMatch;


        if (devMode) {
            if (regexMatch && tradeMatch) {
                topic.classList.add('filtered-regex-trade-related');
            } else if (regexMatch) {
                topic.classList.add('filtered-regex');
            } else if (tradeMatch) {
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
        if (devMode) {
            const locationInfo = getForumLocationInfo();
            console.groupCollapsed(`%cDev Log @ [${locationInfo}]`, 'color: gray;');
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

            const topicName = topic.querySelector('.forum_topic_name');
            if (!topicName) return;

            const text = topicName.textContent.trim();

            const { isMatch: isKeywordMatch, keywordMatches } = isKeywords(text, keywords);
            const { isMatch: isRegexMatch } = isRegex(text, regexFiltersTopics);

            const tradeResult = isTradeRelated(text, topic, isRegexMatch, keywordMatches, true);
            const isTrade = typeof tradeResult === 'object' ? tradeResult.isTrade : tradeResult;

            topic.dataset.tradeMatch = isTrade;
            topic.dataset.regexMatch = isRegexMatch;

            applyTopicClasses(topic, isKeywordMatch, isRegexMatch, isTrade, showAll);
        });

        initCounts();

        setTimeout(() => applyFuzzyEnhancement(showAll, showBlocked), 50);
    }

    function filterComments(showAll = devMode, showBlocked = false) {
        filterOP(showAll, showBlocked);

        const comments = document.querySelectorAll('.commentthread_comment');

        comments.forEach(comment => {
            const container = comment.closest('.commentthread_comment_container');
            if (container && container.id.startsWith('commentthread_Profile_')) {
                return;
            }

            if (comment.classList.contains('commentthread_deleted_comment')) {
                comment.remove();
                return;
            }

            comment.classList.remove('blocked-user-comment', 'filtered-regex-comment');

            if (isBlockedComment(comment)) {
                comment.classList.add('blocked-user-comment');
                comment.style.display = (showAll || showBlocked) ? '' : 'none';
                return;
            }

            if (isFilteredComment(comment)) {
                comment.classList.add('filtered-regex-comment');
                comment.style.display = (showAll) ? '' : 'none';
                return;
            }

            comment.style.display = '';
        });

        initCounts();
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
        nicknameTooltip.href = `https://steamcommunity.com/profiles/${userId}#addnickname`;
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
        isRegexMatch,
        keywordMatches,
        skipFuzzy
    }) {
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
            isKeywordMatch: keywordMatches?.length > 0,
            keywordMatches,
        };

        const cacheKey = normalized;

        if (skipFuzzy) {
            pendingDevLogs.set(cacheKey, debugInfo);
        } else {
            logDevInfo(debugInfo);
            pendingDevLogs.delete(cacheKey);
        }

        return debugInfo;
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
                lines.push(renderMatchLine('language', [`${match[0]} // ${description}`], false, 0, logStyles.regex));
                break;
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

    function logTradeMatches(matchedByKey, scoreByKey) {
        const tradeKeys = ['intent', 'finishes', 'weapons', 'wear', 'float', 'stattrak', 'negatives'];
        const lines = [];

        for (const key of tradeKeys) {
            const matches = matchedByKey[key] || [];
            const weight = scoreByKey[key]?.groupScore ?? 0;
            const isNegative = key === 'negatives';
            if (matches.length) {
                lines.push(renderMatchLine(key, matches, isNegative, weight));
            }
        }

        return lines;
    }

    function logFuzzyTradeMatches(fuzzyMatchByKey, scoreByKey) {
        const lines = [];

        if (fuzzyMatchByKey && typeof fuzzyMatchByKey === 'object') {
            for (const key of Object.keys(fuzzyMatchByKey)) {
                const fuzzyMatches = fuzzyMatchByKey[key] || [];
                const weight = scoreByKey[key]?.groupScore ?? 0;
                if (fuzzyMatches.length) {
                    lines.push(renderMatchLine(`${key} (fuzzy)`, fuzzyMatches, key === 'negatives', weight));
                }
            }
        }

        return lines;
    }

    function getForumLocationInfo() {
        let forumType = null;
        let subForum = null;
        let pageNumber = 1;

        const breadcrumbs = document.querySelector('.group_breadcrumbs.discussions_breadcrumbs');
        const appNameDiv = document.querySelector('.apphub_AppName');

        if (breadcrumbs) {
            forumType = "Steam Forums";

            const selectedSubForum = document.querySelector('.rightbox_list_option.selected .forum_list_name a');
            if (selectedSubForum) {
                subForum = selectedSubForum.textContent.trim();
            }

        } else if (appNameDiv) {
            forumType = appNameDiv.textContent.trim();

            const selectedGameSubForum = document.querySelector('.rightbox_list_option.selected .forum_list_name a.whiteLink');
            if (selectedGameSubForum) {
                subForum = selectedGameSubForum.textContent.trim();
            }
        }

        const activePage = document.querySelector('.forum_paging_pagelink.active');
        if (activePage) {
            pageNumber = parseInt(activePage.textContent.trim(), 10);
        }

        const locationInfo = [forumType, subForum, `Page ${pageNumber}`]
        .filter(Boolean)
        .join(' - ') || 'Unknown Forum Location';

        return locationInfo;
    }

    function renderMatchLine(label, matches = [], isNegative = false, weightSum = 0, overrideStyle = null) {
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
        if (weightSum) {
            let weightDisplay;
            if (isNegative) {
                weightDisplay = `(-${Math.abs(weightSum)})`;
            } else {
                weightDisplay = `(+${weightSum})`;
            }
            weightText = ` %c${weightDisplay}`;
        }

        return {
            text: `%c${label}: %c${matchText}${weightText}`,
            styles: [logStyles.label, baseStyle, ...(weightText ? [baseStyle] : [])]
        };
    }

    function logDevInfo({
        raw,
        normalized,
        isTrade,
        isRegexMatch,
        matchedByKey = {},
        fuzzyMatchByKey = {},
        score = 0,
        scoreByKey = {},
        keywordMatches = [],
        confidence
    }) {
        const isKeywordMatch = keywordMatches?.length > 0;

        const lines = [];

        lines.push(...logKeywordMatches(keywordMatches));
        lines.push(...logRegexMatches(raw));
        lines.push(...logTradeMatches(matchedByKey, scoreByKey));
        lines.push(...logFuzzyTradeMatches(fuzzyMatchByKey, scoreByKey));

        const tradeKeys = ['intent', 'finishes', 'weapons', 'wear', 'float', 'stattrak', 'negatives'];
        const hasTradeMatches = tradeKeys.some(key =>
                                               (matchedByKey[key]?.length || 0) + (fuzzyMatchByKey[key]?.length || 0) > 0
                                              );

        if (hasTradeMatches) {
            const scoreColor = score >= 3 ? logStyles.trade : logStyles.default;
            const qualitativeColor = score >= 3 ? logStyles.trade : logStyles.default;
            lines.push({
                text: `%cTrade-related score: %c${score} %c- %c${confidence}`,
                styles: [logStyles.label, scoreColor, logStyles.label, qualitativeColor]
            });
        }

        let label = `"${raw}"`;
        const coreTags = [];

        if (isKeywordMatch) coreTags.push('Keyword');
        if (isRegexMatch) coreTags.push('Regex');
        if (isTrade) coreTags.push('Trade');

        const hasFuzzyMatches = Object.values(fuzzyMatchByKey || {}).some(arr => arr.length > 0);

        if (coreTags.length) {
            label += ` %c[%c${coreTags.join('+')}%c]%c`;
        }
        if (hasFuzzyMatches) {
            label += ` %c[%cF%cu%cz%cz%cy%c]%c`;
        }

        let groupStyleMain = logStyles.label;
        if (isTrade && isRegexMatch) {
            groupStyleMain = 'color: #d17842; font-weight: bold;';
        } else if (isTrade) {
            groupStyleMain = logStyles.trade;
        } else if (isRegexMatch) {
            groupStyleMain = logStyles.regex;
        } else if (isKeywordMatch) {
            groupStyleMain = logStyles.keyword;
        }

        const styleArgs = [groupStyleMain];
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

        console.groupCollapsed(`%c${label}`, ...styleArgs);
        console.log(`%cNormalized:%c "${normalized}"`, logStyles.label, logStyles.default);
        console.log(
            `%cisKeyword:%c ${isKeywordMatch}   %cisRegex:%c ${isRegexMatch}   %cisTrade:%c ${isTrade}`,
            logStyles.label, isKeywordMatch ? logStyles.keyword : logStyles.label,
            logStyles.label, isRegexMatch ? logStyles.regex : logStyles.label,
            logStyles.label, isTrade ? logStyles.trade : logStyles.label
        );

        for (const line of lines) {
            console.log(line.text, ...line.styles);
        }

        console.groupEnd();
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

                if (comment.classList.contains('filtered-regex-comment')) {
                    filteredCount++;
                }
            });
        }

        return { blockedCount, filteredCount };
    }

    function createDisplayText(blockedCount, filteredCount) {
        const parts = [];
        if (blockedCount > 0) parts.push(`${blockedCount} from blocked users`);
        if (filteredCount > 0) parts.push(`${filteredCount} filtered`);
        return parts.join(', ');
    }

    function displayCount(blockedCount, filteredCount) {
        const pagingSummaries = document.querySelectorAll('.forum_paging_summary.ellipsis');

        pagingSummaries.forEach(pagingSummary => {
            let countDisplay = pagingSummary.querySelector('#count-display');
            const rawText = createDisplayText(blockedCount, filteredCount);
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
        const text = span.textContent.trim().replace('.', '');
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
        const { blockedCount, filteredCount } = countHiddenContent();
        displayCount(blockedCount, filteredCount);
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

    createObserver({
        target: isTopicsContainer || isCommentsContainer,
        config: { childList: true, subtree: true },
        onMutation: (mutations) => {
            let topicsChanged = false;
            let commentsChanged = false;

            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList?.contains("forum_topic")) topicsChanged = true;
                    if (node.classList?.contains("commentthread_comment") || node.classList?.contains("commentthread_deleted_expanded")) commentsChanged = true;
                    if (node.classList?.contains("forum_comment_action_menu")) addNickname(node);
                });
            });

            if (topicsChanged || commentsChanged) {
                runFilters();
                getForumLocationInfo();
            }
            setVisibleCount();
        }
    });

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