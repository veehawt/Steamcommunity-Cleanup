// ==UserScript==
// @name         Steamcommunity-CleanUp
// @namespace    https://github.com/veehawt/Steamcommunity-CleanUp
// @version      0.4.0
// @description  UserScript that improves the Steam forums by hiding discussion topics.
// @author       vee (https://github.com/veehawt | https://steamcommunity.com/profiles/76561197969754818)
// @supportURL   https://github.com/veehawt/Steamcommunity-CleanUp/issues
// @downloadURL  https://github.com/veehawt/Steamcommunity-CleanUp/raw/master/sccu.user.js
// @updateURL    https://github.com/veehawt/Steamcommunity-CleanUp/raw/master/sccu.user.js
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

    // Blocked user topics to hide
    const blocked = [
        "topic by a blocked user", "来自被屏蔽用户的主题", "來自被封鎖使用者的主題",
        "ブロック中のユーザーによるトピック", "กระทู้จากผู้ใช้ที่ถูกบล็อค", "Тема от блокиран потребител",
        "Téma od blokovaného uživatele", "Emne fra en blokeret bruger", "Thema eines blockierten Nutzers",
        "Tema de un usuario bloqueado", "Θέμα από αποκλεισμένο χρήστη", "Sujet d'une personne bloquée",
        "Discussione di un utente bloccato", "Topik dari pengguna yang diblokir", "Blokkolt felhasználó témája",
        "Onderwerp van een geblokkeerde gebruiker", "Emne av en blokkert bruker", "Wątek autorstwa zablokowanego użytkownika",
        "Tópico de um utilizador bloqueado", "Tópico de um usuário bloqueado", "Subiectul unui utilizator blocat",
        "Тема, созданная заблокированным пользователем", "Estetyn käyttäjän keskustelunaihe", "Ämne från en blockerad användare",
        "Engellenmiş kullanıcıya ait başlık", "Chủ đề từ người dùng bị chặn", "Тема від заблокованого користувача"
    ];

    // Keywords in topic titles to hide
    const keywords = [
        //"hack", // Add your keywords here
        //"cheat",
        //"devs",
        //"noob",
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

    const scriptStyles = `
        .nickname img.nickname-icon {
            vertical-align: middle;
            margin-left: 4px;
            margin-right: -2px;
            position: relative;
            top: 1px;
        }
        .header_all, .header_blocked, .footer_all, .footer_blocked {
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
        .header_all.active, .header_blocked.active, .footer_all.active, .footer_blocked.active {
            box-shadow: 0 0 2px #417a9b, 0 0 10px #417a9b;
            background: #549EC8
            background: -webkit-linear-gradient( 150deg, #417a9b 5%, #549EC8 95%);
            background: linear-gradient( -60deg, #417a9b 5%, #549EC8 95%);
            color: #fff !important;
        }
        .header_all:hover, .header_blocked:hover, .footer_all:hover, .footer_blocked:hover {
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

    let regexFilters         = isTradingForum ? regexSpam : [...regexTrade, ...regexLanguage, ...regexSpam];
    let regexFiltersComments = isTradingForum ? regexSpam : [               ...regexLanguage, ...regexSpam];

    let showAllHeader = false;
    let showAllFooter = false;
    let showBlockedHeader = false;
    let showBlockedFooter = false;

    let headerBtnAll, footerBtnAll, headerBtnBlocked, footerBtnBlocked;
    let buttonContainerHeader, buttonContainerFooter;
    const buttonManager = createButtonStateManager();



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
            let topics = document.querySelectorAll('.forum_topic');

            topics.forEach(topic => {
                if (topic.closest('.rightSectionTopTitle')) return;

                let topicName = topic.querySelector('.forum_topic_name');
                if (!topicName) return;

                let text = topicName.textContent.trim();
                let isBlockedTopic = matchesCriteria(text, blocked, []);
                let isFilteredTopic = matchesCriteria(text, keywords, regexFilters);

                if (isBlockedTopic) blockedCount++;
                if (isFilteredTopic) filteredCount++;
            });
        }
        if (isDiscussion) {
            let comments = document.querySelectorAll('.commentthread_comment');

            comments.forEach(comment => {
                let commentText = comment.querySelector('.commentthread_comment_text');
                if (!commentText) return;

                let rawText = commentText.innerHTML;
                let cleanedText = rawText.replace(/<blockquote.*?>.*?<\/blockquote>/gis, '').trim();
                let isBlockedComment = comment.classList.contains('commentthread_deleted_expanded');
                let isFilteredComment = matchesCriteria(cleanedText, [], regexFiltersComments);

                if (isBlockedComment) blockedCount++
                if (isFilteredComment) filteredCount++;
            });
        }
        return { blockedCount, filteredCount: filteredCount };
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

                countDisplay.textContent = displayText === '' ? '' : ` (${displayText})`;
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


    function setVisibleCount() {
        const pageStartSpan = document.querySelector(
            'span[id^="forum_General_"][id$="_pagestart"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_pagestart"]'
        );
        const pageEndSpan = document.querySelector(
            'span[id^="forum_General_"][id$="_pageend"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_pageend"]'
        );
        const pageEndSpanFooter = document.querySelector(
            'span[id^="forum_General_"][id$="_footerpageend"], ' +
            '[id^="commentthread_ForumTopic_"][id$="_fpageend"]'
        );

        if (!pageEndSpan || !pageEndSpanFooter || !pageStartSpan) return;

        const startIndex = parseInt(pageStartSpan.textContent.trim()) || 1;

        let visibleCount = 0;

        if (isDiscussion) {
            visibleCount = document.querySelectorAll('.commentthread_comment:not([style*="display: none"])').length;
        } else {
            visibleCount = document.querySelectorAll('.forum_topic:not([style*="display: none"])').length;
        }

        const endIndex = Math.max(startIndex + visibleCount - 1, startIndex);

        pageEndSpan.textContent = endIndex;
        pageEndSpanFooter.textContent = endIndex;
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

    function filterTopics(showAll = false, showBlocked = false) {
        let topics = document.querySelectorAll('.forum_topic_name');

        topics.forEach(topic => {
            let title = topic.textContent.trim();
            let topicElement = topic.closest('.forum_topic');

            let isBlockedTopic = matchesCriteria(title, blocked, []);
            let isFilteredTopic = matchesCriteria(title, keywords, regexFilters);

            topicElement.classList.remove('hidden-blocked-user', 'hidden-filtered');

            if (isBlockedTopic) {
                topicElement.style.display = (showAll || showBlocked) ? '' : 'none';
                if (showAll || showBlocked) topicElement.classList.add('hidden-blocked-user');
                return;
            }

            if (isFilteredTopic) {
                topicElement.style.display = (showAll) ? '' : 'none';
                if (showAll) topicElement.classList.add('hidden-filtered');
                return;
            }

            topicElement.style.display = '';
        });
        initCounts();
    }

    function filterOP(showAll = false, showBlocked = false) {
        const blockedHiddenPost = document.querySelector('.forum_op [id^="forum_op_hidden_"]');
        const blockedHiddenPostToggle = document.querySelector('.forum_op [id^="forum_op_showhidden_"]');
        const blockedHiddenPostUnhide = document.querySelector('.forum_op .commentthread_show_deleted_link');

        if (blockedHiddenPostUnhide && blockedHiddenPost && blockedHiddenPostToggle) {
            const isBlockedOP = getComputedStyle(blockedHiddenPostToggle).display !== 'none';

            if (isBlockedOP) {
                if (showAll || showBlocked) {
                    blockedHiddenPostUnhide.click(); // Simulate Steam's "Show"
                }
            } else {
                if (!(showAll || showBlocked)) {
                    blockedHiddenPost.style.setProperty('display', 'none', 'important');
                    blockedHiddenPostToggle.style.removeProperty('display');
                }
            }
        }
    }

    function filterComments(showAll = false, showBlocked = false) {
        filterOP(showAll, showBlocked);

        let comments = document.querySelectorAll('.commentthread_comment');

        comments.forEach(comment => {
            if (comment.classList.contains('commentthread_deleted_comment')) {
                comment.remove();
                return;
            }

            let textElement = comment.querySelector('.commentthread_comment_text');
            if (!textElement) return;

            let textClone = textElement.cloneNode(true);
            textClone.querySelectorAll('blockquote').forEach(blockquote => blockquote.remove());
            let text = textClone.textContent.trim();

            let isBlockedComment = comment.classList.contains('commentthread_deleted_expanded');
            let isFilteredComment = matchesCriteria(text, [], regexFiltersComments);

            comment.classList.remove('hidden-blocked-user-comment', 'hidden-filtered-comment');

            if (isBlockedComment) {
                comment.style.display = (showAll || showBlocked) ? '' : 'none';
                if (showAll || showBlocked) comment.classList.add('hidden-blocked-user-comment');
                return;
            }

            if (isFilteredComment) {
                comment.style.display = (showAll) ? '' : 'none';
                if (showAll) comment.classList.add('hidden-filtered-comment');
                return;
            }

            comment.style.display = '';
        });
        initCounts();
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
            } else if (sectionType === 'footer' || sectionType === 'fpagectn') {
                section.insertAdjacentElement('beforebegin', exSections);
            }

            let buttonContainer;
            if (sectionType === 'header' || sectionType === 'pagectn') {
                buttonContainer = createButtonContainer([headerBtnAll, headerBtnBlocked]);
            } else if (sectionType === 'footer' || sectionType === 'fpagectn') {
                buttonContainer = createButtonContainer([footerBtnAll, footerBtnBlocked]);
            }

            if (buttonContainer) {
                exSections.appendChild(buttonContainer);
            }

            setPagingCtrls(exSections, sectionType);
        });
    }

    function setHeaderBtns() {
        let pagingHeaderExtended = document.querySelector('.forum_paging_header_extended');
        let pagingPageCtnExtended = document.querySelector('.forum_paging_pagectn_extended');

        if (!buttonContainerHeader) {
            buttonContainerHeader = document.createElement('div');
            buttonContainerHeader.classList.add('button-container-header');
        }

        if (pagingHeaderExtended && !pagingHeaderExtended.contains(buttonContainerHeader)) {
            pagingHeaderExtended.appendChild(buttonContainerHeader);
        }

        if (pagingPageCtnExtended && !pagingPageCtnExtended.contains(buttonContainerHeader)) {
            pagingPageCtnExtended.appendChild(buttonContainerHeader);
        }
    }

    function setFooterBtns() {
        let pagingFooterExtended = document.querySelector('.forum_paging_footer_extended');
        let pagingFPageCtnExtended = document.querySelector('.forum_paging_fpagectn_extended');

        if (!buttonContainerFooter) {
            buttonContainerFooter = document.createElement('div');
            buttonContainerFooter.classList.add('button-container-footer');
        }

        if (pagingFooterExtended && !pagingFooterExtended.contains(buttonContainerFooter)) {
            pagingFooterExtended.appendChild(buttonContainerFooter);
        }

        if (pagingFPageCtnExtended && !pagingFPageCtnExtended.contains(buttonContainerFooter)) {
            pagingFPageCtnExtended.appendChild(buttonContainerFooter);
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



    function initCounts() {
        const { blockedCount, filteredCount: filteredCount } = countHiddenContent();
        displayCount(blockedCount, filteredCount);
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
    setHeaderBtns();
    setFooterBtns();
    setPagingCtrls();
    filterTopics();
    filterComments();
    initCounts();
    watchUrl();
    setVisibleCount();
})();