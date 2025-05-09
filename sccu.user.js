// ==UserScript==
// @name         Steamcommunity-Cleanup
// @namespace    https://github.com/veehawt/Steamcommunity-Cleanup
// @version      0.4.18
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
        ["comment for comment",   /\bcomment\s+for\s+comment\b/],
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
    ];


    // Refined Regex trade patterns in topic titles to hide (disabled on trade forums)
    const regexTradeIntent = new RegExp(String.raw`\b(
        |capsules?|cases?|check(?: my)? (?:inv+|inventory)|downgrade|upgrade|fast trades?|fair trades?|fast response|giveaway|give me|I have|I want|in stock|
        |invent|inventory|inv+|katowice|kato|knife for knife|for trade|loadout|lf\b|looking for(?: trade)?|o+p+e+n+|open(?:[\s-]?(for\s?)?(24\/7|trade|inv+))|
        |personal trader|play[\s-]?skins|rare|send trade|someone trade me|skins?|stickers?|store|swap|t[r4]+[a@]+([i1]+)?[d+]+[e3]+s*|trade(?:[-\s]?up)?|trading|trading full loadout|
        |trading my knife|
      )\b`, 'i');

    const regexWeapons = new RegExp(String.raw`\b(
        |kni(fe|ve)(s|z)?|bayonet|bowie|butterfly|flip|gut|huntsman|karambit|kukri|m9|nomad|paracord|skeleton|stiletto|survival|talon|ursus|
        |glove(s|z)?|blood[\s-]?hound|broken[\s-]?fang|driver|hand[\s-]?wraps?|hydra|moto|specialist|sport|
        |ak(?:[-\s]?47)?|aug|awp|famas|galil|g3sg1|m4|m4a1[-\s]?s|m4a4|a4|scar[-\s]?20|ssg|
        |bizon|mac[-\s]?10|mp7|mp9|ump|mag[-\s]?7|nova|negev|
        |cz75|deagle|desert eagle|dgl|five[-\s]?seven|glock|p2000|p250|tec[-\s]?9|usp[-\s]?s|
      )\b`, 'i');

    const regexFinishes = new RegExp(String.raw`\b(
        |amber[\s-]?fade|amphibious|arboreal|arid|asiimov|autotronic|atomic[\s-]?alloy|badlands|big[\s-]?game|(?:black|blue|green|midnight|red)[\s-]?laminate|
        |(?:(black|wild)[\s-]?)?lotus|black[\s-]?(pearl|tie)|blood[\s-]?(pressure|sport)?|blue[\s-]?(gem|steel|titanium)|boreal[\s-]?forest|bright[\s-]?water|
        |bronze(?:[\s-]?morph|d)|buckshot|capillary|cartel|case[\s-]?hard(?:ened|end)|charred|chrome[\s-]?cannon|chromatic[\s-]?abberation|caution|
        |cobalt(?:[\s-]?skulls)?|commander|conspiracy|constrictor|convoy|cool[\s-]?mint|cmyk|crakow|crimson(?:[\s-]?(kimono|web)?)?|damascus|ddpat|
        |(desert|scarlet)[\s-]?shamagh|diamond(back)?|doppler|dragon[\s-]?lore|duct[\s-]?tape|eclipse|emerald(?:[\s-]?web)?|empress|fade|field[\s-]?agent|
        |finish[\s-]?line|fever[\s-]?dream|fennec[\s-]?fox|fire[\s-]?serpent|forest|foundation|freehand|fuel[\s-]?injector|giraffe|gold[\s-]?arabesque|
        |golden(?:[\s-]?(coil|koi))?|green[\s-]?energy|guerrilla|gungir|heat[\s-]?treated|hedge(?:[\s-]?maze)?|hellfire|howl|hot[\s-]?rod|hyper[\s-]?beast|
        |ice[\s-]?coaled|imperial(?:[\s-]?plaid)?|inheritance|icarus[\s-]?fell|jade|(?:king[\s-]?)?snake(?:bite)?|leather|
        |(?:(lightning|tiger|serpent)[\s-]?)?strike|long(?:[\s-]?)dog|lore|lunar[\s-]?weave|marble(?:[\s-]?fade)?|mecha[\s-]?industries|mogul|
        |modern[\s-]?hunter|moss[\s-]?quartz|mangrove|mulberry|needle(?:[\s-]?point)?|neon[\s-]?(revolution|rider)?|night(?:[\s-]?(mare|stripe|wish))?|nocts|
        |neo[\s-]?noir|ocean[\s-]?drive|omega|overprint|overtake|(?:p\s*([1-4])|phase\s*([1-4]))|pandora(?:'s?[\s-]?box|[\s-]?)?|phosphor|polygon|poseidon|pow|print[\s-]?stream|
        |(?:queen[\s-]?)?jaguar|radiation[\s-]?hazard|rattler|red[\s-]?line|rub(y|ies)|rust[\s-]?coat|sapphires?|crim[\s-]?z|searing|slate|slaughter|slingshot|smoke[\s-]?out|
        |(?:snow[\s-])?leopard|spruce|stained|stratosphere|sunset[\s-]?storm|spearmint|starcade|superconductor|(?:silk[\s-]?)?tiger([\s-]?tooth)?|temukau|
        |tilted|transport|turtle|ultraviolet|unhinged|vaporwave|vice|vulcan|whiteout|wildfire|x[-\s]?ray|yellow[\s-]?banded|zebra[\s-]?stripe|ibuypower|
      )\b`, 'i');

    const regexWear = /\b(factory new|fn|minimal wear|mw|field[-\s]?tested|ft|well[-\s]?worn|ww|battle[-\s]?scarred|bs|float)\b/i;
    const regexFloat = /\b(?:0)?\.\d{2,9}\b/;
    const regexStatTrak = /\b(stat[\s\-]?trak|stat[\s\-]?track)\b/i;

    const regexTradeNegatives = new RegExp(String.raw`\b(
        |(1|2|3|4|5)[\s-]?v(?:s\.?|s)?[\s-]?(1|2|3|4|5)|abilit(y|ies)|access|add(ition)?|animation|aren'? ?t|isn'? ?t|weren'? ?t|wasn'? ?t|won'? ?t|wouldn'? ?t|couldn'? ?t|shouldn'? ?t|didn'? ?t|don'? ?t|can'? ?t|hasn'? ?t|hadn'? ?t|mustn'? ?t|
        |back|badges?|bans?|because|(been|has) limited|best|black screen|(bring|brought) back|broken(?![\s-]?fang)|bugs?|can I|can you|cannot|chang(e|es|ing)|clans?|crash(ed|es)?|created|crosshairs?|deleted?|disappear(ed|ing|s)?|do (I|you)|drops?|
        |duo|trio|quad|error|extend(?:ed|s|ion|ions)?|fix(ed|es)?|for \d+ days|fps|friends?|game store|glitch(ed|es)?|hard[\s-]?stuck|help|hid(e|ing)|histor(y|ies)hold|how (can|do)?|(I )?opened|idea|is (it|there)|lags?|let (me|us)|(?:re)?load(?:ing)?|
        |made|matchmaking|mm|miss(ed|es|ing)?|name|no trad(e|es|ing)|not available|not work(ing)?|opinions?|options?|
        |people|permission|phones?|players?|possibl(e|y)|practice|premiere?|prices?|problems?|questions?|recruiting|remove(d|s)?|reset(s|ted|ting)?|revamps?|rules|scam(?:s|med)?|stolen|scrim(?:s|z)?|scrimmages?|
        |should|suggestions?|team(?:mate|mates|m8s)?|mates?|m8s?|rant(ing)?|should I|sort(ing|s)?|specific|steam(?:[\s-]?(guard|vr))?|stop|store page|strats?|tactics?|thoughts?|to play\s+.+?(?:\s+with)?|training|unauthorized|unbans?|updates?|unexpected|us(e|es|ers|ing)|valve|wait(ing)? time|what|when|where|which|who|why|
        |wingman|work(ing)?|would you|
      )\b`, 'i');


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
        .hidden-filtered {
            background-color: rgba(118, 85, 116, 0.5);
        }
        .hidden-filtered:hover {
            background-color: rgba(141, 102, 139, 0.8);
        }
        .hidden-filtered-comment {
            background-color: rgba(67, 47, 67, 0.5) !important;
        }
        .hidden-blocked-user {
            border-left: 2px solid #f84972;
            border-right: 2px solid #f84972;
            background-color: rgba(118, 85, 116, 0.5);
        }
        .hidden-blocked-user:hover {
            background-color: rgba(141, 102, 139, 0.8);
        }
        .hidden-blocked-user-comment {
            background-color: #2b2230 !important;
        }
        .hidden-blocked-OP {
            background: #2b2230 !important;
            border: 1px solid #30242b;
        }
        .hidden-trade-related {
            background-color: rgba(44, 165, 141, 0.5) !important;
        }
        .hidden-trade-related:hover {
            background-color: rgba(54, 187, 169, 0.8) !important;
        }
        .hidden-trade-related-filtered {
            background: linear-gradient(50deg, rgba(118, 85, 116, 0.5) 15%, 45%, rgba(44, 165, 141, 0.5)) 30%;
            border: 1px solid transparent;
            border-image: linear-gradient(80deg, rgba(118, 85, 116, 0.8), rgba(44, 165, 141, 0.8)) 1;
        }
        .hidden-trade-related-filtered:hover {
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

    const SCRIPT_VERSION = '0.4.18';
    const devMode = false;
    const tradeCheckCache = new Map();

    const styleSheet = document.createElement("style");
    styleSheet.innerText = scriptStyles;
    document.head.appendChild(styleSheet);

    const isTradingForum      = window.location.href.includes('/tradingforum/');
    const isTopicsContainer   = document.querySelector('.forum_topics_container');
    const isCommentsContainer = document.querySelector('.commentthread_comment_container');

    const isGeneralForum = !!isTopicsContainer;
    const isDiscussion   = !!isCommentsContainer;

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

    let currentEndIndex = 0;

    let showAllHeader = false;
    let showAllFooter = false;
    let showBlockedHeader = false;
    let showBlockedFooter = false;

    let headerBtnAll, footerBtnAll, headerBtnBlocked, footerBtnBlocked;
    let buttonContainerHeader, buttonContainerFooter;
    const buttonManager = createButtonStateManager();



    function normalizeContent(content) {
        return content
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[^\x00-\x7F]/g, ' ')
            .replace(/[^\p{L}\p{N}\s\-\.]/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\B\.(\d{2,9})\b/g, '0.$1');
    }

    function getRegexMatches(normalized) {
        const regexTests = {
            negatives: regexTradeNegatives,
            intent: regexTradeIntent,
            finishes: regexFinishes,
            weapons: regexWeapons,
            wear: regexWear,
            float: regexFloat,
            stattrak: regexStatTrak
        };

        const tests = {};
        const matchedByKey = {};

        for (const [key, regex] of Object.entries(regexTests)) {
            const match = normalized.match(regex);
            tests[key] = !!match;
            matchedByKey[key] = match || [];
        }

        return { tests, matchedByKey };
    }

    function getMatchedNegatives(normalized) {
        const matches = normalized.match(regexTradeNegatives);
        if (!matches) return [];
        const unique = [...new Set(matches)];
        return unique.map(m => `negatives → "${m}"`);
    }

    function computeIsTrade(tests) {
        const { negatives, intent } = tests;
        const matchCount = Object.entries(tests)
        .filter(([key, value]) => key !== 'negatives' && value)
        .length;

        return {
            isTrade: !negatives && (intent || matchCount >= 2),
            matchCount
        };
    }

    function matchesCriteria(text, keywordList, regexList) {
        for (let keyword of keywordList) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
                return true;
            }
        }

        for (let entry of regexList) {
            const regex = Array.isArray(entry) ? entry[1] : entry;
            if (regex.test(text)) {
                return true;
            }
        }

        return false;
    }



    function isBlockedTopic(topic) {
        return topic.querySelector('.forum_topic_name.op_hidden');
    }

    function isFilteredTopic(topic) {
        const topicName = topic.querySelector('.forum_topic_name');
        if (!topicName) return false;

        const text = topicName.textContent.trim();
        const tradeResult = isTradeRelated(text);

        const isRegexMatch = matchesCriteria(text, keywords, regexFiltersTopics);
        const isTradeMatch = typeof tradeResult === 'object' ? tradeResult.isTrade : tradeResult;

        return isRegexMatch || isTradeMatch;
    }

    function isBlockedComment(comment) {
        return comment.classList.contains('commentthread_deleted_expanded');
    }

    function isFilteredComment(comment) {
        const commentText = comment.querySelector('.commentthread_comment_text');
        if (!commentText) return false;

        const textClone = commentText.cloneNode(true);
        textClone.querySelectorAll('blockquote').forEach(bq => bq.remove());
        const cleanedText = textClone.textContent.trim();

        return matchesCriteria(cleanedText, [], regexFiltersComments);
    }

    function isTradeRelated(content, topic = null) {
        if (tradeCheckCache.has(content)) {
            return tradeCheckCache.get(content);
        }

        const raw = content.toLowerCase();
        const normalized = normalizeContent(content);
        const { tests, matchedByKey } = getRegexMatches(normalized);
        const matchedNegatives = getMatchedNegatives(normalized);
        const { isTrade, matchCount } = computeIsTrade(tests);

        const result = devMode
            ? (() => {
                const isBlocked = topic && isBlockedTopic(topic);
                if (!isBlocked) {
                    logDevInfo({
                        raw,
                        normalized,
                        isTrade,
                        matchCount,
                        matchedByKey,
                        matchedNegatives,
                        tests
                    });
                }
                return {
                    normalized,
                    isTrade,
                    matchCount,
                    ...tests
                };
            })()
            : isTrade;

        tradeCheckCache.set(content, result);
        return result;
    }



    function filterTopics(showAll = devMode, showBlocked = false) {
        if (devMode) {
            const locationInfo = getForumLocationInfo();
            console.groupCollapsed(`%cDev Log @ [${locationInfo}]`, 'color: gray;');
        }

        const topics = document.querySelectorAll('.forum_topic');

        topics.forEach(topic => {
            if (topic.closest('.rightSectionTopTitle')) return;

            topic.classList.remove('hidden-blocked-user', 'hidden-filtered', 'hidden-trade-related', 'hidden-trade-related-filtered');

            const topicName = topic.querySelector('.forum_topic_name');
            const text = topicName?.textContent.trim() ?? '';

            if (isBlockedTopic(topic)) {
                topic.style.display = (showAll || showBlocked) ? '' : 'none';
                if (showAll || showBlocked) topic.classList.add('hidden-blocked-user');
                return;
            }

            if (!topicName) return;

            const tradeResult = isTradeRelated(text);
            const tradeMatch = typeof tradeResult === 'object' ? tradeResult.isTrade : tradeResult;
            const regexMatch = matchesCriteria(text, keywords, regexFiltersTopics);

            if (devMode) {
                if (tradeMatch && regexMatch) {
                    topic.classList.add('hidden-trade-related-filtered');
                } else if (tradeMatch) {
                    topic.classList.add('hidden-trade-related');
                } else if (regexMatch) {
                    topic.classList.add('hidden-filtered');
                }
            } else {
                if (tradeMatch || regexMatch) {
                    topic.classList.add('hidden-filtered');
                }
            }

            const isFiltered = isFilteredTopic(topic);
            topic.style.display = showAll || isFiltered === false ? '' : 'none';
        });

        if (devMode) {
            console.groupEnd();
        }

        initCounts();
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

            comment.classList.remove('hidden-blocked-user-comment', 'hidden-filtered-comment');

            if (isBlockedComment(comment)) {
                comment.style.display = (showAll || showBlocked) ? '' : 'none';
                if (showAll || showBlocked) comment.classList.add('hidden-blocked-user-comment');
                return;
            }

            if (isFilteredComment(comment)) {
                comment.style.display = (showAll) ? '' : 'none';
                if (showAll) comment.classList.add('hidden-filtered-comment');
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
                opWrapper.classList.add('hidden-blocked-OP');
            });

            if (isBlockedOP) {
                if (showAll || showBlocked) {
                    blockedHiddenPostUnhide.click(); // Simulate Steam's "Show"
                    opWrapper.classList.add('hidden-blocked-OP');
                }
            } else {
                if (!(showAll || showBlocked)) {
                    blockedHiddenPost.style.setProperty('display', 'none', 'important');
                    blockedHiddenPostToggle.style.removeProperty('display');
                    opWrapper.classList.remove('hidden-blocked-OP');
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

    function logDevInfo({ raw, normalized, isTrade, matchCount, matchedByKey, tests }) {
        const styleLabel = 'color: #888; font-weight: bold;';
        const styleG = 'color: rgba(44, 165, 141, 1);';
        const styleB = 'color: rgba(118, 85, 116, 1);';
        const styleNormal = 'color: #54a5d4;';

        function renderMatchLine(label, match, isNegative = false) {
            const labelStyle = styleLabel;
            const matchStyle = match
                ? (isNegative ? styleG : styleB)
                : styleNormal;
            const matchText = match ? `"${match}"` : '""';

            return {
                text: `%c${label} → %c${matchText}`,
                styles: [labelStyle, matchStyle]
            };
        }

        const lines = [];

        if (matchedByKey.negatives[0]) {
            lines.push(renderMatchLine('negatives', matchedByKey.negatives[0], true));
        }

        for (const key of ['intent', 'finishes', 'weapons', 'wear', 'float', 'stattrak']) {
            const match = matchedByKey[key][0];
            if (match) {
                lines.push(renderMatchLine(key, match, false));
            }
        }

        const keywordMatch = keywords.find(k => raw.includes(k));
        if (keywordMatch) {
            lines.push(renderMatchLine('keyword', keywordMatch));
        }

        for (const [description, pattern] of regexLanguage) {
            const match = raw.match(pattern);
            if (match) {
                lines.push(renderMatchLine('language', match[0] + ` // ${description}`));
                break;
            }
        }

        for (const [description, pattern] of regexSpam) {
            const match = raw.match(pattern);
            if (match) {
                lines.push(renderMatchLine('spam', `${match[0]} // ${description}`));
                break;
            }
        }

        for (const [description, pattern] of regexTrade) {
            const match = raw.match(pattern);
            if (match) {
                lines.push(renderMatchLine('trade', `${match[0]} // ${description}`));
                break;
            }
        }

        if (lines.length === 0) {
            lines.push({ text: `%cnone`, styles: [styleLabel] });
        }

        const useNormalized = isTrade || tests.negatives || matchCount > 0;
        const title = useNormalized ? normalized : raw;

        const headerLines = [];

        if (useNormalized) {
            headerLines.push(
                `%cisTrade:%c ${isTrade}  ` +
                `%cnegatives:%c ${tests.negatives}  ` +
                `%cmatches:%c ${matchCount}`
    );
        }

        console.groupCollapsed(`%c"${title}"`, styleNormal);
        console.log(
            `%c"${title}"\n` +
            headerLines.concat(lines.map(line => line.text)).join('\n'),
            styleNormal,
            ...(useNormalized ? [
                styleLabel, isTrade ? styleB : styleG,
                styleLabel, tests.negatives ? styleG : styleB,
                styleLabel, styleNormal
            ] : []),
            ...lines.flatMap(line => line.styles)
        );

        console.groupEnd();
    }

    function logScriptBanner() {
        const parts = [
            { text: 'Steamcommunity', style: 'color: white; background: black;' },
            { text: '-',              style: 'color: gray; background: black;' },
            { text: 'Cleanup',        style: 'color: #ff8fab; background: black;' },
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

                if (isBlockedTopic(topic)) blockedCount++;
                if (isFilteredTopic(topic)) filteredCount++;
            });
        }

        if (isDiscussion) {
            const comments = document.querySelectorAll('.commentthread_comment');

            comments.forEach(comment => {
                if (isBlockedComment(comment)) blockedCount++;
                if (isFilteredComment(comment)) filteredCount++;
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
            'span[id^="forum_General_"][id$="_pagestart"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_pagestart"]'
        );
        const pageEnd = document.querySelector(
            'span[id^="forum_General_"][id$="_pageend"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_pageend"]'
        );
        const pageStartFooter = document.querySelector(
            'span[id^="forum_General_"][id$="_footerpagestart"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_fpagestart"]'
        );
        const pageEndFooter = document.querySelector(
            'span[id^="forum_General_"][id$="_footerpageend"], ' +
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
        return isDiscussion
            ? document.querySelectorAll('.commentthread_comment:not([style*="display: none"])').length
            : document.querySelectorAll('.forum_topic:not([style*="display: none"])').length;
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
                '[id^="forum_General_"][id$="_pagecontrols"], ' +
                '[id^="forum_Workshop_"][id$="_pagecontrols"], ' +
                '[id^="forum_Trading_"][id$="_pagecontrols"], ' +
                '[id^="commentthread_ForumTopic_"][id$="_pagecontrols"]'
            );
        } else if (controlType === 'footer' || controlType === 'fpagectn') {
            pagingControls = document.querySelector(
                '[id^="forum_General_"][id$="_footerpagecontrols"], ' +
                '[id^="forum_Workshop_"][id$="_footerpagecontrols"], ' +
                '[id^="forum_Trading_"][id$="_footerpagecontrols"], ' +
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