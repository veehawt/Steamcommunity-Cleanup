// ==UserScript==
// @name         Steamcommunity-Cleanup
// @namespace    https://github.com/veehawt/Steamcommunity-Cleanup
// @version      0.4.11
// @description  UserScript that improves the Steam forums by hiding discussion topics.
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
        //[A-Za-z]+/, // English and the basic Latin alphabet
        /[\u0400-\u04FF]/, // Cyrillic (Ukrainian, Russian, Bulgarian, Serbian and more)
        /[\u0600-\u06FF]/, // Arabic
        /[\u0590-\u05FF]/, // Hebrew
        /[\u4E00-\u9FFF]/, // Chinese
        /[\u0900-\u097F]/, // Devanagari (Hindi, Marathi, Sanskrit, etc.)
        /[\u0E00-\u0E7F]/, // Thai
        /[\uAC00-\uD7AF\u1100-\u11FF]/, // Korean
        /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/, // Japanese
        /[ảạằắẳẵặỉĩịỏọồốổỗộờớởỡợủũụưừứửữựỷỹỵđ]/i, // Vietnamese
        /[\u0370-\u03FF]/, // Greek
        /[ğşşçıİĞŞÇ]/, // some Turkish characters aiming to hide Turkish topics
        /[ÄäÖöÜü]/, // additional Turkish letters but also German, Estonian, Finnish and Hungarian
        /[ŐőŰű]/, // Hungarian
        /[Łł]/, // Polish
        /[ÆæØøÅåÞþÐð]/, // Nordic (Danish, Finnish, Icelandic, Norwegian and Swedish)
    ];

    const regexSpam = [
        /[\+\-]?\s*rep\s*(for\s*[\+\-]?\s*rep|\bme\b)?\b/i, // +rep for rep
        /\bcomment\s+for\s+comment\b/, // comment for comment
    ];

    // Regex trade patterns in topic titles to hide (disabled on trade forums)
    const regexTrade = [
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bg\s*i\s*v\s*e\s*a\s*w\s*a\s*y\b))[^\w\s]*\b/i, // most common iterations of "free giveaway"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bp\s*o+\s*i\s*n\s*t\s*s\b))[^\w\s]*\b/i, // "free points"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bs\s*k(?:i|\|)n\s*s\b))[^\w\s]*\b/i, // "free skins"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bi(?:t|\+)e\s*m(?:s|\$)\b))[^\w\s]*\b/i, // "free items"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bk\s*n\s*i\s*[vf]\s*e\s*s\b))[^\w\s]*\b/i, // "free knife"
        /\b[^\w\s]*(?:f\s*r\s*e\s*e\s*(?:\bg\s*l\s*o\s*v\s*e\s*s\b))[^\w\s]*\b/i, // "free gloves"
        /\b[^\w\s]*(?:w\s*t\s*b|w\s*t\s*s|w\s*t\s*t)[^\w\s]*\b/i, // most common iterations of  "wtb, wts, wtt"
        /\bo+f{2,}e+r{1,}i?n?g?s?\b/i, // "offer, offering, offers"
        /(?<![\w-])([HWhw]|\([HWhw]\)|\[[HWhw]\]|\{[HWhw]\}|<[HWhw]>|<[\(\[\{]?[HWhw][\)\]\}]?>)(?![\w-])/, // H W with various brackets
        /\bopen (?:inventory|inv|trade)\b/i, // "open inventory/trade"
    ];

    // Refined Regex trade patterns in topic titles to hide (disabled on trade forums)
    const regexTradeIntent = new RegExp(String.raw`\b(
        check(?: my)? (?:inv|inventory)|downgrade|fast trade|float|giveaway|I have|I want|inventory|katowice|
        knife for knife|knife up for trade|loadout|lf\b|looking for(?: trade)?|open for trade|send trade|
        someone trade me|swap|trade(?:[-\s]?up)?|trading|trading full loadout|trading my knife|upgrade
      )\b`, 'i');

    const regexWeapons = new RegExp(String.raw`\b(
        knife|bayonet|bowie|butterfly|flip|gut|huntsman|karambit|kukri|nomad|paracord|skeleton|
        gloves|driver|moto|specialist|sport|ak[-\s]?47|awp|famas|galil|g3sg1|m4a1[-\s]?s|m4a4|scar[-\s]?20|ssg|
        bizon|mac[-\s]?10|mp7|mp9|ump|mag[-\s]?7|nova|negev|cz75|deagle|desert eagle|five[-\s]?seven|glock|p250|tec[-\s]?9|usp[-\s]?s
      )\b`, 'i');

    const regexFinishes = new RegExp(String.raw`\b(
        asiimov|bloodsport|blue[\s-]?titanium|capillary|case[\s-]?hardened|crimson|doppler|fade|fire[\s-]?serpent|hyper[\s-]?beast|lore|marble|
        medusa|neo[\s-]?noir|night|print[\s-]?stream|redline|searing|slaughter|tiger[\s-]?tooth|vulcan|(?:black|blue|green|midnight|red)[\s-]?laminate
      )\b`, 'i');

    const regexWear = /\b(factory new|fn|minimal wear|mw|field[-\s]?tested|ft|well[-\s]?worn|ww|battle[-\s]?scarred|bs)\b/i;
    const regexFloat = /\b0\.\d{2,9}\b/;
    const regexStatTrak = /\b(stat[\s\-]?trak|stat[\s\-]?track)\b/i;
    const regexTradeNegatives = /\b(can I|can you|can'?t|drops?|duo|help|hold|how|matchmaking|play|premier|scam|stolen|questions?|valve|why)\b/i;


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

    const isTradingForum      = window.location.href.includes('/tradingforum/');
    const isTopicsContainer   = document.querySelector('.forum_topics_container');
    const isCommentsContainer = document.querySelector('.commentthread_comment_container');

    const isGeneralForum = !!isTopicsContainer;
    const isDiscussion   = !!isCommentsContainer;

    let regexFiltersTopics   = isTradingForum ? regexSpam : [...regexLanguage, ...regexSpam, ...regexTrade];
    let regexFiltersComments = isTradingForum ? regexSpam : [...regexLanguage, ...regexSpam];

    let showAllHeader = false;
    let showAllFooter = false;
    let showBlockedHeader = false;
    let showBlockedFooter = false;

    let headerBtnAll, footerBtnAll, headerBtnBlocked, footerBtnBlocked;
    let buttonContainerHeader, buttonContainerFooter;
    const buttonManager = createButtonStateManager();



    function isBlockedTopic(topic) {
        return topic.querySelector('.forum_topic_name.op_hidden');
    }

    function isFilteredTopic(topic) {
        const topicName = topic.querySelector('.forum_topic_name');
        if (!topicName) return false;

        const text = topicName.textContent.trim();

        const isRegexMatch = matchesCriteria(text, keywords, regexFiltersTopics);
        const isTradeMatch = !isTradingForum && isTradeRelated(text);

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

    function isTradeRelated(content) {
        const text = content.toLowerCase();
        if (regexTradeNegatives.test(text)) return false;

        const matches = [
            regexTradeIntent.test(content),
            regexFinishes.test(content),
            regexWeapons.test(content),
            regexWear.test(content),
            regexFloat.test(content),
            regexStatTrak.test(content)
        ];

        const matchCount = matches.filter(Boolean).length;

        return matches[0] || matchCount >= 2;
    }



    function matchesCriteria(text, keywordList, regexList) {
        for (let keyword of keywordList) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
                return true;
            }
        }

        for (let regex of regexList) {
            if (regex.test(text)) {
                return true;
            }
        }

        return false;
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

    function displayCount(blockedCount, filteredCount) {
        const pagingSummaries = document.querySelectorAll('.forum_paging_summary.ellipsis');

        pagingSummaries.forEach(pagingSummary => {
            let countDisplay = pagingSummary.querySelector('#count-display');

            if (countDisplay) {
                let displayText = '';

                if (blockedCount > 0) {
                    displayText += `${blockedCount} from blocked users`;
                }
                if (filteredCount > 0 && blockedCount > 0) {
                    displayText += ', ';
                }
                if (filteredCount > 0) {
                    displayText += `${filteredCount} filtered`;
                }
                const newDisplay = displayText === '' ? '' : ` (${displayText})`;
                if (countDisplay.textContent !== newDisplay) {
                    countDisplay.textContent = newDisplay;
                }

            } else {
                const newCountDisplay = document.createElement('span');
                newCountDisplay.id = 'count-display';

                let displayText = '';

                if (blockedCount > 0) {
                    displayText += `${blockedCount} from blocked users`;
                }
                if (filteredCount > 0 && blockedCount > 0) {
                    displayText += ', ';
                }
                if (filteredCount > 0) {
                    displayText += `${filteredCount} filtered`;
                }

                newCountDisplay.textContent = displayText === '' ? '' : ` (${displayText})`;

                const pageEnd = pagingSummary.querySelector(
                    '[id^="forum_General_"][id$="pageend"], ' +
                    '[id^="forum_Workshop_"][id$="pageend"], ' +
                    '[id^="forum_Trading_"][id$="pageend"], ' +
                    '[id^="commentthread_ForumTopic_"][id$="_pageend"], ' +
                    '[id^="commentthread_ForumTopic_"][id$="_fpageend"]'
                );
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

    function getPageStartIndex(span) {
        const text = span.textContent.trim().replace('.', '');
        return parseInt(text, 10) || 1;
    }

    function getVisibleCount() {
        return isDiscussion
            ? document.querySelectorAll('.commentthread_comment:not([style*="display: none"])').length
            : document.querySelectorAll('.forum_topic:not([style*="display: none"])').length;
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
        window.endIndex = endIndex;

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

            if (window.endIndex === 0) {
                if (section) section.style.display = 'none';
                if (extended) extended.style.display = 'none';
            } else {
                if (section) section.style.display = '';
                if (extended) extended.style.display = '';
            }
        });
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



    function createButton(text, className, onClickHandler) {
        const button = document.createElement('button');
        button.innerText = text;
        button.className = className;
        button.addEventListener('click', onClickHandler);
        return button;
    }

    function initButtons() {
        headerBtnAll = createButton('All', 'header_all', buttonManager.toggleHeaderAll);
        headerBtnBlocked = createButton('Blocked', 'header_blocked', buttonManager.toggleHeaderBlocked);
        footerBtnAll = createButton('All', 'footer_all', buttonManager.toggleFooterAll);
        footerBtnBlocked = createButton('Blocked', 'footer_blocked', buttonManager.toggleFooterBlocked);

        buttonContainerHeader = createButtonContainer([headerBtnAll, headerBtnBlocked]);
        buttonContainerFooter = createButtonContainer([footerBtnAll, footerBtnBlocked]);
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
            if (!stateType) {
                if (buttonType === 'header') {
                    showBlockedHeader = false;
                    headerBtnBlocked.classList.remove('active');
                    showBlockedFooter = false;
                    footerBtnBlocked.classList.remove('active');
                } else if (buttonType === 'footer') {
                    showBlockedFooter = false;
                    footerBtnBlocked.classList.remove('active');
                    showBlockedHeader = false;
                    headerBtnBlocked.classList.remove('active');
                }
            } else {
                if (buttonType === 'header') {
                    showAllHeader = false;
                    headerBtnAll.classList.remove('active');
                    showAllFooter = false;
                    footerBtnAll.classList.remove('active');
                } else if (buttonType === 'footer') {
                    showAllFooter = false;
                    footerBtnAll.classList.remove('active');
                    showAllHeader = false;
                    headerBtnAll.classList.remove('active');
                }
            }

            if (buttonType === 'header') {
                if (stateType) {
                    showBlockedHeader = !showBlockedHeader;
                    headerBtnBlocked.classList.toggle('active', showBlockedHeader);
                    showBlockedFooter = showBlockedHeader;
                    footerBtnBlocked.classList.toggle('active', showBlockedFooter);
                } else {
                    showAllHeader = !showAllHeader;
                    headerBtnAll.classList.toggle('active', showAllHeader);
                    showAllFooter = showAllHeader;
                    footerBtnAll.classList.toggle('active', showAllFooter);
                }
            } else if (buttonType === 'footer') {
                if (stateType) {
                    showBlockedFooter = !showBlockedFooter;
                    footerBtnBlocked.classList.toggle('active', showBlockedFooter);
                    showBlockedHeader = showBlockedFooter;
                    headerBtnBlocked.classList.toggle('active', showBlockedHeader);
                } else {
                    showAllFooter = !showAllFooter;
                    footerBtnAll.classList.toggle('active', showAllFooter);
                    showAllHeader = showAllFooter;
                    headerBtnAll.classList.toggle('active', showAllHeader);
                }
            }

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

    function setBtnContainer(btnType) {
        const buttonContainer = btnType === 'header' ? buttonContainerHeader : buttonContainerFooter;
        const pagingExtended = document.querySelector(`.forum_paging_${btnType}_extended`);
        const pagingPageCtnExtended = document.querySelector(`.forum_paging_${btnType === 'header' ? 'pagectn' : 'fpagectn'}_extended`);

        if (!buttonContainer) {
            const container = document.createElement('div');
            container.classList.add(`button-container-${btnType}`);
            if (btnType === 'header') {
                buttonContainerHeader = container;
            } else if (btnType === 'footer') {
                buttonContainerFooter = container;
            }
        }

        if (pagingExtended && !pagingExtended.contains(buttonContainer)) {
            pagingExtended.appendChild(buttonContainer);
        }

        if (pagingPageCtnExtended && !pagingPageCtnExtended.contains(buttonContainer)) {
            pagingPageCtnExtended.appendChild(buttonContainer);
        }
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



    function filterTopics(showAll = false, showBlocked = false) {
        const topics = document.querySelectorAll('.forum_topic');

        topics.forEach(topic => {
            if (topic.closest('.rightSectionTopTitle')) return;

            topic.classList.remove('hidden-blocked-user', 'hidden-filtered');

            if (isBlockedTopic(topic)) {
                topic.style.display = (showAll || showBlocked) ? '' : 'none';
                if (showAll || showBlocked) topic.classList.add('hidden-blocked-user');
                return;
            }

            if (isFilteredTopic(topic)) {
                topic.style.display = (showAll) ? '' : 'none';
                if (showAll) topic.classList.add('hidden-filtered');
                return;
            }

            topic.style.display = '';
        });

        initCounts();
    }

    function filterOP(showAll = false, showBlocked = false) {
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

    function filterComments(showAll = false, showBlocked = false) {
        filterOP(showAll, showBlocked);

        const comments = document.querySelectorAll('.commentthread_comment');

        comments.forEach(comment => {
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



    function initCounts() {
        const { blockedCount, filteredCount: filteredCount } = countHiddenContent();
        displayCount(blockedCount, filteredCount);
    }

    function watchUrl() {
        window.addEventListener('popstate', () => {
            initCounts();
            setVisibleCount();
        });

        window.addEventListener('hashchange', () => {
            initCounts();
            setVisibleCount();
        });
    }



    if (window.location.hash === "#addnickname" && typeof ShowNicknameModal === "function") {
        const nicknameElement = document.querySelector(".nickname");
        const existingNickname = nicknameElement ? nicknameElement.textContent.trim() : "";

        ShowNicknameModal(); // Already defined by Steam

        const nicknameObserver = new MutationObserver((mutations, obs) => {
            const nicknameInput = document.querySelector(".newmodal input[type='text']");

            if (nicknameInput) {
                const match = existingNickname.match(/^\((.*)\)$/);
                nicknameInput.value = match ? match[1] : existingNickname;

                obs.disconnect();
            }
        });

        nicknameObserver.observe(document.body, { childList: true, subtree: true });
    }


    const observedMenus = new WeakSet();
    const observeActionMenu = () => {
        document.querySelectorAll(".forum_comment_action_menu").forEach((menu) => {
            if (observedMenus.has(menu)) return;
            observedMenus.add(menu);

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === "style" && menu.style.display !== "none") {
                        addNickname(menu);
                    }
                });
            });

            observer.observe(menu, { attributes: true, attributeFilter: ["style"] });
        });
    };


    const menuContainer = document.body;
    const menuObserver = new MutationObserver(() => {
        observeActionMenu();
    });

    menuObserver.observe(menuContainer, { childList: true, subtree: true });


    const observer = new MutationObserver((mutations) => {
        let topicsChanged = false;
        let commentsChanged = false;

        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList?.contains("forum_topic")) topicsChanged = true;
                    if (node.classList?.contains("commentthread_comment") || node.classList?.contains("commentthread_deleted_expanded")) commentsChanged = true;
                    if (node.classList?.contains("forum_comment_action_menu")) addNickname(node);
                });
            }
        });

        if (topicsChanged || commentsChanged) {
            filterTopics(
                buttonManager.getHeaderAll(),
                buttonManager.getHeaderBlocked(),
                buttonManager.getFooterAll(),
                buttonManager.getFooterBlocked()
            );
            filterComments(
                buttonManager.getHeaderAll(),
                buttonManager.getHeaderBlocked(),
                buttonManager.getFooterAll(),
                buttonManager.getFooterBlocked()
            );
        }

        setVisibleCount();
    });

    if (isTopicsContainer) {
        observer.observe(isTopicsContainer, { childList: true, subtree: true });
    }

    if (isCommentsContainer) {
        observer.observe(isCommentsContainer, { childList: true, subtree: true });
    }

    initButtons();
    extendSections('header');
    extendSections('footer');
    extendSections('pagectn');
    extendSections('fpagectn');
    setPagingCtrls();
    filterTopics();
    filterComments();
    initCounts();
    watchUrl();
    setVisibleCount();
})();